import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { COLORS } from '../../config/theme';
import { Card, LoadingScreen } from '../../components/UIComponents';
import { db } from '../../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import TopBar from '../../components/TopBar';
import { showAlert } from '../../utils/alert';

const VENUES = [
  ...Array.from({length: 10}, (_, i) => `LR ${i + 1}`),
  ...Array.from({length: 15}, (_, i) => `Hall ${i + 1}`),
  ...Array.from({length: 15}, (_, i) => `MM ${i + 1}`),
];

const TIME_SLOTS = [
  '08:30 - 10:30',
  '10:30 - 12:30',
  '12:30 - 14:30',
  '14:30 - 16:30',
];

export default function AssignLecturerScreen({ navigation }) {
  const { user } = useAuth();
  const [lecturers, setLecturers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

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
    if (!courseName.trim() || !courseCode.trim() || !selectedLecturer || !selectedVenue || !selectedTime) {
      showAlert('Missing fields', 'Please fill in all fields including venue and time.');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'assignments'), {
        courseName: courseName.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        lecturerId: selectedLecturer.id,
        lecturerName: selectedLecturer.name,
        venue: selectedVenue,
        timeSlot: selectedTime,
        assignedBy: user.uid,
        createdAt: serverTimestamp(),
      });
      showAlert('Success', `${courseCode.toUpperCase()} assigned to ${selectedLecturer.name} at ${selectedVenue}, ${selectedTime}!`);
      setCourseName('');
      setCourseCode('');
      setSelectedLecturer(null);
      setSelectedVenue(null);
      setSelectedTime(null);
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

  if (loading) return <LoadingScreen message="Loading..." />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
      <TopBar title="Assign Courses" navigation={navigation} showBack={true} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

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

          {/* LECTURER PICKER */}
          <Text style={styles.label}>Select Lecturer:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {lecturers.map(l => (
              <TouchableOpacity
                key={l.id}
                style={[styles.chipBtn, selectedLecturer?.id === l.id && styles.chipSelected]}
                onPress={() => setSelectedLecturer(l)}
              >
                <Text style={[styles.chipText, selectedLecturer?.id === l.id && styles.chipTextSelected]}>
                  {l.name}
                </Text>
              </TouchableOpacity>
            ))}
            {lecturers.length === 0 && (
              <Text style={{ color: COLORS.gray, padding: 8 }}>No lecturers registered yet.</Text>
            )}
          </ScrollView>

          {/* TIME SLOT PICKER */}
          <Text style={styles.label}>Select Time Slot:</Text>
          <View style={styles.gridRow}>
            {TIME_SLOTS.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chipBtn, selectedTime === t && styles.chipSelected]}
                onPress={() => setSelectedTime(t)}
              >
                <Text style={[styles.chipText, selectedTime === t && styles.chipTextSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* VENUE PICKER */}
          <Text style={styles.label}>Select Venue:</Text>

          <Text style={styles.venueGroup}>Lecture Rooms</Text>
          <View style={styles.gridRow}>
            {VENUES.filter(v => v.startsWith('LR')).map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.venueBtn, selectedVenue === v && styles.venueBtnSelected]}
                onPress={() => setSelectedVenue(v)}
              >
                <Text style={[styles.venueTxt, selectedVenue === v && styles.venueTxtSelected]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.venueGroup}>Halls</Text>
          <View style={styles.gridRow}>
            {VENUES.filter(v => v.startsWith('Hall')).map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.venueBtn, selectedVenue === v && styles.venueBtnSelected]}
                onPress={() => setSelectedVenue(v)}
              >
                <Text style={[styles.venueTxt, selectedVenue === v && styles.venueTxtSelected]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.venueGroup}>Multimedia Rooms</Text>
          <View style={styles.gridRow}>
            {VENUES.filter(v => v.startsWith('MM')).map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.venueBtn, selectedVenue === v && styles.venueBtnSelected]}
                onPress={() => setSelectedVenue(v)}
              >
                <Text style={[styles.venueTxt, selectedVenue === v && styles.venueTxtSelected]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SUMMARY */}
          {(selectedLecturer || selectedVenue || selectedTime) && (
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Summary</Text>
              {selectedLecturer && <Text style={styles.summaryText}>👤 {selectedLecturer.name}</Text>}
              {selectedVenue && <Text style={styles.summaryText}>📍 {selectedVenue}</Text>}
              {selectedTime && <Text style={styles.summaryText}>🕐 {selectedTime}</Text>}
            </View>
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
          <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 20 }}>No assignments yet.</Text>
        ) : (
          assignments.map(a => (
            <Card key={a.id} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assignCode}>{a.courseCode} — {a.courseName}</Text>
                  <Text style={styles.assignLec}>👤 {a.lecturerName}</Text>
                  <Text style={styles.assignMeta}>📍 {a.venue || '—'}  🕐 {a.timeSlot || '—'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemove(a.id, a.lecturerName)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
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
  label: { fontSize: 13, fontWeight: '700', color: '#002147', marginBottom: 8, marginTop: 8 },
  venueGroup: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 8 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  chipBtn: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff', marginRight: 6, marginBottom: 4 },
  chipSelected: { backgroundColor: '#002147', borderColor: '#002147' },
  chipText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  chipTextSelected: { color: '#C9A84C' },
  venueBtn: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff' },
  venueBtnSelected: { backgroundColor: '#002147', borderColor: '#002147' },
  venueTxt: { fontSize: 12, color: '#374151', fontWeight: '600' },
  venueTxtSelected: { color: '#C9A84C' },
  summary: { backgroundColor: '#F0F4F8', borderRadius: 8, padding: 12, marginTop: 12, marginBottom: 4 },
  summaryTitle: { fontSize: 12, fontWeight: '800', color: '#002147', marginBottom: 6 },
  summaryText: { fontSize: 13, color: '#374151', marginBottom: 3 },
  assignBtn: { backgroundColor: '#C9A84C', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  assignBtnText: { color: '#002147', fontWeight: '800', fontSize: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  assignCode: { fontSize: 14, fontWeight: '800', color: '#002147' },
  assignLec: { fontSize: 12, color: '#374151', marginTop: 3 },
  assignMeta: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  removeBtn: { borderWidth: 1, borderColor: '#EF4444', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  removeBtnText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },
});