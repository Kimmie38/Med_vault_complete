import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/pharmacist/DashboardScreen';
import InventoryScreen from '../screens/pharmacist/InventoryScreen';
import EditBatchScreen from '../screens/pharmacist/EditBatchScreen';
import EditDrugScreen from '../screens/pharmacist/EditDrugScreen';
import SalesScreen from '../screens/pharmacist/SalesScreen';
import SalesHistoryScreen from '../screens/pharmacist/SalesHistoryScreen';
import DataInputScreen from '../screens/pharmacist/DataInputScreen';
import ScanBatchCodeScreen from '../screens/pharmacist/ScanBatchCodeScreen';
import AlertsScreen from '../screens/pharmacist/AlertsScreen';
import ForecastScreen from '../screens/pharmacist/ForecastScreen';
import ProfileScreen from '../screens/pharmacist/ProfileScreen';
import AlertSettingsScreen from '../screens/pharmacist/AlertSettingsScreen';
import ChangePasswordScreen from '../screens/pharmacist/ChangePasswordScreen';
import { useThemedStyles } from '../theme/ThemeContext';
import { useInventory } from '../context/InventoryContext';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ScanStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

// Tabs follow the interface figures in Chapter 4: Home, Alerts, Scan, Forecast, Account.

// Home hosts the dashboard and the screens reached from it (inventory, record sale, edits).
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={DashboardScreen} />
      <HomeStack.Screen name="Inventory" component={InventoryScreen} />
      <HomeStack.Screen name="EditBatch" component={EditBatchScreen} />
      <HomeStack.Screen name="EditDrug" component={EditDrugScreen} />
      <HomeStack.Screen name="Sales" component={SalesScreen} />
      <HomeStack.Screen name="SalesHistory" component={SalesHistoryScreen} />
    </HomeStack.Navigator>
  );
}

// Scan tab = stock entry screen; the camera scanner opens on top of it.
function ScanStackNavigator() {
  return (
    <ScanStack.Navigator screenOptions={{ headerShown: false }}>
      <ScanStack.Screen name="AddBatch" component={DataInputScreen} />
      <ScanStack.Screen name="ScanBatchCode" component={ScanBatchCodeScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
    </ScanStack.Navigator>
  );
}

function AccountStackNavigator() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="AccountMain" component={ProfileScreen} />
      <AccountStack.Screen name="AlertSettings" component={AlertSettingsScreen} />
      <AccountStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </AccountStack.Navigator>
  );
}

function AlertBadge({ children }) {
  const { styles } = useThemedStyles(createStyles);
  const { alerts } = useInventory();
  const count = alerts.length;
  if (!count) return children;
  return (
    <View>
      {children}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
      </View>
    </View>
  );
}

const ICONS = {
  Home: ['home', 'home-outline'],
  Alerts: ['notifications', 'notifications-outline'],
  Scan: ['scan-circle', 'scan-circle-outline'],
  Forecast: ['trending-up', 'trending-up-outline'],
  Account: ['person', 'person-outline'],
};

export default function MainTabs() {
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.greenLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600', marginBottom: 4 },
        tabBarIcon: ({ color, focused }) => {
          const [filled, outline] = ICONS[route.name];
          const icon = <Ionicons name={focused ? filled : outline} size={22} color={color} />;
          return route.name === 'Alerts' ? <AlertBadge>{icon}</AlertBadge> : icon;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Scan" component={ScanStackNavigator} />
      <Tab.Screen name="Forecast" component={ForecastScreen} />
      <Tab.Screen name="Account" component={AccountStackNavigator} />
    </Tab.Navigator>
  );
}

const createStyles = (colors) => StyleSheet.create({
  tabBar: { backgroundColor: colors.bgElevated, borderTopColor: colors.border, height: 84, paddingTop: 8 },
  badge: { position: 'absolute', top: -4, right: -9, backgroundColor: colors.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
