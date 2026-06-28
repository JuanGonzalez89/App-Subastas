import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  aceptarCondicionesApi,
  listarMisSolicitudesApi,
  rechazarCondicionesApi,
  solicitarItemApi,
} from '../../api/clienteApi';
import { SolicitudItemResponse } from '../../types';
import { colors } from '../../theme/colors';

const GOLD = '#C9A84C';
const MIN_FOTOS = 6;
const MAX_FOTOS = 20;

const ESTADO_COLOR: Record<string, string> = {
  pendiente:             '#F59E0B',
  interesado:            '#2196F3',
  en_inspeccion:         '#9C27B0',
  rechazado:             colors.error,
  condiciones_propuestas: GOLD,
  aceptado:              '#27AE60',
  rechazado_duenio:      colors.error,
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente:             'En revisión',
  interesado:            'Empresa interesada',
  en_inspeccion:         'En inspección',
  rechazado:             'Rechazado',
  condiciones_propuestas: 'Condiciones propuestas',
  aceptado:              'Aceptado',
  rechazado_duenio:      'Condiciones rechazadas',
};

export const SubastarItemScreen = () => {
  const [solicitudes, setSolicitudes]   = useState<SolicitudItemResponse[]>([]);
  const [loadingList, setLoadingList]   = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Campos del formulario
  const [descripcion, setDescripcion]               = useState('');
  const [descripcionCompleta, setDescripcionCompleta] = useState('');
  const [precio, setPrecio]                         = useState('');
  const [fotos, setFotos]                           = useState<string[]>([]); // URIs locales
  const [declaro, setDeclaro]                       = useState(false);
  const [errors, setErrors]                         = useState<Record<string, string>>({});

  useEffect(() => { cargarSolicitudes(); }, []);

  const cargarSolicitudes = () => {
    setLoadingList(true);
    listarMisSolicitudesApi()
      .then(setSolicitudes)
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };

  // ── Agregar foto ──────────────────────────────────────────────────────────
  const agregarFoto = async () => {
    if (fotos.length >= MAX_FOTOS) {
      Alert.alert('Límite de fotos', `Podés subir hasta ${MAX_FOTOS} fotos.`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setFotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const eliminarFoto = (idx: number) =>
    setFotos((prev) => prev.filter((_, i) => i !== idx));

  // ── Aceptar / Rechazar condiciones ───────────────────────────────────────
  const handleAceptarCondiciones = async (id: number) => {
    Alert.alert(
      'Aceptar condiciones',
      '¿Confirmás que aceptás el valor base, comisiones y fecha de subasta propuestos por la empresa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            setActionLoading(id);
            try {
              const updated = await aceptarCondicionesApi(id);
              setSolicitudes((prev) => prev.map((s) => (s.id === id ? updated : s)));
            } catch (e: any) {
              Alert.alert('Error', e.message);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const handleRechazarCondiciones = async (id: number) => {
    Alert.alert(
      'Rechazar condiciones',
      'Si rechazás, el bien te será devuelto con cargo a tu cuenta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(id);
            try {
              const updated = await rechazarCondicionesApi(id);
              setSolicitudes((prev) => prev.map((s) => (s.id === id ? updated : s)));
            } catch (e: any) {
              Alert.alert('Error', e.message);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  // ── Validación ────────────────────────────────────────────────────────────
  const validar = (): boolean => {
    const e: Record<string, string> = {};
    if (!descripcion.trim())
      e.descripcion = 'La descripción es obligatoria';
    if (fotos.length < MIN_FOTOS)
      e.fotos = `Debés subir al menos ${MIN_FOTOS} fotos del artículo (${fotos.length}/${MIN_FOTOS})`;
    else if (fotos.length > MAX_FOTOS)
      e.fotos = `Máximo ${MAX_FOTOS} fotos permitidas`;
    if (precio && isNaN(parseFloat(precio)))
      e.precio = 'El precio debe ser un número válido';
    if (!declaro)
      e.declaro = 'Debés declarar que el bien te pertenece para continuar';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Enviar solicitud ──────────────────────────────────────────────────────
  const handleEnviar = async () => {
    if (!validar()) return;
    setSaving(true);
    try {
      const nueva = await solicitarItemApi(
        descripcion.trim(),
        descripcionCompleta.trim() || undefined,
        precio ? parseFloat(precio) : undefined,
        fotos,
      );
      setSolicitudes((prev) => [nueva, ...prev]);
      // Reset form
      setShowForm(false);
      setDescripcion(''); setDescripcionCompleta('');
      setPrecio(''); setFotos([]); setDeclaro(false);
      Alert.alert(
        '¡Solicitud enviada!',
        'Vamos a revisar tu artículo y te contactaremos cuando esté aprobado.',
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Banner informativo */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={GOLD} />
        <Text style={styles.infoText}>
          Podés solicitar incluir tu artículo en una futura subasta. El equipo lo revisará y te notificará por la app.
        </Text>
      </View>

      {/* Lista de solicitudes */}
      {loadingList ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(s) => String(s.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={44} color={colors.textDisabled} />
              <Text style={styles.emptyTitle}>Sin solicitudes</Text>
              <Text style={styles.emptyText}>Todavía no enviaste ningún artículo para subastar</Text>
            </View>
          }
          ListHeaderComponent={
            solicitudes.length > 0
              ? <Text style={styles.listHeader}>Mis solicitudes ({solicitudes.length})</Text>
              : null
          }
          renderItem={({ item }) => (
            <SolicitudCard
              solicitud={item}
              actionLoading={actionLoading === item.id}
              onAceptar={() => handleAceptarCondiciones(item.id)}
              onRechazar={() => handleRechazarCondiciones(item.id)}
            />
          )}
        />
      )}

      {/* Formulario (bottom sheet) */}
      {showForm && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.formWrapper}
        >
          <ScrollView
            contentContainerStyle={styles.formScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header del form */}
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Nuevo artículo</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Descripción */}
            <Text style={styles.fieldLabel}>Descripción del artículo *</Text>
            <TextInput
              style={[styles.input, errors.descripcion && styles.inputError]}
              placeholder="Ej: Jarrón de porcelana japonesa, siglo XVIII"
              placeholderTextColor={colors.textDisabled}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
            />
            {errors.descripcion ? <Text style={styles.errorText}>{errors.descripcion}</Text> : null}

            {/* Historia / datos adicionales */}
            <Text style={styles.fieldLabel}>Historia o datos adicionales (opcional)</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Origen, procedencia, estado de conservación, artista, curiosidades..."
              placeholderTextColor={colors.textDisabled}
              value={descripcionCompleta}
              onChangeText={setDescripcionCompleta}
              multiline
              numberOfLines={4}
            />

            {/* Precio sugerido */}
            <Text style={styles.fieldLabel}>Precio base sugerido (opcional)</Text>
            <TextInput
              style={[styles.input, errors.precio && styles.inputError]}
              placeholder="0.00"
              placeholderTextColor={colors.textDisabled}
              value={precio}
              onChangeText={setPrecio}
              keyboardType="decimal-pad"
            />
            {errors.precio ? <Text style={styles.errorText}>{errors.precio}</Text> : null}

            {/* ── Fotos (mínimo 6, requerido por TPO) ── */}
            <Text style={styles.fieldLabel}>
              Fotos del artículo * ({fotos.length}/{MIN_FOTOS} mínimo)
            </Text>
            <View style={styles.fotosGrid}>
              {fotos.map((uri, idx) => (
                <View key={idx} style={styles.fotoBox}>
                  <Image source={{ uri }} style={styles.fotoPreview} />
                  <TouchableOpacity
                    style={styles.fotoDeleteBtn}
                    onPress={() => eliminarFoto(idx)}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              {fotos.length < MAX_FOTOS && (
                <TouchableOpacity style={styles.fotoAddBox} onPress={agregarFoto}>
                  <Ionicons name="camera-outline" size={28} color={colors.textSecondary} />
                  <Text style={styles.fotoAddText}>Agregar foto</Text>
                </TouchableOpacity>
              )}
            </View>
            {errors.fotos ? <Text style={styles.errorText}>{errors.fotos}</Text> : null}

            {/* ── Declaración de propiedad (OBLIGATORIA según TPO) ── */}
            <TouchableOpacity
              style={styles.declaroRow}
              onPress={() => setDeclaro(!declaro)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, declaro && styles.checkboxActive]}>
                {declaro && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>
              <Text style={styles.declaroText}>
                Declaro que el bien a subastar me pertenece y no posee ningún impedimento legal para su venta. Me comprometo a acreditar el origen lícito si fuera requerido.
              </Text>
            </TouchableOpacity>
            {errors.declaro ? <Text style={styles.errorText}>{errors.declaro}</Text> : null}

            {/* Botón enviar */}
            <TouchableOpacity
              style={[styles.enviarBtn, saving && styles.enviarBtnDisabled]}
              onPress={handleEnviar}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.enviarBtnText}>Enviar solicitud</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Botón full-width fijo al fondo */}
      {!showForm && (
        <View style={styles.footerBar}>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.addBtnText}>+ Solicitar subastar mi artículo</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// ── Card de solicitud ─────────────────────────────────────────────────────────
interface SolicitudCardProps {
  solicitud: SolicitudItemResponse;
  actionLoading: boolean;
  onAceptar: () => void;
  onRechazar: () => void;
}

const SolicitudCard = ({ solicitud, actionLoading, onAceptar, onRechazar }: SolicitudCardProps) => {
  const estadoColor = ESTADO_COLOR[solicitud.estado] ?? colors.textSecondary;
  const estadoLabel = ESTADO_LABEL[solicitud.estado] ?? solicitud.estado;

  return (
    <View style={styles.card}>
      {/* Encabezado */}
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          <Ionicons name="cube-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardDesc} numberOfLines={2}>{solicitud.descripcion}</Text>
          <Text style={styles.cardFecha}>{solicitud.fechaSolicitud}</Text>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: estadoColor + '22' }]}>
          <Text style={[styles.estadoText, { color: estadoColor }]}>{estadoLabel.toUpperCase()}</Text>
        </View>
      </View>

      {/* Etapa 1: pendiente */}
      {solicitud.estado === 'pendiente' && (
        <InfoLinea icon="time-outline" color="#F59E0B"
          text="La empresa está revisando tu solicitud. Te notificaremos cuando haya novedades." />
      )}

      {/* Etapa 2: interesado — empresa da dirección de envío */}
      {solicitud.estado === 'interesado' && (
        <View style={styles.infoBloque}>
          <InfoLinea icon="checkmark-circle-outline" color="#2196F3"
            text="¡La empresa está interesada en tu artículo!" />
          {solicitud.direccionEnvio && (
            <InfoLinea icon="location-outline" color="#2196F3"
              text={`Enviá el artículo a: ${solicitud.direccionEnvio}`} bold />
          )}
          <InfoLinea icon="alert-circle-outline" color="#F59E0B"
            text="Importante: si el artículo no es aprobado tras la inspección, la devolución será con cargo a tu cuenta." />
        </View>
      )}

      {/* Etapa 3: en inspección */}
      {solicitud.estado === 'en_inspeccion' && (
        <InfoLinea icon="search-outline" color="#9C27B0"
          text="Tu artículo fue recibido y está siendo inspeccionado por nuestros expertos." />
      )}

      {/* Etapa 3b: rechazado */}
      {solicitud.estado === 'rechazado' && (
        <View style={styles.infoBloque}>
          <InfoLinea icon="close-circle-outline" color={colors.error}
            text="El artículo no fue aceptado." />
          {solicitud.motivoRechazo && (
            <InfoLinea icon="document-text-outline" color={colors.error}
              text={`Motivo: ${solicitud.motivoRechazo}`} />
          )}
          <InfoLinea icon="return-down-back-outline" color={colors.textSecondary}
            text="El bien será devuelto con cargo a tu cuenta." />
        </View>
      )}

      {/* Etapa 4: condiciones propuestas */}
      {solicitud.estado === 'condiciones_propuestas' && (
        <View style={styles.infoBloque}>
          <InfoLinea icon="pricetag-outline" color={GOLD}
            text="La empresa te propone las siguientes condiciones:" />
          {solicitud.valorBase != null && (
            <InfoLinea icon="cash-outline" color={GOLD}
              text={`Valor base asignado: $${Number(solicitud.valorBase).toLocaleString('es-AR')}`} bold />
          )}
          {solicitud.comision != null && (
            <InfoLinea icon="trending-up-outline" color={GOLD}
              text={`Comisión de la empresa: ${solicitud.comision}%`} />
          )}
          {solicitud.fechaSubasta && (
            <InfoLinea icon="calendar-outline" color={colors.textSecondary}
              text={`Fecha de subasta: ${solicitud.fechaSubasta}${solicitud.horaSubasta ? ' a las ' + solicitud.horaSubasta : ''}`} />
          )}
          {solicitud.lugarSubasta && (
            <InfoLinea icon="location-outline" color={colors.textSecondary}
              text={`Lugar: ${solicitud.lugarSubasta}`} />
          )}
          <View style={styles.botonesRow}>
            <TouchableOpacity
              style={[styles.btnAceptar, actionLoading && { opacity: 0.6 }]}
              onPress={onAceptar}
              disabled={actionLoading}
            >
              {actionLoading
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Text style={styles.btnText}>Aceptar condiciones</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnRechazar, actionLoading && { opacity: 0.6 }]}
              onPress={onRechazar}
              disabled={actionLoading}
            >
              <Text style={[styles.btnText, { color: colors.error }]}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Etapa 5a: aceptado */}
      {solicitud.estado === 'aceptado' && (
        <View style={styles.infoBloque}>
          <InfoLinea icon="checkmark-done-circle-outline" color="#27AE60"
            text="¡Aceptaste las condiciones! Tu artículo será incluido en la subasta." />
          {solicitud.depositoUbicacion && (
            <InfoLinea icon="business-outline" color={colors.textSecondary}
              text={`Depósito: ${solicitud.depositoUbicacion}`} />
          )}
          {solicitud.polizaSeguro && (
            <InfoLinea icon="shield-checkmark-outline" color={colors.textSecondary}
              text={`Póliza de seguro: ${solicitud.polizaSeguro}`} />
          )}
        </View>
      )}

      {/* Etapa 5b: rechazado por dueño */}
      {solicitud.estado === 'rechazado_duenio' && (
        <InfoLinea icon="close-circle-outline" color={colors.error}
          text="Rechazaste las condiciones propuestas. El bien será devuelto con los gastos correspondientes." />
      )}
    </View>
  );
};

const InfoLinea = ({
  icon, color, text, bold = false,
}: {
  icon: any; color: string; text: string; bold?: boolean;
}) => (
  <View style={styles.infoLinea}>
    <Ionicons name={icon} size={16} color={color} style={{ marginTop: 2 }} />
    <Text style={[styles.infoLineaText, bold && { fontWeight: '700' }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Banner
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: GOLD + '18', borderLeftWidth: 3, borderLeftColor: GOLD,
    paddingHorizontal: 14, paddingVertical: 12,
    marginHorizontal: 16, marginTop: 16, borderRadius: 8,
  },
  infoText: { flex: 1, fontSize: 13, color: colors.textPrimary, lineHeight: 18 },

  // Lista
  listContent: { padding: 16, gap: 10, paddingBottom: 20 },
  listHeader: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
  empty: { alignItems: 'center', paddingTop: 48, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },

  // Card
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1, gap: 2 },
  cardDesc: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  cardFecha: { fontSize: 12, color: colors.textSecondary },
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  estadoText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  cardPrecio: { fontSize: 13, color: colors.textSecondary },

  // Info por estado
  infoBloque: { gap: 8, marginTop: 4 },
  infoLinea: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoLineaText: { flex: 1, fontSize: 13, color: colors.textPrimary, lineHeight: 19 },

  // Botones condiciones
  botonesRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btnAceptar: {
    flex: 1, backgroundColor: '#27AE60', borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  btnRechazar: {
    flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.error,
  },
  btnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  // Formulario bottom sheet
  formWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12, shadowRadius: 8,
  },
  formScroll: { padding: 20, paddingBottom: 48, gap: 4 },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  formTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: '#F5F5F5', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.textPrimary,
    borderWidth: 1, borderColor: '#E8E8E8',
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  inputError: { borderColor: colors.error },
  errorText: { fontSize: 11, color: colors.error, marginTop: 3 },

  // Fotos
  fotosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fotoBox: { width: 88, height: 88, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  fotoPreview: { width: '100%', height: '100%' },
  fotoDeleteBtn: {
    position: 'absolute', top: 3, right: 3,
    backgroundColor: '#FFFFFF', borderRadius: 10,
  },
  fotoAddBox: {
    width: 88, height: 88, borderRadius: 10,
    borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 4,
    backgroundColor: '#FAFAFA',
  },
  fotoAddText: { fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
  fotoAddBoxDisabled: {
    width: 88, height: 88, borderRadius: 10,
    borderWidth: 2, borderColor: colors.success, borderStyle: 'solid',
    justifyContent: 'center', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FFF0',
  },

  // Declaración de propiedad (checkbox)
  declaroRow: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    marginTop: 16, padding: 14,
    backgroundColor: '#F5EDD8', borderRadius: 12,
    borderWidth: 1, borderColor: GOLD + '60',
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#CCCCCC',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0, marginTop: 1,
  },
  checkboxActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  declaroText: { flex: 1, fontSize: 13, color: colors.textPrimary, lineHeight: 20 },

  // Botón enviar
  enviarBtn: {
    backgroundColor: colors.textPrimary, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center', marginTop: 20,
  },
  enviarBtnDisabled: { opacity: 0.6 },
  enviarBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // Footer
  footerBar: {
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  addBtn: {
    backgroundColor: colors.textPrimary, borderRadius: 14,
    paddingVertical: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  addBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
