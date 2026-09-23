// MedVault design tokens — derived from the brand mark (teal-to-green vault door with a medical cross).
//
// There are two palettes (dark + light) with the SAME token names, so a screen never needs to know
// which theme is active. Read the live palette with the `useTheme()` / `useThemedStyles()` hooks in
// ./ThemeContext — do not import a palette directly in screens.
//
// Note: `greenLight` is the *accent* colour used for text/icons on the app background. In dark mode it is
// a bright mint; in light mode it is a deeper green so it stays readable on white.

export const darkColors = {
  bg: '#060A0C',            // near-black app background (matches the logo plate)
  bgElevated: '#0D1417',    // cards / sheets
  bgElevated2: '#121B1F',   // nested surfaces, inputs
  border: '#1E2A2E',

  tealDeep: '#0A4A5C',
  teal: '#0F6B82',
  green: '#1FAE74',         // solid fills (buttons, active segments)
  greenLight: '#33C98A',    // accent for text / icons / highlights

  textPrimary: '#F2F7F6',
  textSecondary: '#9FB0B3',
  textMuted: '#5F7377',

  danger: '#E4483F',
  dangerGlow: 'rgba(228,72,63,0.35)',
  warning: '#E8A33D',
  success: '#2ECC81',
  info: '#3DA9E8',

  // tinted surfaces
  greenTint: 'rgba(31,174,116,0.12)',
  greenTintStrong: 'rgba(31,174,116,0.16)',
  successTint: 'rgba(46,204,129,0.14)',
  warningTint: 'rgba(232,163,61,0.14)',
  dangerTint: 'rgba(228,72,63,0.16)',
  dangerFlash: 'rgba(228,72,63,0.12)',
  infoTint: 'rgba(61,169,232,0.14)',

  onGreen: '#06110D',       // text/icons placed on a solid `green` fill
  neutralButton: '#3A3A3A', // secondary action button (e.g. Discard)
};

export const lightColors = {
  bg: '#F3F7F6',
  bgElevated: '#FFFFFF',
  bgElevated2: '#E8F0EE',
  border: '#D3E0DD',

  tealDeep: '#0A4A5C',
  teal: '#0F6B82',
  green: '#0F8A5C',
  greenLight: '#0B7F53',

  textPrimary: '#0E1A1D',
  textSecondary: '#465C60',
  textMuted: '#5B7074',

  danger: '#D0342B',
  dangerGlow: 'rgba(208,52,43,0.25)',
  warning: '#A9640A',
  success: '#16875A',
  info: '#1B76B8',

  greenTint: 'rgba(15,138,92,0.10)',
  greenTintStrong: 'rgba(15,138,92,0.14)',
  successTint: 'rgba(22,135,90,0.12)',
  warningTint: 'rgba(169,100,10,0.12)',
  dangerTint: 'rgba(208,52,43,0.10)',
  dangerFlash: 'rgba(208,52,43,0.10)',
  infoTint: 'rgba(27,118,184,0.12)',

  onGreen: '#FFFFFF',
  neutralButton: '#5B6F73',
};

// Gradients depend on the palette (the green end differs between themes).
export const makeGradients = (c) => ({
  brand: [c.tealDeep, c.green],
  brandVertical: [c.tealDeep, c.greenLight],
  danger: ['#7A1A16', '#E4483F'],
});

// Cards get a soft shadow in light mode (in dark mode the border alone separates surfaces).
export const makeShadow = (isDark) =>
  isDark
    ? {}
    : { shadowColor: '#0A2A30', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 1 };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const type = {
  display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700' },
  h3: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyMedium: { fontSize: 15, fontWeight: '600' },
  small: { fontSize: 13, fontWeight: '400' },
  tiny: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
};

// Legacy alias: the dark palette. Only kept so the parked (unused) screens in src/_parked still import.
// Active screens must use useTheme()/useThemedStyles() instead.
export const colors = darkColors;

export default { darkColors, lightColors, spacing, radius, type };
