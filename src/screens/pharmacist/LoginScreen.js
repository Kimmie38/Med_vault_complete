import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BrandLogo from '../../components/BrandLogo';
import { spacing, type } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { api } from '../../api/client';

export default function LoginScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const e = {};
    if (!identifier.trim()) e.identifier = 'Enter your email or staff ID';
    if (!password) e.password = 'Enter your password';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const result = await api.login(identifier.trim(), password);
      if (!result.isAdmin && result.mustChangePassword) {
        navigation.replace('ChangePasswordRequired');
      } else {
        navigation.replace(result.isAdmin ? 'AdminApp' : 'MainApp');
      }
    } catch (error) {
      setErrors({ identifier: error.code === 'ACCOUNT_SUSPENDED' ? 'This account is suspended. Please contact your administrator.' : undefined, password: error.code === 'ACCOUNT_SUSPENDED' ? undefined : 'We couldn’t sign you in. Check your email or staff ID and password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <BrandLogo size={104} showName nameSize={30} style={styles.logo} />


        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to manage your pharmacy stock</Text>

        <View style={{ marginTop: spacing.xl, width: '100%' }}>
          <Input
            label="Email or staff ID"
            placeholder="you@pharmacy.com or STF-0142"
            value={identifier}
            onChangeText={setIdentifier}
            icon="person-outline"
            autoCapitalize="none"
            error={errors.identifier}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
            error={errors.password}
          />

          <Pressable
            style={{ alignSelf: 'flex-end', marginBottom: spacing.lg }}
            onPress={() => Alert.alert(
              'Forgot your password?',
              'Ask your pharmacy administrator to reset it from the admin console. They\u2019ll give you a temporary password — you\u2019ll be asked to choose a new one the next time you log in.'
            )}
          >
            <Text style={styles.forgot}>Forgot password?</Text>
          </Pressable>

          <Button label="Log In" onPress={handleLogin} loading={loading} />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>New to MedVault? </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Create an account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: 70, paddingBottom: 220, alignItems: 'center' },
  logo: { marginBottom: spacing.lg, marginTop: spacing.lg },
  title: { color: colors.textPrimary, ...type.h1 },
  subtitle: { color: colors.textSecondary, ...type.body, marginTop: 6 },
  forgot: { color: colors.greenLight, ...type.small, fontWeight: '600' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  signupText: { color: colors.textSecondary, ...type.small },
  signupLink: { color: colors.greenLight, ...type.small, fontWeight: '700' },
  debugWrap: { marginTop: 8, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(0,0,0,0.04)', flexDirection: 'row', alignItems: 'center' },
  debugLabel: { color: colors.textSecondary, marginRight: 6, fontSize: 11 },
  debugValue: { color: colors.textSecondary, fontSize: 11, maxWidth: 260 },
});
