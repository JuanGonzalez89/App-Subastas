import api from './axiosInstance';
import { AuthResponse, LoginRequest, RegistroStep1Request, RegistroStep2Request } from '../types';

export const registroPaso1Api = (data: RegistroStep1Request): Promise<{ mensaje: string }> =>
  api.post('/auth/registro/paso1', data).then((r) => r.data);

export const registroPaso2Api = (data: RegistroStep2Request): Promise<{ mensaje: string }> =>
  api.post('/auth/registro/paso2', data).then((r) => r.data);

export const loginApi = (data: LoginRequest): Promise<AuthResponse> =>
  api.post('/auth/login', data).then((r) => r.data);
