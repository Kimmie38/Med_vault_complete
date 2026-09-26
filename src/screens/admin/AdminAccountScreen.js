import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { spacing, type, radius } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useAdmin } from '../../context/AdminContext';
import { resetToLogin } from '../../navigation/navigationRef';
import { joinedLabel } from '../../utils/adminStats';

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

// The administrator's own profile and settings. There is only ever one admin account.
export default function AdminAccountScreen({ navigation }) {
  const { colors, styles, isDark, setMode } = useThemedStyles(createStyles);
  const { admin, pharmacies, totals } = useAdmin();
  const profile = admin || { name: 'Administrator', email: 'Loading…', adminId: '', role: 'Administrator', createdAt: null };
  const [notice, setNotice] = useState(null);

  const exportUsers = async () => {
    const header = ['Name', 'Pharmacy', 'Role', 'Email', 'Staff ID', 'Location', 'Status', 'Joined', 'Drugs', 'Open alerts'];
    const rows = pharmacies.map((p) => [p.name, p.pharmacyName, p.role, p.email, p.staffId, p.location, p.status, p.createdAt, p.counts.drugs, p.counts.openAlerts]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
    try {
      await Share.share({ title: 'MedVault users', message: csv });
    } catch (e) {
      setNotice({ title: 'Export failed', message: 'Could not open the share sheet.' });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Account</Text>
      </View>

      <View style={styles.top}>
        <View style={styles.avatar}>
          <Ionicons name="shield-checkmark" size={36} color="#fff" />
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.store}>{profile.email}</Text>
        <View style={{ alignSelf: 'center' }}>
          <Badge label="Administrator" tone="info" />
        </View>
      </View>

      <View style={styles.soleNote}>
        <Ionicons name="lock-closed" size={17} color={colors.greenLight} style={{ marginTop: 1 }} />
        <Text style={styles.soleText}>
          MedVault has one administrator account. It can't be created, duplicated, suspended or deleted from inside the app.
        </Text>
      </View>

      <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}>
        <InfoRow icon="mail-outline" label="Email" value={profile.email} />
        <InfoRow icon="id-card-outline" label="Admin ID" value={profile.adminId || profile.staffId || '—'} />
        <InfoRow icon="shield-outline" label="Role" value={profile.role} />
        <InfoRow icon="calendar-outline" label="Since" value={joinedLabel(profile.createdAt)} />
        <InfoRow icon="people-outline" label="Managing" value={`${totals.users || pharmacies.length} accounts`} last />
      </Card>

      <Text style={styles.sectionLabel}>Appearance</Text>
      <Card style={styles.themeCard}>
        <View style={styles.menuIcon}>
          <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.greenLight} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuLabel}>Dark mode</Text>
          <Text style={styles.themeHint}>{isDark ? 'On — easier on the eyes in low light' : 'Off — light theme is showing'}</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={(v) => setMode(v ? 'dark' : 'light')}
          trackColor={{ false: colors.border, true: colors.green }}
          ios_backgroundColor={colors.border}
          thumbColor="#fff"
          accessibilityLabel="Dark mode"
        />
      </Card>

      <Text style={styles.sectionLabel}>Security</Text>
      <View style={{ marginHorizontal: spacing.lg }}>
        <Pressable style={styles.menuRow} onPress={() => navigation.navigate('ChangePassword')}>
          <View style={styles.menuIcon}>
            <Ionicons name="key-outline" size={18} color={colors.greenLight} />
          </View>
          <Text style={styles.menuLabel}>Change password</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>Data</Text>
      <View style={{ marginHorizontal: spacing.lg }}>
        <Pressable style={styles.menuRow} onPress={exportUsers}>
          <View style={styles.menuIcon}>
            <Ionicons name="download-outline" size={18} color={colors.greenLight} />
          </View>
          <Text style={styles.menuLabel}>Export all users (CSV)</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Pressable style={styles.logoutBtn} onPress={resetToLogin}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>

      <ConfirmDialog visible={!!notice} icon="alert-circle" tone="danger" title={notice?.title} message={notice?.message} onCancel={() => setNotice(null)} />
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, last }) {
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={[styles.infoRow, !last && styles.infoBorder]}>
      <Ionicons name={icon} size={17} color={colors.textMuted} style={{ marginRight: 10 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.sm },
  title: { color: colors.textPrimary, ...type.h1 },
  top: { alignItems: 'center', marginTop: spacing.sm },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.tealDeep, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.green, marginBottom: spacing.sm },
  name: { color: colors.textPrimary, ...type.h2 },
  store: { color: colors.textSecondary, ...type.small, marginTop: 2, marginBottom: spacing.sm },
  soleNote: { flexDirection: 'row', gap: 10, marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.greenTint, borderWidth: 1, borderColor: colors.border },
  soleText: { flex: 1, color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
  sectionLabel: { color: colors.textMuted, ...type.tiny, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.lg, marginBottom: spacing.sm, marginHorizontal: spacing.lg },
  themeCard: { marginHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  themeHint: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, ...theme.shadow },
  menuIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  menuLabel: { flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, marginHorizontal: spacing.lg, paddingVertical: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.danger },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textMuted, fontSize: 12.5, width: 90 },
  infoValue: { color: colors.textPrimary, fontSize: 13, flex: 1, textAlign: 'right', fontWeight: '600' },
});
