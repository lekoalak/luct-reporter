# 📱 LUCT Reporter — Mobile Application

**Limkokwing University of Creative Technology**
Faculty of Information Communication Technology
BSc Degree in Software Engineering with Multimedia — BIMP2210

> A React Native mobile application for lecture reporting, attendance tracking, student monitoring, and academic quality management.

---

## 📋 Assignment Info

| Field | Value |
|-------|-------|
| Module | Mobile Device Programming – BIMP2210 |
| Assignment | Assignment 2 (25%) |
| Lecturer | tsekiso.thokoana@limkokwing.ac.ls |
| Deadline | Week 9 |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native (Expo) |
| **Styling** | React Native StyleSheet + Flexbox |
| **Navigation** | React Navigation v6 (Stack + Bottom Tabs) |
| **Backend** | Firebase (Node.js SDK) |
| **Database** | Firestore (real-time NoSQL) |
| **Auth** | Firebase Authentication |
| **Notifications** | Firebase Cloud Messaging (FCM) |
| **Export** | XLSX (Excel report generation) |
| **Hosting** | Firebase Hosting (web build via Expo) |

---

## 👥 User Roles & Features

### 🎓 Student
- Login / Register
- View attendance history (real-time)
- Monitor lecture reports
- Rate lecturers

### 👨‍🏫 Lecturer
- Login / Register
- Submit lecture reports (full form)
- View / edit / delete own reports
- Manage class attendance
- View PRL feedback
- Rate courses
- Export reports to Excel

### 🎓 Principal Lecturer (PRL)
- View all reports in faculty (real-time)
- Add feedback to reports
- Monitor lectures
- Rate lecturers
- Export faculty reports to Excel

### 🏛️ Program Leader (PL)
- Add / assign / manage courses
- View all reports university-wide (real-time)
- Monitor all lectures
- Export all reports to Excel

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+ or yarn
- Expo CLI: `npm install -g expo-cli`
- Firebase account: https://console.firebase.google.com

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/luct-reporter.git
cd luct-reporter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g. `luct-reporter`)
3. Enable **Firestore Database** (start in test mode, then apply rules)
4. Enable **Authentication** → Email/Password provider
5. Go to **Project Settings → General → Your Apps** → Add a Web App
6. Copy the config and paste it into `src/config/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

⚠️ **Never commit your real Firebase config to a public GitHub repo.**
Use environment variables or add `src/config/firebase.js` to `.gitignore` for production.

---

### 4. Deploy Firestore Security Rules

Install Firebase CLI if not already installed:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
```

Then deploy:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

### 5. Run the App Locally

```bash
# Start Expo dev server
npx expo start

# Run on Android emulator
npx expo start --android

# Run on iOS simulator
npx expo start --ios

# Run in web browser
npx expo start --web
```

Scan the QR code with **Expo Go** app on your physical device.

---

## 🌐 Hosting (Web Build)

### Build for Web
```bash
npx expo export --platform web
```

### Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

Your app will be live at:
```
https://YOUR_PROJECT_ID.web.app
```

---

## 📤 Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "feat: initial LUCT Reporter app — BIMP2210 Assignment 2"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/luct-reporter.git
git branch -M main
git push -u origin main
```

Submit the GitHub link and Firebase Hosting URL to Google Classroom.

---

## 🗄️ Firestore Database Schema

```
users/
  {uid}/ → name, email, role, faculty, studentId?, staffId?, createdAt

courses/
  {courseId}/ → name, code, faculty, programLeaderId, registeredStudents, createdAt

courseAssignments/
  {id}/ → courseId, lecturerId, principalLecturerId, className, createdAt

reports/
  {reportId}/ → facultyName, className, weekOfReporting, dateOfLecture,
                  courseName, courseCode, lecturerId, lecturerName,
                  actualStudentsPresent, totalRegisteredStudents,
                  venue, scheduledLectureTime, topicTaught,
                  learningOutcomes, recommendations,
                  prlFeedback?, prlId?, feedbackAt?, createdAt, updatedAt

attendance/
  {attendanceId}/ → reportId, studentId, studentName, status, timestamp

ratings/
  {ratingId}/ → targetId, targetType, raterId, raterRole, score, comment, createdAt
```

---

## 🏫 Venues Reference

| Type | Range |
|------|-------|
| Lecture Rooms | Lecture Room 1 – 15 |
| Lecture Halls | Lecture Hall 1 – 15 |
| Multimedia Labs | MM 1 – MM 10 |

---

## 📁 Project Structure

```
luct-reporter/
├── App.js                          # Root entry point
├── app.json                        # Expo config
├── firebase.json                   # Firebase hosting config
├── firestore.rules                 # Security rules
├── firestore.indexes.json          # Composite indexes
├── src/
│   ├── config/
│   │   ├── firebase.js             # Firebase initialization
│   │   └── theme.js                # LUCT colors, fonts, constants
│   ├── hooks/
│   │   └── useAuth.js              # Auth context & hook
│   ├── services/
│   │   ├── authService.js          # Firebase Auth operations
│   │   ├── reportService.js        # CRUD + real-time for reports
│   │   ├── courseService.js        # CRUD + real-time for courses
│   │   ├── attendanceService.js    # Attendance + ratings
│   │   └── exportService.js        # Excel export (XLSX)
│   ├── components/
│   │   └── UIComponents.js         # Button, Input, Card, Picker, etc.
│   ├── navigation/
│   │   └── AppNavigator.js         # Role-based navigation
│   └── screens/
│       ├── Auth/
│       │   ├── LoginScreen.js
│       │   └── RegisterScreen.js
│       ├── Student/
│       │   └── StudentDashboard.js
│       ├── Lecturer/
│       │   ├── LecturerDashboard.js
│       │   ├── LecturerReportsScreen.js
│       │   ├── SubmitReportScreen.js
│       │   └── AttendanceScreen.js
│       ├── PRL/
│       │   └── PRLDashboard.js
│       ├── PL/
│       │   └── PLDashboard.js
│       └── Shared/
│           ├── ReportDetailScreen.js
│           └── RatingScreen.js
└── assets/
    └── (icon.png, splash.png, etc.)
```

---

## ✨ Extra Credit Features

- ✅ **Search functionality** — every module has a live search bar filtering by course, code, topic, lecturer, venue
- ✅ **Excel export** — reports and attendance can be downloaded as `.xlsx` files (with column formatting and headers)

---

## 🎨 LUCT Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#002147` | Primary, nav bars, headings |
| Navy Light | `#003366` | Hover states |
| Gold | `#C9A84C` | Accents, badges, secondary CTA |
| Gold Light | `#F0C060` | Highlights |
| White | `#FFFFFF` | Cards, backgrounds |
| Off White | `#F5F7FA` | Screen backgrounds |

---

## 📞 Contact

**Course Lecturer:** tsekiso.thokoana@limkokwing.ac.ls
**Institution:** Limkokwing University of Creative Technology, Maseru, Lesotho
