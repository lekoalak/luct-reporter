import TopBar from '../../components/TopBar';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, ScrollView,
} from 'react-native';
import { COLORS, FONTS, FACULTIES } from '../../config/theme';
import {
  ScreenHeader, SearchBar, Card, Badge, EmptyState, LoadingScreen,
  Button, Input, Picker,
} from '../../components/UIComponents';
import { subscribeAllReports, searchReports } from '../../services/reportService';
import {
  subscribeAllCourses, createCourse, deleteCourse, searchCourses,
} from '../../services/courseService';
import { exportReportsToExcel } from '../../services/exportService';
import { useAuth } from '../../hooks/useAuth';

export default function PLDashboard({ navigation }) {
  const { user, userData } = useAuth();
  const [tab, setTab] = useState('reports'); // 'reports' | 'courses'
  const [reports, setReports] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [courseForm, setCourseForm] = useState({ name: '', code: '', faculty: '' });
  const [courseLoading, setCourseLoading] = useState(false);

  useEffect(() => {
    const unsub1 = subscribeAllReports((data) => {
      setReports(data);
      setLoading(false);
    });
    const unsub2 = subscribeAllCourses((data) => setCourses(data));
    return () => { unsub1(); unsub2(); };
  }, []);

  const filteredReports = search ? searchReports(reports, search) : reports;
  const filteredCourses = search ? searchCourses(courses, search) : courses;

  const handleAddCourse = async () => {
    if (!courseForm.name.trim() || !courseForm.code.trim() || !courseForm.faculty) {
      return Alert.alert('Error', 'Please fill in all course fields.');
    }
    setCourseLoading(true);
    try {
      await createCourse({ ...courseForm, programLeaderId: user.uid, registeredStudents: 0 });
      setShowAddCourse(false);
      setCourseForm({ name: '', code: '', faculty: '' });
      Alert.alert('Success', 'Course added successfully.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCourseLoading(false);
    }
  };

  const handleDeleteCourse = (id) => {
    Alert.alert('Delete Course', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCourse(id).catch(e => Alert.alert('Error', e.message)) },
    ]);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportReportsToExcel(filteredReports, 'All_Reports');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
    <TopBar title="Program Leader Portal" subtitle="University Overview" navigation={navigation} showBack={false} />
      

      {/* Stats Banner */}
      <View style={styles.statsRow}>
        <Stat num={reports.length} label="Reports" color={COLORS.navy} />
        <Stat num={courses.length} label="Courses" color={COLORS.gold} />
        <Stat
          num={reports.filter(r => !r.prlFeedback).length}
          label="Pending" color={COLORS.warning}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['reports', 'courses'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => { setTab(t); setSearch(''); }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'reports' ? '📋 Reports' : '📚 Courses'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search & Actions */}
      <SearchBar value={search} onChangeText={setSearch} placeholder={`Search ${tab}...`} />

      {tab === 'reports' && (
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Button title="⬇ Export Excel" onPress={handleExport} loading={exporting} variant="secondary" />
        </View>
      )}

      {tab === 'courses' && (
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Button title="+ Add Course" onPress={() => setShowAddCourse(true)} />
        </View>
      )}

      {/* Add Course Form */}
      {showAddCourse && tab === 'courses' && (
        <Card style={{ margin: 16, marginTop: 0 }}>
          <Text style={styles.formTitle}>New Course</Text>
          <Input label="Course Name" value={courseForm.name}
            onChangeText={v => setCourseForm(f => ({ ...f, name: v }))} required />
          <Input label="Course Code" value={courseForm.code}
            onChangeText={v => setCourseForm(f => ({ ...f, code: v }))} required />
          <Picker label="Faculty" value={courseForm.faculty} options={FACULTIES}
            onSelect={v => setCourseForm(f => ({ ...f, faculty: v }))} required />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Add Course" onPress={handleAddCourse} loading={courseLoading} style={{ flex: 1 }} />
            <Button title="Cancel" onPress={() => setShowAddCourse(false)} variant="outline" style={{ flex: 0.5 }} />
          </View>
        </Card>
      )}

      {/* List */}
      {tab === 'reports' ? (
        <FlatList
          data={filteredReports}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          ListEmptyComponent={<EmptyState icon="📋" title="No reports found" />}
          renderItem={({ item }) => (
            <Card
              onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
              style={{ marginBottom: 12 }}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseCode}>{item.courseCode}</Text>
                  <Text style={styles.courseName}>{item.courseName}</Text>
                  <Text style={styles.meta}>
                    👨‍🏫 {item.lecturerName} · {item.weekOfReporting} · 🏫 {item.venue}
                  </Text>
                </View>
                <Badge
                  label={item.prlFeedback ? '✓' : '⏳'}
                  color={item.prlFeedback ? COLORS.success : COLORS.warning}
                />
              </View>
              <Text style={styles.topic} numberOfLines={1}>📝 {item.topicTaught}</Text>
            </Card>
          )}
        />
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          ListEmptyComponent={<EmptyState icon="📚" title="No courses yet" message="Add a course to get started" />}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseCode}>{item.code}</Text>
                  <Text style={styles.courseName}>{item.name}</Text>
                  <Text style={styles.meta}>{item.faculty}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteCourse(item.id)}>
                  <Text style={{ fontSize: 18 }}>🗑</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const Stat = ({ num, label, color }) => (
  <View style={styles.stat}>
    <Text style={[styles.statNum, { color }]}>{num}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: FONTS.sizes.xxl, fontWeight: '900' },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 2 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: COLORS.navy },
  tabText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray },
  tabTextActive: { color: COLORS.white },

  formTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.navy, marginBottom: 16 },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  courseCode: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.gold, textTransform: 'uppercase' },
  courseName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.navy },
  meta: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 2 },
  topic: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray },
});
