import React, { useState } from 'react';
import {
  Alert,
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
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthStack';

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'Login'> };

const DARK = '#0D1B2A';
const GOLD = '#C9A84C';
const INPUT_BG = '#1E2D3D';
const BORDER = '#2E3F50';

export const LoginScreen = ({ navigation }: Props) => {
  const { login, enterAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !clave.trim()) {
      Alert.alert('Campos requeridos', 'Completá usuario y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), clavePersonal: clave });
    } catch (e: any) {
      Alert.alert('Error al ingresar', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK} />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Logo ── */}
            <View style={styles.logoArea}>
              <View style={styles.logoCircle}>
                <Ionicons name="hammer" size={44} color={GOLD} />
              </View>
              <Text style={styles.appName}>SUBASTA</Text>
              <Text style={styles.appSub}>Premium Auction House</Text>
            </View>

            {/* ── Formulario ── */}
            <View style={styles.form}>
              <Text style={styles.fieldLabel}>Usuario</Text>
              <TextInput
                style={[styles.input, focusEmail && styles.inputFocus]}
                placeholder="Ingresa tu usuario"
                placeholderTextColor="#4A6278"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusEmail(true)}
                onBlur={() => setFocusEmail(false)}
              />

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Contraseña</Text>
              <View style={styles.passWrapper}>
                <TextInput
                  style={[styles.input, styles.passInput, focusPass && styles.inputFocus]}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor="#4A6278"
                  value={clave}
                  onChangeText={setClave}
                  secureTextEntry={!showPass}
                  onFocus={() => setFocusPass(true)}
                  onBlur={() => setFocusPass(false)}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPass(!showPass)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPass ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#4A6278"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.loginBtnText}>
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterStep1')}
                style={styles.registerLink}
              >
                <Text style={styles.registerLinkText}>
                  ¿No tienes cuenta? <Text style={styles.registerLinkBold}>Regístrate</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('RegisterStep3', { email: email.trim().toLowerCase() || undefined })}
                style={styles.tokenLink}
              >
                <Text style={styles.tokenLinkText}>Ya tengo token de confirmación</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.guestBtn}
                onPress={enterAsGuest}
                activeOpacity={0.85}
              >
                <Text style={styles.guestBtnText}>Ingresar como invitado</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 },

  logoArea: { alignItems: 'center', paddingTop: 60, paddingBottom: 48 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#132233',
    borderWidth: 2,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 6,
  },
  appSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
    marginTop: 4,
  },

  form: { gap: 0 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 8 },
  input: {
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  inputFocus: { borderColor: GOLD },
  passWrapper: { position: 'relative' },
  passInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },

  loginBtn: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 28,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { fontSize: 17, fontWeight: '800', color: '#0D1B2A' },

  registerLink: { alignItems: 'center', marginTop: 22 },
  registerLinkText: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  registerLinkBold: { color: GOLD, fontWeight: '700' },

  tokenLink: { alignItems: 'center', marginTop: 14 },
  tokenLinkText: { fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecorationLine: 'underline' },

  divider: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  dividerText: { fontSize: 13, color: 'rgba(255,255,255,0.35)' },

  guestBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.4)',
    backgroundColor: 'transparent',
  },
  guestBtnText: { fontSize: 15, fontWeight: '600', color: 'rgba(201,168,76,0.85)' },
});
