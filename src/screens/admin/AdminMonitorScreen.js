import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Chip from '../../components/Chip';
import StatTile from '../../components/StatTile';
import AdminAlertRow from '../../components/AdminAlertRow';
import EmptyState from '../../components/EmptyState';
import { spacing, type } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useAdmin } from '../../context/AdminContext';
import { TIER_LABEL } from '../../utils/adminStats';

const FILTERS = ['all', 'expired', 'critical', 'low', 'warning', 'upcoming'];

// Every open alert from every pharmacy in one place.
export default function AdminMonitorScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { alerts } = useAdmin();
  const [filter, setFilter] = useState('all');

  const count = (t) => (t === 'all' ? alerts.length : alerts.filter((a) => a.tier === t).length);
  const list = filter === 'all' ? alerts : alerts.filter((a) => a.tier === filter);
  const pharmaciesAffected = new Set(alerts.filter((a) => a.tier !== 'upcoming').map((a) => a.userId)).size;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Monitor</Text>
        <Text style={styles.sub}>{alerts.length} open alerts · {pharmaciesAffected} pharmacies affected</Text>
      </View>

      <View style={styles.statsRow}>
        <StatTile icon="skull-outline" value={count('expired')} label="Expired" tone="danger" />
        <StatTile icon="alert-circle-outline" value={count('critical')} label="Critical" tone="danger" />
        <StatTile icon="trending-down-outline" value={count('low')} label="Low stock" tone="warning" />
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => <Chip key={f} label={f === 'all' ? 'All' : TIER_LABEL[f]} count={count(f)} active={filter === f} onPress={() => setFilter(f)} />)}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {list.length === 0 ? (
          <EmptyState title="All clear" subtitle="No alerts in this category across any pharmacy." />
        ) : (
          list.map((a) => (
            <AdminAlertRow key={a.alertId} alert={a} onPress={() => navigation.navigate('Users', { screen: 'UserDetail', params: { userId: a.userId } })} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
  title: { color: colors.textPrimary, ...type.h1 },
  sub: { color: colors.textSecondary, ...type.small, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.sm + 2, paddingHorizontal: spacing.lg },
  chips: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 40, gap: spacing.sm },
});
