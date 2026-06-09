import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { listarSubastasApi } from '../../api/subastasApi';
import { SubastaResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { SubastasStackParamList } from '../../navigation/SubastasStack';

type Props = { navigation: StackNavigationProp<SubastasStackParamList, 'AuctionList'> };

const FILTROS = [
  { label: 'Todas',    value: undefined },
  { label: 'Común',    value: 'comun' },
  { label: 'Especial', value: 'especial' },
  { label: 'Plata',    value: 'plata' },
  { label: 'Oro',      value: 'oro' },
  { label: 'Platino',  value: 'platino' },
];

const CAT_COLOR: Record<string, string> = {
  comun: '#6B7280', especial: '#2563EB',
  plata: '#9CA3AF', oro: '#C9A84C', platino: '#7C3AED',
};

export const AuctionListScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const [subastas, setSubastas]     = useState<SubastaResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState('');
  const [filtro, setFiltro]         = useState<string | undefined>(undefined);
  const [filtroIdx, setFiltroIdx]   = useState(0);

  const cargar = useCallback(async (cat?: string) => {
    setError('');
    try {
      const data = await listarSubastasApi(cat);
      setSubastas(data);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    cargar(filtro).finally(() => setLoading(false));
  }, [filtro]);

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar(filtro);
    setRefreshing(false);
  };

  const enVivo       = subastas.filter((s) => s.estado === 'abierta');
  const proximamente = subastas.filter((s) => s.estado !== 'abierta');

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.secondary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subastas</Text>
        <View style={styles.headerRight}>
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          <View style={styles.userChip}>
            <Ionicons name="person-outline" size={13} color="#FFFFFF" />
            <Text style={styles.userChipText}>
              {user?.categoria
                ? user.categoria.charAt(0).toUpperCase() + user.categoria.slice(1)
                : 'Invitado'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Filtros ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosScroll}
        contentContainerStyle={styles.filtrosContent}
      >
        {FILTROS.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.chip, filtroIdx === i && styles.chipActive]}
            onPress={() => { setFiltroIdx(i); setFiltro(f.value); }}
          >
            <Text style={[styles.chipText, filtroIdx === i && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Contenido ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => cargar(filtro)}>
              <Text style={styles.retry}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Subastas en Vivo */}
            {enVivo.length > 0 && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Subastas en Vivo</Text>
                  <Text style={styles.sectionSub}>Participá ahora en las subastas activas</Text>
                </View>
                {enVivo.map((s) => (
                  <AuctionCard
                    key={s.id}
                    subasta={s}
                    badge="En curso"
                    badgeColor="#27AE60"
                    onPress={() => navigation.navigate('AuctionDetail', { subastaId: s.id })}
                  />
                ))}
              </View>
            )}

            {/* Próximamente */}
            {proximamente.length > 0 && (
              <View style={{ marginTop: enVivo.length > 0 ? 8 : 0 }}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Próximamente</Text>
                </View>
                {proximamente.map((s) => (
                  <AuctionCard
                    key={s.id}
                    subasta={s}
                    badge="Próximamente"
                    badgeColor={colors.secondary}
                    onPress={() => navigation.navigate('AuctionDetail', { subastaId: s.id })}
                  />
                ))}
              </View>
            )}

            {subastas.length === 0 && !error && (
              <View style={styles.empty}>
                <Ionicons name="hammer-outline" size={48} color={colors.textDisabled} />
                <Text style={styles.emptyText}>No hay subastas disponibles</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Tarjeta grande estilo wireframe ────────────────────────────────────────
const AuctionCard = ({
  subasta,
  badge,
  badgeColor,
  onPress,
}: {
  subasta: SubastaResponse;
  badge: string;
  badgeColor: string;
  onPress: () => void;
}) => {
  const catColor = CAT_COLOR[subasta.categoria] ?? colors.textSecondary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Zona de imagen */}
      <View style={[styles.cardImage, { backgroundColor: catColor + '28' }]}>
        <Ionicons name="hammer-outline" size={56} color={catColor + '80'} />
        {/* Badge */}
        <View style={[styles.cardBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.cardBadgeText}>{badge}</Text>
        </View>
      </View>

      {/* Cuerpo */}
      <View style={styles.cardBody}>
        <Text style={styles.cardCat}>{subasta.categoria?.toUpperCase()}</Text>
        <Text style={styles.cardNombre} numberOfLines={2}>
          {subasta.ubicacion ?? 'Subasta de ' + subasta.categoria}
        </Text>

        {subasta.fecha ? (
          <View style={styles.cardRow}>
            <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.cardInfo}>
              {subasta.fecha}
              {subasta.hora ? `  ·  ${subasta.hora.substring(0, 5)} hs` : ''}
            </Text>
          </View>
        ) : null}

        {subasta.subastador ? (
          <View style={styles.cardRow}>
            <Ionicons name="person-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.cardInfo}>{subasta.subastador}</Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={[styles.monedaChip, { backgroundColor: catColor }]}>
            <Text style={styles.monedaText}>{subasta.moneda}</Text>
          </View>
          {!subasta.puedeAcceder && (
            <View style={styles.lockChip}>
              <Ionicons name="lock-closed-outline" size={11} color={colors.warning} />
              <Text style={styles.lockText}>Categoría insuficiente</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, minHeight: 200 },
  errorText: { fontSize: 14, color: colors.error, textAlign: 'center', marginBottom: 12 },
  retry: { color: colors.primary, fontSize: 14, textDecorationLine: 'underline' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  userChipText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  // Filtros
  filtrosScroll: { maxHeight: 52, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: colors.border },
  filtrosContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F0F0F0' },
  chipActive: { backgroundColor: colors.textPrimary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: '#FFFFFF' },

  // Secciones
  sectionHeader: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  sectionSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

  // Card grande
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardImage: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cardBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  cardBody: { padding: 14, gap: 5 },
  cardCat: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  cardNombre: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardInfo: { fontSize: 13, color: colors.textSecondary },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  monedaChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  monedaText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  lockChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lockText: { fontSize: 11, color: colors.warning },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
