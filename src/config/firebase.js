import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBT73H0gzjh0T6dSofeT5VnBqFfzACkrio",
  authDomain: "luct-reporter-6ee04.firebaseapp.com",
  projectId: "luct-reporter-6ee04",
  storageBucket: "luct-reporter-6ee04.firebasestorage.app",
  messagingSenderId: "303097623222",
  appId: "1:303097623222:web:837404cd090532d754ec17"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export default app;