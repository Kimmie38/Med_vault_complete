import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AdminOverviewScreen from '../screens/admin/AdminOverviewScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminUserDetailScreen from '../screens/admin/AdminUserDetailScreen';
import AdminMonitorScreen from '../screens/admin/AdminMonitorScreen';
import AdminActivityScreen from '../screens/admin/AdminActivityScreen';
import AdminAccountScreen from '../screens/admin/AdminAccountScreen';
import ChangePasswordScreen from '../screens/pharmacist/ChangePasswordScreen';
import { useThemedStyles } from '../theme/ThemeContext';
import { useAdmin } from '../context/AdminContext';

const Tab = createBottomTabNavigator();
const UsersStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

// Users tab = the list plus a user's detail page pushed on top of it.
function UsersStackNavigator() {
  return (
    <UsersStack.Navigator screenOptions={{ headerShown: false }}>
      <UsersStack.Screen name="UsersList" component={AdminUsersScreen} />
      <UsersStack.Screen name="UserDetail" component={AdminUserDetailScreen} />
    </UsersStack.Navigator>
  );
}

// Account tab = the admin's profile plus screens reached from it (just change password, for now).
function AccountStackNavigator() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="AccountMain" component={AdminAccountScreen} />
      <AccountStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </AccountStack.Navigator>
  );
}

function MonitorBadge({ children }) {
  const { styles } = useThemedStyles(createStyles);
  const { alerts } = useAdmin();
  const count = alerts.filter((a) => a.tier === 'expired' || a.tier === 'critical').length;
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
  Overview: ['grid', 'grid-outline'],
  Users: ['people', 'people-outline'],
  Monitor: ['pulse', 'pulse-outline'],
  Activity: ['time', 'time-outline'],
  Account: ['shield-checkmark', 'shield-checkmark-outline'],
};

// The administrator's app: Overview, Users, Monitor, Activity, Account.
export default function AdminTabs() {
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
          return route.name === 'Monitor' ? <MonitorBadge>{icon}</MonitorBadge> : icon;
        },
      })}
    >
      <Tab.Screen name="Overview" component={AdminOverviewScreen} />
      <Tab.Screen name="Users" component={UsersStackNavigator} />
      <Tab.Screen name="Monitor" component={AdminMonitorScreen} />
      <Tab.Screen name="Activity" component={AdminActivityScreen} />
      <Tab.Screen name="Account" component={AccountStackNavigator} />
    </Tab.Navigator>
  );
}

const createStyles = (colors) => StyleSheet.create({
  tabBar: { backgroundColor: colors.bgElevated, borderTopColor: colors.border, height: 84, paddingTop: 8 },
  badge: { position: 'absolute', top: -4, right: -9, backgroundColor: colors.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
