import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { obtenerHistorialApi } from '../../api/clienteApi';
import { HistorialResponse, PujaHistorialItem } from '../../types';
import { colors } from '../../theme/colors';

const GOLD = '#C9A84C';

export const HistorialScreen = () => {
  const [historial, setHistorial] = useState<HistorialResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    obtenerHistorialApi()
      .then(setHistorial)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const h = historial!;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Métricas principales ── */}
        <View style={styles.statsRow}>
          <StatCard
            icon="hammer-outline"
            label="Subastas\nasistidas"
            value={String(h.subastasAsistidas)}
          />
          <StatCard
            icon="trophy-outline"
            label="Subastas\nganadas"
            value={String(h.subastasGanadas)}
            highlight
          />
          <StatCard
            icon="trending-up-outline"
            label="Total\nofertado"
            value={formatImporte(h.importeTotalOfertado)}
          />
        </View>

        {/* ── Lista de pujas ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Pujas</Text>

          {h.pujas.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="clipboard-outline" size={40} color={colors.textDisabled} />
              <Text style={styles.emptyText}>Todavía no participaste en ninguna subasta</Text>
            </View>
          ) : (
            h.pujas.map((puja, i) => (
              <PujaRow key={puja.pujaId ?? i} puja={puja} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Tarjeta de stat ───────────────────────────────────────────────────────────
const StatCard = ({
  icon, label, value, highlight,
}: {
  icon: any; label: string; value: string; highlight?: boolean;
}) => (
  <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
    <Ionicons name={icon} size={24} color={highlight ? GOLD : colors.textSecondary} />
    <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── Fila de puja ──────────────────────────────────────────────────────────────
const PujaRow = ({ puja }: { puja: PujaHistorialItem }) => {
  const ganada = puja.ganador === 'si';
  return (
    <View style={styles.pujaRow}>
      <View style={[styles.pujaIconBox, ganada && styles.pujaIconBoxGanada]}>
        <Ionicons
          name={ganada ? 'trophy' : 'hammer-outline'}
          size={18}
          color={ganada ? GOLD : colors.textSecondary}
        />
      </View>
      <View style={styles.pujaInfo}>
        <Text style={styles.pujaSubasta}>Subasta #{puja.subastaId}</Text>
        <Text style={styles.pujaItem}>Ítem #{puja.itemId}</Text>
      </View>
      <View style={styles.pujaRight}>
        <Text style={[styles.pujaMonto, ganada && styles.pujaMontoCelebrado]}>
          {formatImporte(puja.monto)}
        </Text>
        {ganada && (
          <View style={styles.ganadaBadge}>
            <Text style={styles.ganadaText}>GANADA</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const formatImporte = (v: number): string => {
  if (!v && v !== 0) return '-';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${Number(v).toLocaleString('es-AR')}`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 14, color: colors.error, textAlign: 'center' },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statCardHighlight: { borderWidth: 1.5, borderColor: GOLD },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  statValueHighlight: { color: GOLD },
  statLabel: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', lineHeight: 14 },

  // Sección
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: colors.textPrimary,
    padding: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 12, paddingHorizontal: 24 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  // Puja row
  pujaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F9',
    gap: 12,
  },
  pujaIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#F4F5F9',
    justifyContent: 'center', alignItems: 'center',
  },
  pujaIconBoxGanada: { backgroundColor: GOLD + '20' },
  pujaInfo: { flex: 1, gap: 2 },
  pujaSubasta: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  pujaItem: { fontSize: 12, color: colors.textSecondary },
  pujaRight: { alignItems: 'flex-end', gap: 4 },
  pujaMonto: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  pujaMontoCelebrado: { color: GOLD },
  ganadaBadge: {
    backgroundColor: GOLD + '25',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  ganadaText: { fontSize: 9, fontWeight: '800', color: GOLD, letterSpacing: 0.5 },
});
