import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, type, radius } from '../../theme/theme';

export default function RoleSelectScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Image source={require('../../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Welcome to MedVault</Text>
        <Text style={styles.subtitle}>Genuine medicine. Verified pharmacists.</Text>
      </View>

      <View style={styles.cards}>
        <Pressable onPress={() => navigation.navigate('PharmacistAuth')} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
          <LinearGradient colors={[colors.tealDeep, colors.green]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.roleCard}>
            <View style={styles.roleIcon}>
              <Ionicons name="medkit" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.roleTitle}>I'm a Pharmacist</Text>
              <Text style={styles.roleSub}>Manage inventory, track expiry & sell</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#fff" />
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('UserApp')} style={({ pressed }) => [styles.roleCardOutline, { opacity: pressed ? 0.85 : 1 }]}>
          <View style={[styles.roleIcon, { backgroundColor: colors.bgElevated2 }]}>
            <Ionicons name="scan" size={24} color={colors.greenLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.roleTitle, { color: colors.textPrimary }]}>I'm buying medicine</Text>
            <Text style={[styles.roleSub, { color: colors.textSecondary }]}>Check a drug before you buy</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <Text style={styles.footer}>Registered with the Pharmacists Council of Nigeria</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingTop: 90, paddingBottom: 40 },
  top: { alignItems: 'center' },
  logo: { width: 110, height: 110, marginBottom: spacing.lg },
  title: { color: colors.textPrimary, ...type.h1, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, ...type.body, marginTop: 8, textAlign: 'center' },
  cards: { gap: spacing.md },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.lg, borderRadius: radius.lg,
  },
  roleCardOutline: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.lg, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bgElevated,
  },
  roleIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  roleTitle: { color: '#fff', ...type.h3 },
  roleSub: { color: 'rgba(255,255,255,0.85)', ...type.small, marginTop: 2 },
  footer: { color: colors.textMuted, ...type.small, textAlign: 'center' },
});
