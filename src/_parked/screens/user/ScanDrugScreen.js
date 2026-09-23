import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, type } from '../../../theme/theme';

export default function ScanDrugScreen({ navigation }) {
  const lineY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lineY, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(lineY, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();

    const timer = setTimeout(() => {
      navigation.replace('DrugInfo', { batchCode: '5012345678901' });
    }, 1800);

    return () => { loop.stop(); clearTimeout(timer); };
  }, []);

  const translateY = lineY.interpolate({ inputRange: [0, 1], outputRange: [0, 210] });

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={10}>
        <Ionicons name="close" size={24} color="#fff" />
      </Pressable>

      <Text style={styles.title}>Scanning...</Text>
      <Text style={styles.subtitle}>Point your camera at the drug's barcode</Text>

      <View style={styles.frame}>
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
        <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', paddingTop: 80 },
  closeBtn: { position: 'absolute', top: 56, right: spacing.lg, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  title: { color: '#fff', ...type.h2 },
  subtitle: { color: 'rgba(255,255,255,0.6)', ...type.small, marginTop: 6, marginBottom: spacing.xl },
  frame: { width: 280, height: 210, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: colors.greenLight },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
  scanLine: { position: 'absolute', top: 0, left: 8, right: 8, height: 2, backgroundColor: colors.greenLight, shadowColor: colors.greenLight, shadowOpacity: 0.9, shadowRadius: 8 },
});
