import TopBar from '../../components/TopBar';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { COLORS, FONTS } from '../../config/theme';
import { Button, LoadingScreen, Input, ScreenHeader } from '../../components/UIComponents';
import { getReport, addPRLFeedback } from '../../services/reportService';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../config/theme';

export default function ReportDetailScreen({ route, navigation }) {
  const { reportId } = route.params;
  const { user, userData } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await getReport(reportId);
        setReport(r);
        if (r?.prlFeedback) setFeedback(r.prlFeedback);
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reportId]);

  const handleFeedback = async () => {
    if (!feedback.trim()) return Alert.alert('Error', 'Please enter feedback before submitting.');
    setSubmittingFeedback(true);
    try {
      await addPRLFeedback(reportId, feedback.trim(), user.uid);
      Alert.alert('Success', 'Feedback submitted successfully.');
      setReport(r => ({ ...r, prlFeedback: feedback.trim() }));
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!report) return (
    <View style={styles.notFound}>
      <Text style={styles.notFoundText}>Report not found.</Text>
    </View>
  );

  const attendance = report.totalRegisteredStudents
    ? ((report.actualStudentsPresent / report.totalRegisteredStudents) * 100).toFixed(1)
    : 'N/A';

  return (
    <ScrollView style={styles.container}>
    <TopBar title="Report Detail" navigation={navigation} showBack={true} />
      <ScreenHeader title="Report Detail" subtitle={report.courseCode} />

      <View style={styles.body}>
        {/* Attendance Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{report.actualStudentsPresent}</Text>
            <Text style={styles.summaryLabel}>Present</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{report.totalRegisteredStudents}</Text>
            <Text style={styles.summaryLabel}>Registered</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: COLORS.gold }]}>{attendance}%</Text>
            <Text style={styles.summaryLabel}>Rate</Text>
          </View>
        </View>

        {/* Report Fields */}
        <Section title="Class Information">
          <Field label="Faculty" value={report.facultyName} />
          <Field label="Class Name" value={report.className} />
          <Field label="Week" value={report.weekOfReporting} />
          <Field label="Date of Lecture" value={report.dateOfLecture} />
        </Section>

        <Section title="Course Details">
          <Field label="Course Name" value={report.courseName} />
          <Field label="Course Code" value={report.courseCode} />
          <Field label="Lecturer" value={report.lecturerName} />
        </Section>

        <Section title="Venue & Schedule">
          <Field label="Venue" value={report.venue} />
          <Field label="Scheduled Time" value={report.scheduledLectureTime} />
        </Section>

        <Section title="Lecture Content">
          <Field label="Topic Taught" value={report.topicTaught} />
          <Field label="Learning Outcomes" value={report.learningOutcomes} />
          <Field label="Recommendations" value={report.recommendations || '—'} />
        </Section>

        {/* PRL Feedback Section */}
        {(userData?.role === USER_ROLES.PRINCIPAL_LECTURER ||
          userData?.role === USER_ROLES.PROGRAM_LEADER) && (
          <Section title="💬 PRL Feedback">
            <Input
              label="Feedback"
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
              placeholder="Add your feedback for this report..."
            />
            <Button
              title={report.prlFeedback ? 'Update Feedback' : 'Submit Feedback'}
              onPress={handleFeedback}
              loading={submittingFeedback}
              variant="secondary"
            />
          </Section>
        )}

        {/* Show existing PRL feedback to lecturers */}
        {userData?.role === USER_ROLES.LECTURER && report.prlFeedback && (
          <Section title="💬 PRL Feedback">
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>{report.prlFeedback}</Text>
            </View>
          </Section>
        )}
      </View>
    </ScrollView>
  );
}

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const Field = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  body: { padding: 16 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: COLORS.gray, fontSize: FONTS.sizes.lg },

  summaryCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 20,
    marginBottom: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.white },
  summaryLabel: { fontSize: FONTS.sizes.xs, color: COLORS.gray, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: COLORS.navyLight, marginHorizontal: 8 },

  section: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 8,
  },
  sectionBody: {},

  field: { marginBottom: 10 },
  fieldLabel: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.gray, marginBottom: 2 },
  fieldValue: { fontSize: FONTS.sizes.md, color: COLORS.black, lineHeight: 22 },

  feedbackBox: {
    backgroundColor: COLORS.gold + '15',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  feedbackText: { fontSize: FONTS.sizes.md, color: COLORS.navyDark, lineHeight: 22 },
});
