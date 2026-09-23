import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Chip from '../../components/Chip';
import UserRow from '../../components/UserRow';
import EmptyState from '../../components/EmptyState';
import { spacing, type, radius } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useAdmin } from '../../context/AdminContext';
import { daysSince } from '../../utils/adminStats';

const FILTERS = ['All', 'Active', 'Suspended', 'New', 'Inactive'];

// Every pharmacy account on MedVault. Search by name, pharmacy, email or staff ID.
export default function AdminUsersScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { pharmacies, refreshUsers } = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  useFocusEffect(useCallback(() => {
    refreshUsers().catch(() => {});
  }, [refreshUsers]));

  const matchesFilter = (p, f) => {
    if (f === 'Active') return p.status === 'active';
    if (f === 'Suspended') return p.status === 'suspended';
    if (f === 'New') return daysSince(`${p.createdAt} 00:00`) <= 7;
    if (f === 'Inactive') return p.status === 'active' && daysSince(p.lastActive) > 30;
    return true;
  };

  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f, pharmacies.filter((p) => matchesFilter(p, f)).length])), [pharmacies]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = query.trim().toLowerCase();
  const list = pharmacies
    .filter((p) => matchesFilter(p, filter))
    .filter((p) => !q || [p.name, p.pharmacyName, p.email, p.staffId, p.location].some((v) => v.toLowerCase().includes(q)));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <Text style={styles.sub}>{pharmacies.length} pharmacy accounts</Text>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, pharmacy, email or staff ID"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query ? <Ionicons name="close-circle" size={18} color={colors.textMuted} onPress={() => setQuery('')} /> : null}
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => <Chip key={f} label={f} count={counts[f]} active={filter === f} onPress={() => setFilter(f)} />)}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {list.length === 0 ? (
          <EmptyState icon="people-outline" tint={colors.textMuted} title="No users found" subtitle="Try a different search or filter." />
        ) : (
          list.map((p) => <UserRow key={p.userId} user={p} onPress={() => navigation.navigate('UserDetail', { userId: p.userId })} />)
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.md },
  title: { color: colors.textPrimary, ...type.h1 },
  sub: { color: colors.textSecondary, ...type.small, marginTop: 2 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: spacing.lg, paddingHorizontal: spacing.md, height: 46, borderRadius: radius.md, backgroundColor: colors.bgElevated2, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14, height: 46 },
  chips: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 40, gap: spacing.sm },
});
