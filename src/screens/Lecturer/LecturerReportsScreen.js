import TopBar from '../../components/TopBar';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { COLORS, FONTS } from '../../config/theme';
import {
  ScreenHeader, SearchBar, Card, Badge, EmptyState, LoadingScreen, Button,
} from '../../components/UIComponents';
import { subscribeLecturerReports, searchReports, deleteReport } from '../../services/reportService';
import { exportReportsToExcel } from '../../services/exportService';
import { useAuth } from '../../hooks/useAuth';

export default function LecturerReportsScreen({ navigation }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const unsub = subscribeLecturerReports(user.uid, (data) => {
      setReports(data);
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  const filtered = search ? searchReports(reports, search) : reports;

  const handleDelete = (id) => {
    Alert.alert('Delete Report', 'Are you sure you want to delete this report?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReport(id);
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReportsToExcel(filtered, 'My_Reports');
    } catch (e) {
      Alert.alert('Export Error', e.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading your reports..." />;

  return (
    <View style={styles.container}>
    <TopBar title="My Reports" navigation={navigation} showBack={false} />
      <ScreenHeader
        title="My Reports"
        subtitle={`${reports.length} report${reports.length !== 1 ? 's' : ''} submitted`}
      />

      <View style={styles.actionRow}>
        <Button
          title="+ New Report"
          onPress={() => navigation.navigate('SubmitReport')}
          style={styles.newBtn}
        />
        <Button
          title="⬇ Export"
          onPress={handleExport}
          variant="secondary"
          loading={exporting}
          style={styles.exportBtn}
        />
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search by topic, course, venue..." />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title={search ? 'No results found' : 'No reports yet'}
            message={search ? 'Try a different search term' : 'Tap "+ New Report" to submit your first report'}
          />
        }
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            onView={() => navigation.navigate('ReportDetail', { reportId: item.id })}
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />
    </View>
  );
}

const ReportCard = ({ report, onView, onDelete }) => {
  const attendance = report.totalRegisteredStudents
    ? Math.round((report.actualStudentsPresent / report.totalRegisteredStudents) * 100)
    : 0;
  const attendanceColor = attendance >= 75 ? COLORS.success : attendance >= 50 ? COLORS.warning : COLORS.error;

  return (
    <Card style={styles.card} onPress={onView}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.courseCode}>{report.courseCode}</Text>
          <Text style={styles.courseName} numberOfLines={1}>{report.courseName}</Text>
        </View>
        <Badge
          label={`${attendance}%`}
          color={attendanceColor}
        />
      </View>

      <View style={styles.cardMeta}>
        <MetaItem icon="🏫" text={report.venue} />
        <MetaItem icon="📅" text={report.weekOfReporting} />
        <MetaItem icon="👥" text={`${report.actualStudentsPresent}/${report.totalRegisteredStudents}`} />
      </View>

      <Text style={styles.topic} numberOfLines={2}>📝 {report.topicTaught}</Text>

      {report.prlFeedback && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>💬 PRL Feedback: {report.prlFeedback}</Text>
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity onPress={onView} style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>View Details →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const MetaItem = ({ icon, text }) => (
  <View style={styles.metaItem}>
    <Text style={styles.metaIcon}>{icon}</Text>
    <Text style={styles.metaText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  newBtn: { flex: 1 },
  exportBtn: { flex: 0, paddingHorizontal: 16 },
  list: { padding: 16, paddingTop: 4 },

  card: { marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  courseCode: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.gold, textTransform: 'uppercase' },
  courseName: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.navy, marginTop: 2 },

  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { fontSize: 13 },
  metaText: { fontSize: FONTS.sizes.xs, color: COLORS.darkGray },

  topic: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray, lineHeight: 20 },

  feedbackBanner: {
    backgroundColor: COLORS.gold + '20',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  feedbackText: { fontSize: FONTS.sizes.xs, color: COLORS.navyDark, lineHeight: 18 },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 10,
  },
  viewBtn: { padding: 4 },
  viewBtnText: { color: COLORS.navy, fontWeight: '700', fontSize: FONTS.sizes.sm },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 18 },
});
