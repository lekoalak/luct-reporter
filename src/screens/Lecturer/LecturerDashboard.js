import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS } from '../../config/theme';
import { ScreenHeader, Card, LoadingScreen } from '../../components/UIComponents';
import { subscribeLecturerReports } from '../../services/reportService';
import { useAuth } from '../../hooks/useAuth';

export default function LecturerDashboard({ navigation }) {
  const { user, userData } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeLecturerReports(user.uid, (data) => {
      setReports(data);
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  const pending = reports.filter(r => !r.prlFeedback).length;
  const totalStudents = reports.reduce((acc, r) => acc + (r.actualStudentsPresent || 0), 0);
  const avgAttendance = reports.length
    ? Math.round(reports.reduce((acc, r) =>
        acc + (r.totalRegisteredStudents ? (r.actualStudentsPresent / r.totalRegisteredStudents) * 100 : 0), 0
      ) / reports.length)
    : 0;

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
      <ScreenHeader
        title="Lecturer Portal"
        subtitle={`Welcome, ${userData?.name?.split(' ')[0]}`}
      />

      {/* Hero Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroGreeting}>Good {getTimeOfDay()},</Text>
        <Text style={styles.heroName}>{userData?.name}</Text>
        <Text style={styles.heroFaculty}>{userData?.faculty?.replace('Faculty of ', '')}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatTile icon="📋" label="Reports" value={reports.length} color={COLORS.navy} />
        <StatTile icon="⏳" label="Awaiting Feedback" value={pending} color={COLORS.warning} />
        <StatTile icon="👥" label="Total Students" value={totalStudents} color={COLORS.info} />
        <StatTile icon="📊" label="Avg Attendance" value={`${avgAttendance}%`} color={COLORS.success} />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actions}>
        <ActionCard icon="📝" label="Submit Report" color={COLORS.navy}
          onPress={() => navigation.navigate('SubmitReport')} />
        <ActionCard icon="📋" label="My Reports" color={COLORS.navyLight}
          onPress={() => navigation.navigate('Reports')} />
        <ActionCard icon="⭐" label="Ratings" color={COLORS.gold}
          onPress={() => navigation.navigate('Ratings')} />
        <ActionCard icon="👥" label="Attendance" color={COLORS.success}
          onPress={() => navigation.navigate('Attendance')} />
      </View>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          {reports.slice(0, 3).map(r => (
            <Card
              key={r.id}
              style={styles.recentCard}
              onPress={() => navigation.navigate('ReportDetail', { reportId: r.id })}
            >
              <Text style={styles.recentCode}>{r.courseCode}</Text>
              <Text style={styles.recentName} numberOfLines={1}>{r.courseName}</Text>
              <Text style={styles.recentMeta}>
                {r.venue} · {r.weekOfReporting} ·{' '}
                {r.actualStudentsPresent}/{r.totalRegisteredStudents} students
              </Text>
              {r.prlFeedback && (
                <Text style={styles.feedbackTag}>💬 Feedback received</Text>
              )}
            </Card>
          ))}
          <TouchableOpacity
            onPress={() => navigation.navigate('Reports')}
            style={styles.viewAll}
          >
            <Text style={styles.viewAllText}>View all reports →</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const StatTile = ({ icon, label, value, color }) => (
  <View style={[styles.statTile, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionCard = ({ icon, label, color, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[styles.actionCard, { backgroundColor: color }]}
  >
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: COLORS.navy,
    margin: 16,
    borderRadius: 16,
    padding: 22,
  },
  heroGreeting: { color: COLORS.gold, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  heroName: { color: COLORS.white, fontSize: FONTS.sizes.xl, fontWeight: '800', marginTop: 4 },
  heroFaculty: { color: COLORS.gray, fontSize: FONTS.sizes.xs, marginTop: 4 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
  },
  statTile: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '900' },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 2, textAlign: 'center' },

  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.navy,
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 16 },
  actionCard: {
    width: '47%',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },

  recentCard: { marginHorizontal: 16, marginBottom: 10 },
  recentCode: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.gold, textTransform: 'uppercase' },
  recentName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.navy, marginTop: 2 },
  recentMeta: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 4 },
  feedbackTag: { fontSize: FONTS.sizes.xs, color: COLORS.success, marginTop: 6, fontWeight: '600' },

  viewAll: { alignItems: 'center', padding: 16 },
  viewAllText: { color: COLORS.navy, fontWeight: '700', fontSize: FONTS.sizes.sm },
});
