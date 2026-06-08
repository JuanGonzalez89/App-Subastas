import React, { useState } from 'react';
import {
  Alert,
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
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { registroPaso2Api } from '../../api/authApi';
import { colors } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/AuthStack';

type Props = {
  route: RouteProp<AuthStackParamList, 'RegisterStep3'>;
  navigation: StackNavigationProp<AuthStackParamList, 'RegisterStep3'>;
};

export const RegisterStep3Screen = ({ navigation }: Props) => {
  const [token, setToken]         = useState('');
  const [pin, setPin]             = useState('');
  const [confirmarPin, setConfirmarPin] = useState('');
  const [accepted, setAccepted]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const validar = () => {
    const e: Record<string, string> = {};
    if (!token.trim()) e.token = 'El token es obligatorio';
    if (!pin.trim()) e.pin = 'El PIN es obligatorio';
    else if (pin.length < 6) e.pin = 'Mínimo 6 caracteres';
    if (pin !== confirmarPin) e.confirmarPin = 'Los PIN no coinciden';
    if (!accepted) e.accepted = 'Debés aceptar los términos';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFinalizar = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      await registroPaso2Api({ token: token.trim(), clavePersonal: pin });
      Alert.alert(
        '¡Registro completo!',
        'Tu cuenta está lista. Ya podés iniciar sesión.',
        [{ text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.topTitle}>Registro - Paso 3 de 3</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* ── Barra de progreso ── */}
        <View style={styles.progressBar}>
          <View style={[styles.progressSeg, styles.progressDone]} />
          <View style={[styles.progressSeg, styles.progressDone]} />
          <View style={[styles.progressSeg, styles.progressActive]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crear PIN de Seguridad</Text>
            <Text style={styles.cardSub}>
              Este PIN será requerido para confirmar pujas y transacciones importantes
            </Text>

            <Field
              label="Token de confirmación (recibido por email)"
              value={token}
              onChange={setToken}
              placeholder="Pegá el token aquí"
              error={errors.token}
              autoCapitalize="none"
            />

            <Field
              label="PIN (mínimo 6 dígitos)"
              value={pin}
              onChange={setPin}
              placeholder="••••••"
              error={errors.pin}
              secureTextEntry
            />

            <Field
              label="Confirmar PIN"
              value={confirmarPin}
              onChange={setConfirmarPin}
              placeholder="••••••"
              error={errors.confirmarPin}
              secureTextEntry
            />

            {/* Checkbox términos */}
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setAccepted(!accepted)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
                {accepted && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkText}>
                Al crear tu cuenta, aceptas nuestros términos y condiciones y políticas de privacidad. Recibirás un email de confirmación para activar tu cuenta.
              </Text>
            </TouchableOpacity>
            {errors.accepted ? <Text style={styles.errorText}>{errors.accepted}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.finalBtn, loading && styles.finalBtnDisabled]}
            onPress={handleFinalizar}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.finalBtnText}>
              {loading ? 'Procesando...' : 'Finalizar Registro'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Field = ({
  label, value, onChange, placeholder, error, secureTextEntry, autoCapitalize,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; error?: string; secureTextEntry?: boolean; autoCapitalize?: any;
}) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textDisabled}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize ?? 'none'}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F0' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF',
  },
  topTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  progressBar: { flexDirection: 'row', gap: 4, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF' },
  progressSeg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#E0E0E0' },
  progressActive: { backgroundColor: colors.textPrimary },
  progressDone: { backgroundColor: colors.secondary },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    marginBottom: 16, elevation: 1, gap: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  input: {
    backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 14, color: colors.textPrimary,
    borderWidth: 1, borderColor: '#E8E8E8',
  },
  inputError: { borderColor: colors.error },
  errorText: { fontSize: 11, color: colors.error, marginTop: 4 },
  checkRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#CCCCCC',
    justifyContent: 'center', alignItems: 'center', marginTop: 1, flexShrink: 0,
  },
  checkboxActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  checkText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, flex: 1 },
  finalBtn: {
    backgroundColor: colors.textPrimary, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
  },
  finalBtnDisabled: { opacity: 0.6 },
  finalBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
