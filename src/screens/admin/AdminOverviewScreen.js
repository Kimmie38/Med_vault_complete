import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import StatTile from '../../components/StatTile';
import BarChart from '../../components/BarChart';
import UserRow from '../../components/UserRow';
import ActivityRow from '../../components/ActivityRow';
import Badge from '../../components/Badge';
import { spacing, type } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useAdmin } from '../../context/AdminContext';

const WEEK_LABELS = ['5w ago', '4w ago', '3w ago', '2w ago', '1w ago', 'This wk'];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,';
}

// The administrator's landing page: how the whole system is doing, at a glance.
export default function AdminOverviewScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { totals, pharmacies, activity } = useAdmin();

  const goUser = (userId) => navigation.navigate('Users', { screen: 'UserDetail', params: { userId } });

  // Pharmacies with the most urgent stock problems first.
  const needAttention = pharmacies
    .filter((p) => p.counts.attention > 0)
    .sort((a, b) => b.counts.expired * 3 + b.counts.critical * 2 + b.counts.attention - (a.counts.expired * 3 + a.counts.critical * 2 + a.counts.attention))
    .slice(0, 3);
  const attentionPharmacies = pharmacies.filter((p) => p.counts.attention > 0).length;

  const chart = totals.weekly.map((value, i) => ({ label: WEEK_LABELS[i], value, highlight: i === totals.weekly.length - 1 }));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <View style={styles.nameRow}>
            <Text style={styles.name}>Administrator</Text>
            <Badge label="Admin" tone="info" />
          </View>
          <Text style={styles.sub}>MedVault system overview</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Account')}
          style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.7 }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Admin profile and settings"
        >
          <Ionicons name="settings-outline" size={22} color={colors.greenLight} />
        </Pressable>
      </View>

      {totals.attention > 0 && (
        <Pressable onPress={() => navigation.navigate('Monitor')}>
          <LinearGradient colors={['#7A1A16', colors.danger]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.banner}>
            <Ionicons name="warning" size={20} color="#fff" />
            <Text style={styles.bannerText}>
              {totals.attention} alerts across {attentionPharmacies} pharmacies need attention
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      )}

      <View style={styles.statsRow}>
        <StatTile icon="people-outline" value={totals.users} label="Total users" onPress={() => navigation.navigate('Users', { screen: 'UsersList' })} />
        <StatTile icon="checkmark-circle-outline" value={totals.active} label="Active" tone="green" />
        <StatTile icon="ban-outline" value={totals.suspended} label="Suspended" tone="danger" />
      </View>
      <View style={styles.statsRow}>
        <StatTile icon="medkit-outline" value={totals.drugs} label="Drugs" tone="info" />
        <StatTile icon="cart-outline" value={totals.unitsSoldThisWeek} label="Sold/week" />
        <StatTile icon="notifications-outline" value={totals.openAlerts} label="Open alerts" tone="warning" onPress={() => navigation.navigate('Monitor')} />
      </View>

      <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}>
        <Text style={styles.cardTitle}>Units sold across all pharmacies</Text>
        <Text style={styles.cardSub}>Last 6 weeks, combined</Text>
        <View style={{ marginTop: spacing.md }}>
          <BarChart data={chart} height={140} />
        </View>
      </Card>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Needs attention</Text>
        <Pressable onPress={() => navigation.navigate('Monitor')}><Text style={styles.seeAll}>See all</Text></Pressable>
      </View>
      <View style={styles.list}>
        {needAttention.length === 0 ? (
          <Text style={styles.empty}>Every pharmacy's stock is healthy.</Text>
        ) : (
          needAttention.map((p) => <UserRow key={p.userId} user={p} onPress={() => goUser(p.userId)} />)
        )}
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <Pressable onPress={() => navigation.navigate('Activity')}><Text style={styles.seeAll}>See all</Text></Pressable>
      </View>
      <Card style={{ marginHorizontal: spacing.lg, paddingVertical: spacing.xs }}>
        {activity.slice(0, 5).map((a) => <ActivityRow key={a.id} item={a} />)}
      </Card>

      {(totals.newThisWeek > 0 || totals.dormant > 0) && (
        <Text style={styles.footnote}>
          {totals.newThisWeek > 0 ? `${totals.newThisWeek} new sign-up${totals.newThisWeek > 1 ? 's' : ''} this week` : ''}
          {totals.newThisWeek > 0 && totals.dormant > 0 ? '  ·  ' : ''}
          {totals.dormant > 0 ? `${totals.dormant} inactive for 30+ days` : ''}
        </Text>
      )}
    </ScrollView>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
  greeting: { color: colors.textSecondary, ...type.small },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  name: { color: colors.textPrimary, ...type.h1 },
  sub: { color: colors.textMuted, ...type.small, marginTop: 2 },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...theme.shadow },
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: 14, marginBottom: spacing.md },
  bannerText: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 13.5 },
  statsRow: { flexDirection: 'row', gap: spacing.sm + 2, paddingHorizontal: spacing.lg, marginBottom: spacing.sm + 2 },
  cardTitle: { color: colors.textPrimary, ...type.h3 },
  cardSub: { color: colors.textMuted, ...type.small, marginTop: 2 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { color: colors.textPrimary, ...type.h2 },
  seeAll: { color: colors.greenLight, fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  empty: { color: colors.textMuted, ...type.small, paddingVertical: spacing.md },
  footnote: { color: colors.textMuted, ...type.small, textAlign: 'center', marginTop: spacing.lg },
});
