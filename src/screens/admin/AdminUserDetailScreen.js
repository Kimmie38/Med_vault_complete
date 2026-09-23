import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import StatTile from '../../components/StatTile';
import BarChart from '../../components/BarChart';
import ActivityRow from '../../components/ActivityRow';
import AdminAlertRow from '../../components/AdminAlertRow';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { spacing, type, radius } from '../../theme/theme';
import { useThemedStyles } from '../../theme/ThemeContext';
import { useAdmin } from '../../context/AdminContext';
import { TIER_LABEL, TIER_TONE, TIER_ORDER, timeAgo, joinedLabel } from '../../utils/adminStats';

const WEEK_LABELS = ['5w ago', '4w ago', '3w ago', '2w ago', '1w ago', 'This wk'];

// One pharmacy account in full: profile, stock health, alerts, activity — and the admin's controls.
export default function AdminUserDetailScreen({ navigation, route }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { getUser, activity = [], suspendUser, reactivateUser, resetPassword, deleteUser } = useAdmin();
  const user = getUser && route && route.params ? getUser(route.params.userId) : null;
  const [dialog, setDialog] = useState(null); // 'suspend' | 'reactivate' | 'reset' | 'delete' | { tempPassword }

  // If the account was just deleted, leave this page.
  useEffect(() => {
    if (!user) navigation.goBack();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const suspended = user && user.status === 'suspended';
  const close = () => setDialog(null);
  const userActivity = activity.filter((a) => a.userId === (user && user.userId)).slice(0, 5);
  const chart = (user.weekly || []).map((value, i) => ({ label: WEEK_LABELS[i], value, highlight: i === (user.weekly || []).length - 1 }));
  const drugs = [...(user.drugs || [])].sort((a, b) => (a.status === 'ok' ? 9 : TIER_ORDER.indexOf(a.status)) - (b.status === 'ok' ? 9 : TIER_ORDER.indexOf(b.status)));

  const confirm = () => {
    if (dialog === 'suspend') { user && suspendUser && suspendUser(user.userId); close(); }
      else if (dialog === 'reactivate') { user && reactivateUser && reactivateUser(user.userId); close(); }
      else if (dialog === 'reset') { setDialog({ tempPassword: user && resetPassword ? resetPassword(user.userId) : null }); }
      else if (dialog === 'delete') { close(); user && deleteUser && deleteUser(user.userId); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn} accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>User details</Text>
        </View>

        <View style={styles.top}>
          <Avatar name={user.name} size={76} tone={suspended ? 'muted' : 'brand'} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.store}>{user.pharmacyName}</Text>
          <View style={styles.badges}>
            <Badge label={user.role} tone="info" />
            <Badge label={suspended ? 'Suspended' : 'Active'} tone={suspended ? 'danger' : 'success'} />
          </View>
        </View>

        {suspended && (
          <View style={styles.suspendedNote}>
            <Ionicons name="ban" size={18} color={colors.danger} />
            <Text style={styles.suspendedText}>This account is suspended and cannot sign in. Its data is kept.</Text>
          </View>
        )}

        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}>
          <InfoRow icon="mail-outline" label="Email" value={user.email} />
          <InfoRow icon="id-card-outline" label="Staff ID" value={user.staffId} />
          <InfoRow icon="location-outline" label="Location" value={user.location} />
          <InfoRow icon="calendar-outline" label="Joined" value={joinedLabel(user.createdAt)} />
          <InfoRow icon="time-outline" label="Last active" value={timeAgo(user.lastActive)} last />
        </Card>

        <View style={styles.statsRow}>
          <StatTile icon="medkit-outline" value={user.counts.drugs} label="Drugs" tone="info" />
          <StatTile icon="layers-outline" value={user.counts.batches} label="Batches" />
          <StatTile icon="cart-outline" value={user.counts.soldThisWeek} label="Sold/week" />
          <StatTile icon="notifications-outline" value={user.counts.openAlerts} label="Alerts" tone="warning" />
        </View>

        <Text style={styles.sectionTitle}>Sales, last 6 weeks</Text>
        <Card style={{ marginHorizontal: spacing.lg }}>
          {user.weekly.every((v) => v === 0) ? <Text style={styles.muted}>No sales recorded yet.</Text> : <BarChart data={chart} height={110} />}
        </Card>

        <Text style={styles.sectionTitle}>Stock health</Text>
        <Card style={{ marginHorizontal: spacing.lg, paddingVertical: spacing.xs }}>
          {drugs.length === 0 ? (
            <EmptyState icon="cube-outline" tint={colors.textMuted} title="No stock yet" subtitle="This pharmacy hasn't added any drugs." />
          ) : (
            drugs.map((d, i) => (
              <View key={d.key} style={[styles.drugRow, i < drugs.length - 1 && styles.drugBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.drugName}>{d.name}</Text>
                  <Text style={styles.drugMeta}>{d.stock} in stock · reorder at {d.reorderLevel}</Text>
                </View>
                <Badge label={d.status === 'ok' ? 'OK' : TIER_LABEL[d.status]} tone={TIER_TONE[d.status]} />
              </View>
            ))
          )}
        </Card>

        {user.alerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Open alerts ({user.alerts.length})</Text>
            <View style={styles.list}>
              {user.alerts.map((a) => <AdminAlertRow key={a.alertId} alert={a} showPharmacy={false} />)}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Recent activity</Text>
        <Card style={{ marginHorizontal: spacing.lg, paddingVertical: spacing.xs }}>
          {userActivity.length === 0 ? <Text style={[styles.muted, { paddingVertical: spacing.md }]}>No activity yet.</Text> : userActivity.map((a) => <ActivityRow key={a.id} item={a} compact />)}
        </Card>

        <Text style={styles.sectionTitle}>Admin controls</Text>
        <View style={styles.actions}>
          {suspended ? (
            <Button label="Reactivate account" icon={<Ionicons name="play-circle-outline" size={18} color="#fff" />} onPress={() => setDialog('reactivate')} />
          ) : (
            <Button label="Suspend account" variant="outline" icon={<Ionicons name="pause-circle-outline" size={18} color={colors.textPrimary} />} onPress={() => setDialog('suspend')} />
          )}
          <Button label="Reset password" variant="outline" icon={<Ionicons name="key-outline" size={18} color={colors.textPrimary} />} onPress={() => setDialog('reset')} />
          <Button label="Delete account" variant="danger" icon={<Ionicons name="trash-outline" size={18} color="#fff" />} onPress={() => setDialog('delete')} />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={dialog === 'suspend'} icon="pause-circle" tone="danger"
        title="Suspend this account?" confirmLabel="Suspend" onConfirm={confirm} onCancel={close}
        message={`${user.name} won't be able to sign in until you reactivate the account. Their stock and sales data are kept.`}
      />
      <ConfirmDialog
        visible={dialog === 'reactivate'} icon="play-circle"
        title="Reactivate this account?" confirmLabel="Reactivate" onConfirm={confirm} onCancel={close}
        message={`${user.name} will be able to sign in again straight away.`}
      />
      <ConfirmDialog
        visible={dialog === 'reset'} icon="key"
        title="Reset password?" confirmLabel="Generate" onConfirm={confirm} onCancel={close}
        message={`A temporary password will be created for ${user.name}. They will be asked to choose a new one when they next sign in.`}
      />
      <ConfirmDialog
        visible={dialog === 'delete'} icon="trash" tone="danger"
        title="Delete this account?" confirmLabel="Delete" onConfirm={confirm} onCancel={close}
        message={`This permanently removes ${user.name}'s account and all of its stock, sales and alert records. This can't be undone.`}
      />
      <ConfirmDialog
        visible={!!dialog && typeof dialog === 'object'} icon="checkmark-circle"
        title="Temporary password" onCancel={close}
        message={`Share this with ${user.name} securely. It is shown only once.`}
      >
        <View style={styles.pwBox}>
          <Text style={styles.pwText} selectable>{dialog && dialog.tempPassword}</Text>
        </View>
      </ConfirmDialog>
    </View>
  );
}

function InfoRow({ icon, label, value, last }) {
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={[styles.infoRow, !last && styles.infoBorder]}>
      <Ionicons name={icon} size={17} color={colors.textMuted} style={{ marginRight: 10 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.sm },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.bgElevated2, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.textPrimary, ...type.h2 },
  top: { alignItems: 'center', marginTop: spacing.sm },
  name: { color: colors.textPrimary, ...type.h2, marginTop: spacing.sm },
  store: { color: colors.textSecondary, ...type.small, marginTop: 2 },
  badges: { flexDirection: 'row', gap: 8, marginTop: spacing.sm },
  suspendedNote: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: spacing.lg, marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.dangerTint, borderWidth: 1, borderColor: colors.danger },
  suspendedText: { flex: 1, color: colors.textPrimary, fontSize: 12.5, lineHeight: 17 },
  statsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  sectionTitle: { color: colors.textPrimary, ...type.h3, marginTop: spacing.lg, marginBottom: spacing.sm, marginHorizontal: spacing.lg },
  muted: { color: colors.textMuted, ...type.small },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  drugRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: spacing.sm },
  drugBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  drugName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  drugMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  actions: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.textMuted, fontSize: 12.5, width: 90 },
  infoValue: { color: colors.textPrimary, fontSize: 13, flex: 1, textAlign: 'right', fontWeight: '600' },
  pwBox: { marginTop: spacing.md, backgroundColor: colors.bgElevated2, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, paddingHorizontal: spacing.lg },
  pwText: { color: colors.greenLight, fontSize: 22, fontWeight: '800', letterSpacing: 2 },
});
