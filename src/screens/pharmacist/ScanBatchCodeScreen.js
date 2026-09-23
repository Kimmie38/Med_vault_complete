import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { darkColors as colors, spacing, type } from '../../theme/theme'; // camera UI is always dark

// Scans a drug's barcode / QR code with the device camera (documentation §3.4.3.2).
// The scanned code is handed back to the Add Stock screen, which looks it up in the drug records.
export default function ScanBatchCodeScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [captured, setCaptured] = useState(false);
  const handled = useRef(false);
  const lineY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lineY, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(lineY, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [lineY]);

  const finish = (code) => {
    if (handled.current) return;
    handled.current = true;
    setCaptured(true);
    setTimeout(() => {
      navigation.popTo('AddBatch', { scannedCode: String(code) }, { merge: true });
    }, 450);
  };

  const translateY = lineY.interpolate({ inputRange: [0, 1], outputRange: [0, 210] });
  const granted = permission?.granted;

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={10}>
        <Ionicons name="close" size={24} color="#fff" />
      </Pressable>

      <Text style={styles.title}>Scan drug barcode</Text>
      <Text style={styles.subtitle}>Hold the barcode or QR code inside the frame</Text>

      <View style={styles.frameWrap}>
        <View style={styles.frame}>
          {granted && (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'] }}
              onBarcodeScanned={captured ? undefined : ({ data }) => finish(data)}
            />
          )}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          {granted && !captured && <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />}
          {captured && (
            <View style={styles.successWrap}>
              <Ionicons name="checkmark-circle" size={54} color={colors.success} />
            </View>
          )}
          {!granted && !captured && (
            <View style={styles.successWrap}>
              <Ionicons name="camera-outline" size={40} color="rgba(255,255,255,0.5)" />
            </View>
          )}
        </View>
      </View>

      <Text style={styles.status}>{captured ? 'Code captured' : granted ? 'Scanning for a medicine code…' : 'Camera access is needed to scan'}</Text>

      {!granted && (
        <Pressable style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permText}>Allow camera access</Text>
        </Pressable>
      )}

      {!granted && <Text style={styles.helpText}>You can allow camera access in your device settings and try again.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', paddingTop: 80 },
  closeBtn: { position: 'absolute', top: 56, right: spacing.lg, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  title: { color: '#fff', ...type.h2 },
  subtitle: { color: 'rgba(255,255,255,0.6)', ...type.small, marginTop: 6, marginBottom: spacing.xl },
  frameWrap: { width: 280, height: 210, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 280, height: 210, borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: colors.greenLight },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
  scanLine: { position: 'absolute', top: 0, left: 8, right: 8, height: 2, backgroundColor: colors.greenLight, shadowColor: colors.greenLight, shadowOpacity: 0.9, shadowRadius: 8 },
  successWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  status: { color: 'rgba(255,255,255,0.7)', ...type.small, marginTop: spacing.xl },
  permBtn: { marginTop: spacing.md, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999, backgroundColor: colors.green },
  permText: { color: '#06110D', fontWeight: '700' },
  helpText: { color: 'rgba(255,255,255,0.55)', ...type.small, textAlign: 'center', paddingHorizontal: spacing.xl, marginTop: spacing.lg, lineHeight: 18 },
});
