import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import SelectField from '../../components/SelectField';
import { spacing, type } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { RESERVED_IDENTIFIERS } from '../../data/adminMockData';
import { useInventory } from '../../context/InventoryContext';
import { api } from '../../api/client';

// Matches the User table in the documentation: name, role, email, pharmacy name (+ staff ID for login).
const ROLES = [
  { value: 'Pharmacist', label: 'Pharmacist' },
  { value: 'Staff', label: 'Staff' },
];

export default function RegisterScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { setProfile } = useInventory();
  const [form, setForm] = useState({
    name: '', email: '', staffId: '', role: '', pharmacyName: '', password: '', confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (!form.staffId.trim()) e.staffId = 'Enter your staff ID';
    // The administrator's identifiers are reserved: sign-up can never create a second admin.
    const reserved = RESERVED_IDENTIFIERS.map((r) => r.toLowerCase());
    if (reserved.includes(form.email.trim().toLowerCase())) e.email = 'This email is reserved';
    if (reserved.includes(form.staffId.trim().toLowerCase())) e.staffId = 'This staff ID is reserved';
    if (!form.role) e.role = 'Select your role';
    if (!form.pharmacyName.trim()) e.pharmacyName = 'Enter the pharmacy name';
    if (form.password.length < 6) e.password = 'Use at least 6 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await api.register({ name: form.name.trim(), email: form.email.trim(), staffId: form.staffId.trim(), role: form.role, pharmacyName: form.pharmacyName.trim(), password: form.password });
      setProfile(result.user);
      navigation.replace('MainApp');
    } catch (error) {
      setErrors({ email: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Set up MedVault for your pharmacy. Only registered staff can view or change stock records.</Text>

        <View style={{ marginTop: spacing.lg, width: '100%' }}>
          <Input label="Full name" placeholder="e.g. Adaeze Okonkwo" value={form.name} onChangeText={update('name')} icon="person-outline" error={errors.name} />
          <Input label="Email address" placeholder="you@pharmacy.com" value={form.email} onChangeText={update('email')} icon="mail-outline" autoCapitalize="none" keyboardType="email-address" error={errors.email} />
          <Input label="Staff ID" placeholder="e.g. STF-0142" value={form.staffId} onChangeText={update('staffId')} icon="id-card-outline" autoCapitalize="characters" error={errors.staffId} />
          <SelectField label="Role" value={form.role} options={ROLES} onSelect={update('role')} placeholder="Select your role" icon="briefcase-outline" error={errors.role} />
          <Input label="Pharmacy name" placeholder="e.g. Okonkwo Pharmacy" value={form.pharmacyName} onChangeText={update('pharmacyName')} icon="business-outline" error={errors.pharmacyName} />
          <Input label="Password" placeholder="Create a password" value={form.password} onChangeText={update('password')} icon="lock-closed-outline" secureTextEntry error={errors.password} />
          <Input label="Confirm password" placeholder="Re-enter password" value={form.confirm} onChangeText={update('confirm')} icon="lock-closed-outline" secureTextEntry error={errors.confirm} />

          <Button label="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: spacing.sm }} />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signupLink}>Log in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: 70, paddingBottom: 220 },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.bgElevated2, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title: { color: colors.textPrimary, ...type.h1 },
  subtitle: { color: colors.textSecondary, ...type.body, marginTop: 8, lineHeight: 20 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  signupText: { color: colors.textSecondary, ...type.small },
  signupLink: { color: colors.greenLight, ...type.small, fontWeight: '700' },
});
