import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'reports';

/**
 * Create a new lecture report
 */
export const createReport = async (reportData) => {
  try {
    const payload = {
      ...reportData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, COLLECTION), payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error('createReport error:', error);
    throw new Error('Failed to submit report. Please try again.');
  }
};

/**
 * Update an existing report
 */
export const updateReport = async (reportId, updates) => {
  try {
    const ref = doc(db, COLLECTION, reportId);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error('updateReport error:', error);
    throw new Error('Failed to update report.');
  }
};

/**
 * Delete a report
 */
export const deleteReport = async (reportId) => {
  try {
    await deleteDoc(doc(db, COLLECTION, reportId));
    return true;
  } catch (error) {
    console.error('deleteReport error:', error);
    throw new Error('Failed to delete report.');
  }
};

/**
 * Get a single report by ID
 */
export const getReport = async (reportId) => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, reportId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    throw new Error('Failed to fetch report.');
  }
};

/**
 * Get all reports by a specific lecturer
 */
export const getLecturerReports = async (lecturerId) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('lecturerId', '==', lecturerId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error('Failed to fetch reports.');
  }
};

/**
 * Get all reports for a faculty (PRL view)
 */
export const getFacultyReports = async (facultyName) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('facultyName', '==', facultyName),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error('Failed to fetch faculty reports.');
  }
};

/**
 * Get all reports (Program Leader)
 */
export const getAllReports = async () => {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error('Failed to fetch all reports.');
  }
};

/**
 * Add PRL feedback to a report
 */
export const addPRLFeedback = async (reportId, feedback, prlId) => {
  try {
    await updateDoc(doc(db, COLLECTION, reportId), {
      prlFeedback: feedback,
      prlId,
      feedbackAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw new Error('Failed to submit feedback.');
  }
};

/**
 * Real-time listener for lecturer reports
 */
export const subscribeLecturerReports = (lecturerId, callback) => {
  const q = query(
    collection(db, COLLECTION),
    where('lecturerId', '==', lecturerId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const reports = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(reports);
  }, (error) => {
    console.error('subscribeLecturerReports error:', error);
  });
};

/**
 * Real-time listener for faculty reports
 */
export const subscribeFacultyReports = (facultyName, callback) => {
  const q = query(
    collection(db, COLLECTION),
    where('facultyName', '==', facultyName),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const reports = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(reports);
  });
};

/**
 * Real-time listener for all reports (PL)
 */
export const subscribeAllReports = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const reports = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(reports);
  });
};

/**
 * Search reports by keyword across multiple fields
 */
export const searchReports = async (reports, keyword) => {
  const kw = keyword.toLowerCase();
  return reports.filter(r =>
    r.courseName?.toLowerCase().includes(kw) ||
    r.courseCode?.toLowerCase().includes(kw) ||
    r.lecturerName?.toLowerCase().includes(kw) ||
    r.topicTaught?.toLowerCase().includes(kw) ||
    r.className?.toLowerCase().includes(kw) ||
    r.venue?.toLowerCase().includes(kw)
  );
};
