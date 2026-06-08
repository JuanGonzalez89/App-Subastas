import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  agregarMedioPagoApi,
  eliminarMedioPagoApi,
  listarMediosPagoApi,
} from '../../api/clienteApi';
import { MedioPagoRequest, MedioPagoResponse } from '../../types';
import { colors } from '../../theme/colors';

const TIPOS = [
  { value: 'cuenta_bancaria',    label: 'Cuenta bancaria',    icon: 'business-outline' as const },
  { value: 'tarjeta_credito',    label: 'Tarjeta de crédito', icon: 'card-outline' as const },
  { value: 'cheque_certificado', label: 'Cheque certificado', icon: 'document-text-outline' as const },
];

const TIPO_LABELS: Record<string, string> = {
  cuenta_bancaria:    'Cuenta bancaria',
  tarjeta_credito:    'Tarjeta de crédito',
  cheque_certificado: 'Cheque certificado',
};

const TIPO_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cuenta_bancaria:    'business-outline',
  tarjeta_credito:    'card-outline',
  cheque_certificado: 'document-text-outline',
};

export const PaymentMethodsScreen = () => {
  const [medios, setMedios]       = useState<MedioPagoResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState<MedioPagoRequest>({
    tipo: 'cuenta_bancaria', entidad: '', numero: '', montoGarantizado: undefined,
  });
  const [formError, setFormError] = useState('');

  const cargar = () =>
    listarMediosPagoApi()
      .then(setMedios)
      .finally(() => setLoading(false));

  useEffect(() => { cargar(); }, []);

  const abrirModal = () => {
    setForm({ tipo: 'cuenta_bancaria', entidad: '', numero: '' });
    setFormError('');
    setModalVisible(true);
  };

  const guardar = async () => {
    if (!form.entidad.trim() || !form.numero.trim()) {
      setFormError('Completá todos los campos obligatorios');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const nuevo = await agregarMedioPagoApi(form);
      setMedios((prev) => [nuevo, ...prev]);
      setModalVisible(false);
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const eliminar = (id: number, entidad: string) => {
    Alert.alert(
      'Eliminar medio de pago',
      `¿Confirmás eliminar ${entidad}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarMedioPagoApi(id);
              setMedios((prev) => prev.filter((m) => m.id !== id));
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Lista de medios */}
      <FlatList
        data={medios}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={48} color={colors.textDisabled} />
            <Text style={styles.emptyText}>No tenés medios de pago registrados</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name={TIPO_ICONS[item.tipo] ?? 'card-outline'} size={22} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTipo}>{TIPO_LABELS[item.tipo] ?? item.tipo}</Text>
              <Text style={styles.cardEntidad}>{item.entidad}</Text>
              <Text style={styles.cardNumero}>{item.numero}</Text>
              {item.montoGarantizado != null && (
                <Text style={styles.cardMonto}>
                  Garantizado: ${new Intl.NumberFormat('es-AR').format(item.montoGarantizado)}
                </Text>
              )}
            </View>
            <View style={styles.cardActions}>
              {item.verificado === 'si' ? (
                <View style={styles.verificadoBadge}>
                  <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                  <Text style={styles.verificadoText}>Verificado</Text>
                </View>
              ) : (
                <View style={styles.pendienteBadge}>
                  <Text style={styles.pendienteText}>Pendiente</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => eliminar(item.id, item.entidad)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* ── Botón fijo full-width en el fondo (wireframe pág. 8) ── */}
      <View style={styles.footerBar}>
        <TouchableOpacity style={styles.addBtn} onPress={abrirModal} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>+ Agregar Nuevo Medio de Pago</Text>
        </TouchableOpacity>
      </View>

      {/* Modal agregar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo medio de pago</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
              {/* Tipo */}
              <Text style={styles.fieldLabel}>Tipo *</Text>
              <View style={styles.tipoSelector}>
                {TIPOS.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.tipoChip, form.tipo === t.value && styles.tipoChipActivo]}
                    onPress={() => setForm((f) => ({ ...f, tipo: t.value }))}
                  >
                    <Ionicons
                      name={t.icon}
                      size={15}
                      color={form.tipo === t.value ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text style={[styles.tipoChipText, form.tipo === t.value && styles.tipoChipTextActivo]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Entidad */}
              <Text style={styles.fieldLabel}>Entidad / Banco *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Banco Nación, Visa, HSBC"
                placeholderTextColor={colors.textDisabled}
                value={form.entidad}
                onChangeText={(t) => setForm((f) => ({ ...f, entidad: t }))}
              />

              {/* Número */}
              <Text style={styles.fieldLabel}>
                {form.tipo === 'cuenta_bancaria'    ? 'CBU / Alias' :
                 form.tipo === 'tarjeta_credito'    ? 'Número (últimos 4 dígitos)' :
                                                     'Número de cheque'} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder={form.tipo === 'cuenta_bancaria' ? 'CBU o alias' : '****'}
                placeholderTextColor={colors.textDisabled}
                value={form.numero}
                onChangeText={(t) => setForm((f) => ({ ...f, numero: t }))}
                keyboardType={form.tipo === 'tarjeta_credito' ? 'numeric' : 'default'}
              />

              {/* Monto garantizado */}
              <Text style={styles.fieldLabel}>Monto garantizado (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textDisabled}
                keyboardType="decimal-pad"
                value={form.montoGarantizado != null ? String(form.montoGarantizado) : ''}
                onChangeText={(t) => setForm((f) => ({ ...f, montoGarantizado: t ? parseFloat(t) : undefined }))}
              />

              {formError ? <Text style={styles.formError}>{formError}</Text> : null}

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={guardar}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.saveBtnText}>Guardar</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Lista
  listContent: { padding: 16, gap: 10, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },

  // Card
  card: {
    backgroundColor: colors.surface, borderRadius: 14,
    padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, elevation: 2,
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center', alignItems: 'center',
  },
  cardContent: { flex: 1, gap: 2 },
  cardTipo: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardEntidad: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  cardNumero: { fontSize: 13, color: colors.textSecondary },
  cardMonto: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  cardActions: { alignItems: 'flex-end', gap: 10 },
  verificadoBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verificadoText: { fontSize: 10, color: colors.success, fontWeight: '700' },
  pendienteBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  pendienteText: { fontSize: 10, color: colors.warning, fontWeight: '700' },

  // Footer con botón full-width (wireframe pág. 8)
  footerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  modalBody: { padding: 20, gap: 6, paddingBottom: 40 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 12, marginBottom: 4 },
  tipoSelector: { gap: 8 },
  tipoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: colors.border, backgroundColor: colors.inputBackground,
  },
  tipoChipActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tipoChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  tipoChipTextActivo: { color: '#FFFFFF', fontWeight: '700' },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border,
  },
  formError: { fontSize: 13, color: colors.error, marginTop: 8 },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 20,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
