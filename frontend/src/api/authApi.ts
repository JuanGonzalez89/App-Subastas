import axiosInstance from './axiosInstance';
import { AuthResponse, LoginRequest, RegistroStep1Request, RegistroStep2Request } from '../types';

export const registroPaso1Api = (data: RegistroStep1Request): Promise<{ mensaje: string }> =>
  axiosInstance.post('/auth/registro/paso1', data).then((r) => r.data);

export const registroPaso2Api = (data: RegistroStep2Request): Promise<{ mensaje: string }> =>
  axiosInstance.post('/auth/registro/paso2', data).then((r) => r.data);

export const loginApi = (data: LoginRequest): Promise<AuthResponse> =>
  axiosInstance.post('/auth/login', data).then((r) => r.data);
