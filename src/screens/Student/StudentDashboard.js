import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
} from 'react-native';
import { COLORS, FONTS } from '../../config/theme';
import {
  Card, ScreenHeader, EmptyState, LoadingScreen, Button, SearchBar, Badge,
} from '../../components/UIComponents';
import { subscribeStudentAttendance } from '../../services/attendanceService';
import { useAuth } from '../../hooks/useAuth';

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
      <ScreenHeader
        title="My Dashboard"
        subtitle={`Welcome, ${userData?.name?.split(' ')[0] || 'Student'}`}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard icon="✅" value={present} label="Present" color={COLORS.success} />
          <StatCard icon="❌" value={total - present} label="Absent" color={COLORS.error} />
          <StatCard icon="📊" value={`${rate}%`} label="Rate" color={COLORS.navy} />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickRow}>
            <QuickAction
              icon="⭐"
              label="Rate Lecturers"
              onPress={() => navigation.navigate('Ratings')}
            />
            <QuickAction
              icon="📋"
              label="View Reports"
              onPress={() => navigation.navigate('Monitoring')}
            />
          </View>
        </View>

        {/* Attendance History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance History</Text>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search attendance..." />
          {filtered.length === 0 ? (
            <EmptyState icon="📅" title="No attendance records" message="Your attendance will appear here" />
          ) : (
            filtered.map(item => (
              <Card key={item.id} style={{ marginBottom: 10, marginHorizontal: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={styles.attDate}>
                      {item.timestamp
                        ? new Date(item.timestamp.seconds * 1000).toLocaleDateString('en-GB', {
                            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                          })
                        : 'Date unavailable'}
                    </Text>
                    <Text style={styles.attReport}>Report ID: {item.reportId?.slice(-6) || '—'}</Text>
                  </View>
                  <Badge
                    label={item.status === 'present' ? '✓ Present' : '✗ Absent'}
                    color={item.status === 'present' ? COLORS.success : COLORS.error}
                  />
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const StatCard = ({ icon, value, label, color }) => (
  <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickAction = ({ icon, label, onPress }) => (
  <Card style={styles.quickCard} onPress={onPress}>
    <Text style={styles.quickIcon}>{icon}</Text>
    <Text style={styles.quickLabel}>{label}</Text>
  </Card>
);

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: FONTS.sizes.xxl, fontWeight: '900' },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 2 },

  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.navy,
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },

  quickRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  quickCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 0,
  },
  quickIcon: { fontSize: 28, marginBottom: 8 },
  quickLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.navy },

  attDate: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.black },
  attReport: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 2 },
});
