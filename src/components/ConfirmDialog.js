import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { radius, spacing, type } from '../theme/theme';
import { useThemedStyles } from '../theme/ThemeContext';

// Themed confirmation dialog (works on every platform, unlike Alert.alert on web).
//   tone: 'danger' | 'primary'      children: optional extra content under the message
//   Omit `confirmLabel` to show a single "Done" button (for result messages).
export default function ConfirmDialog({ visible, title, message, icon = 'help-circle', tone = 'primary', confirmLabel, cancelLabel = 'Cancel', onConfirm, onCancel, children }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const tint = tone === 'danger' ? colors.danger : colors.greenLight;
  const tintBg = tone === 'danger' ? colors.dangerTint : colors.greenTint;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={[styles.iconWrap, { backgroundColor: tintBg }]}>
            <Ionicons name={icon} size={26} color={tint} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {children}
          <View style={styles.actions}>
            {confirmLabel ? (
              <>
                <Button label={cancelLabel} variant="outline" onPress={onCancel} style={{ flex: 1 }} />
                <Button label={confirmLabel} variant={tone === 'danger' ? 'danger' : 'primary'} onPress={onConfirm} style={{ flex: 1 }} />
              </>
            ) : (
              <Button label="Done" onPress={onCancel} style={{ flex: 1 }} />
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors, theme) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 380, backgroundColor: colors.bgElevated, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center' },
  iconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { color: colors.textPrimary, ...type.h2, textAlign: 'center' },
  message: { color: colors.textSecondary, ...type.body, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, width: '100%' },
});
