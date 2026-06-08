import api from './axiosInstance';
import { ConectarResponse, PujaRequest, PujaResponse } from '../types';

export const conectarSubastaApi = (subastaId: number): Promise<ConectarResponse> =>
  api.post(`/subastas/${subastaId}/conectar`).then((r) => r.data);

export const pujarApi = (subastaId: number, data: PujaRequest): Promise<PujaResponse> =>
  api.post(`/subastas/${subastaId}/pujas`, data).then((r) => r.data);

export const listarPujasApi = (subastaId: number, itemId: number): Promise<PujaResponse[]> =>
  api.get(`/subastas/${subastaId}/pujas`, { params: { itemId } }).then((r) => r.data);
