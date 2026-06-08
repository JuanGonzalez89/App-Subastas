import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen }        from '../screens/auth/LoginScreen';
import { RegisterStep1Screen } from '../screens/auth/RegisterStep1Screen';
import { RegisterDNIScreen }  from '../screens/auth/RegisterDNIScreen';
import { RegisterStep3Screen } from '../screens/auth/RegisterStep3Screen';

export type AuthStackParamList = {
  Login:          undefined;
  RegisterStep1:  undefined;
  RegisterDNI:    {
    nombre: string; apellido: string; email: string;
    numeroDocumento: string; domicilio: string; numeroPais: number;
  };
  RegisterStep3:  { email?: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login"          component={LoginScreen} />
    <Stack.Screen name="RegisterStep1"  component={RegisterStep1Screen} />
    <Stack.Screen name="RegisterDNI"    component={RegisterDNIScreen} />
    <Stack.Screen name="RegisterStep3"  component={RegisterStep3Screen} />
  </Stack.Navigator>
);
