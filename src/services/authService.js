import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password, role, faculty, studentId, staffId }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    const userData = {
      name,
      email,
      role,
      faculty,
      createdAt: serverTimestamp(),
    };
    if (studentId) userData.studentId = studentId;
    if (staffId) userData.staffId = staffId;

    await setDoc(doc(db, 'users', user.uid), userData);

    return { user, userData };
  } catch (error) {
    throw new Error(parseAuthError(error.code));
  }
};

/**
 * Login existing user
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) throw new Error('User profile not found.');
    return { user, userData: userDoc.data() };
  } catch (error) {
    throw new Error(parseAuthError(error.code));
  }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error('Logout failed. Please try again.');
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) return userDoc.data();
    return null;
  } catch (error) {
    throw new Error('Failed to fetch user profile.');
  }
};

/**
 * Auth state listener
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Parse Firebase error codes to user-friendly messages
 */
const parseAuthError = (code) => {
  const errors = {
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return errors[code] || 'An unexpected error occurred.';
};
