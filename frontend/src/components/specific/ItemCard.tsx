import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ItemResponse } from '../../types';
import { colors } from '../../theme/colors';
import { getFotoUrl } from '../../api/subastasApi';

interface ItemCardProps {
  item: ItemResponse;
  moneda?: string;
  onPress: () => void;
}

export const ItemCard = ({ item, moneda = 'ARS', onPress }: ItemCardProps) => {
  const vendido = item.subastado === 'si';
  const primeraFoto = item.fotoIds.length > 0 ? getFotoUrl(item.fotoIds[0]) : null;

  const formatPrecio = (precio?: number) => {
    if (precio == null) return null;
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: moneda }).format(precio);
  };

  return (
    <TouchableOpacity style={[styles.card, vendido && styles.cardVendido]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        {primeraFoto ? (
          <Image source={{ uri: primeraFoto }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={30} color={colors.textDisabled} />
          </View>
        )}
        {item.fotoIds.length > 1 && (
          <View style={styles.fotoCount}>
            <Ionicons name="images-outline" size={10} color={colors.white} />
            <Text style={styles.fotoCountText}>{item.fotoIds.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.pieza}>Pieza #{item.numeroPieza}</Text>
        <Text style={styles.descripcion} numberOfLines={2}>
          {item.descripcion ?? 'Sin descripción'}
        </Text>

        <View style={styles.footer}>
          {item.precioBase != null ? (
            <Text style={styles.precio}>{formatPrecio(item.precioBase)}</Text>
          ) : (
            <View style={styles.precioOculto}>
              <Ionicons name="lock-closed-outline" size={11} color={colors.textDisabled} />
              <Text style={styles.precioOcultoText}>Precio reservado</Text>
            </View>
          )}
          {vendido && (
            <View style={styles.vendidoBadge}>
              <Text style={styles.vendidoText}>VENDIDO</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} style={styles.arrow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    overflow: 'hidden',
  },
  cardVendido: { opacity: 0.65 },
  imageContainer: { width: 80, height: 80 },
  image: { width: 80, height: 80 },
  noImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoCount: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  fotoCountText: { fontSize: 9, color: colors.white, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 3 },
  pieza: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' },
  descripcion: { fontSize: 13, color: colors.textPrimary, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  precio: { fontSize: 14, fontWeight: '700', color: colors.primary },
  precioOculto: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  precioOcultoText: { fontSize: 11, color: colors.textDisabled },
  vendidoBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vendidoText: { fontSize: 9, fontWeight: '700', color: colors.white },
  arrow: { paddingRight: 10 },
});
