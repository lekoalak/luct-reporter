import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// ⚠️ Replace these values with your actual Firebase project config
// from https://console.firebase.google.com → Project Settings → General → Your apps
const firebaseConfig = {
  apiKey: "AIzaSyBT73H0gzjh0T6dSofeT5VnBqFfzACkrio",
  authDomain: "luct-reporter-6ee04.firebaseapp.com",
  projectId: "luct-reporter-6ee04",
  storageBucket: "luct-reporter-6ee04.firebasestorage.app",
  messagingSenderId: "303097623222",
  appId: "1:303097623222:web:837404cd090532d754ec17",
  measurementId: "G-HGYTDCSNMM"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;

/*
 FIRESTORE COLLECTIONS SCHEMA:
 
 users/
   {uid}/
     name: string
     email: string
     role: 'student' | 'lecturer' | 'principal_lecturer' | 'program_leader'
     faculty: string
     studentId?: string
     staffId?: string
     createdAt: timestamp

 courses/
   {courseId}/
     name: string
     code: string
     faculty: string
     programLeaderId: string
     registeredStudents: number
     createdAt: timestamp

 courseAssignments/
   {assignmentId}/
     courseId: string
     lecturerId: string
     principalLecturerId: string
     className: string
     createdAt: timestamp

 reports/
   {reportId}/
     facultyName: string
     className: string
     weekOfReporting: string
     dateOfLecture: timestamp
     courseName: string
     courseCode: string
     lecturerId: string
     lecturerName: string
     actualStudentsPresent: number
     totalRegisteredStudents: number
     venue: string
     scheduledLectureTime: string
     topicTaught: string
     learningOutcomes: string
     recommendations: string
     prlFeedback?: string
     createdAt: timestamp
     updatedAt: timestamp

 attendance/
   {attendanceId}/
     reportId: string
     studentId: string
     status: 'present' | 'absent'
     timestamp: timestamp

 ratings/
   {ratingId}/
     targetId: string  (lecturerId or courseId)
     targetType: 'lecturer' | 'course'
     raterId: string
     raterRole: string
     score: number (1-5)
     comment: string
     createdAt: timestamp
*/
