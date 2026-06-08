import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { registroPaso2Api } from '../../api/authApi';
import { colors } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/AuthStack';

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'RegisterStep2'> };

export const RegisterStep2Screen = ({ navigation }: Props) => {
  const [token, setToken] = useState('');
  const [clave, setClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [errors, setErrors] = useState<{ token?: string; clave?: string; confirmarClave?: string }>({});
  const [loading, setLoading] = useState(false);

  const validar = () => {
    const e: typeof errors = {};
    if (!token.trim()) e.token = 'El token es obligatorio';
    if (!clave.trim()) e.clave = 'La clave es obligatoria';
    else if (clave.length < 6) e.clave = 'La clave debe tener al menos 6 caracteres';
    if (clave !== confirmarClave) e.confirmarClave = 'Las claves no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      await registroPaso2Api({ token: token.trim(), clavePersonal: clave });
      Alert.alert(
        'Registro completado',
        '¡Tu cuenta está lista! Ya podés iniciar sesión.',
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Completar registro</Text>
          <Text style={styles.subtitle}>
            Ingresá el token que recibiste por email y creá tu clave personal.
          </Text>

          <Input
            label="Token de confirmación"
            value={token}
            onChangeText={setToken}
            placeholder="Pegá aquí el token del email"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.token}
          />
          <Input
            label="Nueva clave personal"
            value={clave}
            onChangeText={setClave}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
            error={errors.clave}
          />
          <Input
            label="Confirmar clave"
            value={confirmarClave}
            onChangeText={setConfirmarClave}
            secureTextEntry
            placeholder="Repetí tu clave"
            error={errors.confirmarClave}
          />

          <Button title="Completar registro" onPress={handleSubmit} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: { paddingVertical: 16 },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24, lineHeight: 20 },
});
