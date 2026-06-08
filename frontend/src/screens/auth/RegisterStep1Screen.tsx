import React, { useState } from 'react';
import {
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
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/AuthStack';

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'RegisterStep1'> };

const PAISES = [
  { numero: 1, nombre: 'Argentina' },
  { numero: 2, nombre: 'Brasil' },
  { numero: 3, nombre: 'Uruguay' },
  { numero: 4, nombre: 'Chile' },
  { numero: 5, nombre: 'Paraguay' },
  { numero: 9, nombre: 'Estados Unidos' },
  { numero: 10, nombre: 'España' },
];

export const RegisterStep1Screen = ({ navigation }: Props) => {
  const [nombre, setNombre]     = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail]       = useState('');
  const [documento, setDocumento] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [paisIdx, setPaisIdx]   = useState(0);
  const [showPaises, setShowPaises] = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  const validar = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = 'Requerido';
    if (!apellido.trim()) e.apellido = 'Requerido';
    if (!email.trim()) e.email = 'Requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido';
    if (!documento.trim()) e.documento = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinuar = () => {
    if (!validar()) return;
    navigation.navigate('RegisterDNI', {
      nombre:          nombre.trim(),
      apellido:        apellido.trim(),
      email:           email.trim().toLowerCase(),
      numeroDocumento: documento.trim(),
      domicilio:       domicilio.trim(),
      numeroPais:      PAISES[paisIdx].numero,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* ── Header ── */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Registro - Paso 1 de 3</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* ── Barra de progreso ── */}
        <View style={styles.progressBar}>
          <View style={[styles.progressSeg, styles.progressActive]} />
          <View style={styles.progressSeg} />
          <View style={styles.progressSeg} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datos Personales</Text>

            <Field label="Nombre" value={nombre} onChange={setNombre}
              placeholder="Ingresa tu nombre" error={errors.nombre} />
            <Field label="Apellido" value={apellido} onChange={setApellido}
              placeholder="Ingresa tu apellido" error={errors.apellido} />
            <Field label="Email" value={email} onChange={setEmail}
              placeholder="tu@email.com" error={errors.email}
              keyboardType="email-address" autoCapitalize="none" />
            <Field label="Número de documento" value={documento} onChange={setDocumento}
              placeholder="DNI o pasaporte" error={errors.documento}
              keyboardType="numeric" />
            <Field label="Domicilio" value={domicilio} onChange={setDomicilio}
              placeholder="Calle, número, ciudad" />

            {/* ── País selector ── */}
            <Text style={styles.label}>País</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setShowPaises(!showPaises)}
              activeOpacity={0.8}
            >
              <Text style={styles.pickerBtnText}>{PAISES[paisIdx].nombre}</Text>
              <Ionicons
                name={showPaises ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {showPaises && (
              <View style={styles.dropdown}>
                {PAISES.map((p, i) => (
                  <TouchableOpacity
                    key={p.numero}
                    style={[styles.dropItem, i === paisIdx && styles.dropItemActive]}
                    onPress={() => { setPaisIdx(i); setShowPaises(false); }}
                  >
                    <Text style={[styles.dropItemText, i === paisIdx && styles.dropItemTextActive]}>
                      {p.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.continueBtn} onPress={handleContinuar} activeOpacity={0.85}>
            <Text style={styles.continueBtnText}>Continuar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Field = ({
  label, value, onChange, placeholder, error, keyboardType, autoCapitalize,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; error?: string;
  keyboardType?: any; autoCapitalize?: any;
}) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textDisabled}
      keyboardType={keyboardType ?? 'default'}
      autoCapitalize={autoCapitalize ?? 'words'}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F0' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  topTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  progressBar: { flexDirection: 'row', gap: 4, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF' },
  progressSeg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#E0E0E0' },
  progressActive: { backgroundColor: colors.textPrimary },
  scroll: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  inputError: { borderColor: colors.error },
  errorText: { fontSize: 11, color: colors.error, marginTop: 4 },
  pickerBtn: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  pickerBtnText: { fontSize: 14, color: colors.textPrimary },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginTop: 4,
    overflow: 'hidden',
    elevation: 4,
  },
  dropItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dropItemActive: { backgroundColor: '#F5F0E8' },
  dropItemText: { fontSize: 14, color: colors.textPrimary },
  dropItemTextActive: { fontWeight: '700', color: colors.secondary },

  continueBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  continueBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
