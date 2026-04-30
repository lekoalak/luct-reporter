import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { COLORS, USER_ROLES } from '../config/theme';

// Auth screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Shared screens
import ReportDetailScreen from '../screens/Shared/ReportDetailScreen';
import RatingScreen from '../screens/Shared/RatingScreen';

// Lecturer screens
import LecturerDashboard from '../screens/Lecturer/LecturerDashboard';
import LecturerReportsScreen from '../screens/Lecturer/LecturerReportsScreen';
import SubmitReportScreen from '../screens/Lecturer/SubmitReportScreen';
import AttendanceScreen from '../screens/Lecturer/AttendanceScreen';

// Student screens
import StudentDashboard from '../screens/Student/StudentDashboard';

// PRL screens
import PRLDashboard from '../screens/PRL/PRLDashboard';

// PL screens
import PLDashboard from '../screens/PL/PLDashboard';

import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from '../components/UIComponents';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ────────────── AUTH STACK ──────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ────────────── LECTURER TABS ──────────────
function LecturerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.navy,
          borderTopWidth: 0,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Home: '🏠', Reports: '📋', Attendance: '👥', Ratings: '⭐',
          };
          return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={LecturerDashboard} />
      <Tab.Screen name="Reports" component={LecturerReportsScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Ratings" component={LecturerRatingsPlaceholder} />
    </Tab.Navigator>
  );
}

function LecturerRatingsPlaceholder() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.offWhite }}>
      <Text style={{ fontSize: 48 }}>⭐</Text>
      <Text style={{ fontSize: 16, color: COLORS.navy, fontWeight: '700', marginTop: 12 }}>
        My Ratings
      </Text>
      <Text style={{ color: COLORS.gray, marginTop: 6, textAlign: 'center', paddingHorizontal: 30 }}>
        Students and PRL can rate your lectures here.
      </Text>
    </View>
  );
}

// ────────────── STUDENT TABS ──────────────
function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: { backgroundColor: COLORS.navy, borderTopWidth: 0, height: 60 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused }) => {
          const icons = { Dashboard: '🏠', Ratings: '⭐', Monitoring: '📊' };
          return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={StudentDashboard} />
      <Tab.Screen name="Monitoring" component={MonitoringPlaceholder} />
      <Tab.Screen name="Ratings" component={StudentRatingsPlaceholder} />
    </Tab.Navigator>
  );
}

function MonitoringPlaceholder() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.offWhite }}>
      <Text style={{ fontSize: 48 }}>📊</Text>
      <Text style={{ fontSize: 16, color: COLORS.navy, fontWeight: '700', marginTop: 12 }}>Monitoring</Text>
      <Text style={{ color: COLORS.gray, marginTop: 6 }}>Track your progress here.</Text>
    </View>
  );
}

function StudentRatingsPlaceholder() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.offWhite }}>
      <Text style={{ fontSize: 48 }}>⭐</Text>
      <Text style={{ fontSize: 16, color: COLORS.navy, fontWeight: '700', marginTop: 12 }}>Rate Lecturers</Text>
      <Text style={{ color: COLORS.gray, marginTop: 6, textAlign: 'center', paddingHorizontal: 30 }}>
        Rate your lecturers to help improve quality.
      </Text>
    </View>
  );
}

// ────────────── PRL TABS ──────────────
function PRLTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: { backgroundColor: COLORS.navy, borderTopWidth: 0, height: 60 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused }) => {
          const icons = { Dashboard: '🏠', Reports: '📋', Monitoring: '📊', Ratings: '⭐' };
          return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={PRLDashboard} />
      <Tab.Screen name="Monitoring" component={MonitoringPlaceholder} />
      <Tab.Screen name="Ratings" component={StudentRatingsPlaceholder} />
    </Tab.Navigator>
  );
}

// ────────────── PL TABS ──────────────
function PLTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: { backgroundColor: COLORS.navy, borderTopWidth: 0, height: 60 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused }) => {
          const icons = { Dashboard: '🏠', Monitoring: '📊', Ratings: '⭐' };
          return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={PLDashboard} />
      <Tab.Screen name="Monitoring" component={MonitoringPlaceholder} />
      <Tab.Screen name="Ratings" component={StudentRatingsPlaceholder} />
    </Tab.Navigator>
  );
}

// ────────────── ROOT NAVIGATOR ──────────────
function RootNavigator() {
  const { user, userData, loading } = useAuth();

  if (loading) return <LoadingScreen message="Starting LUCT Reporter..." />;

  const getRoleNavigator = () => {
    switch (userData?.role) {
      case USER_ROLES.LECTURER: return LecturerTabs;
      case USER_ROLES.STUDENT: return StudentTabs;
      case USER_ROLES.PRINCIPAL_LECTURER: return PRLTabs;
      case USER_ROLES.PROGRAM_LEADER: return PLTabs;
      default: return LecturerTabs; // fallback
    }
  };

  const RoleHome = user && userData ? getRoleNavigator() : null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user || !userData ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          <Stack.Screen name="Main" component={RoleHome} />
          <Stack.Screen name="SubmitReport" component={SubmitReportScreen} />
          <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
          <Stack.Screen name="Rating" component={RatingScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ────────────── APP NAVIGATOR ──────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
