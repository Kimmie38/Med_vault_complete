import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Easing, StyleSheet, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkColors } from '../theme/theme';
import { restoreSession } from '../api/client';

const { width } = Dimensions.get('window');
const MARK = Math.min(width * 0.52, 300); // mark diameter (layers are square)

// The splash is always dark (it is a brand moment, and it matches the native splash shown by the OS
// before the app loads), regardless of the light/dark setting used inside the app.
const c = darkColors;

// "Vault unlocks" sequence, ~2.8 s:
//   1. the closed door settles into place (continues straight on from the native splash image)
//   2. the dial spins past its mark, then clicks back into position
//   3. the cross handle pops in and the whole door gives a small lock "thunk"
//   4. "Med" and "Vault" slide together, then the tagline fades up
export default function SplashScreen({ navigation }) {
  const doorScale = useRef(new Animated.Value(0.92)).current;
  const dialRot = useRef(new Animated.Value(-260)).current; // degrees
  const dialOpacity = useRef(new Animated.Value(0)).current;
  const crossScale = useRef(new Animated.Value(0.3)).current;
  const crossOpacity = useRef(new Animated.Value(0)).current;
  const thunk = useRef(new Animated.Value(1)).current;
  const medX = useRef(new Animated.Value(-18)).current;
  const vaultX = useRef(new Animated.Value(18)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    const nd = { useNativeDriver: true };

    const door = Animated.timing(doorScale, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), ...nd });

    const dial = Animated.sequence([
      Animated.delay(260),
      Animated.parallel([
        Animated.timing(dialOpacity, { toValue: 1, duration: 200, ...nd }),
        Animated.sequence([
          Animated.timing(dialRot, { toValue: 40, duration: 620, easing: Easing.out(Easing.cubic), ...nd }),   // spin past
          Animated.timing(dialRot, { toValue: -10, duration: 220, easing: Easing.inOut(Easing.quad), ...nd }), // click back
          Animated.timing(dialRot, { toValue: 0, duration: 140, easing: Easing.out(Easing.quad), ...nd }),     // settle
        ]),
      ]),
    ]);

    const cross = Animated.sequence([
      Animated.delay(1120),
      Animated.parallel([
        Animated.spring(crossScale, { toValue: 1, friction: 5, tension: 90, ...nd }),
        Animated.timing(crossOpacity, { toValue: 1, duration: 220, ...nd }),
      ]),
    ]);

    const lock = Animated.sequence([
      Animated.delay(1260),
      Animated.timing(thunk, { toValue: 1.045, duration: 90, easing: Easing.out(Easing.quad), ...nd }),
      Animated.timing(thunk, { toValue: 1, duration: 180, easing: Easing.in(Easing.quad), ...nd }),
    ]);

    const name = Animated.sequence([
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(nameOpacity, { toValue: 1, duration: 420, ...nd }),
        Animated.timing(medX, { toValue: 0, duration: 480, easing: Easing.out(Easing.cubic), ...nd }),
        Animated.timing(vaultX, { toValue: 0, duration: 480, easing: Easing.out(Easing.cubic), ...nd }),
      ]),
    ]);

    const tagline = Animated.sequence([
      Animated.delay(1950),
      Animated.parallel([
        Animated.timing(tagOpacity, { toValue: 1, duration: 380, ...nd }),
        Animated.timing(tagY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), ...nd }),
      ]),
    ]);

    const all = Animated.parallel([door, dial, cross, lock, name, tagline]);
    all.start();

    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) navigation.replace('Login');
    }, 3000);
    restoreSession().then((role) => {
      finished = true;
      clearTimeout(timer);
      navigation.replace(role === 'admin' ? 'AdminApp' : role === 'pharmacist' ? 'MainApp' : 'Login');
    });
    return () => {
      finished = true;
      clearTimeout(timer);
      all.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const spin = dialRot.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] });

  return (
    <LinearGradient colors={[c.bg, '#08171C']} style={styles.container}>
      <View style={styles.center}>
        <Animated.View style={[styles.mark, { transform: [{ scale: Animated.multiply(doorScale, thunk) }] }]}>
          <Image source={require('../../assets/images/mark-shell.png')} style={styles.layer} resizeMode="contain" />
          <Animated.Image
            source={require('../../assets/images/mark-dial.png')}
            style={[styles.layer, { opacity: dialOpacity, transform: [{ rotate: spin }] }]}
            resizeMode="contain"
          />
          <Animated.Image
            source={require('../../assets/images/mark-cross.png')}
            style={[styles.layer, { opacity: crossOpacity, transform: [{ scale: crossScale }] }]}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.nameRow, { opacity: nameOpacity }]}>
          <Animated.Text style={[styles.med, { transform: [{ translateX: medX }] }]}>Med</Animated.Text>
          <Animated.Text style={[styles.vault, { transform: [{ translateX: vaultX }] }]}>Vault</Animated.Text>
        </Animated.View>

        <Animated.View style={{ opacity: tagOpacity, transform: [{ translateY: tagY }] }}>
          <Text style={styles.tagline}>Track stock. Prevent expiry. Forecast demand.</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  mark: { width: MARK, height: MARK },
  layer: { position: 'absolute', top: 0, left: 0, width: MARK, height: MARK },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 26 },
  med: { color: c.textPrimary, fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  vault: { color: c.greenLight, fontSize: 40, fontWeight: '300', letterSpacing: -1 },
  tagline: { color: c.textSecondary, fontSize: 13, marginTop: 14, letterSpacing: 0.3 },
});
