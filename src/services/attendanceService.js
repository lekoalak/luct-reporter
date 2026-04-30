import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ────────────── ATTENDANCE ──────────────

/**
 * Mark attendance for a student
 */
export const markAttendance = async ({ reportId, studentId, studentName, status }) => {
  try {
    const payload = {
      reportId,
      studentId,
      studentName,
      status, // 'present' | 'absent'
      timestamp: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'attendance'), payload);
    return { id: ref.id, ...payload };
  } catch (error) {
    throw new Error('Failed to mark attendance.');
  }
};

/**
 * Get attendance records for a report
 */
export const getReportAttendance = async (reportId) => {
  try {
    const q = query(
      collection(db, 'attendance'),
      where('reportId', '==', reportId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error('Failed to fetch attendance.');
  }
};

/**
 * Get attendance for a student across all reports
 */
export const getStudentAttendance = async (studentId) => {
  try {
    const q = query(
      collection(db, 'attendance'),
      where('studentId', '==', studentId),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error('Failed to fetch student attendance.');
  }
};

/**
 * Real-time listener for student attendance
 */
export const subscribeStudentAttendance = (studentId, callback) => {
  const q = query(
    collection(db, 'attendance'),
    where('studentId', '==', studentId),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

// ────────────── RATINGS ──────────────

/**
 * Submit a rating
 */
export const submitRating = async ({ targetId, targetType, raterId, raterRole, score, comment }) => {
  try {
    // Check if already rated
    const q = query(
      collection(db, 'ratings'),
      where('targetId', '==', targetId),
      where('raterId', '==', raterId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      // Update existing
      await updateDoc(doc(db, 'ratings', snap.docs[0].id), {
        score,
        comment,
        updatedAt: serverTimestamp(),
      });
      return { updated: true };
    }
    // Create new
    const payload = {
      targetId,
      targetType,
      raterId,
      raterRole,
      score,
      comment,
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'ratings'), payload);
    return { id: ref.id, ...payload };
  } catch (error) {
    throw new Error('Failed to submit rating.');
  }
};

/**
 * Get all ratings for a target (lecturer or course)
 */
export const getRatings = async (targetId) => {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('targetId', '==', targetId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error('Failed to fetch ratings.');
  }
};

/**
 * Calculate average rating
 */
export const getAverageRating = (ratings) => {
  if (!ratings.length) return 0;
  const sum = ratings.reduce((acc, r) => acc + (r.score || 0), 0);
  return (sum / ratings.length).toFixed(1);
};

/**
 * Real-time listener for ratings of a target
 */
export const subscribeRatings = (targetId, callback) => {
  const q = query(
    collection(db, 'ratings'),
    where('targetId', '==', targetId)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};
