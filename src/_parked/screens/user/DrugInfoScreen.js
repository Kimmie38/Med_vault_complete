import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import { colors, spacing, type, radius } from '../../../theme/theme';
import { drugDirectory } from '../../../data/mockData';

export default function DrugInfoScreen({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const fade = useRef(new Animated.Value(0)).current;

  const { batchCode, drugName } = route.params || {};
  const record = (batchCode && drugDirectory[batchCode]) || Object.values(drugDirectory)[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.greenLight} />
        <Text style={styles.loadingTitle}>MedVault AI is checking this drug…</Text>
        <Text style={styles.loadingSub}>Reading pack details and cross-checking pharmacist records</Text>
      </View>
    );
  }

  const daysLeft = Math.round((new Date(record.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isFresh = daysLeft > 30;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Drug Details</Text>
        <View style={{ width: 34 }} />
      </View>

      <Animated.View style={{ opacity: fade }}>
        <LinearGradient
          colors={record.verified ? [colors.tealDeep, colors.green] : ['#7A1A16', colors.danger]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.verifyBanner}
        >
          <Ionicons name={record.verified ? 'shield-checkmark' : 'warning'} size={32} color="#fff" />
          <Text style={styles.verifyTitle}>{record.verified ? 'Verified Genuine' : 'Could Not Verify'}</Text>
          <Text style={styles.verifySub}>
            {record.verified
              ? 'This batch matches records submitted by a PCN-registered pharmacist.'
              : 'We could not match this batch to any registered pharmacist record.'}
          </Text>
        </LinearGradient>

        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <View style={styles.drugTop}>
            <View>
              <Text style={styles.drugName}>{record.name}</Text>
              <Text style={styles.drugStrength}>{record.strength} · {record.form}</Text>
            </View>
            <Badge label={isFresh ? 'Safe to use' : 'Expiring soon'} tone={isFresh ? 'success' : 'warning'} />
          </View>

          <View style={styles.divider} />

          <DetailRow icon="business-outline" label="Manufacturer" value={record.manufacturer} />
          <DetailRow icon="calendar-outline" label="Manufactured" value={record.manufactureDate} />
          <DetailRow icon="alert-circle-outline" label="Expires" value={`${record.expiryDate} (${daysLeft}d left)`} />
          <DetailRow icon="barcode-outline" label="Batch code" value={record.batchCode} />
          <DetailRow icon="storefront-outline" label="Sold by" value={record.registeredPharmacy} last />
        </Card>

        <View style={styles.aiCard}>
          <Ionicons name="sparkles" size={18} color={colors.info} />
          <Text style={styles.aiText}>
            AI summary: This looks like a genuine, in-date batch sold by a registered pharmacy. Always check the pack seal before use.
          </Text>
        </View>

        <Pressable style={styles.reportBtn}>
          <Ionicons name="flag-outline" size={16} color={colors.danger} />
          <Text style={styles.reportText}>Report a problem with this drug</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value, last }) {
  return (
    <View style={[detailStyles.row, !last && detailStyles.border]}>
      <Ionicons name={icon} size={16} color={colors.textMuted} style={{ marginRight: 10 }} />
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 11 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { color: colors.textMuted, fontSize: 12, width: 100 },
  value: { color: colors.textPrimary, fontSize: 12.5, flex: 1, textAlign: 'right', fontWeight: '600' },
});

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  loadingTitle: { color: colors.textPrimary, ...type.h3, marginTop: spacing.lg, textAlign: 'center' },
  loadingSub: { color: colors.textMuted, ...type.small, marginTop: 8, textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.sm },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.bgElevated2, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.textPrimary, ...type.h3 },
  verifyBanner: { alignItems: 'center', marginHorizontal: spacing.lg, padding: spacing.xl, borderRadius: radius.lg, marginTop: spacing.sm },
  verifyTitle: { color: '#fff', ...type.h2, marginTop: spacing.sm },
  verifySub: { color: 'rgba(255,255,255,0.9)', ...type.small, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  drugTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  drugName: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
  drugStrength: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  aiCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: 'rgba(61,169,232,0.1)', marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.lg },
  aiText: { flex: 1, color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
  reportBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, marginHorizontal: spacing.lg, paddingVertical: 13, borderRadius: radius.md, borderWidth: 1, borderColor: colors.danger },
  reportText: { color: colors.danger, fontSize: 13, fontWeight: '700' },
});
