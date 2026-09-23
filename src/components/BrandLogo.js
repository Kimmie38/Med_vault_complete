import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// MedVault mark (transparent PNG — works on both themes) with an optional theme-aware wordmark.
// The wordmark is real text so it stays crisp and switches colour with the theme.
export default function BrandLogo({ size = 96, showName = false, nameSize = 30, style }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, style]}>
      <Image source={require('../../assets/images/logo-mark.png')} style={{ width: size, height: size }} resizeMode="contain" />
      {showName ? (
        <Text style={[styles.name, { fontSize: nameSize, color: colors.textPrimary }]}>
          Med<Text style={{ color: colors.greenLight, fontWeight: '300' }}>Vault</Text>
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  name: { fontWeight: '800', letterSpacing: -0.5, marginTop: 10 },
});
