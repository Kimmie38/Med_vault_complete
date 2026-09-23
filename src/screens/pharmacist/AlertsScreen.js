import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../../components/Badge';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import SegmentedControl from '../../components/SegmentedControl';
import { spacing, type, radius } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { TIERS } from '../../utils/inventory';
import { formatDate } from '../../utils/dates';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warning' },
  { key: 'expired', label: 'Expired' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'low_stock', label: 'Low stock' },
];

const matches = (alert, filter) => {
  if (filter === 'all') return true;
  if (filter === 'low_stock') return alert.alertType === 'low_stock';
  return alert.alertType === 'expiry' && alert.alertTier === filter;
};

function AlertCard({ alert, onDiscard, onSellFirst, onForecast }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const flash = useRef(new Animated.Value(0)).current;
  const isUrgent = alert.alertTier === 'critical' || alert.alertTier === 'expired';
  const tone = TIERS[alert.alertTier].tone;

  useEffect(() => {
    if (!isUrgent) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(flash, { toValue: 0, duration: 700, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isUrgent, flash]);

  const accent = tone === 'danger' ? colors.danger : tone === 'warning' ? colors.warning : colors.info;
  const borderColor = isUrgent ? flash.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.danger] }) : colors.border;
  const bgColor = isUrgent ? flash.interpolate({ inputRange: [0, 1], outputRange: [colors.bgElevated, colors.dangerFlash] }) : colors.bgElevated;

  const isLow = alert.alertType === 'low_stock';

  return (
    <Animated.View style={[styles.card, { borderColor, backgroundColor: bgColor }]}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.drugName}>{(alert.drug && alert.drug.name) || 'Unknown drug'}</Text>
          <Text style={styles.meta}>
            {isLow
              ? `${alert.drug.category} · reorder level ${alert.drug.reorderLevel}`
              : `Batch ${alert.batch.batchNumber} · Qty ${alert.batch.quantity}`}
          </Text>
        </View>
        <Badge label={isLow ? 'Low stock' : TIERS[alert.alertTier].label} tone={tone} />
      </View>

      <Text style={styles.detail}>
        {isLow
          ? alert.stock === 0
            ? 'Out of sellable stock'
            : `Only ${alert.stock} unit${alert.stock === 1 ? '' : 's'} left`
          : alert.alertTier === 'expired'
            ? `Expired ${Math.abs(alert.days)} day${Math.abs(alert.days) === 1 ? '' : 's'} ago (${formatDate(alert.batch.expiryDate)})`
            : `Expires ${formatDate(alert.batch.expiryDate)} · ${alert.days} day${alert.days === 1 ? '' : 's'} left`}
      </Text>

      <View style={styles.actionsRow}>
        {isLow ? (
          <Pressable style={styles.primaryBtn} onPress={() => onForecast(alert.drug.drugId)}>
            <Ionicons name="trending-up-outline" size={16} color="#fff" />
            <Text style={styles.actionLabel}>See reorder suggestion</Text>
          </Pressable>
        ) : (
          <>
            <Pressable style={styles.discardBtn} onPress={() => onDiscard(alert)}>
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.actionLabel}>Discard</Text>
            </Pressable>
            {alert.alertTier !== 'expired' && (
              <Pressable style={styles.primaryBtn} onPress={() => onSellFirst(alert.drug.drugId)}>
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text style={styles.actionLabel}>Sell first</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </Animated.View>
  );
}

export default function AlertsScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { alerts, resolvedAlerts, discardBatch } = useInventory();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('active');

  const visible = alerts.filter((a) => matches(a, filter));

  const confirmDiscard = (alert) => {
    Alert.alert(
      'Discard this batch?',
      `${(alert.drug && alert.drug.name) || 'Unknown drug'} · batch ${alert.batch.batchNumber} (${alert.batch.quantity} units) will be removed from stock and logged as discarded.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => discardBatch(alert.batchId) },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <Text style={styles.subtitle}>
          {alerts.length} active alert{alerts.length !== 1 ? 's' : ''} · {resolvedAlerts.length} resolved
        </Text>
      </View>

      <SegmentedControl
        value={view}
        onChange={setView}
        options={[{ value: 'active', label: 'Active' }, { value: 'resolved', label: 'Resolved' }]}
      />

      {view === 'active' ? (
        <>
          <View style={styles.chipsWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {FILTERS.map((f) => (
                <Chip
                  key={f.key}
                  label={f.label}
                  count={alerts.filter((a) => matches(a, f.key)).length}
                  active={filter === f.key}
                  onPress={() => setFilter(f.key)}
                />
              ))}
            </ScrollView>
          </View>

          {visible.length === 0 ? (
            <EmptyState
              title="All clear"
              subtitle={filter === 'all' ? 'No batches are near expiry and nothing is low on stock.' : 'Nothing to show for this filter.'}
            />
          ) : (
            <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}>
              {visible.map((a) => (
                <AlertCard
                  key={a.alertId}
                  alert={a}
                  onDiscard={confirmDiscard}
                  onSellFirst={(drugId) => navigation.navigate('Home', { screen: 'Sales', params: { drugId } })}
                  onForecast={(drugId) => navigation.navigate('Forecast', { drugId })}
                />
              ))}
            </ScrollView>
          )}
        </>
      ) : resolvedAlerts.length === 0 ? (
        <EmptyState icon="file-tray-outline" tint={colors.textMuted} title="Nothing resolved yet" subtitle="An alert is resolved when its batch is discarded, sold out or restocked." />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}>
          {resolvedAlerts.map((r) => (
            <View key={r.alertId} style={styles.resolvedCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.drugName}>{(r.drug && r.drug.name) || 'Unknown drug'}</Text>
                <Text style={styles.meta}>
                  {r.batch ? `Batch ${r.batch.batchNumber}` : 'Low stock'} · {TIERS[r.alertTier].label} · resolved {r.resolvedAt}
                </Text>
              </View>
              <Badge label="Resolved" tone="neutral" />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
  title: { color: colors.textPrimary, ...type.h1 },
  subtitle: { color: colors.textSecondary, ...type.small, marginTop: 4 },
  chipsWrap: { marginBottom: spacing.md },
  chips: { paddingHorizontal: spacing.lg, gap: 8 },
  card: { borderWidth: 1.5, borderRadius: radius.lg, padding: spacing.md, paddingLeft: spacing.md + 6, marginBottom: spacing.md, overflow: 'hidden' },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  drugName: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  detail: { color: colors.textSecondary, fontSize: 12.5, marginTop: spacing.sm, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  discardBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neutralButton, height: 42, borderRadius: radius.sm },
  primaryBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green, height: 42, borderRadius: radius.sm },
  actionLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  resolvedCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bgElevated, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
});
