import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserHomeScreen from '../screens/user/UserHomeScreen';
import ScanDrugScreen from '../screens/user/ScanDrugScreen';
import DrugInfoScreen from '../screens/user/DrugInfoScreen';

const Stack = createNativeStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserHome" component={UserHomeScreen} />
      <Stack.Screen name="ScanDrug" component={ScanDrugScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="DrugInfo" component={DrugInfoScreen} />
    </Stack.Navigator>
  );
}
