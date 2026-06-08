import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { registroPaso1Api } from '../../api/authApi';
import { colors } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/AuthStack';

type Props = {
  route: RouteProp<AuthStackParamList, 'RegisterDNI'>;
  navigation: StackNavigationProp<AuthStackParamList, 'RegisterDNI'>;
};

export const RegisterDNIScreen = ({ route, navigation }: Props) => {
  const params = route.params;
  const [frente, setFrente]       = useState<string | null>(null);
  const [frenteB64, setFrenteB64] = useState<string | undefined>(undefined);
  const [dorso, setDorso]         = useState<string | null>(null);
  const [dorsoB64, setDorsoB64]   = useState<string | undefined>(undefined);
  const [loading, setLoading]     = useState(false);

  const pickImage = async (side: 'frente' | 'dorso') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir el DNI.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const b64 = result.assets[0].base64 ?? undefined;
      if (side === 'frente') { setFrente(uri); setFrenteB64(b64); }
      else                   { setDorso(uri);  setDorsoB64(b64);  }
    }
  };

  const handleContinuar = async () => {
    if (!frente || !dorso) {
      Alert.alert('Fotos requeridas', 'Por favor subí ambas fotos del DNI (frente y dorso).');
      return;
    }
    setLoading(true);
    try {
      await registroPaso1Api({
        nombre:           params.nombre,
        apellido:         params.apellido,
        email:            params.email,
        numeroDocumento:  params.numeroDocumento,
        domicilio:        params.domicilio,
        numeroPais:       params.numeroPais,
        documentoFrente:  frenteB64,
        documentoDorso:   dorsoB64,
      });
      Alert.alert(
        'Solicitud enviada',
        'La empresa revisará tus documentos. Cuando sea aprobado recibirás un email con tu token.',
        [{ text: 'Entendido', onPress: () => navigation.navigate('RegisterStep3', { email: params.email }) }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Registro - Paso 2 de 3</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* ── Barra de progreso ── */}
      <View style={styles.progressBar}>
        <View style={[styles.progressSeg, styles.progressDone]} />
        <View style={[styles.progressSeg, styles.progressActive]} />
        <View style={styles.progressSeg} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verificación de Identidad</Text>
          <Text style={styles.cardSub}>
            Sube fotos claras de tu documento de identidad (frente y dorso)
          </Text>

          {/* DNI Frente */}
          <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('frente')} activeOpacity={0.8}>
            {frente ? (
              <Image source={{ uri: frente }} style={styles.uploadPreview} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={32} color={colors.textSecondary} />
                <Text style={styles.uploadTitle}>DNI - Frente</Text>
                <Text style={styles.uploadSub}>Click para subir imagen</Text>
              </>
            )}
          </TouchableOpacity>

          {/* DNI Dorso */}
          <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('dorso')} activeOpacity={0.8}>
            {dorso ? (
              <Image source={{ uri: dorso }} style={styles.uploadPreview} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={32} color={colors.textSecondary} />
                <Text style={styles.uploadTitle}>DNI - Dorso</Text>
                <Text style={styles.uploadSub}>Click para subir imagen</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Asegúrate de que la foto sea clara y todos los datos sean legibles. La verificación puede tardar hasta 24 horas.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, loading && styles.continueBtnDisabled]}
          onPress={handleContinuar}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            {loading ? 'Enviando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  progressDone: { backgroundColor: colors.secondary },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 1,
    gap: 14,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  cardSub: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  uploadPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  uploadSub: { fontSize: 12, color: colors.textSecondary },
  disclaimer: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  continueBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.6 },
  continueBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
