import axiosInstance from './axiosInstance';
import { ItemResponse, SubastaResponse } from '../types';

export const listarSubastasApi = (categoria?: string): Promise<SubastaResponse[]> => {
  const params = categoria ? { categoria } : {};
  return axiosInstance.get('/subastas', { params }).then((r) => r.data);
};

export const obtenerSubastaApi = (id: number): Promise<SubastaResponse> =>
  axiosInstance.get(`/subastas/${id}`).then((r) => r.data);

export const listarItemsApi = (subastaId: number): Promise<ItemResponse[]> =>
  axiosInstance.get(`/subastas/${subastaId}/items`).then((r) => r.data);

export const obtenerItemApi = (itemId: number): Promise<ItemResponse> =>
  axiosInstance.get(`/items/${itemId}`).then((r) => r.data);

export const getFotoUrl = (fotoId: number): string => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';
  return `${baseUrl}/fotos/${fotoId}`;
};
