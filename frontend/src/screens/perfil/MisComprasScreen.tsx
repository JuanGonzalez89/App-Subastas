import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  listarComprasApi,
  listarMediosPagoApi,
  listarMultasApi,
  pagarCompraApi,
  pagarMultaApi,
} from '../../api/clienteApi';
import { getFotoUrl } from '../../api/subastasApi';
import { CompraResponse, MedioPagoResponse, MultaResponse } from '../../types';
import { colors } from '../../theme/colors';

const GOLD = '#C9A84C';

const TIPO_LABEL: Record<string, string> = {
  cuenta_bancaria: 'Cuenta bancaria',
  tarjeta_credito: 'Tarjeta de crédito',
  cheque_certificado: 'Cheque certificado',
};

const fmt = (n?: number) =>
  n == null ? '0' : new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(n);

export const MisComprasScreen = () => {
  const [compras, setCompras] = useState<CompraResponse[]>([]);
  const [medios, setMedios]   = useState<MedioPagoResponse[]>([]);
  const [multas, setMultas]   = useState<MultaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal de selección de medio de pago
  const [compraSel, setCompraSel] = useState<CompraResponse | null>(null);
  const [pagando, setPagando]     = useState(false);

  // Resultado del pago (banner)
  const [resultado, setResultado] = useState<{ tipo: 'ok' | 'multa'; texto: string } | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [c, m, mu] = await Promise.all([
        listarComprasApi(),
        listarMediosPagoApi(),
        listarMultasApi(),
      ]);
      setCompras(c);
      setMedios(m);
      setMultas(mu);
    } catch (_) {
      // se mantiene el último estado
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const onRefresh = () => { setRefreshing(true); cargar(); };

  const mediosVerificados = medios.filter((m) => m.verificado === 'si');

  const handlePagar = async (medioId: number) => {
    if (!compraSel) return;
    setPagando(true);
    try {
      const res = await pagarCompraApi(compraSel.registroId, medioId);
      setCompraSel(null);
      setResultado({ tipo: res.multaGenerada ? 'multa' : 'ok', texto: res.mensaje });
      await cargar();
    } catch (e: any) {
      setResultado({ tipo: 'multa', texto: e.message ?? 'No se pudo procesar el pago.' });
      setCompraSel(null);
    } finally {
      setPagando(false);
    }
  };

  const handlePagarMulta = async (id: number) => {
    try {
      await pagarMultaApi(id);
      setResultado({ tipo: 'ok', texto: 'Multa abonada. Ya podés volver a participar de subastas.' });
      await cargar();
    } catch (e: any) {
      setResultado({ tipo: 'multa', texto: e.message ?? 'No se pudo abonar la multa.' });
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const multasPendientes = multas.filter((m) => m.estado === 'pendiente');

  const ESTADO_BADGE: Record<string, { label: string; color: string }> = {
    pendiente: { label: 'Pendiente de pago', color: '#E67E22' },
    pagado:    { label: 'Pagado',            color: colors.success },
    multa:     { label: 'Con multa',         color: colors.error },
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Banner de resultado */}
        {resultado && (
          <View style={[styles.resultBanner, resultado.tipo === 'multa' ? styles.resultMulta : styles.resultOk]}>
            <Ionicons
              name={resultado.tipo === 'multa' ? 'warning' : 'checkmark-circle'}
              size={20}
              color={resultado.tipo === 'multa' ? colors.error : colors.success}
            />
            <Text style={styles.resultText}>{resultado.texto}</Text>
            <TouchableOpacity onPress={() => setResultado(null)} hitSlop={10}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Multas pendientes */}
        {multasPendientes.map((m) => (
          <View key={m.id} style={styles.multaCard}>
            <View style={styles.multaHeader}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.multaTitle}>Multa pendiente</Text>
            </View>
            <Text style={styles.multaImporte}>${fmt(m.importe)}</Text>
            {m.fechaLimite && (
              <Text style={styles.multaPlazo}>Tenés hasta el {m.fechaLimite} (72 hs) para presentar los fondos.</Text>
            )}
            <Text style={styles.multaMotivo}>
              No podés participar de otra subasta hasta abonar esta multa.
            </Text>
            <TouchableOpacity style={styles.multaBtn} onPress={() => handlePagarMulta(m.id)} activeOpacity={0.85}>
              <Text style={styles.multaBtnText}>Abonar multa</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Lista de compras */}
        {compras.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="bag-handle-outline" size={48} color={colors.textDisabled} />
            <Text style={styles.emptyText}>Todavía no ganaste ningún bien en subasta.</Text>
          </View>
        ) : (
          compras.map((c) => {
            const badge = ESTADO_BADGE[c.estadoPago] ?? ESTADO_BADGE.pendiente;
            return (
              <View key={c.registroId} style={styles.card}>
                <View style={styles.cardTop}>
                  {c.fotoIds && c.fotoIds.length > 0 ? (
                    <Image source={{ uri: getFotoUrl(c.fotoIds[0]) }} style={styles.foto} />
                  ) : (
                    <View style={[styles.foto, styles.fotoEmpty]}>
                      <Ionicons name="image-outline" size={24} color={colors.textDisabled} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.desc} numberOfLines={2}>{c.descripcion}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.color }]}>
                      <Text style={styles.badgeText}>{badge.label}</Text>
                    </View>
                  </View>
                </View>

                {/* Desglose */}
                <View style={styles.desglose}>
                  <Linea label="Lo pujado" valor={`${c.moneda} $${fmt(c.importe)}`} />
                  <Linea label="Comisión" valor={`${c.moneda} $${fmt(c.comision)}`} />
                  <Linea label="Costo de envío" valor={`${c.moneda} $${fmt(c.costoEnvio)}`} />
                  <View style={styles.divider} />
                  <Linea label="Total a pagar" valor={`${c.moneda} $${fmt(c.total)}`} bold />
                </View>

                {c.estadoPago === 'pagado' ? (
                  <View style={styles.pagadoRow}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.pagadoText}>Pagado{c.fechaPago ? ` el ${c.fechaPago}` : ''}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.pagarBtn} onPress={() => { setResultado(null); setCompraSel(c); }} activeOpacity={0.85}>
                    <Ionicons name="card-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.pagarBtnText}>
                      {c.estadoPago === 'multa' ? 'Reintentar pago' : 'Pagar'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal selección de medio de pago */}
      <Modal visible={compraSel !== null} transparent animationType="slide" onRequestClose={() => setCompraSel(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Elegí cómo pagar</Text>
              <TouchableOpacity onPress={() => setCompraSel(null)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {compraSel && (
              <Text style={styles.modalTotal}>
                Total: {compraSel.moneda} ${fmt(compraSel.total)}
              </Text>
            )}

            {pagando ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 24 }} />
            ) : mediosVerificados.length === 0 ? (
              <Text style={styles.sinMedios}>
                No tenés medios de pago verificados. Registrá uno y esperá la verificación de la empresa.
              </Text>
            ) : (
              <FlatList
                data={mediosVerificados}
                keyExtractor={(m) => String(m.id)}
                renderItem={({ item: m }) => {
                  const cubre = m.montoGarantizado == null
                    || (compraSel != null && m.montoGarantizado >= compraSel.total);
                  return (
                    <TouchableOpacity
                      style={[styles.medioRow, !cubre && styles.medioRowDisabled]}
                      onPress={() => cubre && handlePagar(m.id)}
                      disabled={!cubre}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={m.tipo === 'cheque_certificado' ? 'document-text-outline'
                            : m.tipo === 'tarjeta_credito' ? 'card-outline' : 'business-outline'}
                        size={22}
                        color={cubre ? GOLD : colors.textDisabled}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.medioTipo, !cubre && styles.medioDisabledText]}>
                          {TIPO_LABEL[m.tipo] ?? m.tipo}
                        </Text>
                        <Text style={styles.medioDet}>
                          {m.entidad} · ****{m.numero.slice(-4)}
                          {m.montoGarantizado != null ? ` · garantía $${fmt(m.montoGarantizado)}` : ''}
                        </Text>
                        {!cubre && (
                          <Text style={styles.medioNoCubre}>No cubre el total — elegí otro medio</Text>
                        )}
                      </View>
                      {cubre && <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const Linea = ({ label, valor, bold }: { label: string; valor: string; bold?: boolean }) => (
  <View style={styles.lineaRow}>
    <Text style={[styles.lineaLabel, bold && styles.lineaBold]}>{label}</Text>
    <Text style={[styles.lineaValor, bold && styles.lineaBold]}>{valor}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },

  resultBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, padding: 14, borderWidth: 1,
  },
  resultOk: { backgroundColor: '#EAF7EE', borderColor: colors.success + '55' },
  resultMulta: { backgroundColor: '#FDECEA', borderColor: colors.error + '55' },
  resultText: { flex: 1, fontSize: 13, color: colors.textPrimary, lineHeight: 19 },

  multaCard: {
    backgroundColor: '#FDECEA', borderRadius: 14, padding: 16, gap: 6,
    borderWidth: 1, borderColor: colors.error + '55',
  },
  multaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  multaTitle: { fontSize: 15, fontWeight: '800', color: colors.error },
  multaImporte: { fontSize: 24, fontWeight: '900', color: colors.error },
  multaPlazo: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  multaMotivo: { fontSize: 12, color: colors.textSecondary },
  multaBtn: {
    backgroundColor: colors.error, borderRadius: 10, paddingVertical: 12,
    alignItems: 'center', marginTop: 6,
  },
  multaBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

  emptyBox: { alignItems: 'center', gap: 12, paddingVertical: 60 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, gap: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardTop: { flexDirection: 'row', gap: 12 },
  foto: { width: 64, height: 64, borderRadius: 10 },
  fotoEmpty: { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  desc: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  desglose: { backgroundColor: '#FAFAFA', borderRadius: 10, padding: 12, gap: 6 },
  lineaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  lineaLabel: { fontSize: 13, color: colors.textSecondary },
  lineaValor: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  lineaBold: { fontWeight: '800', color: colors.textPrimary, fontSize: 15 },
  divider: { height: 1, backgroundColor: '#E8E8E8', marginVertical: 2 },

  pagarBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14,
  },
  pagarBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  pagadoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  pagadoText: { color: colors.success, fontWeight: '600', fontSize: 13 },

  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '70%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  modalTotal: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
  sinMedios: { fontSize: 13, color: colors.textSecondary, paddingVertical: 20, textAlign: 'center' },
  medioRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  medioTipo: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  medioDet: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  medioRowDisabled: { opacity: 0.55 },
  medioDisabledText: { color: colors.textDisabled },
  medioNoCubre: { fontSize: 11, color: colors.error, marginTop: 2, fontWeight: '600' },
});
