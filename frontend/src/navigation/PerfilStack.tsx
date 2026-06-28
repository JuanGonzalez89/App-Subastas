import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileScreen }         from '../screens/perfil/ProfileScreen';
import { PaymentMethodsScreen }  from '../screens/perfil/PaymentMethodsScreen';
import { HistorialScreen }       from '../screens/perfil/HistorialScreen';
import { SubastarItemScreen }    from '../screens/perfil/SubastarItemScreen';
import { MisComprasScreen }      from '../screens/perfil/MisComprasScreen';
import { colors } from '../theme/colors';

export type PerfilStackParamList = {
  Profile:        undefined;
  PaymentMethods: undefined;
  Historial:      undefined;
  SubastarItem:   undefined;
  MisCompras:     undefined;
};

const Stack = createStackNavigator<PerfilStackParamList>();

export const PerfilStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="Profile"        component={ProfileScreen}        options={{ title: 'Mi Perfil' }} />
    <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Medios de Pago' }} />
    <Stack.Screen name="Historial"      component={HistorialScreen}      options={{ title: 'Mi Historial' }} />
    <Stack.Screen name="SubastarItem"   component={SubastarItemScreen}   options={{ title: 'Subastar Artículo' }} />
    <Stack.Screen name="MisCompras"     component={MisComprasScreen}     options={{ title: 'Mis Compras' }} />
  </Stack.Navigator>
);
