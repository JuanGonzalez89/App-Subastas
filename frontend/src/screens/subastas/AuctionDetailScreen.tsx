import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ItemCard } from '../../components/specific/ItemCard';
import { listarItemsApi, obtenerSubastaApi } from '../../api/subastasApi';
import { ItemResponse, SubastaResponse } from '../../types';
import { colors } from '../../theme/colors';
import { SubastasStackParamList } from '../../navigation/SubastasStack';

type Props = {
  navigation: StackNavigationProp<SubastasStackParamList, 'AuctionDetail'>;
  route: RouteProp<SubastasStackParamList, 'AuctionDetail'>;
};

export const AuctionDetailScreen = ({ navigation, route }: Props) => {
  const { subastaId } = route.params;
  const [subasta, setSubasta] = useState<SubastaResponse | null>(null);
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const cargar = async () => {
    setError('');
    try {
      const [sub, its] = await Promise.all([
        obtenerSubastaApi(subastaId),
        listarItemsApi(subastaId),
      ]);
      setSubasta(sub);
      setItems(its);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => { cargar().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => { setRefreshing(true); await cargar(); setRefreshing(false); };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (error || !subasta) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Subasta no encontrada'}</Text>
      </View>
    );
  }

  const catColor = colors.categoria[subasta.categoria as keyof typeof colors.categoria] ?? colors.textSecondary;
  const abierta = subasta.estado === 'abierta';

  const Header = () => (
    <View>
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={[styles.catBadge, { backgroundColor: catColor }]}>
            <Text style={styles.catText}>{subasta.categoria?.toUpperCase()}</Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: abierta ? colors.success : colors.textDisabled }]}>
            <Text style={styles.estadoText}>{abierta ? '● ABIERTA' : '● CERRADA'}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <InfoRow icon="calendar-outline" label="Fecha" value={subasta.fecha ?? '—'} />
          <InfoRow icon="time-outline" label="Hora" value={subasta.hora ? subasta.hora.substring(0, 5) + ' hs' : '—'} />
          <InfoRow icon="location-outline" label="Lugar" value={subasta.ubicacion ?? '—'} />
          <InfoRow icon="person-outline" label="Rematador" value={subasta.subastador ?? '—'} />
          <InfoRow icon="cash-outline" label="Moneda" value={subasta.moneda} />
        </View>

        {!subasta.puedeAcceder && (
          <View style={styles.alertaBanner}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.warning} />
            <Text style={styles.alertaText}>
              Tu categoría no alcanza para pujar en esta subasta
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>
        Catálogo ({items.length} {items.length === 1 ? 'ítem' : 'ítems'})
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            moneda={subasta.moneda}
            onPress={() => navigation.navigate('ItemDetail', { itemId: item.id, subastaId })}
          />
        )}
        ListHeaderComponent={Header}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyItems}>
            <Ionicons name="cube-outline" size={40} color={colors.textDisabled} />
            <Text style={styles.emptyText}>Esta subasta aún no tiene catálogo</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={15} color={colors.textSecondary} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 14, color: colors.error, textAlign: 'center' },
  headerCard: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 14,
    padding: 16,
    elevation: 3,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  catBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  catText: { fontSize: 11, fontWeight: '700', color: colors.white, letterSpacing: 0.8 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoText: { fontSize: 11, fontWeight: '700', color: colors.white },
  infoGrid: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 13, color: colors.textSecondary, width: 72 },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  alertaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  alertaText: { fontSize: 13, color: colors.warning, flex: 1 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  emptyItems: { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
});
