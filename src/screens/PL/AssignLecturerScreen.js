import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { COLORS } from '../../config/theme';
import { Card, LoadingScreen } from '../../components/UIComponents';
import { db } from '../../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import TopBar from '../../components/TopBar';
import { showAlert } from '../../utils/alert';

export default function AssignLecturerScreen({ navigation }) {
  const { user } = useAuth();
  const [lecturers, setLecturers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const lSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'lecturer')));
      setLecturers(lSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const aSnap = await getDocs(collection(db, 'assignments'));
      setAssignments(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      showAlert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!courseName.trim() || !courseCode.trim() || !selectedLecturer) {
      showAlert('Missing fields', 'Please fill in course name, code, and select a lecturer.');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'assignments'), {
        courseName: courseName.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        lecturerId: selectedLecturer.id,
        lecturerName: selectedLecturer.name,
        assignedBy: user.uid,
        createdAt: serverTimestamp(),
      });
      showAlert('Success', `${courseCode.toUpperCase()} assigned to ${selectedLecturer.name}!`);
      setCourseName('');
      setCourseCode('');
      setSelectedLecturer(null);
      loadData();
    } catch (e) {
      showAlert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id, name) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Remove assignment for ${name}?`)) return;
    }
    try {
      await deleteDoc(doc(db, 'assignments', id));
      loadData();
    } catch (e) {
      showAlert('Error', e.message);
    }
  };

  if (loading) return <LoadingScreen message="Loading lecturers..." />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
      <TopBar title="Assign Courses" navigation={navigation} showBack={true} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} style={{ flex: 1 }}>

        <Card style={{ marginBottom: 20 }}>
          <Text style={styles.cardTitle}>New Assignment</Text>
          <TextInput
            style={styles.input}
            placeholder="Course name (e.g. Web Development)"
            placeholderTextColor={COLORS.gray}
            value={courseName}
            onChangeText={setCourseName}
          />
          <TextInput
            style={styles.input}
            placeholder="Course code (e.g. BIMP2210)"
            placeholderTextColor={COLORS.gray}
            value={courseCode}
            onChangeText={setCourseCode}
            autoCapitalize="characters"
          />
          <Text style={styles.label}>Select Lecturer:</Text>
          {lecturers.map(l => (
            <TouchableOpacity
              key={l.id}
              style={[styles.lecturerBtn, selectedLecturer?.id === l.id && styles.lecturerBtnSelected]}
              onPress={() => setSelectedLecturer(l)}
            >
              <Text style={[styles.lecturerName, selectedLecturer?.id === l.id && { color: '#fff' }]}>
                {l.name}
              </Text>
              <Text style={[styles.lecturerSub, selectedLecturer?.id === l.id && { color: '#C9A84C' }]}>
                {l.faculty?.replace('Faculty of ', '')}
              </Text>
            </TouchableOpacity>
          ))}
          {lecturers.length === 0 && (
            <Text style={{ color: COLORS.gray, textAlign: 'center', marginVertical: 12 }}>
              No lecturers registered yet.
            </Text>
          )}
          <TouchableOpacity
            style={[styles.assignBtn, saving && { opacity: 0.6 }]}
            onPress={handleAssign}
            disabled={saving}
          >
            <Text style={styles.assignBtnText}>{saving ? 'Assigning…' : '+ Assign Course'}</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitle}>Current Assignments ({assignments.length})</Text>
        {assignments.length === 0 ? (
          <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 20 }}>
            No assignments yet.
          </Text>
        ) : (
          assignments.map(a => (
            <Card key={a.id} style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.assignCode}>{a.courseCode}</Text>
                <Text style={styles.assignName}>{a.courseName}</Text>
                <Text style={styles.assignLec}>→ {a.lecturerName}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(a.id, a.lecturerName)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#002147', marginBottom: 14 },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10,
    fontSize: 14, color: '#1A202C', backgroundColor: '#fff',
  },
  label: { fontSize: 13, fontWeight: '700', color: '#002147', marginBottom: 8, marginTop: 4 },
  lecturerBtn: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
    padding: 10, marginBottom: 8, backgroundColor: '#fff',
  },
  lecturerBtnSelected: { backgroundColor: '#002147', borderColor: '#002147' },
  lecturerName: { fontSize: 14, fontWeight: '700', color: '#002147' },
  lecturerSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  assignBtn: {
    backgroundColor: '#C9A84C', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center', marginTop: 12,
  },
  assignBtnText: { color: '#002147', fontWeight: '800', fontSize: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  assignCode: { fontSize: 15, fontWeight: '800', color: '#002147' },
  assignName: { fontSize: 13, color: '#374151', marginTop: 2 },
  assignLec: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  removeBtn: { borderWidth: 1, borderColor: '#EF4444', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  removeBtnText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
});
