import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../config/theme';

// ────────────── BUTTON ──────────────
export const Button = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const variantStyles = {
    primary: { bg: COLORS.navy, text: COLORS.white, border: COLORS.navy },
    secondary: { bg: COLORS.gold, text: COLORS.navy, border: COLORS.gold },
    outline: { bg: 'transparent', text: COLORS.navy, border: COLORS.navy },
    danger: { bg: COLORS.error, text: COLORS.white, border: COLORS.error },
    ghost: { bg: 'transparent', text: COLORS.navy, border: 'transparent' },
  };
  const v = variantStyles[variant] || variantStyles.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={styles.btnRow}>
          {icon && <Text style={[styles.btnIcon]}>{icon} </Text>}
          <Text style={[styles.btnText, { color: v.text }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ────────────── INPUT ──────────────
export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  numberOfLines,
  keyboardType,
  error,
  required,
  editable = true,
  style,
  inputStyle,
}) => (
  <View style={[styles.inputWrap, style]}>
    {label && (
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    )}
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || label}
      placeholderTextColor={COLORS.gray}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={keyboardType || 'default'}
      editable={editable}
      style={[
        styles.input,
        multiline && styles.inputMulti,
        !editable && styles.inputDisabled,
        error && styles.inputError,
        inputStyle,
      ]}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

// ────────────── PICKER (dropdown) ──────────────
export const Picker = ({ label, value, options = [], onSelect, required, placeholder, error }) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter(o =>
    (typeof o === 'string' ? o : o.label)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSelect = (opt) => {
    onSelect(typeof opt === 'string' ? opt : opt.value);
    setVisible(false);
    setSearch('');
  };

  const displayValue = value
    ? (options.find(o => (typeof o === 'string' ? o : o.value) === value) || value)
    : null;
  const displayLabel = displayValue
    ? (typeof displayValue === 'string' ? displayValue : displayValue.label)
    : null;

  return (
    <View style={styles.inputWrap}>
      {label && (
        <Text style={styles.label}>
          {label}{required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[styles.input, styles.pickerBtn, error && styles.inputError]}
        activeOpacity={0.8}
      >
        <Text style={[styles.pickerText, !displayLabel && styles.pickerPlaceholder]}>
          {displayLabel || placeholder || `Select ${label}`}
        </Text>
        <Text style={styles.pickerArrow}>▾</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={visible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setVisible(false)} activeOpacity={1}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search..."
              placeholderTextColor={COLORS.gray}
              style={styles.modalSearch}
            />
            <FlatList
              data={filtered}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => {
                const lbl = typeof item === 'string' ? item : item.label;
                const val = typeof item === 'string' ? item : item.value;
                const isSelected = val === value;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={[styles.modalOption, isSelected && styles.modalOptionActive]}
                  >
                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextActive]}>
                      {lbl}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 320 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ────────────── CARD ──────────────
export const Card = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

// ────────────── BADGE ──────────────
export const Badge = ({ label, color = COLORS.navy, textColor = COLORS.white }) => (
  <View style={[styles.badge, { backgroundColor: color }]}>
    <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
  </View>
);

// ────────────── HEADER ──────────────
export const ScreenHeader = ({ title, subtitle, right }) => (
  <View style={styles.header}>
    <View style={{ flex: 1 }}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
    {right && <View>{right}</View>}
  </View>
);

// ────────────── SEARCH BAR ──────────────
export const SearchBar = ({ value, onChangeText, placeholder = 'Search...' }) => (
  <View style={styles.searchWrap}>
    <Text style={styles.searchIcon}>🔍</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.gray}
      style={styles.searchInput}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChangeText('')}>
        <Text style={styles.searchClear}>✕</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ────────────── EMPTY STATE ──────────────
export const EmptyState = ({ icon = '📋', title, message }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {message && <Text style={styles.emptyMsg}>{message}</Text>}
  </View>
);

// ────────────── LOADING ──────────────
export const LoadingScreen = ({ message = 'Loading...' }) => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color={COLORS.navy} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// ────────────── STAR RATING ──────────────
export const StarRating = ({ value = 0, onRate, size = 28 }) => (
  <View style={styles.stars}>
    {[1, 2, 3, 4, 5].map(star => (
      <TouchableOpacity
        key={star}
        onPress={() => onRate && onRate(star)}
        disabled={!onRate}
      >
        <Text style={{ fontSize: size, color: star <= value ? COLORS.gold : COLORS.lightGray }}>
          ★
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ────────────── STYLES ──────────────
const styles = StyleSheet.create({
  // Button
  btn: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    ...SHADOWS.button,
  },
  btnDisabled: { opacity: 0.55 },
  btnRow: { flexDirection: 'row', alignItems: 'center' },
  btnText: { fontSize: FONTS.sizes.md, fontWeight: '700', letterSpacing: 0.3 },
  btnIcon: { fontSize: 16 },

  // Input
  inputWrap: { marginBottom: 14 },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.darkGray, marginBottom: 6 },
  required: { color: COLORS.error },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.borderColor,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
  },
  inputMulti: { height: 90, textAlignVertical: 'top', paddingTop: 12 },
  inputDisabled: { backgroundColor: COLORS.lightGray, color: COLORS.gray },
  inputError: { borderColor: COLORS.error },
  errorText: { fontSize: FONTS.sizes.xs, color: COLORS.error, marginTop: 4 },

  // Picker
  pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerText: { fontSize: FONTS.sizes.md, color: COLORS.black, flex: 1 },
  pickerPlaceholder: { color: COLORS.gray },
  pickerArrow: { fontSize: 14, color: COLORS.gray },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.navy },
  modalClose: { fontSize: 18, color: COLORS.gray, padding: 4 },
  modalSearch: {
    margin: 12,
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: FONTS.sizes.md,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  modalOptionActive: { backgroundColor: COLORS.navy + '10' },
  modalOptionText: { fontSize: FONTS.sizes.md, color: COLORS.black },
  modalOptionTextActive: { color: COLORS.navy, fontWeight: '600' },
  checkmark: { color: COLORS.navy, fontWeight: '700', fontSize: 16 },

  // Card
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.card,
  },

  // Badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.navy,
  },
  headerTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  headerSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.gold, marginTop: 2 },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.borderColor,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: FONTS.sizes.md, color: COLORS.black },
  searchClear: { fontSize: 14, color: COLORS.gray, padding: 4 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.darkGray, textAlign: 'center' },
  emptyMsg: { fontSize: FONTS.sizes.sm, color: COLORS.gray, marginTop: 6, textAlign: 'center' },

  // Loading
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  loadingText: { fontSize: FONTS.sizes.md, color: COLORS.gray, marginTop: 12 },

  // Stars
  stars: { flexDirection: 'row', gap: 4 },
});
