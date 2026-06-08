import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuctionListScreen } from '../screens/subastas/AuctionListScreen';
import { AuctionDetailScreen } from '../screens/subastas/AuctionDetailScreen';
import { ItemDetailScreen } from '../screens/subastas/ItemDetailScreen';
import { LiveAuctionScreen } from '../screens/subastas/LiveAuctionScreen';
import { colors } from '../theme/colors';

export type SubastasStackParamList = {
  AuctionList: undefined;
  AuctionDetail: { subastaId: number };
  ItemDetail: { itemId: number; subastaId: number };
  LiveAuction: {
    subastaId: number;
    itemId: number;
    asistenteId: number;
    numeroPostor: number;
    descripcion: string;
    pieza: number;
    fotoIds: number[];
    precioBase: number;
    moneda: string;
  };
};

const Stack = createStackNavigator<SubastasStackParamList>();

export const SubastasStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="AuctionList"   component={AuctionListScreen}   options={{ title: 'Subastas' }} />
    <Stack.Screen name="AuctionDetail" component={AuctionDetailScreen} options={{ title: 'Detalle de Subasta' }} />
    <Stack.Screen name="ItemDetail"    component={ItemDetailScreen}    options={{ title: 'Detalle del Ítem' }} />
    <Stack.Screen
      name="LiveAuction"
      component={LiveAuctionScreen}
      options={{ headerShown: false }}   // header propio dark
    />
  </Stack.Navigator>
);
