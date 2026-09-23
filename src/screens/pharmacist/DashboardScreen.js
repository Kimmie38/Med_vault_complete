import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { spacing, type, radius } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { TIERS } from '../../utils/inventory';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function alertDetail(a) {
  if (a.alertType === 'low_stock') return `Low stock · ${a.stock} left (reorder level ${a.drug?.reorderLevel ?? 'unknown'})`;
  if (a.alertTier === 'expired') return `Batch ${a.batch?.batchNumber ?? 'Unknown'} · expired ${Math.abs(a.days)}d ago`;
  return `Batch ${a.batch?.batchNumber ?? 'Unknown'} · ${a.days}d to expiry`;
}

export default function DashboardScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { profile = {}, drugs = [], alerts = [] } = useInventory();

  const expiringSoon = alerts.filter((a) => a.alertType === 'expiry' && a.alertTier !== 'expired').length;
  const expired = alerts.filter((a) => a.alertType === 'expiry' && a.alertTier === 'expired').length;
  const lowStock = alerts.filter((a) => a.alertType === 'low_stock').length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.name}>{(profile?.name || '').split(' ')[0]} 👋</Text>
          <Text style={styles.pharmacy}>{profile?.pharmacyName || ''}</Text>
        </View>
        {/* Settings: opens the Profile & Settings screen (profile details + dark/light mode). */}
        <Pressable
          onPress={() => navigation.navigate('Account')}
          style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.7 }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Profile and settings"
        >
          <Ionicons name="settings-outline" size={22} color={colors.greenLight} />
        </Pressable>
      </View>

      {alerts.length > 0 && (
        <Pressable onPress={() => navigation.navigate('Alerts')}>
          <LinearGradient colors={['#7A1A16', colors.danger]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.alertBanner}>
            <Ionicons name="warning" size={20} color="#fff" />
            <Text style={styles.alertText}>
              {alerts.length} item{alerts.length > 1 ? 's' : ''} need your attention
              {expired > 0 ? ` · ${expired} expired` : ''}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      )}

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="medical-outline" size={20} color={colors.greenLight} />
          <Text style={styles.statValue}>{drugs.length}</Text>
          <Text style={styles.statLabel}>Drugs tracked</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="time-outline" size={20} color={colors.warning} />
          <Text style={styles.statValue}>{expiringSoon}</Text>
          <Text style={styles.statLabel}>Expiring soon</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="trending-down-outline" size={20} color={colors.danger} />
          <Text style={styles.statValue}>{lowStock}</Text>
          <Text style={styles.statLabel}>Low in stock</Text>
        </Card>
      </View>

      <View style={styles.quickRow}>
        <QuickAction icon="cart-outline" label="Record sale" onPress={() => navigation.navigate('Sales')} />
        <QuickAction icon="scan-outline" label="Add stock" onPress={() => navigation.navigate('Scan')} />
        <QuickAction icon="cube-outline" label="Inventory" onPress={() => navigation.navigate('Inventory')} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Needs attention</Text>
        <Pressable onPress={() => navigation.navigate('Alerts')}>
          <Text style={styles.sectionLink}>See all</Text>
        </Pressable>
      </View>

      {alerts.length === 0 ? (
        <Card style={styles.allClear}>
          <Ionicons name="checkmark-done-circle-outline" size={34} color={colors.success} />
          <Text style={styles.allClearTitle}>All clear</Text>
          <Text style={styles.allClearSub}>No batches are near expiry and nothing is low on stock.</Text>
        </Card>
      ) : (
        alerts.slice(0, 5).map((a) => (
          <Pressable key={a.alertId} onPress={() => navigation.navigate('Alerts')}>
            <Card style={styles.attentionCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.attentionName}>{(a.drug && a.drug.name) || 'Unknown drug'}</Text>
                <Text style={styles.attentionMeta}>{alertDetail(a)}</Text>
              </View>
              <Badge label={a.alertType === 'low_stock' ? 'Low stock' : TIERS[a.alertTier].label} tone={TIERS[a.alertTier].tone} />
            </Card>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

function QuickAction({ icon, label, onPress }) {
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quick, { opacity: pressed ? 0.8 : 1 }]}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={20} color={colors.greenLight} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
  greeting: { color: colors.textSecondary, ...type.small },
  name: { color: colors.textPrimary, ...type.h1, marginTop: 2 },
  pharmacy: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...theme.shadow },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md },
  alertText: { flex: 1, color: '#fff', ...type.small, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  statCard: { flex: 1, alignItems: 'flex-start', gap: 6 },
  statValue: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 11 },
  quickRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  quick: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: radius.md, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border, ...theme.shadow },
  quickIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { color: colors.textPrimary, ...type.h3 },
  sectionLink: { color: colors.greenLight, ...type.small, fontWeight: '600' },
  attentionCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  attentionName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  attentionMeta: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  allClear: { marginHorizontal: spacing.lg, alignItems: 'center', paddingVertical: spacing.lg },
  allClearTitle: { color: colors.textPrimary, ...type.h3, marginTop: spacing.sm },
  allClearSub: { color: colors.textMuted, ...type.small, marginTop: 4, textAlign: 'center' },
});
