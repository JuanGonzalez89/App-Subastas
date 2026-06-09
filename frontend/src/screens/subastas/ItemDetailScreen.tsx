import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { obtenerItemApi, getFotoUrl } from '../../api/subastasApi';
import { conectarSubastaApi } from '../../api/pujaApi';
import { ItemResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { SubastasStackParamList } from '../../navigation/SubastasStack';

type Props = {
  route: RouteProp<SubastasStackParamList, 'ItemDetail'>;
  navigation: StackNavigationProp<SubastasStackParamList, 'ItemDetail'>;
};

const { width } = Dimensions.get('window');

type TabId = 'historia' | 'disenador' | 'precio';
const TABS: { id: TabId; label: string }[] = [
  { id: 'historia',  label: 'Historia' },
  { id: 'disenador', label: 'Diseñador' },
  { id: 'precio',    label: 'Precio Base' },
];

export const ItemDetailScreen = ({ route, navigation }: Props) => {
  const { itemId, subastaId, moneda: monedaParam } = route.params;
  const { user } = useAuth();

  const [item, setItem]             = useState<ItemResponse | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [fotoActual, setFotoActual] = useState(0);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [tabActivo, setTabActivo]   = useState<TabId>('historia');
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    obtenerItemApi(itemId)
      .then(setItem)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [itemId]);

  const handleInscribirse = async () => {
    if (!user) {
      Alert.alert('Iniciá sesión', 'Necesitás una cuenta para participar en subastas.');
      return;
    }
    if (!item) return;

    setInscribiendo(true);
    try {
      const res = await conectarSubastaApi(subastaId);
      navigation.navigate('LiveAuction', {
        subastaId,
        itemId:       item.id,
        asistenteId:  res.asistenteId,
        numeroPostor: res.numeroPostor,
        descripcion:  item.descripcion ?? 'Sin descripción',
        pieza:        item.numeroPieza,
        fotoIds:      item.fotoIds,
        precioBase:   item.precioBase ?? 0,
        moneda:       monedaParam ?? 'ARS',
      });
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo conectar a la subasta');
    } finally {
      setInscribiendo(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (error || !item) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Ítem no encontrado'}</Text>
      </View>
    );
  }

  const vendido = item.subastado === 'si';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Carrusel de fotos ── */}
        {item.fotoIds.length > 0 ? (
          <View>
            <FlatList
              ref={flatRef}
              data={item.fotoIds}
              keyExtractor={(id) => String(id)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                setFotoActual(Math.round(e.nativeEvent.contentOffset.x / width));
              }}
              renderItem={({ item: fotoId }) => (
                <Image
                  source={{ uri: getFotoUrl(fotoId) }}
                  style={styles.foto}
                  resizeMode="cover"
                />
              )}
            />
            {/* Dots */}
            {item.fotoIds.length > 1 && (
              <View style={styles.paginacion}>
                {item.fotoIds.map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => flatRef.current?.scrollToIndex({ index: i })}>
                    <View style={[styles.dot, i === fotoActual && styles.dotActivo]} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noFoto}>
            <Ionicons name="image-outline" size={50} color={colors.textDisabled} />
            <Text style={styles.noFotoText}>Sin imágenes</Text>
          </View>
        )}

        {/* ── Header del ítem ── */}
        <View style={styles.itemHeader}>
          <View style={styles.itemHeaderRow}>
            <Text style={styles.pieza}>Pieza #{item.numeroPieza}</Text>
            {vendido && (
              <View style={styles.vendidoBadge}>
                <Text style={styles.vendidoText}>VENDIDO</Text>
              </View>
            )}
          </View>
          <Text style={styles.descripcionCorta} numberOfLines={2}>
            {item.descripcion ?? 'Sin descripción'}
          </Text>
        </View>

        {/* ── Tabs: Historia / Diseñador / Precio Base ── */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, tabActivo === tab.id && styles.tabActive]}
              onPress={() => setTabActivo(tab.id)}
            >
              <Text style={[styles.tabText, tabActivo === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Contenido de tab ── */}
        <View style={styles.tabContent}>
          {tabActivo === 'historia' && (
            <View style={styles.tabPanel}>
              {item.descripcionCompleta ? (
                <Text style={styles.panelText}>{item.descripcionCompleta}</Text>
              ) : (
                <Text style={styles.panelEmpty}>
                  No hay información histórica disponible para esta pieza.
                </Text>
              )}
            </View>
          )}

          {tabActivo === 'disenador' && (
            <View style={styles.tabPanel}>
              <View style={styles.diseñadorCard}>
                <View style={styles.diseñadorIcono}>
                  <Ionicons name="person-circle-outline" size={48} color={colors.secondary} />
                </View>
                <Text style={styles.diseñadorNombre}>
                  {item.disenador ?? 'Información no disponible'}
                </Text>
                {item.origenDilenador ? (
                  <Text style={styles.diseñadorOrigenText}>{item.origenDilenador}</Text>
                ) : (
                  <Text style={styles.panelEmpty}>
                    No hay información del diseñador para esta pieza.
                  </Text>
                )}
              </View>
            </View>
          )}

          {tabActivo === 'precio' && (
            <View style={styles.tabPanel}>
              {item.precioBase != null ? (
                <View style={styles.precioCard}>
                  <Text style={styles.precioLabel}>Precio base de subasta</Text>
                  <Text style={styles.precioValor}>
                    {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(item.precioBase)}
                  </Text>
                  <Text style={styles.precioSub}>
                    Las pujas deben superar el precio base en al menos un 1%
                  </Text>
                </View>
              ) : (
                <View style={styles.precioOcultoCard}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textDisabled} />
                  <Text style={styles.precioOcultoText}>
                    Iniciá sesión para ver el precio base
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Botón sticky: Inscribirse ── */}
      {!vendido && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.inscribirseBtn, inscribiendo && styles.inscribirseBtnDisabled]}
            onPress={handleInscribirse}
            disabled={inscribiendo}
            activeOpacity={0.85}
          >
            {inscribiendo ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons name="hammer-outline" size={18} color={colors.primary} />
                <Text style={styles.inscribirseBtnText}>Inscribirse a esta Subasta</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 14, color: colors.error, textAlign: 'center' },

  // Foto
  foto: { width, height: 280 },
  noFoto: {
    width, height: 200,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  noFotoText: { fontSize: 13, color: colors.textDisabled },
  paginacion: {
    flexDirection: 'row', justifyContent: 'center',
    paddingVertical: 10, gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  dotActivo: { backgroundColor: colors.primary, width: 20 },

  // Header ítem
  itemHeader: { padding: 20, paddingBottom: 12, gap: 6 },
  itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pieza: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  vendidoBadge: { backgroundColor: colors.error, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  vendidoText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  descripcionCorta: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, lineHeight: 24 },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },

  // Contenido tab
  tabContent: { backgroundColor: '#FFFFFF', minHeight: 200 },
  tabPanel: { padding: 20, gap: 14 },
  panelText: { fontSize: 15, color: colors.textPrimary, lineHeight: 24 },
  panelEmpty: { fontSize: 14, color: colors.textDisabled, textAlign: 'center', paddingTop: 24 },

  // Diseñador
  diseñadorCard: { alignItems: 'center', gap: 8, paddingTop: 8 },
  diseñadorIcono: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center', alignItems: 'center',
  },
  diseñadorNombre: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  diseñadorOrigenText: { fontSize: 14, color: colors.textSecondary },

  // Precio
  precioCard: {
    backgroundColor: colors.primary,
    borderRadius: 16, padding: 20, alignItems: 'center', gap: 8,
  },
  precioLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  precioValor: { fontSize: 30, fontWeight: '900', color: colors.secondary },
  precioSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 18 },
  precioOcultoCard: {
    borderRadius: 16, padding: 20,
    backgroundColor: colors.inputBackground,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  precioOcultoText: { fontSize: 14, color: colors.textSecondary, flex: 1 },

  // Footer
  footer: { padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  inscribirseBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  inscribirseBtnDisabled: { opacity: 0.6 },
  inscribirseBtnText: { fontSize: 16, fontWeight: '800', color: colors.primary },
});
