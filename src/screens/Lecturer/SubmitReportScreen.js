import TopBar from '../../components/TopBar';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, FACULTIES, ALL_VENUES, WEEKS } from '../../config/theme';
import { Button, Input, Picker, ScreenHeader } from '../../components/UIComponents';
import { createReport } from '../../services/reportService';
import { useAuth } from '../../hooks/useAuth';

const TIME_SLOTS = [
  '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
  '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
  '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00',
];

export default function SubmitReportScreen({ navigation }) {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    facultyName: userData?.faculty || '',
    className: '',
    weekOfReporting: '',
    dateOfLecture: new Date().toLocaleDateString('en-GB'),
    courseName: '',
    courseCode: '',
    lecturerName: userData?.name || '',
    actualStudentsPresent: '',
    totalRegisteredStudents: '',
    venue: '',
    scheduledLectureTime: '',
    topicTaught: '',
    learningOutcomes: '',
    recommendations: '',
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    const required = [
      'facultyName', 'className', 'weekOfReporting', 'dateOfLecture',
      'courseName', 'courseCode', 'lecturerName', 'actualStudentsPresent',
      'totalRegisteredStudents', 'venue', 'scheduledLectureTime', 'topicTaught',
      'learningOutcomes',
    ];
    required.forEach(f => {
      if (!form[f]?.toString().trim()) e[f] = 'This field is required';
    });
    if (form.actualStudentsPresent && isNaN(Number(form.actualStudentsPresent)))
      e.actualStudentsPresent = 'Must be a number';
    if (form.totalRegisteredStudents && isNaN(Number(form.totalRegisteredStudents)))
      e.totalRegisteredStudents = 'Must be a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await createReport({
        ...form,
        actualStudentsPresent: Number(form.actualStudentsPresent),
        totalRegisteredStudents: Number(form.totalRegisteredStudents),
        lecturerId: user.uid,
      });
      Alert.alert('Report Submitted', 'Your lecture report has been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TopBar title="Submit Report" navigation={navigation} showBack={true} />
        <ScreenHeader title="Submit Report" subtitle="Lecture Reporting Form" />

        <View style={styles.body}>
          {/* Section: Class Info */}
          <SectionTitle label="📚 Class Information" />
          <Picker label="Faculty Name" value={form.facultyName} options={FACULTIES}
            onSelect={set('facultyName')} error={errors.facultyName} required />
          <Input label="Class Name" value={form.className} onChangeText={set('className')}
            placeholder="e.g. BIMP2210-A" error={errors.className} required />
          <Picker label="Week of Reporting" value={form.weekOfReporting} options={WEEKS}
            onSelect={set('weekOfReporting')} error={errors.weekOfReporting} required />
          <Input label="Date of Lecture" value={form.dateOfLecture} onChangeText={set('dateOfLecture')}
            placeholder="DD/MM/YYYY" error={errors.dateOfLecture} required />

          {/* Section: Course Info */}
          <SectionTitle label="📖 Course Details" />
          <Input label="Course Name" value={form.courseName} onChangeText={set('courseName')}
            placeholder="e.g. Mobile Device Programming" error={errors.courseName} required />
          <Input label="Course Code" value={form.courseCode} onChangeText={set('courseCode')}
            placeholder="e.g. BIMP2210" error={errors.courseCode} required />
          <Input label="Lecturer's Name" value={form.lecturerName} onChangeText={set('lecturerName')}
            error={errors.lecturerName} required />

          {/* Section: Attendance */}
          <SectionTitle label="👥 Attendance" />
          <Input label="Actual Students Present" value={form.actualStudentsPresent}
            onChangeText={set('actualStudentsPresent')} keyboardType="numeric"
            error={errors.actualStudentsPresent} required />
          <Input label="Total Registered Students" value={form.totalRegisteredStudents}
            onChangeText={set('totalRegisteredStudents')} keyboardType="numeric"
            error={errors.totalRegisteredStudents} required
            placeholder="e.g. 30" />

          {/* Attendance indicator */}
          {form.actualStudentsPresent && form.totalRegisteredStudents &&
            !isNaN(Number(form.actualStudentsPresent)) && !isNaN(Number(form.totalRegisteredStudents)) && (
              <View style={styles.attendancePill}>
                <Text style={styles.attendancePillText}>
                  📊 Attendance Rate:{' '}
                  {((Number(form.actualStudentsPresent) / Number(form.totalRegisteredStudents)) * 100).toFixed(1)}%
                </Text>
              </View>
            )}

          {/* Section: Venue & Time */}
          <SectionTitle label="🏫 Venue & Schedule" />
          <Picker label="Venue" value={form.venue} options={ALL_VENUES}
            onSelect={set('venue')} error={errors.venue} required />
          <Picker label="Scheduled Lecture Time" value={form.scheduledLectureTime}
            options={TIME_SLOTS} onSelect={set('scheduledLectureTime')}
            error={errors.scheduledLectureTime} required />

          {/* Section: Content */}
          <SectionTitle label="✏️ Lecture Content" />
          <Input label="Topic Taught" value={form.topicTaught} onChangeText={set('topicTaught')}
            multiline numberOfLines={3} error={errors.topicTaught} required
            placeholder="Describe the topic covered in this lecture..." />
          <Input label="Learning Outcomes" value={form.learningOutcomes}
            onChangeText={set('learningOutcomes')} multiline numberOfLines={4}
            error={errors.learningOutcomes} required
            placeholder="What students were expected to learn..." />
          <Input label="Lecturer's Recommendations" value={form.recommendations}
            onChangeText={set('recommendations')} multiline numberOfLines={3}
            placeholder="Any recommendations or notes..." />

          <Button title="Submit Report" onPress={handleSubmit} loading={loading} style={{ marginTop: 8, marginBottom: 24 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const SectionTitle = ({ label }) => (
  <Text style={styles.sectionTitle}>{label}</Text>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  body: { padding: 16 },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
    paddingLeft: 10,
  },
  attendancePill: {
    backgroundColor: COLORS.navy + '15',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  attendancePillText: {
    color: COLORS.navy,
    fontWeight: '700',
    fontSize: FONTS.sizes.md,
  },
});
