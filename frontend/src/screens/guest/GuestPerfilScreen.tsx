import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

const GOLD = '#C9A84C';
const DARK = '#0D1B2A';

export const GuestPerfilScreen = () => {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="person-outline" size={52} color={GOLD} />
        </View>

        <Text style={styles.title}>Modo invitado</Text>
        <Text style={styles.subtitle}>
          Estás navegando sin cuenta. Registrate o iniciá sesión para acceder a tu perfil, historial de pujas y mucho más.
        </Text>

        <View style={styles.featureList}>
          <FeatureRow icon="hammer-outline"   text="Participar en subastas en vivo" />
          <FeatureRow icon="eye-outline"       text="Ver precios base de los ítems" />
          <FeatureRow icon="time-outline"      text="Ver tu historial de pujas" />
          <FeatureRow icon="card-outline"      text="Registrar medios de pago" />
          <FeatureRow icon="cube-outline"      text="Solicitar subastar tus artículos" />
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={logout}>
          <Ionicons name="log-in-outline" size={20} color={DARK} />
          <Text style={styles.loginBtnText}>Iniciar sesión / Registrarse</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const FeatureRow = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.featureRow}>
    <Ionicons name={icon} size={16} color={GOLD} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 0,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#132233',
    borderWidth: 2,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  featureList: {
    width: '100%',
    backgroundColor: '#132233',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#1E3045',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
  },
});
