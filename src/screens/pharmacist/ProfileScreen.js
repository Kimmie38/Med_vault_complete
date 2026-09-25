import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { spacing, type, radius } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { buildInventoryCsv } from '../../utils/inventory';
import { resetToLogin } from '../../navigation/navigationRef';

// Profile & settings: who you are, how the app looks (light / dark), and the app's preferences.
// Reached from the gear icon at the top of Home and from the Account tab.
export default function ProfileScreen({ navigation }) {
  const { colors, styles, isDark, setMode } = useThemedStyles(createStyles);
  const { profile = {}, drugs = [], batches = [], suppliers = [] } = useInventory();

  const exportCsv = async () => {
    try {
      await Share.share({ title: 'MedVault inventory', message: buildInventoryCsv({ drugs, batches, suppliers }) });
    } catch (e) {
      Alert.alert('Export failed', 'Could not open the share sheet.');
    }
  };

  const MENU = [
    { icon: 'key-outline', label: 'Change password', onPress: () => navigation.navigate('ChangePassword') },
    { icon: 'notifications-outline', label: 'Alert settings', onPress: () => navigation.navigate('AlertSettings') },
    { icon: 'download-outline', label: 'Export inventory (CSV)', onPress: exportCsv },
    { icon: 'help-circle-outline', label: 'Help & user guide', onPress: () => Alert.alert('User guide', 'Scan tab: add stock batches.\nHome: record a sale (oldest expiry is used first) and browse inventory.\nAlerts tab: act on expiring or low stock.\nForecast tab: see how much to reorder.') },
  ];

  const safeName = profile.name || '';
  const initials = safeName.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile & Settings</Text>
      </View>

      <View style={styles.profileTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{profile.name || ''}</Text>
        <Text style={styles.store}>{profile.pharmacyName || ''}</Text>
        <View style={{ alignSelf: 'center' }}>
          <Badge label={profile.role || ''} tone="info" />
        </View>
      </View>

      <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
        <InfoRow icon="mail-outline" label="Email" value={profile.email || ''} />
        <InfoRow icon="id-card-outline" label="Staff ID" value={profile.staffId || ''} />
        <InfoRow icon="briefcase-outline" label="Role" value={profile.role || ''} />
        <InfoRow icon="business-outline" label="Pharmacy" value={profile.pharmacyName || ''} last />
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

      <Text style={styles.sectionLabel}>Preferences</Text>
      <View style={{ marginHorizontal: spacing.lg, gap: spacing.sm }}>
        {MENU.map((m) => (
          <Pressable key={m.label} style={styles.menuRow} onPress={m.onPress}>
            <View style={styles.menuIcon}>
              <Ionicons name={m.icon} size={18} color={colors.greenLight} />
            </View>
            <Text style={styles.menuLabel}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoutBtn} onPress={resetToLogin}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.sm },
  title: { color: colors.textPrimary, ...type.h1 },
  profileTop: { alignItems: 'center', marginTop: spacing.sm },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.tealDeep, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.green, marginBottom: spacing.sm },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { color: colors.textPrimary, ...type.h2 },
  store: { color: colors.textSecondary, ...type.small, marginTop: 2, marginBottom: spacing.sm },
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
