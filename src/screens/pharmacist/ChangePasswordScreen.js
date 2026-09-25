import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ScreenHeader from '../../components/ScreenHeader';
import { spacing, type } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { api } from '../../api/client';

// Simple "forgot / change password" screen: since the user is already signed in, this just
// asks for the current password plus a new one — no email or OTP verification step.
//
// It doubles as the screen shown right after login when an administrator has reset a user's
// password: the backend flags that account with `mustChangePassword`, and every other route
// is blocked until they pick a new one here (route.params.forced === true, set from LoginScreen).
export default function ChangePasswordScreen({ navigation, route }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const forced = !!route?.params?.forced;
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // While a reset is pending, don't let Android's hardware back button escape to Login/MainApp
  // in a half-signed-in state — the account can't do anything else until this is done.
  useEffect(() => {
    if (!forced) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [forced]);

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.current) e.current = forced ? 'Enter the temporary password you were given' : 'Enter your current password';
    if (form.next.length < 6) e.next = 'Use at least 6 characters';
    if (form.next && form.current && form.next === form.current) e.next = 'Choose a password you have not used just now';
    if (form.confirm !== form.next) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.changePassword(form.current, form.next);
      if (forced) {
        navigation.replace('MainApp');
      } else {
        Alert.alert('Password changed', 'Your password has been updated.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      setErrors({ current: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScreenHeader
        title="Change password"
        subtitle={forced ? 'Your administrator reset your password. Choose a new one to continue.' : 'Update the password for your account'}
        onBack={forced ? undefined : () => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Card>
          <Input label={forced ? 'Temporary password' : 'Current password'} placeholder={forced ? 'Password your administrator gave you' : 'Enter your current password'} value={form.current} onChangeText={update('current')} icon="lock-closed-outline" secureTextEntry error={errors.current} />
          <Input label="New password" placeholder="Create a new password" value={form.next} onChangeText={update('next')} icon="key-outline" secureTextEntry error={errors.next} />
          <Input label="Confirm new password" placeholder="Re-enter new password" value={form.confirm} onChangeText={update('confirm')} icon="key-outline" secureTextEntry error={errors.confirm} />
          <Text style={styles.hint}>You'll stay signed in on this device; any other device using this account will need to sign in again.</Text>
          <Button label="Update password" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  hint: { color: colors.textMuted, fontSize: 11.5, lineHeight: 16, marginTop: -4, marginBottom: spacing.md },
});
