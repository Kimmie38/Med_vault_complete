import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, makeGradients, makeShadow } from './theme';

// The user's choice is saved on the device, so it survives restarts.
const STORAGE_KEY = 'medvault.themeMode';
// Theme used on first launch, before the user has picked one.
export const DEFAULT_MODE = 'dark';

const ThemeContext = createContext(null);

// Keeps native pieces (alerts, date-picker dialogs, keyboard) in step with the in-app choice.
function syncNativeAppearance(mode) {
  try {
    if (typeof Appearance.setColorScheme === 'function') Appearance.setColorScheme(mode);
  } catch (e) {
    // Not supported on this platform — the in-app theme still works.
  }
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(DEFAULT_MODE);
  const [ready, setReady] = useState(false);

  // Load the saved choice once at start-up.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let saved = DEFAULT_MODE;
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY);
        if (v === 'light' || v === 'dark') saved = v;
      } catch (e) {
        // Storage unavailable — fall back to the default theme.
      }
      if (cancelled) return;
      syncNativeAppearance(saved);
      setModeState(saved);
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const setMode = useCallback((next) => {
    if (next !== 'light' && next !== 'dark') return;
    setModeState(next);
    syncNativeAppearance(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(() => {
    const isDark = mode === 'dark';
    const colors = isDark ? darkColors : lightColors;
    return {
      mode,
      isDark,
      colors,
      gradients: makeGradients(colors),
      shadow: makeShadow(isDark),
      setMode,
      toggleDark: () => setMode(isDark ? 'light' : 'dark'),
    };
  }, [mode, setMode]);

  // Hold the first frame until the saved theme is known, so a light-mode user never sees a dark flash.
  if (!ready) return <View style={{ flex: 1, backgroundColor: darkColors.bg }} />;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

// Styles that depend on the active palette. `factory` must be a module-level function
// `(colors, theme) => StyleSheet.create({...})`; it is re-run only when the theme changes.
export function useThemedStyles(factory) {
  const theme = useTheme();
  const styles = useMemo(() => factory(theme.colors, theme), [factory, theme]);
  return { ...theme, styles };
}
