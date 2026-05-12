import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '../../config/theme';
import { Card, LoadingScreen } from '../../components/UIComponents';
import { db } from '../../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import TopBar from '../../components/TopBar';
import { showAlert } from '../../utils/alert';

const STARS = [1, 2, 3, 4, 5];
const STAR_LABELS = { 1: '😞 Poor', 2: '😕 Below Average', 3: '😐 Average', 4: '😊 Good', 5: '🌟 Excellent' };

export default function StudentRatingsScreen({ navigation }) {
  const { user, userData } = useAuth();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [myRatings, setMyRatings] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const lSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'lecturer')));
      setLecturers(lSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const rSnap = await getDocs(query(collection(db, 'ratings'), where('raterId', '==', user.uid)));
      setMyRatings(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      showAlert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const alreadyRated = (lecturerId) => myRatings.some(r => r.lecturerId === lecturerId);

  const handleSubmit = async () => {
    if (!selected) { showAlert('Select a lecturer', 'Please choose a lecturer to rate.'); return; }
    if (stars === 0) { showAlert('Select stars', 'Please give a star rating.'); return; }
    if (alreadyRated(selected.id)) { showAlert('Already rated', 'You have already rated this lecturer.'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, 'ratings'), {
        lecturerId: selected.id,
        lecturerName: selected.name,
        raterId: user.uid,
        raterName: userData?.name || 'Student',
        raterRole: 'student',
        score: stars,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      showAlert('Thank you!', `You rated ${selected.name} ${stars} star${stars !== 1 ? 's' : ''}.`);
      setSelected(null);
      setStars(0);
      setComment('');
      loadData();
    } catch (e) {
      showAlert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading lecturers..." />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.offWhite }}>
      <TopBar title="Rate Lecturers" navigation={navigation} showBack={false} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

        {!selected ? (
          <>
            <Text style={styles.sectionTitle}>Choose a lecturer to rate</Text>
            {lecturers.map(l => (
              <Card key={l.id} style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{l.name?.[0]?.toUpperCase() || 'L'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lecName}>{l.name}</Text>
                  <Text style={styles.lecFac}>{l.faculty?.replace('Faculty of ', '')}</Text>
                </View>
                {alreadyRated(l.id) ? (
                  <View style={styles.ratedBadge}><Text style={styles.ratedText}>Rated ✓</Text></View>
                ) : (
                  <TouchableOpacity style={styles.rateBtn} onPress={() => setSelected(l)}>
                    <Text style={styles.rateBtnText}>Rate</Text>
                  </TouchableOpacity>
                )}
              </Card>
            ))}
            {lecturers.length === 0 && (
              <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 30 }}>No lecturers found.</Text>
            )}
          </>
        ) : (
          <Card>
            <TouchableOpacity onPress={() => setSelected(null)} style={{ marginBottom: 16 }}>
              <Text style={{ color: '#C9A84C', fontWeight: '700' }}>← Back to list</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={styles.avatar}>
                <Text style={{ color: '#C9A84C', fontWeight: '800', fontSize: 28 }}>{selected.name?.[0]}</Text>
              </View>
              <Text style={styles.selName}>{selected.name}</Text>
              <Text style={styles.selFac}>{selected.faculty?.replace('Faculty of ', '')}</Text>
            </View>

            <Text style={styles.label}>Your rating:</Text>
            <View style={styles.starsRow}>
              {STARS.map(n => (
                <TouchableOpacity key={n} onPress={() => setStars(n)}>
                  <Text style={{ fontSize: 36, opacity: n <= stars ? 1 : 0.25 }}>⭐</Text>
                </TouchableOpacity>
              ))}
            </View>
            {stars > 0 && (
              <Text style={styles.starLabel}>{STAR_LABELS[stars]}</Text>
            )}

            <Text style={[styles.label, { marginTop: 16 }]}>Comment (optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="Share your experience..."
              placeholderTextColor={COLORS.gray}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitBtn, saving && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={saving}
            >
              <Text style={styles.submitBtnText}>{saving ? 'Submitting…' : 'Submit Rating'}</Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#002147', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#C9A84C', fontWeight: '800', fontSize: 18 },
  lecName: { fontSize: 14, fontWeight: '700', color: '#002147' },
  lecFac: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  rateBtn: { backgroundColor: '#C9A84C', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 6 },
  rateBtnText: { color: '#002147', fontWeight: '800', fontSize: 12 },
  ratedBadge: { borderWidth: 1, borderColor: '#10B981', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  ratedText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  selName: { fontSize: 20, fontWeight: '900', color: '#002147', marginTop: 10 },
  selFac: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  label: { fontSize: 13, fontWeight: '700', color: '#002147', marginBottom: 8 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  starLabel: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#002147', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 14, color: '#1A202C', backgroundColor: '#fff', minHeight: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#002147', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  submitBtnText: { color: '#C9A84C', fontWeight: '800', fontSize: 15 },
});