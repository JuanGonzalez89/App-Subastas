import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import {
  aprobarMedioPagoAdminApi,
  aprobarPreRegistroAdminApi,
  aprobarSolicitudItemAdminApi,
  crearProductoAdminApi,
  crearSubastaAdminApi,
  listarMediosPagoAdminApi,
  listarSolicitudesAdminApi,
  listarSolicitudesUsuariosApi,
} from '../../api/adminApi';
import { MedioPagoResponse, PreRegistracionResponse, SolicitudItemResponse } from '../../types';

const TIPO_LABELS: Record<string, string> = {
  cuenta_bancaria: 'Cuenta bancaria',
  tarjeta_credito: 'Tarjeta de crédito',
  cheque_certificado: 'Cheque certificado',
};

type Tab = 'solicitudes' | 'crear-subasta' | 'crear-producto';
type SolicitudSubtab = 'usuarios' | 'productos' | 'medios';

export const AdminScreen = () => {
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>('solicitudes');
  const [subtab, setSubtab] = useState<SolicitudSubtab>('usuarios');

  const [usuarios, setUsuarios] = useState<PreRegistracionResponse[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudItemResponse[]>([]);
  const [medios, setMedios] = useState<MedioPagoResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarUsuarios = () => {
    setLoading(true);
    listarSolicitudesUsuariosApi()
      .then(setUsuarios)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const cargarSolicitudesItems = () => {
    setLoading(true);
    listarSolicitudesAdminApi()
      .then(setSolicitudes)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const cargarMedios = () => {
    setLoading(true);
    listarMediosPagoAdminApi()
      .then(setMedios)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === 'solicitudes') {
      if (subtab === 'usuarios') cargarUsuarios();
      else if (subtab === 'productos') cargarSolicitudesItems();
      else cargarMedios();
    }
  }, [tab, subtab]);

  const handleAprobarUsuario = async (id: number) => {
    try {
      await aprobarPreRegistroAdminApi(id, 'comun', 'USER');
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      Alert.alert('Aprobado', 'El usuario fue aprobado correctamente.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleAprobarMedio = async (id: number) => {
    try {
      await aprobarMedioPagoAdminApi(id);
      setMedios((prev) => prev.filter((m) => m.id !== id));
      Alert.alert('Aprobado', 'El medio de pago fue aprobado correctamente.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleAprobarItem = async (id: number) => {
    try {
      await aprobarSolicitudItemAdminApi(id);
      setSolicitudes((prev) => prev.filter((s) => s.id !== id));
      Alert.alert('Aprobado', 'La solicitud fue aprobada correctamente.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const solicitudesPendientes = solicitudes.filter((s) => s.estado === 'pendiente');

  const tabs: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'solicitudes', label: 'Solicitudes', icon: 'document-text-outline' },
    { key: 'crear-subasta', label: 'Nueva Subasta', icon: 'hammer-outline' },
    { key: 'crear-producto', label: 'Nuevo Producto', icon: 'cube-outline' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel Admin</Text>
        <TouchableOpacity onPress={logout} hitSlop={8}>
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Ionicons name={t.icon} size={16} color={tab === t.key ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'solicitudes' && (
        <View style={{ flex: 1 }}>
          <View style={styles.subtabBar}>
            <TouchableOpacity
              style={[styles.subtab, subtab === 'usuarios' && styles.subtabActive]}
              onPress={() => setSubtab('usuarios')}
            >
              <Ionicons
                name="people-outline"
                size={14}
                color={subtab === 'usuarios' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text style={[styles.subtabText, subtab === 'usuarios' && styles.subtabTextActive]}>
                Usuarios Pendientes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.subtab, subtab === 'productos' && styles.subtabActive]}
              onPress={() => setSubtab('productos')}
            >
              <Ionicons
                name="cube-outline"
                size={14}
                color={subtab === 'productos' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text style={[styles.subtabText, subtab === 'productos' && styles.subtabTextActive]}>
                Productos Pendientes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.subtab, subtab === 'medios' && styles.subtabActive]}
              onPress={() => setSubtab('medios')}
            >
              <Ionicons
                name="card-outline"
                size={14}
                color={subtab === 'medios' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text style={[styles.subtabText, subtab === 'medios' && styles.subtabTextActive]}>
                Medios Pendientes
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
          ) : subtab === 'usuarios' ? (
            <FlatList
              data={usuarios}
              keyExtractor={(u) => String(u.id)}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="checkmark-done-outline" size={48} color={colors.success} />
                  <Text style={styles.emptyText}>No hay usuarios pendientes</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardDesc}>{item.nombre} {item.apellido}</Text>
                    <Text style={styles.cardPrecio}>{item.email}</Text>
                    <Text style={styles.cardFecha}>{item.fechaSolicitud}</Text>
                  </View>
                  <TouchableOpacity style={styles.aprobarBtn} onPress={() => handleAprobarUsuario(item.id)}>
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : subtab === 'productos' ? (
            <FlatList
              data={solicitudesPendientes}
              keyExtractor={(s) => String(s.id)}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="checkmark-done-outline" size={48} color={colors.success} />
                  <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>
                    {item.precioSugerido != null && (
                      <Text style={styles.cardPrecio}>
                        Precio: ${Number(item.precioSugerido).toLocaleString('es-AR')}
                      </Text>
                    )}
                    <Text style={styles.cardFecha}>{item.fechaSolicitud}</Text>
                  </View>
                  <TouchableOpacity style={styles.aprobarBtn} onPress={() => handleAprobarItem(item.id)}>
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <FlatList
              data={medios}
              keyExtractor={(m) => String(m.id)}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="checkmark-done-outline" size={48} color={colors.success} />
                  <Text style={styles.emptyText}>No hay medios de pago pendientes</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardDesc}>{TIPO_LABELS[item.tipo] ?? item.tipo}</Text>
                    <Text style={styles.cardPrecio}>{item.entidad} — {item.numero}</Text>
                    <View style={styles.pendienteBadge}>
                      <Text style={styles.pendienteText}>Pendiente</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.aprobarBtn} onPress={() => handleAprobarMedio(item.id)}>
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      )}

      {tab === 'crear-subasta' && <CrearSubastaForm />}
      {tab === 'crear-producto' && <CrearProductoForm />}
    </SafeAreaView>
  );
};

const CrearSubastaForm = () => {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [categoria, setCategoria] = useState('comun');
  const [moneda, setMoneda] = useState('ARS');
  const [saving, setSaving] = useState(false);

  const handleCrear = async () => {
    if (!fecha || !hora || !ubicacion || !capacidad) {
      Alert.alert('Error', 'Completá todos los campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      await crearSubastaAdminApi({
        fecha, hora, ubicacion, moneda, categoria,
        capacidadAsistentes: parseInt(capacidad, 10),
        tieneDeposito: 'no', seguridadPropia: 'no',
      });
      Alert.alert('Creada', 'Subasta creada correctamente');
      setFecha(''); setHora(''); setUbicacion(''); setCapacidad('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollForm>
      <Text style={styles.fieldLabel}>Fecha (YYYY-MM-DD) *</Text>
      <TextInput style={styles.input} value={fecha} onChangeText={setFecha} placeholder="2026-06-15" />
      <Text style={styles.fieldLabel}>Hora (HH:MM) *</Text>
      <TextInput style={styles.input} value={hora} onChangeText={setHora} placeholder="18:00" />
      <Text style={styles.fieldLabel}>Ubicación *</Text>
      <TextInput style={styles.input} value={ubicacion} onChangeText={setUbicacion} placeholder="Dirección del evento" />
      <Text style={styles.fieldLabel}>Capacidad asistentes *</Text>
      <TextInput style={styles.input} value={capacidad} onChangeText={setCapacidad} keyboardType="numeric" />
      <Text style={styles.fieldLabel}>Categoría</Text>
      <View style={styles.row}>
        {['comun', 'especial', 'plata', 'oro', 'platino'].map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, categoria === c && styles.chipActive]}
            onPress={() => setCategoria(c)}
          >
            <Text style={[styles.chipText, categoria === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.fieldLabel}>Moneda</Text>
      <View style={styles.row}>
        {['ARS', 'USD'].map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.chip, moneda === m && styles.chipActive]}
            onPress={() => setMoneda(m)}
          >
            <Text style={[styles.chipText, moneda === m && styles.chipTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.btn} onPress={handleCrear} disabled={saving}>
        {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Crear Subasta</Text>}
      </TouchableOpacity>
    </ScrollForm>
  );
};

const CrearProductoForm = () => {
  const [descCatalogo, setDescCatalogo] = useState('');
  const [descCompleta, setDescCompleta] = useState('');
  const [duenio, setDuenio] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCrear = async () => {
    if (!descCatalogo.trim() || !descCompleta.trim() || !duenio.trim()) {
      Alert.alert('Error', 'Completá todos los campos');
      return;
    }
    setSaving(true);
    try {
      await crearProductoAdminApi({ descripcionCatalogo: descCatalogo, descripcionCompleta: descCompleta, duenio: parseInt(duenio, 10) });
      Alert.alert('Creado', 'Producto creado correctamente');
      setDescCatalogo(''); setDescCompleta(''); setDuenio('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollForm>
      <Text style={styles.fieldLabel}>Descripción para catálogo *</Text>
      <TextInput style={styles.input} value={descCatalogo} onChangeText={setDescCatalogo} placeholder="Nombre corto" />
      <Text style={styles.fieldLabel}>Descripción completa *</Text>
      <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={descCompleta} onChangeText={setDescCompleta} multiline maxLength={300} placeholder="Detalles del producto" />
      <Text style={styles.fieldLabel}>ID del dueño *</Text>
      <TextInput style={styles.input} value={duenio} onChangeText={setDuenio} keyboardType="numeric" placeholder="ID del cliente dueño" />
      <TouchableOpacity style={styles.btn} onPress={handleCrear} disabled={saving}>
        {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Crear Producto</Text>}
      </TouchableOpacity>
    </ScrollForm>
  );
};

const ScrollForm = ({ children }: { children: React.ReactNode }) => (
  <ScrollView contentContainerStyle={styles.formContainer}>
    {children}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  tabBar: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  tabActive: { backgroundColor: colors.secondary + '20' },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  subtabBar: {
    flexDirection: 'row', backgroundColor: colors.background,
    paddingHorizontal: 16, paddingVertical: 8, gap: 8,
  },
  subtab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: colors.surface,
  },
  subtabActive: { backgroundColor: colors.primary },
  subtabText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  subtabTextActive: { color: '#FFFFFF' },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2,
  },
  cardInfo: { flex: 1, gap: 2 },
  cardDesc: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  cardPrecio: { fontSize: 12, color: colors.textSecondary },
  cardFecha: { fontSize: 11, color: colors.textDisabled },
  aprobarBtn: {
    backgroundColor: colors.success, width: 36, height: 36,
    borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  pendienteBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  pendienteText: { fontSize: 10, color: colors.warning, fontWeight: '700' },
  formContainer: { padding: 20, gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  btn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 20,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
