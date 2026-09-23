import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../../components/Card';
import { colors, spacing, type, radius } from '../../../theme/theme';

const RECENT = [
  { name: 'Amoxicillin 500mg', date: '2 days ago', ok: true },
  { name: 'Vitamin C 1000mg', date: '1 week ago', ok: true },
];

export default function UserHomeScreen({ navigation }) {
  const [query, setQuery] = useState('');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.getParent()?.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Check a drug</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={styles.lead}>Scan or search any drug to confirm it's genuine and safe to use.</Text>

      <Pressable onPress={() => navigation.navigate('ScanDrug')}>
        <LinearGradient colors={[colors.tealDeep, colors.green]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.scanCard}>
          <View style={styles.scanIconWrap}>
            <Ionicons name="scan" size={28} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.scanTitle}>Scan the barcode</Text>
            <Text style={styles.scanSub}>Fastest way — point your camera at the pack</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </LinearGradient>
      </Pressable>

      <View style={styles.orRow}>
        <View style={styles.line} />
        <Text style={styles.orText}>or search by name</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. Amoxicillin, Paracetamol..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
        <Pressable onPress={() => navigation.navigate('DrugInfo', { drugName: query || 'Amoxicillin' })}>
          <Ionicons name="arrow-forward-circle" size={26} color={colors.greenLight} />
        </Pressable>
      </View>

      <View style={styles.aiNote}>
        <Ionicons name="sparkles" size={16} color={colors.info} />
        <Text style={styles.aiNoteText}>MedVault AI reads the pack and cross-checks it against pharmacist-submitted records.</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent checks</Text>
      {RECENT.map((r) => (
        <Card key={r.name} style={styles.recentCard}>
          <View style={styles.recentIcon}>
            <Ionicons name="medical-outline" size={18} color={colors.greenLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.recentName}>{r.name}</Text>
            <Text style={styles.recentDate}>{r.date}</Text>
          </View>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.sm },
  headerTitle: { color: colors.textPrimary, ...type.h2 },
  lead: { color: colors.textSecondary, ...type.body, paddingHorizontal: spacing.lg, marginTop: 6, marginBottom: spacing.lg, lineHeight: 20 },
  scanCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.lg, padding: spacing.lg, borderRadius: radius.lg },
  scanIconWrap: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  scanTitle: { color: '#fff', ...type.h3 },
  scanSub: { color: 'rgba(255,255,255,0.85)', ...type.small, marginTop: 3 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, marginVertical: spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { color: colors.textMuted, fontSize: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.bgElevated2, marginHorizontal: spacing.lg, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 50, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  aiNote: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: 'rgba(61,169,232,0.1)', marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.md },
  aiNoteText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  sectionTitle: { color: colors.textPrimary, ...type.h3, marginHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.sm },
  recentCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  recentIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(31,174,116,0.12)', alignItems: 'center', justifyContent: 'center' },
  recentName: { color: colors.textPrimary, fontSize: 13.5, fontWeight: '600' },
  recentDate: { color: colors.textMuted, fontSize: 11.5, marginTop: 1 },
});
