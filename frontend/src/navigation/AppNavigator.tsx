import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { colors } from '../theme/colors';

export const AppNavigator = () => {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user || isGuest ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};
