import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SubastaResponse } from '../../types';
import { colors } from '../../theme/colors';

interface AuctionCardProps {
  subasta: SubastaResponse;
  onPress: () => void;
}

export const AuctionCard = ({ subasta, onPress }: AuctionCardProps) => {
  const abierta = subasta.estado === 'abierta';
  const catColor = colors.categoria[subasta.categoria as keyof typeof colors.categoria] ?? colors.textSecondary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={[styles.catBadge, { backgroundColor: catColor }]}>
          <Text style={styles.catText}>{subasta.categoria?.toUpperCase()}</Text>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: abierta ? colors.success : colors.textDisabled }]}>
          <Text style={styles.estadoText}>{abierta ? 'ABIERTA' : 'CERRADA'}</Text>
        </View>
      </View>

      <View style={styles.body}>
        {subasta.ubicacion ? (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.location} numberOfLines={1}>{subasta.ubicacion}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.info}>
            {subasta.fecha ?? 'Fecha a confirmar'}
            {subasta.hora ? `  ·  ${subasta.hora.substring(0, 5)} hs` : ''}
          </Text>
        </View>

        {subasta.subastador ? (
          <View style={styles.row}>
            <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.info}>{subasta.subastador}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.monedaBadge}>
          <Text style={styles.monedaText}>{subasta.moneda}</Text>
        </View>
        {!subasta.puedeAcceder && (
          <View style={styles.lockRow}>
            <Ionicons name="lock-closed-outline" size={13} color={colors.warning} />
            <Text style={styles.lockText}>Categoría insuficiente</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  catText: { fontSize: 10, fontWeight: '700', color: colors.white, letterSpacing: 0.8 },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  estadoText: { fontSize: 10, fontWeight: '700', color: colors.white },
  body: { paddingHorizontal: 14, paddingBottom: 10, gap: 5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  location: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  info: { fontSize: 13, color: colors.textSecondary },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  monedaBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  monedaText: { fontSize: 11, fontWeight: '700', color: colors.white },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  lockText: { fontSize: 12, color: colors.warning },
});
