import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { obtenerPerfilApi, obtenerHistorialApi } from '../../api/clienteApi';
import { HistorialResponse, PerfilResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { PerfilStackParamList } from '../../navigation/PerfilStack';

type Props = { navigation: StackNavigationProp<PerfilStackParamList, 'Profile'> };

const GOLD  = '#C9A84C';
const BEIGE = '#F5EDD8';

const CATEGORIA_LABELS: Record<string, string> = {
  comun: 'Común', especial: 'Especial',
  plata: 'Plata', oro: 'Oro', platino: 'Platino',
};

// Meses abreviados para el gráfico de actividad
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const ProfileScreen = ({ navigation }: Props) => {
  const { logout, isAdmin } = useAuth();
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  const [historial, setHistorial] = useState<HistorialResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    Promise.all([
      obtenerPerfilApi(),
      obtenerHistorialApi(),
    ])
      .then(([p, h]) => {
        setPerfil(p);
        setHistorial(h);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (error || !perfil) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'No se pudo cargar el perfil'}</Text>
      </View>
    );
  }

  const catColor = colors.categoria[perfil.categoria as keyof typeof colors.categoria] ?? colors.primary;

  const formatearMonto = (monto: number): string => {
    if (monto >= 1_000_000) return `$${(monto / 1_000_000).toFixed(1)}M`;
    if (monto >= 1_000) return `$${(monto / 1_000).toFixed(1)}K`;
    return `$${new Intl.NumberFormat('es-AR').format(monto)}`;
  };

  const barData = historial?.pujas && historial.pujas.length > 0
    ? (() => {
        const total = historial.pujas.length;
        const counts = new Array(6).fill(0);
        historial.pujas.forEach((_, i) => counts[Math.floor(i / Math.max(total / 6, 1)) % 6]++);
        const max = Math.max(...counts, 1);
        return counts.map((c) => c / max);
      })()
    : [0, 0, 0, 0, 0, 0];
  const mesActual = new Date().getMonth();
  const ultimos6Meses = Array.from({ length: 6 }, (_, i) => MESES[(mesActual - 5 + i + 12) % 12]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Hero: ícono medalla + nombre ── */}
        <View style={styles.hero}>
          {/* Círculo beige con medalla dorada (wireframe pág. 10) */}
          <View style={styles.medalCircle}>
            <Ionicons name="ribbon" size={44} color={GOLD} />
          </View>
          <Text style={styles.nombreCompleto}>{perfil.nombre} {perfil.apellido}</Text>
          <View style={[styles.catBadge, { backgroundColor: catColor }]}>
            <Text style={styles.catText}>{CATEGORIA_LABELS[perfil.categoria] ?? perfil.categoria}</Text>
          </View>
          {perfil.admitido === 'si' && (
            <View style={styles.verificadoRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.verificadoText}>Cliente verificado</Text>
            </View>
          )}
        </View>

        {/* ── 3 tarjetas de estadísticas ── */}
        <View style={styles.statsRow}>
          <StatCard label="Subastas" value={String(historial?.subastasAsistidas ?? 0)} icon="hammer-outline" />
          <StatCard label="Ganadas"  value={String(historial?.subastasGanadas ?? 0)}  icon="trophy-outline" />
          <StatCard label="Ofertado" value={formatearMonto(historial?.importeTotalOfertado ?? 0)} icon="trending-up-outline" />
        </View>

        {/* ── Actividad de Pujas (gráfico de barras) ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actividad de Pujas</Text>
          <Text style={styles.cardSub}>Últimos 6 meses</Text>
          <View style={styles.barChart}>
            {barData.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${Math.round(val * 100)}%`, backgroundColor: GOLD }]} />
                </View>
                <Text style={styles.barLabel}>{ultimos6Meses[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Información personal ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información personal</Text>
          <InfoRow icon="mail-outline"     label="Email"     value={perfil.email} />
          {perfil.documento ? (
            <InfoRow icon="card-outline"   label="Documento" value={perfil.documento} />
          ) : null}
          {perfil.direccion ? (
            <InfoRow icon="location-outline" label="Domicilio" value={perfil.direccion} />
          ) : null}
        </View>

        {/* ── Accesos rápidos ── */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Historial')}
          activeOpacity={0.8}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#1565C0' }]}>
              <Ionicons name="time-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.menuLabel}>Mi historial de pujas</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('PaymentMethods')}
          activeOpacity={0.8}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.menuLabel}>Medios de pago</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('SubastarItem')}
          activeOpacity={0.8}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: GOLD }]}>
              <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.menuLabel}>Subastar mi artículo</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
        </TouchableOpacity>

        {isAdmin && (
          <View style={[styles.menuItem, { opacity: 0.8 }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#7C3AED' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.menuLabel}>Panel de Administración (en pestaña Admin)</Text>
            </View>
          </View>
        )}

        {/* ── Cerrar sesión ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Componente tarjeta de stat ────────────────────────────────────────────────
const StatCard = ({ label, value, icon }: { label: string; value: string; icon: any }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={22} color={GOLD} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── Fila de info ─────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color={colors.textSecondary} style={{ width: 22 }} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 14, color: colors.error, textAlign: 'center' },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },

  // Hero
  hero: { alignItems: 'center', gap: 10, paddingVertical: 12 },
  medalCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: BEIGE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GOLD + '60',
  },
  nombreCompleto: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  catBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  catText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  verificadoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  verificadoText: { fontSize: 12, color: colors.success, fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },

  // Bar chart
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  cardSub: { fontSize: 12, color: colors.textSecondary },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    marginTop: 8,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: {
    width: 22,
    height: 80,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, color: colors.textSecondary },

  // Info
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 2 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '500', marginTop: 2 },

  // Menu
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.error },
});
