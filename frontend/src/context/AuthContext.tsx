import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginApi } from '../api/authApi';
import { LoginRequest, UsuarioResponse } from '../types';

interface AuthContextType {
  user: UsuarioResponse | null;
  token: string | null;
  loading: boolean;
  isGuest: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  enterAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UsuarioResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    cargarSesionGuardada();
  }, []);

  const cargarSesionGuardada = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          try { await SecureStore.deleteItemAsync('token'); } catch (_) {}
          try { await SecureStore.deleteItemAsync('user'); } catch (_) {}
        }
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    const response = await loginApi(data);
    await SecureStore.setItemAsync('token', response.token);
    await SecureStore.setItemAsync('user', JSON.stringify(response.usuario));
    setToken(response.token);
    setUser(response.usuario);
    setIsGuest(false);
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    } catch (_) {}
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const enterAsGuest = () => {
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isGuest, login, logout, enterAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
