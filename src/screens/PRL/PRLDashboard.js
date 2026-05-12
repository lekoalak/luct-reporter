import TopBar from '../../components/TopBar';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS } from '../../config/theme';
import {
  ScreenHeader, SearchBar, Card, Badge, EmptyState, LoadingScreen, Button,
} from '../../components/UIComponents';
import { subscribeFacultyReports, searchReports } from '../../services/reportService';
import { exportReportsToExcel } from '../../services/exportService';
import { useAuth } from '../../hooks/useAuth';

export default function PRLDashboard({ navigation }) {
  const { user, userData } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const unsub = subscribeFacultyReports(userData?.faculty, (data) => {
      setReports(data);
      setLoading(false);
    });
    return unsub;
  }, [userData?.faculty]);

  const filtered = search ? searchReports(reports, search) : reports;

  const pending = reports.filter(r => !r.prlFeedback).length;
  const reviewed = reports.filter(r => r.prlFeedback).length;

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReportsToExcel(filtered, 'Faculty_Reports');
    } catch (e) {
      Alert.alert('Export Error', e.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading faculty reports..." />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
    <TopBar title="PRL Dashboard" subtitle={userData?.faculty?.replace('Faculty of ', '') || 'My Faculty'} navigation={navigation} showBack={false} />
      <ScreenHeader
        title="PRL Dashboard"
        subtitle={userData?.faculty?.replace('Faculty of ', '') || 'My Faculty'}
      />

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={[styles.stat, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.lightGray }]}>
          <Text style={[styles.statNum, { color: COLORS.warning }]}>{pending}</Text>
          <Text style={styles.statLabel}>Pending Review</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: COLORS.success }]}>{reviewed}</Text>
          <Text style={styles.statLabel}>Reviewed</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Button
          title="⬇ Export Excel"
          onPress={handleExport}
          loading={exporting}
          variant="secondary"
          style={{ flex: 1 }}
        />
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search reports..." />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="📋" title="No reports found" message="Faculty reports will appear here" />
        }
        renderItem={({ item }) => (
          <Card
            style={{ marginBottom: 12 }}
            onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
          >
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.courseCode}>{item.courseCode}</Text>
                <Text style={styles.courseName}>{item.courseName}</Text>
                <Text style={styles.lecturerName}>👨‍🏫 {item.lecturerName}</Text>
              </View>
              <Badge
                label={item.prlFeedback ? '✓ Reviewed' : '⏳ Pending'}
                color={item.prlFeedback ? COLORS.success : COLORS.warning}
              />
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>🏫 {item.venue}</Text>
              <Text style={styles.metaText}>📅 {item.weekOfReporting}</Text>
              <Text style={styles.metaText}>
                👥 {item.actualStudentsPresent}/{item.totalRegisteredStudents}
              </Text>
            </View>
            <Text style={styles.topic} numberOfLines={2}>📝 {item.topicTaught}</Text>
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
            >
              <Text style={styles.reviewBtnText}>
                {item.prlFeedback ? 'View / Edit Feedback →' : 'Add Feedback →'}
              </Text>
            </TouchableOpacity>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.navy },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 2 },

  actionRow: { paddingHorizontal: 16, paddingVertical: 10 },
  list: { padding: 16, paddingTop: 4 },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  courseCode: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.gold, textTransform: 'uppercase' },
  courseName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.navy },
  lecturerName: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray, marginTop: 2 },

  cardMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 8 },
  metaText: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },
  topic: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray, marginBottom: 10, lineHeight: 20 },

  reviewBtn: { alignSelf: 'flex-start', paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.lightGray, width: '100%' },
  reviewBtnText: { color: COLORS.navy, fontWeight: '700', fontSize: FONTS.sizes.sm },
});
