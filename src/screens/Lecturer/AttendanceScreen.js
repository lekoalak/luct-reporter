import TopBar from '../../components/TopBar';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { COLORS, FONTS } from '../../config/theme';
import {
  ScreenHeader, Card, Button, EmptyState, LoadingScreen, SearchBar, Badge,
} from '../../components/UIComponents';
import { subscribeLecturerReports } from '../../services/reportService';
import {
  markAttendance, getReportAttendance,
} from '../../services/attendanceService';
import { exportAttendanceToExcel } from '../../services/exportService';
import { useAuth } from '../../hooks/useAuth';

export default function AttendanceScreen({ navigation }) {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [attendance, setAttendance] = useState([]);
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

  const loadAttendance = async (report) => {
    setSelectedReport(report);
    try {
      const data = await getReportAttendance(report.id);
      setAttendance(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAttendanceToExcel(attendance, `Attendance_${selectedReport.courseCode}`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  const filtered = search
    ? reports.filter(r =>
        r.courseName?.toLowerCase().includes(search.toLowerCase()) ||
        r.courseCode?.toLowerCase().includes(search.toLowerCase())
      )
    : reports;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
    <TopBar title="Attendance" navigation={navigation} showBack={false} />
      <ScreenHeader
        title={selectedReport ? 'Attendance' : 'Select Class'}
        subtitle={selectedReport ? `${selectedReport.courseCode} · ${selectedReport.className}` : 'Choose a report to view attendance'}
      />

      {selectedReport ? (
        <View style={{ flex: 1 }}>
          <View style={styles.actionRow}>
            <Button
              title="← Back to Reports"
              onPress={() => { setSelectedReport(null); setAttendance([]); }}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title="⬇ Export"
              onPress={handleExport}
              loading={exporting}
              variant="secondary"
              style={{ flex: 0.6 }}
            />
          </View>

          <View style={styles.statsBanner}>
            <Text style={styles.statsText}>
              {attendance.filter(a => a.status === 'present').length} Present /
              {' '}{attendance.length} Recorded
            </Text>
          </View>

          <FlatList
            data={attendance}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <EmptyState
                icon="👥"
                title="No attendance recorded"
                message="Attendance will appear here once students are marked"
              />
            }
            renderItem={({ item }) => (
              <Card style={styles.attCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={styles.studentName}>{item.studentName || 'Unknown Student'}</Text>
                    <Text style={styles.studentId}>{item.studentId}</Text>
                  </View>
                  <Badge
                    label={item.status === 'present' ? '✓ Present' : '✗ Absent'}
                    color={item.status === 'present' ? COLORS.success : COLORS.error}
                  />
                </View>
              </Card>
            )}
          />
        </View>
      ) : (
        <>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search by course name or code..." />
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={<EmptyState icon="📋" title="No reports found" />}
            renderItem={({ item }) => (
              <Card
                onPress={() => loadAttendance(item)}
                style={{ marginBottom: 10 }}
              >
                <Text style={styles.courseCode}>{item.courseCode}</Text>
                <Text style={styles.courseName}>{item.courseName}</Text>
                <Text style={styles.classMeta}>
                  {item.className} · {item.weekOfReporting} · {item.venue}
                </Text>
                <Text style={styles.viewAtt}>View Attendance →</Text>
              </Card>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  statsBanner: {
    backgroundColor: COLORS.navy,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 4,
  },
  statsText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },

  attCard: { marginBottom: 10 },
  studentName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.navy },
  studentId: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 2 },

  courseCode: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.gold, textTransform: 'uppercase' },
  courseName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.navy, marginTop: 2 },
  classMeta: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 4 },
  viewAtt: { color: COLORS.navy, fontWeight: '700', fontSize: FONTS.sizes.sm, marginTop: 10 },
});
