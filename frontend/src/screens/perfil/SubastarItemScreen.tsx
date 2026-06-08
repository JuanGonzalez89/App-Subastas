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
import { listarMisSolicitudesApi, solicitarItemApi } from '../../api/clienteApi';
import { SolicitudItemRequest, SolicitudItemResponse } from '../../types';
import { colors } from '../../theme/colors';

const GOLD = '#C9A84C';
const MAX_FOTOS = 6;

const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#F59E0B',
  aprobado:  '#27AE60',
  rechazado: colors.error,
};

export const SubastarItemScreen = () => {
  const [solicitudes, setSolicitudes]   = useState<SolicitudItemResponse[]>([]);
  const [loadingList, setLoadingList]   = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [saving, setSaving]             = useState(false);

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setFotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const eliminarFoto = (idx: number) =>
    setFotos((prev) => prev.filter((_, i) => i !== idx));

  // ── Validación ────────────────────────────────────────────────────────────
  const validar = (): boolean => {
    const e: Record<string, string> = {};
    if (!descripcion.trim())
      e.descripcion = 'La descripción es obligatoria';
    if (fotos.length < MAX_FOTOS)
      e.fotos = `Debés subir al menos ${MAX_FOTOS} fotos del artículo (${fotos.length}/${MAX_FOTOS})`;
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
      const data: SolicitudItemRequest = {
        descripcion: descripcion.trim(),
        descripcionCompleta: descripcionCompleta.trim() || undefined,
        precioSugerido: precio ? parseFloat(precio) : undefined,
      };
      const nueva = await solicitarItemApi(data);
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
          renderItem={({ item }) => <SolicitudCard solicitud={item} />}
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
              Fotos del artículo * ({fotos.length}/{MAX_FOTOS} mínimo)
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
const SolicitudCard = ({ solicitud }: { solicitud: SolicitudItemResponse }) => {
  const estadoColor = ESTADO_COLOR[solicitud.estado] ?? colors.textSecondary;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          <Ionicons name="cube-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardDesc} numberOfLines={2}>{solicitud.descripcion}</Text>
          <Text style={styles.cardFecha}>{solicitud.fechaSolicitud}</Text>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: estadoColor + '20' }]}>
          <Text style={[styles.estadoText, { color: estadoColor }]}>
            {solicitud.estado.toUpperCase()}
          </Text>
        </View>
      </View>
      {solicitud.precioSugerido != null && (
        <Text style={styles.cardPrecio}>
          Precio sugerido: ${Number(solicitud.precioSugerido).toLocaleString('es-AR')}
        </Text>
      )}
    </View>
  );
};

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
