import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const MOBILE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';
const BASE_URL = Platform.OS === 'web' ? 'http://localhost:8080' : MOBILE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Sin conexión al servidor. Verificá tu conexión a internet.'));
    }
    const mensaje = error.response.data?.error ?? 'Ocurrió un error inesperado.';
    return Promise.reject(new Error(mensaje));
  }
);

export default axiosInstance;
