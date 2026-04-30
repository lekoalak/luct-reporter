import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, FACULTIES } from '../../config/theme';
import { Button, Input, Picker } from '../../components/UIComponents';
import { registerUser } from '../../services/authService';
import { USER_ROLES } from '../../config/theme';

const ROLE_OPTIONS = [
  { label: 'Student', value: USER_ROLES.STUDENT },
  { label: 'Lecturer', value: USER_ROLES.LECTURER },
  { label: 'Principal Lecturer (PRL)', value: USER_ROLES.PRINCIPAL_LECTURER },
  { label: 'Program Leader (PL)', value: USER_ROLES.PROGRAM_LEADER },
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    role: '', faculty: '', studentId: '', staffId: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!form.role) e.role = 'Please select your role';
    if (!form.faculty) e.faculty = 'Please select your faculty';
    if (form.role === USER_ROLES.STUDENT && !form.studentId.trim()) e.studentId = 'Student ID is required';
    if (form.role !== USER_ROLES.STUDENT && !form.staffId.trim()) e.staffId = 'Staff ID is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        faculty: form.faculty,
        studentId: form.studentId.trim() || null,
        staffId: form.staffId.trim() || null,
      });
      Alert.alert('Account Created', 'Welcome to LUCT Reporter!');
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Create Account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Personal Information</Text>
          <Input label="Full Name" value={form.name} onChangeText={set('name')} error={errors.name} required />
          <Input label="Email Address" value={form.email} onChangeText={set('email')} keyboardType="email-address" error={errors.email} required />
          <Input label="Password" value={form.password} onChangeText={set('password')} secureTextEntry error={errors.password} required />
          <Input label="Confirm Password" value={form.confirm} onChangeText={set('confirm')} secureTextEntry error={errors.confirm} required />

          <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Academic Details</Text>
          <Picker
            label="Role"
            value={form.role}
            options={ROLE_OPTIONS}
            onSelect={set('role')}
            error={errors.role}
            required
          />
          <Picker
            label="Faculty"
            value={form.faculty}
            options={FACULTIES}
            onSelect={set('faculty')}
            error={errors.faculty}
            required
          />
          {form.role === USER_ROLES.STUDENT && (
            <Input label="Student ID" value={form.studentId} onChangeText={set('studentId')} error={errors.studentId} required />
          )}
          {form.role && form.role !== USER_ROLES.STUDENT && (
            <Input label="Staff ID" value={form.staffId} onChangeText={set('staffId')} error={errors.staffId} required />
          )}

          <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 12 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.offWhite, paddingBottom: 40 },
  topBar: {
    backgroundColor: COLORS.navy,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 16 },
  backText: { color: COLORS.gold, fontSize: FONTS.sizes.md, fontWeight: '600' },
  pageTitle: { color: COLORS.white, fontSize: FONTS.sizes.xl, fontWeight: '800' },
  card: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 18,
    padding: 22,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
});
