import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import BarChart from '../../components/BarChart';
import EmptyState from '../../components/EmptyState';
import { spacing, type, radius } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useInventory } from '../../context/InventoryContext';
import { forecastDrug, weekLabels, MA_WINDOW, ES_ALPHA, HISTORY_WEEKS } from '../../utils/forecast';

const CHART_WEEKS = 6;

// Demand forecast (documentation §4.1.5): bar chart of units sold over the past six weeks, the
// projected demand for the coming week (moving average + exponential smoothing), and one
// prominent suggested reorder quantity.
export default function ForecastScreen({ route }) {
  const { colors, gradients, styles } = useThemedStyles(createStyles);
  const { drugs, batches, sales, settings, updateSettings, stockOf } = useInventory();
  const [drugId, setDrugId] = useState(drugs[0]?.drugId);
  const [showHow, setShowHow] = useState(false);
  const chipsRef = useRef(null);
  const chipX = useRef({});

  useEffect(() => {
    if (route?.params?.drugId) setDrugId(route.params.drugId);
  }, [route?.params?.drugId]);

  const drug = drugs.find((d) => d.drugId === drugId) || drugs[0];

  // Keep the selected drug's chip in view when it is chosen from another screen.
  useEffect(() => {
    const x = chipX.current[drugId];
    if (x !== undefined && chipsRef.current) chipsRef.current.scrollTo({ x: Math.max(0, x - spacing.lg), animated: true });
  }, [drugId]);
  const stock = drug ? stockOf(drug.drugId) : 0;

  const result = useMemo(
    () =>
      drug
        ? forecastDrug({ sales, batches, drugId: drug.drugId, stock, reorderLevel: drug.reorderLevel, leadTimeWeeks: settings.leadTimeWeeks || 2 })
        : null,
    [sales, batches, drug, stock, settings.leadTimeWeeks]
  );

  if (!drug || !result) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Demand forecast</Text>
          <Text style={styles.subtitle}>How much to reorder, based on your sales history</Text>
        </View>
        <EmptyState
          icon="analytics-outline"
          tint={colors.greenLight}
          title={drugs.length ? 'Preparing your forecast' : 'Add a medicine to get started'}
          subtitle={drugs.length ? 'Your forecast will appear in a moment.' : 'Add your first medicine and record sales to see demand and reorder recommendations here.'}
        />
      </ScrollView>
    );
  }

  const labels = weekLabels(CHART_WEEKS);
  const past = result.series.slice(-CHART_WEEKS);
  const chartData = [
    ...past.map((v, i) => ({ label: labels[i], value: v })),
    { label: 'Next wk', value: result.weekly, highlight: true },
  ];

  const ok = result.suggested === 0; // stock is enough: neutral card instead of the brand gradient
  const enoughData = result.series.filter((v) => v > 0).length >= 3;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Demand forecast</Text>
        <Text style={styles.subtitle}>How much to reorder, based on your sales history</Text>
      </View>

      <ScrollView ref={chipsRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {drugs.map((d) => (
          <View key={d.drugId} onLayout={(e) => { chipX.current[d.drugId] = e.nativeEvent.layout.x; }}>
            <Chip label={d.name} active={d.drugId === drug.drugId} onPress={() => setDrugId(d.drugId)} />
          </View>
        ))}
      </ScrollView>

      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{drug.name}</Text>
            <Text style={styles.cardSub}>Units sold per week</Text>
          </View>
          <View style={styles.legend}>
            <View style={[styles.dot, { backgroundColor: colors.teal }]} />
            <Text style={styles.legendText}>Sold</Text>
            <View style={[styles.dot, { backgroundColor: colors.greenLight, marginLeft: 10 }]} />
            <Text style={styles.legendText}>Projected</Text>
          </View>
        </View>
        <BarChart data={chartData} />
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Moving average</Text>
          <Text style={styles.statValue}>{Math.round(result.ma)}</Text>
          <Text style={styles.statUnit}>units / week</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Smoothed trend</Text>
          <Text style={styles.statValue}>{Math.round(result.es)}</Text>
          <Text style={styles.statUnit}>units / week</Text>
        </Card>
        <Card style={[styles.statCard, { borderColor: colors.green }]}>
          <Text style={styles.statLabel}>Next week</Text>
          <Text style={[styles.statValue, { color: colors.greenLight }]}>{Math.round(result.weekly)}</Text>
          <Text style={styles.statUnit}>units projected</Text>
        </Card>
      </View>

      <LinearGradient colors={result.suggested > 0 ? gradients.brand : [colors.bgElevated, colors.bgElevated]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.reorderCard, result.suggested === 0 && styles.reorderCardOk]}>
        <Text style={[styles.reorderLabel, ok && styles.reorderLabelOk]}>Suggested reorder</Text>
        {result.suggested > 0 ? (
          <>
            <Text style={styles.reorderValue}>{result.suggested}</Text>
            <Text style={styles.reorderUnit}>units of {drug.name}</Text>
          </>
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={44} color={colors.success} style={{ marginVertical: 6 }} />
            <Text style={[styles.reorderUnit, styles.reorderUnitOk]}>Stock is enough for now — no reorder needed</Text>
          </>
        )}
        <Text style={[styles.reorderBasis, ok && styles.reorderBasisOk]}>Based on moving average + exponential smoothing trend over {HISTORY_WEEKS} weeks</Text>
        <View style={styles.reorderMetaRow}>
          <Text style={[styles.reorderMeta, ok && styles.reorderMetaOk]}>{stock} in stock</Text>
          <Text style={[styles.reorderMeta, ok && styles.reorderMetaOk]}>·</Text>
          <Text style={[styles.reorderMeta, ok && styles.reorderMetaOk]}>reorder level {drug.reorderLevel}</Text>
        </View>
      </LinearGradient>

      <Text style={styles.sectionLabel}>Restock cover</Text>
      <View style={styles.coverRow}>
        {[1, 2, 3, 4].map((w) => (
          <Chip key={w} label={`${w} week${w > 1 ? 's' : ''}`} active={settings.leadTimeWeeks === w} onPress={() => updateSettings({ leadTimeWeeks: w })} />
        ))}
      </View>
      <Text style={styles.cover}>How long a restock needs to last. Longer cover means a bigger suggested order.</Text>

      {!enoughData && (
        <Card style={styles.warnCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
          <Text style={styles.warnText}>There are only a few weeks of sales for this drug, so the forecast may be rough. It improves as more sales are recorded.</Text>
        </Card>
      )}

      <Pressable style={styles.howHeader} onPress={() => setShowHow(!showHow)}>
        <Ionicons name="help-circle-outline" size={18} color={colors.greenLight} />
        <Text style={styles.howTitle}>How is this calculated?</Text>
        <Ionicons name={showHow ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </Pressable>
      {showHow && (
        <Card style={{ marginHorizontal: spacing.lg }}>
          <Text style={styles.howText}>
            1. Your sales from the last {HISTORY_WEEKS} weeks are grouped into weekly totals.{'\n\n'}
            2. A moving average of the latest {MA_WINDOW} weeks shows the recent typical demand.{'\n\n'}
            3. Exponential smoothing (weight {ES_ALPHA} on the newest week) follows the trend, giving recent weeks more influence.{'\n\n'}
            4. The two are averaged into a projection of {Math.round(result.weekly)} units per week.{'\n\n'}
            5. Suggested reorder = {Math.round(result.weekly)} × {settings.leadTimeWeeks} week{settings.leadTimeWeeks > 1 ? 's' : ''} + reorder level ({drug.reorderLevel}) − stock in hand ({stock}).
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
  title: { color: colors.textPrimary, ...type.h1 },
  subtitle: { color: colors.textSecondary, ...type.small, marginTop: 4 },
  chips: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.md },
  chartCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  cardSub: { color: colors.textMuted, fontSize: 11.5, marginTop: 2 },
  legend: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendText: { color: colors.textMuted, fontSize: 10.5 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  statCard: { flex: 1, padding: spacing.sm + 4 },
  statLabel: { color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },
  statValue: { color: colors.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 4 },
  statUnit: { color: colors.textMuted, fontSize: 10.5, marginTop: 1 },
  reorderCard: { marginHorizontal: spacing.lg, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg },
  reorderCardOk: { borderWidth: 1, borderColor: colors.border },
  reorderLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },
  reorderValue: { color: '#fff', fontSize: 56, fontWeight: '800', marginTop: 4, lineHeight: 64 },
  reorderUnit: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  reorderBasis: { color: 'rgba(255,255,255,0.7)', fontSize: 11.5, marginTop: spacing.sm, textAlign: 'center' },
  reorderMetaRow: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  reorderMeta: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  reorderLabelOk: { color: colors.textSecondary },
  reorderUnitOk: { color: colors.textPrimary },
  reorderBasisOk: { color: colors.textMuted },
  reorderMetaOk: { color: colors.textMuted },
  sectionLabel: { color: colors.textPrimary, ...type.h3, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  coverRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg, flexWrap: 'wrap' },
  cover: { color: colors.textMuted, fontSize: 11.5, paddingHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.md, lineHeight: 16 },
  warnCard: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.md, borderColor: colors.warning },
  warnText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  howHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  howTitle: { flex: 1, color: colors.greenLight, fontSize: 13.5, fontWeight: '700' },
  howText: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
});
