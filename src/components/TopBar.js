import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../config/theme';
import { logoutUser } from '../services/authService';
import { showAlert } from '../utils/alert';

export default function TopBar({ title, subtitle, navigation, showBack = false }) {
  const handleLogout = () => {
    showAlert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try { await logoutUser(); }
          catch (e) { showAlert('Error', e.message); }
        },
      },
    ]);
  };

  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.center}>
     <Text style={styles.title} numberOfLines={1}>{title}</Text>
{role ? <Text style={styles.role}>{role}</Text> : null}
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={styles.side}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#002147',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: { width: 72 },
  center: { flex: 1, alignItems: 'center' },
  title: { color: '#FFFFFF', fontWeight: '800', fontSize: 17, textAlign: 'center' },
  subtitle: { color: '#C9A84C', fontSize: 11, marginTop: 2, textAlign: 'center' },
  backBtn: { padding: 4 },
  backText: { color: '#C9A84C', fontWeight: '700', fontSize: 13 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#C9A84C',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoutText: { color: '#C9A84C', fontWeight: '700', fontSize: 11 },
});