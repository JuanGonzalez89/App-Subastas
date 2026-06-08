import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

const CATEGORIA_LABELS: Record<string, string> = {
  comun: 'Común',
  especial: 'Especial',
  plata: 'Plata',
  oro: 'Oro',
  platino: 'Platino',
};

export const HomeScreen = () => {
  const { user } = useAuth();

  const categoriaBadge = user?.categoria
    ? colors.categoria[user.categoria as keyof typeof colors.categoria]
    : colors.textSecondary;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bienvenido/a,</Text>
        <Text style={styles.name}>{user?.nombre} {user?.apellido}</Text>
        {user?.categoria && (
          <View style={[styles.badge, { backgroundColor: categoriaBadge }]}>
            <Text style={styles.badgeText}>{CATEGORIA_LABELS[user.categoria] ?? user.categoria.toUpperCase()}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>
        <InfoCard icon="mail-outline" label="Email" value={user?.email ?? '—'} />
        <InfoCard icon="shield-checkmark-outline" label="Estado" value="Cuenta activa" valueColor={colors.success} />

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>¿Qué podés hacer?</Text>
          <TipRow icon="hammer-outline" text="Explorar subastas desde la tab Subastas" />
          <TipRow icon="card-outline" text="Gestionar medios de pago en tu Perfil" />
          <TipRow icon="person-outline" text="Ver tu información personal en la tab Perfil" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.infoCard}>
    <Ionicons name={icon} size={18} color={colors.textSecondary} />
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  </View>
);

const TipRow = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
  <View style={styles.tipRow}>
    <Ionicons name={icon} size={16} color={colors.primary} />
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '800', color: colors.white },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.white, letterSpacing: 1 },
  content: { flex: 1, padding: 20 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
  },
  infoLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase' },
  infoValue: { fontSize: 15, fontWeight: '500', color: colors.textPrimary, marginTop: 2 },
  tipsCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
});
