import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'courses';
const ASSIGNMENTS = 'courseAssignments';

/**
 * Add a new course (PL)
 */
export const createCourse = async (courseData) => {
  try {
    const payload = { ...courseData, createdAt: serverTimestamp() };
    const ref = await addDoc(collection(db, COLLECTION), payload);
    return { id: ref.id, ...payload };
  } catch (error) {
    throw new Error('Failed to create course.');
  }
};

/**
 * Update course
 */
export const updateCourse = async (courseId, updates) => {
  try {
    await updateDoc(doc(db, COLLECTION, courseId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw new Error('Failed to update course.');
  }
};

/**
 * Delete course
 */
export const deleteCourse = async (courseId) => {
  try {
    await deleteDoc(doc(db, COLLECTION, courseId));
    return true;
  } catch (error) {
    throw new Error('Failed to delete course.');
  }
};

/**
 * Get all courses
 */
export const getAllCourses = async () => {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error('Failed to fetch courses.');
  }
};

/**
 * Get courses by faculty
 */
export const getFacultyCourses = async (faculty) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('faculty', '==', faculty),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error('Failed to fetch faculty courses.');
  }
};

/**
 * Assign lecturer to a course (PL)
 */
export const assignLecturer = async (courseId, lecturerId, principalLecturerId, className) => {
  try {
    const payload = {
      courseId,
      lecturerId,
      principalLecturerId,
      className,
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, ASSIGNMENTS), payload);
    return { id: ref.id, ...payload };
  } catch (error) {
    throw new Error('Failed to assign lecturer.');
  }
};

/**
 * Get assignments for a specific lecturer
 */
export const getLecturerAssignments = async (lecturerId) => {
  try {
    const q = query(
      collection(db, ASSIGNMENTS),
      where('lecturerId', '==', lecturerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw new Error('Failed to fetch assignments.');
  }
};

/**
 * Real-time listener for all courses
 */
export const subscribeAllCourses = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

/**
 * Search courses by keyword
 */
export const searchCourses = (courses, keyword) => {
  const kw = keyword.toLowerCase();
  return courses.filter(c =>
    c.name?.toLowerCase().includes(kw) ||
    c.code?.toLowerCase().includes(kw) ||
    c.faculty?.toLowerCase().includes(kw)
  );
};
