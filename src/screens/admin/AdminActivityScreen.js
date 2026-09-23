import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Chip from '../../components/Chip';
import Card from '../../components/Card';
import ActivityRow from '../../components/ActivityRow';
import EmptyState from '../../components/EmptyState';
import { spacing, type } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useAdmin } from '../../context/AdminContext';
import { dayHeading } from '../../utils/adminStats';

const FILTERS = [
  { key: 'all', label: 'All', types: null },
  { key: 'access', label: 'Sign-ins', types: ['login', 'signup'] },
  { key: 'stock', label: 'Stock', types: ['stock', 'alert'] },
  { key: 'sale', label: 'Sales', types: ['sale'] },
  { key: 'admin', label: 'Admin', types: ['admin'] },
];

// The system-wide activity log, newest first, grouped by day. Admin actions are recorded here too.
export default function AdminActivityScreen() {
  const { colors, styles } = useThemedStyles(createStyles);
  const { activity } = useAdmin();
  const [filter, setFilter] = useState('all');

  const active = FILTERS.find((f) => f.key === filter);
  const items = activity.filter((a) => !active.types || active.types.includes(a.type));
  const count = (f) => (f.types ? activity.filter((a) => f.types.includes(a.type)).length : activity.length);

  // group by day, keeping newest first
  const groups = [];
  [...items].sort((a, b) => (a.at < b.at ? 1 : -1)).forEach((a) => {
    const heading = dayHeading(a.at);
    const g = groups[groups.length - 1];
    if (g && g.heading === heading) g.items.push(a);
    else groups.push({ heading, items: [a] });
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.sub}>Everything happening across MedVault</Text>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => <Chip key={f.key} label={f.label} count={count(f)} active={filter === f.key} onPress={() => setFilter(f.key)} />)}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {groups.length === 0 ? (
          <EmptyState icon="time-outline" tint={colors.textMuted} title="Nothing here yet" subtitle="Activity of this kind will show up here." />
        ) : (
          groups.map((g) => (
            <View key={g.heading}>
              <Text style={styles.day}>{g.heading}</Text>
              <Card style={styles.card}>
                {g.items.map((a) => <ActivityRow key={a.id} item={a} />)}
              </Card>
            </View>
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
  chips: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  day: { color: colors.textMuted, ...type.tiny, textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.sm },
  card: { marginHorizontal: spacing.lg, paddingVertical: spacing.xs, marginBottom: spacing.sm },
});
