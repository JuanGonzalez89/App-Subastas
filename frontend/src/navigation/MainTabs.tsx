import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SubastasStack } from './SubastasStack';
import { PerfilStack } from './PerfilStack';
import { GuestPerfilScreen } from '../screens/guest/GuestPerfilScreen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Inicio: 'home',
  Subastas: 'hammer',
  Perfil: 'person-circle-outline',
};

export const MainTabs = () => {
  const { isGuest } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 8,
          height: 60,
          paddingBottom: 8,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name] ?? 'ellipse'} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Subastas" component={SubastasStack} />
      <Tab.Screen
        name="Perfil"
        component={isGuest ? GuestPerfilScreen : PerfilStack}
      />
    </Tab.Navigator>
  );
};
