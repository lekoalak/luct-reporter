import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '../../config/theme';
import { Card, LoadingScreen } from '../../components/UIComponents';
import { db } from '../../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import TopBar from '../../components/TopBar';
import { showAlert } from '../../utils/alert';

export default function MarkAttendanceScreen({ navigation }) {
  const { user, userData } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});
  const [className, setClassName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(list);
      const initial = {};
      list.forEach(s => { initial[s.id] = 'present'; });
      setAttendance(initial);
    } catch (e) {
      showAlert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present',
    }));
  };

  const handleSave = async () => {
    if (!className.trim() || !courseCode.trim()) {
      showAlert('Missing fields', 'Please enter class name and course code.');
      return;
    }
    setSaving(true);
    try {
      const batch = students.map(s =>
        addDoc(collection(db, 'attendance'), {
          studentId: s.id,
          studentName: s.name,
          lecturerId: user.uid,
          lecturerName: userData?.name,
          className: className.trim(),
          courseCode: courseCode.trim().toUpperCase(),
          status: attendance[s.id] || 'absent',
          timestamp: serverTimestamp(),
        })
      );
      await Promise.all(batch);
      showAlert('Success', `Attendance saved for ${students.length} students!`);
      navigation.goBack();
    } catch (e) {
      showAlert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = search
    ? students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
    : students;

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length;

  if (loading) return <LoadingScreen message="Loading students..." />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
      <TopBar title="Mark Attendance" navigation={navigation} showBack={true} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

        <Card style={{ marginBottom: 16 }}>
          <Text style={styles.cardTitle}>Class Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Class name (e.g. BIMP2210 - Group A)"
            placeholderTextColor={COLORS.gray}
            value={className}
            onChangeText={setClassName}
          />
          <TextInput
            style={styles.input}
            placeholder="Course code (e.g. BIMP2210)"
            placeholderTextColor={COLORS.gray}
            value={courseCode}
            onChangeText={setCourseCode}
            autoCapitalize="characters"
          />
        </Card>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderTopColor: '#10B981' }]}>
            <Text style={[styles.statNum, { color: '#10B981' }]}>{presentCount}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={[styles.statBox, { borderTopColor: '#EF4444' }]}>
            <Text style={[styles.statNum, { color: '#EF4444' }]}>{absentCount}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={[styles.statBox, { borderTopColor: '#002147' }]}>
            <Text style={[styles.statNum, { color: '#002147' }]}>{students.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            placeholderTextColor={COLORS.gray}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>Student Name</Text>
          <Text style={styles.listHeaderText}>Status</Text>
        </View>

        {filtered.map(s => (
          <Card key={s.id} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{s.name?.[0]?.toUpperCase() || 'S'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{s.name}</Text>
              <Text style={styles.studentId}>{s.studentId || s.email}</Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, attendance[s.id] === 'present' ? styles.presentBtn : styles.absentBtn]}
              onPress={() => toggle(s.id)}
            >
              <Text style={styles.toggleText}>
                {attendance[s.id] === 'present' ? '✓ Present' : '✗ Absent'}
              </Text>
            </TouchableOpacity>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Text style={{ textAlign: 'center', color: COLORS.gray, marginTop: 20 }}>
            No students found.
          </Text>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : `Save Attendance (${students.length} students)`}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#002147', marginBottom: 12 },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10,
    fontSize: 14, color: '#1A202C', backgroundColor: '#fff',
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10,
    padding: 12, alignItems: 'center', borderTopWidth: 3, elevation: 2,
  },
  statNum: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  searchBox: { marginBottom: 12 },
  searchInput: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#1A202C', backgroundColor: '#fff',
  },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 4, marginBottom: 8,
  },
  listHeaderText: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#002147', alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  avatarText: { color: '#C9A84C', fontWeight: '800', fontSize: 16 },
  studentName: { fontSize: 14, fontWeight: '700', color: '#002147' },
  studentId: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  toggleBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  presentBtn: { backgroundColor: '#10B981' },
  absentBtn: { backgroundColor: '#EF4444' },
  toggleText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  saveBtn: {
    backgroundColor: '#002147', borderRadius: 8,
    paddingVertical: 14, alignItems: 'center', marginTop: 16,
  },
  saveBtnText: { color: '#C9A84C', fontWeight: '800', fontSize: 15 },
});