import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/pharmacist/LoginScreen';
import RegisterScreen from './src/screens/pharmacist/RegisterScreen';
import MainTabs from './src/navigation/MainTabs';
import AdminTabs from './src/navigation/AdminTabs';
import { InventoryProvider } from './src/context/InventoryContext';
import { AdminProvider } from './src/context/AdminContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { navigationRef } from './src/navigation/navigationRef';

const Stack = createNativeStackNavigator();

// Flow (documentation §4.1): Splash -> Login (entry point) -> Dashboard and the rest of the app.
// The single administrator signs in on the same Login screen and lands in AdminApp instead of MainApp.
function Root() {
  const { colors, isDark } = useTheme();

  // React Navigation's own theme follows the app theme (screen backgrounds, headers, transitions).
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    dark: isDark,
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.bg,
      card: colors.bg,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.green,
    },
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme} ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MainApp" component={MainTabs} options={{ gestureEnabled: false }} />
          <Stack.Screen name="AdminApp" component={AdminTabs} options={{ gestureEnabled: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

// Suppress noisy React key warning that appears during development
LogBox.ignoreLogs(["Each child in a list should have a unique \"key\" prop"]);

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AdminProvider>
          <InventoryProvider>
            <Root />
          </InventoryProvider>
        </AdminProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
