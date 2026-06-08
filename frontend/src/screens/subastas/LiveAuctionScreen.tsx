import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { listarPujasApi, pujarApi } from '../../api/pujaApi';
import { getFotoUrl } from '../../api/subastasApi';
import { PujaResponse } from '../../types';
import { SubastasStackParamList } from '../../navigation/SubastasStack';

// ── Colores del tema oscuro de la pantalla EN VIVO ──────────────────────────
const DARK = {
  bg:       '#0D1B2A',
  card:     '#152234',
  cardAlt:  '#1A2A40',
  gold:     '#C9A84C',
  goldSoft: '#D4A843',
  text:     '#FFFFFF',
  textSub:  'rgba(255,255,255,0.6)',
  textDim:  'rgba(255,255,255,0.35)',
  green:    '#27AE60',
  red:      '#E53935',
  own:      'rgba(201,168,76,0.12)',
  border:   'rgba(255,255,255,0.08)',
};

type Props = {
  route: RouteProp<SubastasStackParamList, 'LiveAuction'>;
  navigation: StackNavigationProp<SubastasStackParamList, 'LiveAuction'>;
};

const { width } = Dimensions.get('window');
const POLL_INTERVAL = 3000; // ms

export const LiveAuctionScreen = ({ route, navigation }: Props) => {
  const {
    subastaId,
    itemId,
    asistenteId,
    numeroPostor,
    descripcion,
    pieza,
    fotoIds,
    precioBase,
    moneda,
  } = route.params;

  const [pujas, setPujas]           = useState<PujaResponse[]>([]);
  const [inputMonto, setInputMonto] = useState('');
  const [pujando, setPujando]       = useState(false);
  const [loadingPujas, setLoadingPujas] = useState(true);
  const [fotoActual, setFotoActual] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Oferta actual: la mayor puja en el historial ──────────────────────────
  const ofertaActual = pujas.length > 0
    ? Math.max(...pujas.map((p) => p.monto))
    : precioBase;

  // ── Incrementos calculados sobre precioBase (1%, 5%, 10%, 20%) ───────────
  const incrementos = [
    Math.ceil(precioBase * 0.01),
    Math.ceil(precioBase * 0.05),
    Math.ceil(precioBase * 0.10),
    Math.ceil(precioBase * 0.20),
  ];

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(n);

  // ── Polling ───────────────────────────────────────────────────────────────
  const fetchPujas = useCallback(async () => {
    try {
      const data = await listarPujasApi(subastaId, itemId);
      setPujas(data);
    } catch {
      // silencioso: el historial se mantiene del último fetch exitoso
    } finally {
      setLoadingPujas(false);
    }
  }, [subastaId, itemId]);

  useEffect(() => {
    fetchPujas();
    pollRef.current = setInterval(fetchPujas, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchPujas]);

  // ── Pujar ─────────────────────────────────────────────────────────────────
  const handlePujar = async (monto?: number) => {
    const montoFinal = monto ?? parseFloat(inputMonto.replace(',', '.'));

    if (!montoFinal || isNaN(montoFinal)) {
      Alert.alert('Monto inválido', 'Ingresá un monto para pujar.');
      return;
    }

    const minBid = ofertaActual + precioBase * 0.01;
    const maxBid = ofertaActual + precioBase * 0.20;

    if (montoFinal < minBid) {
      Alert.alert(
        'Monto muy bajo',
        `La oferta mínima es $${fmt(Math.ceil(minBid))}.`
      );
      return;
    }
    if (montoFinal > maxBid) {
      Alert.alert(
        'Monto muy alto',
        `La oferta máxima es $${fmt(Math.floor(maxBid))}.`
      );
      return;
    }

    setPujando(true);
    try {
      const nueva = await pujarApi(subastaId, { itemId, monto: montoFinal });
      setPujas((prev) => [nueva, ...prev.filter((p) => p.id !== nueva.id)]);
      setInputMonto('');
    } catch (e: any) {
      Alert.alert('Error al pujar', e.message ?? 'Intentá de nuevo.');
    } finally {
      setPujando(false);
    }
  };

  // ── Render del historial ──────────────────────────────────────────────────
  const renderPuja = ({ item: p }: { item: PujaResponse }) => (
    <View style={[styles.pujaRow, p.esPropio && styles.pujaRowOwn]}>
      <View style={styles.pujaLeft}>
        <Text style={[styles.pujaName, p.esPropio && styles.pujaNameOwn]}>
          {p.esPropio ? 'Vos' : `Postor #${p.numeroPostor}`}
        </Text>
      </View>
      <Text style={[styles.pujaMonto, p.esPropio && styles.pujaMontoOwn]}>
        ${fmt(p.monto)}
      </Text>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK.bg} />

      {/* ── Header propio ── */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={DARK.text} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <Ionicons name="people-outline" size={14} color={DARK.textSub} />
            <Text style={styles.headerStat}>Postor #{numeroPostor}</Text>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>

          {/* ── Foto principal con badge EN VIVO ── */}
          <View style={styles.imageContainer}>
            {fotoIds.length > 0 ? (
              <>
                <FlatList
                  ref={flatRef}
                  data={fotoIds}
                  keyExtractor={(id) => String(id)}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) =>
                    setFotoActual(Math.round(e.nativeEvent.contentOffset.x / width))
                  }
                  renderItem={({ item: fotoId }) => (
                    <Image
                      source={{ uri: getFotoUrl(fotoId) }}
                      style={styles.foto}
                      resizeMode="cover"
                    />
                  )}
                />
                {/* Dots */}
                {fotoIds.length > 1 && (
                  <View style={styles.fotoDots}>
                    {fotoIds.map((_, i) => (
                      <View
                        key={i}
                        style={[styles.fotoDot, i === fotoActual && styles.fotoDotActivo]}
                      />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={[styles.foto, styles.fotoEmpty]}>
                <Ionicons name="image-outline" size={48} color={DARK.textDim} />
              </View>
            )}

            {/* Badge EN VIVO */}
            <View style={styles.enVivoBadge}>
              <View style={styles.enVivoDot} />
              <Text style={styles.enVivoText}>EN VIVO</Text>
            </View>
          </View>

          {/* ── Info del ítem ── */}
          <View style={styles.itemRow}>
            {fotoIds.length > 0 && (
              <Image
                source={{ uri: getFotoUrl(fotoIds[0]) }}
                style={styles.thumbNail}
                resizeMode="cover"
              />
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemNombre} numberOfLines={2}>{descripcion}</Text>
              <Text style={styles.itemPieza}>Pieza #{pieza}</Text>
            </View>
          </View>

          {/* ── Mayor oferta actual ── */}
          <View style={styles.ofertaCard}>
            <Text style={styles.ofertaLabel}>Mayor Oferta Actual</Text>
            <Text style={styles.ofertaMonto}>${fmt(ofertaActual)}</Text>
            <Text style={styles.ofertaBase}>Precio Base: ${fmt(precioBase)}</Text>
          </View>

          {/* ── Sección de puja ── */}
          <View style={styles.pujaSection}>
            {/* Reglas */}
            <View style={styles.reglasRow}>
              <Ionicons name="information-circle-outline" size={14} color={DARK.gold} />
              <Text style={styles.reglasText}>
                Puja mínima: +1% del precio base {'|'} Puja máxima: +20% del precio base
              </Text>
            </View>

            {/* Botones de incremento rápido (2×2) */}
            <View style={styles.incrementosGrid}>
              {incrementos.map((inc, idx) => {
                const nuevaMonto = ofertaActual + inc;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.incBtn}
                    onPress={() => handlePujar(nuevaMonto)}
                    disabled={pujando}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.incBtnText}>+${fmt(inc)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Input monto personal + botón Pujar */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.montoInput}
                placeholder="Ingresa monto personal"
                placeholderTextColor={DARK.textDim}
                keyboardType="numeric"
                value={inputMonto}
                onChangeText={setInputMonto}
                editable={!pujando}
              />
              <TouchableOpacity
                style={[styles.pujarBtn, pujando && styles.pujarBtnDisabled]}
                onPress={() => handlePujar()}
                disabled={pujando}
                activeOpacity={0.85}
              >
                {pujando ? (
                  <ActivityIndicator color={DARK.text} size="small" />
                ) : (
                  <>
                    <Ionicons name="hammer" size={16} color={DARK.text} />
                    <Text style={styles.pujarBtnText}>Pujar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Historial de Pujas ── */}
          <View style={styles.historialSection}>
            <Text style={styles.historialTitle}>Historial de Pujas</Text>
            {loadingPujas ? (
              <ActivityIndicator color={DARK.gold} style={{ marginTop: 16 }} />
            ) : pujas.length === 0 ? (
              <Text style={styles.sinPujas}>Aún no hay pujas. ¡Sé el primero!</Text>
            ) : (
              pujas.map((p) => (
                <View key={p.id} style={[styles.pujaRow, p.esPropio && styles.pujaRowOwn]}>
                  <View style={styles.pujaLeft}>
                    <Text style={[styles.pujaName, p.esPropio && styles.pujaNameOwn]}>
                      {p.esPropio ? 'Vos' : `Postor #${p.numeroPostor}`}
                    </Text>
                    {p.ganador === 'si' && (
                      <View style={styles.ganadorBadge}>
                        <Text style={styles.ganadorText}>GANADOR</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.pujaMonto, p.esPropio && styles.pujaMontoOwn]}>
                    ${fmt(p.monto)}
                  </Text>
                </View>
              ))
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK.bg },
  headerSafe: { backgroundColor: DARK.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerStat: { fontSize: 13, color: DARK.textSub, fontWeight: '600' },
  scroll: { flex: 1 },

  // ── Imagen ──
  imageContainer: { position: 'relative' },
  foto: { width, height: 240 },
  fotoEmpty: { backgroundColor: DARK.card, justifyContent: 'center', alignItems: 'center' },
  fotoDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  fotoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  fotoDotActivo: { backgroundColor: DARK.text, width: 18 },
  enVivoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: DARK.red,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  enVivoDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: DARK.text },
  enVivoText: { fontSize: 11, fontWeight: '800', color: DARK.text, letterSpacing: 1 },

  // ── Info ítem ──
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: DARK.border,
  },
  thumbNail: { width: 44, height: 44, borderRadius: 8 },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: 15, fontWeight: '700', color: DARK.text },
  itemPieza: { fontSize: 12, color: DARK.textSub, marginTop: 2 },

  // ── Oferta actual ──
  ofertaCard: {
    backgroundColor: DARK.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  ofertaLabel: { fontSize: 13, color: DARK.textSub, fontWeight: '500' },
  ofertaMonto: { fontSize: 38, fontWeight: '900', color: DARK.gold, letterSpacing: -1 },
  ofertaBase:  { fontSize: 12, color: DARK.textDim },

  // ── Sección de puja ──
  pujaSection: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  reglasRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: DARK.card,
    borderRadius: 10,
    padding: 10,
  },
  reglasText: { fontSize: 11, color: DARK.textSub, flex: 1, lineHeight: 16 },

  // Botones 2×2
  incrementosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  incBtn: {
    width: (width - 32 - 10) / 2,
    backgroundColor: DARK.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  incBtnText: { fontSize: 16, fontWeight: '800', color: DARK.bg },

  // Input + botón Pujar
  inputRow: { flexDirection: 'row', gap: 10 },
  montoInput: {
    flex: 1,
    backgroundColor: DARK.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: DARK.text,
    borderWidth: 1,
    borderColor: DARK.border,
  },
  pujarBtn: {
    backgroundColor: DARK.green,
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  pujarBtnDisabled: { opacity: 0.5 },
  pujarBtnText: { fontSize: 15, fontWeight: '800', color: DARK.text },

  // ── Historial ──
  historialSection: {
    marginHorizontal: 16,
    marginTop: 24,
    gap: 0,
  },
  historialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK.text,
    marginBottom: 12,
  },
  sinPujas: { fontSize: 13, color: DARK.textDim, textAlign: 'center', paddingVertical: 20 },
  pujaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: DARK.border,
  },
  pujaRowOwn: { backgroundColor: DARK.own, marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 10 },
  pujaLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pujaName: { fontSize: 14, color: DARK.textSub, fontWeight: '500' },
  pujaNameOwn: { color: DARK.gold, fontWeight: '700' },
  pujaMonto: { fontSize: 16, fontWeight: '700', color: DARK.text },
  pujaMontoOwn: { color: DARK.gold },
  ganadorBadge: {
    backgroundColor: DARK.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ganadorText: { fontSize: 9, fontWeight: '800', color: DARK.bg },
});
