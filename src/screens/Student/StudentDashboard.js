import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../config/theme';
import { Card, EmptyState, LoadingScreen, SearchBar, Badge } from '../../components/UIComponents';
import { subscribeStudentAttendance } from '../../services/attendanceService';
import { useAuth } from '../../hooks/useAuth';
import TopBar from '../../components/TopBar';

export default function StudentDashboard({ navigation }) {
  const { user, userData } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = subscribeStudentAttendance(user.uid, (data) => {
      setAttendance(data);
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  const filtered = search
    ? attendance.filter(a =>
        a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        a.status?.toLowerCase().includes(search.toLowerCase())
      )
    : attendance;

  const present = attendance.filter(a => a.status === 'present').length;
  const total = attendance.length;
  const rate = total ? Math.round((present / total) * 100) : 0;

  if (loading) return <LoadingScreen message="Loading your dashboard..." />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
      <TopBar
        title="Student Portal"
        subtitle={`Welcome, ${userData?.name?.split(' ')[0] || 'Student'}`}
        navigation={navigation}
        showBack={false}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: COLORS.success, borderTopWidth: 3 }]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={[styles.statValue, { color: COLORS.success }]}>{present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: COLORS.error, borderTopWidth: 3 }]}>
            <Text style={styles.statIcon}>❌</Text>
            <Text style={[styles.statValue, { color: COLORS.error }]}>{total - present}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: COLORS.navy, borderTopWidth: 3 }]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={[styles.statValue, { color: COLORS.navy }]}>{rate}%</Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          <Card style={styles.quickCard} onPress={() => navigation.navigate('Ratings')}>
            <Text style={styles.quickIcon}>⭐</Text>
            <Text style={styles.quickLabel}>Rate Lecturers</Text>
          </Card>
          <Card style={styles.quickCard} onPress={() => navigation.navigate('Monitoring')}>
            <Text style={styles.quickIcon}>📋</Text>
            <Text style={styles.quickLabel}>View Reports</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Attendance History</Text>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search attendance..." />
        {filtered.length === 0 ? (
          <EmptyState icon="📅" title="No attendance records" message="Your attendance will appear here" />
        ) : (
          filtered.map(item => (
            <Card key={item.id} style={styles.attCard}>
              <View style={styles.attRow}>
                <View>
                  <Text style={styles.attDate}>
                    {item.timestamp
                      ? new Date(item.timestamp.seconds * 1000).toLocaleDateString('en-GB')
                      : 'Date unavailable'}
                  </Text>
                  <Text style={styles.attReport}>ID: {item.reportId?.slice(-6) || '-'}</Text>
                </View>
                <Badge
                  label={item.status === 'present' ? 'Present' : 'Absent'}
                  color={item.status === 'present' ? COLORS.success : COLORS.error}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 3,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    color: '#9AA5B4',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#002147',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 0,
  },
  quickIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#002147',
  },
  attCard: {
    marginBottom: 10,
    marginHorizontal: 16,
  },
  attRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
  },
  attReport: {
    fontSize: 11,
    color: '#9AA5B4',
    marginTop: 2,
  },
});