import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AdminScreen } from '../screens/admin/AdminScreen';

export type AdminStackParamList = {
  AdminPanel: undefined;
};

const Stack = createStackNavigator<AdminStackParamList>();

export const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminPanel" component={AdminScreen} />
  </Stack.Navigator>
);
