import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../../config/theme';
import { Button, Input } from '../../components/UIComponents';
import { loginUser } from '../../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { userData } = await loginUser(email.trim(), password);
      // Navigation handled by AuthProvider in App.js
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header Banner */}
        <View style={styles.banner}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>LUCT</Text>
          </View>
          <Text style={styles.bannerTitle}>LUCT Reporter</Text>
          <Text style={styles.bannerSub}>Limkokwing University of Creative Technology</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSub}>Sign in to your account</Text>

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@limkokwing.ac.ls"
            keyboardType="email-address"
            error={errors.email}
            required
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
            required
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 8 }}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>New to LUCT Reporter?</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Create Account"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
          />
        </View>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} Limkokwing University of Creative Technology
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.offWhite,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: COLORS.navy,
    paddingTop: 60,
    paddingBottom: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...SHADOWS.button,
  },
  logoText: { fontSize: 18, fontWeight: '900', color: COLORS.navy },
  bannerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  bannerSub: { fontSize: FONTS.sizes.xs, color: COLORS.gold, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },

  card: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 20,
    padding: 24,
    marginTop: -24,
    ...SHADOWS.card,
  },
  formTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.navy, marginBottom: 4 },
  formSub: { fontSize: FONTS.sizes.sm, color: COLORS.gray, marginBottom: 24 },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.lightGray },
  dividerText: { fontSize: FONTS.sizes.xs, color: COLORS.gray, paddingHorizontal: 10 },

  footer: {
    textAlign: 'center',
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray,
    marginTop: 10,
  },
});
