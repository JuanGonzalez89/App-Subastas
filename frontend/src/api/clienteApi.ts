import api from './axiosInstance';
import {
  HistorialResponse,
  MedioPagoRequest,
  MedioPagoResponse,
  PerfilResponse,
  SolicitudItemRequest,
  SolicitudItemResponse,
} from '../types';

// ── Perfil ─────────────────────────────────────────────────────────────────
export const obtenerPerfilApi = (): Promise<PerfilResponse> =>
  api.get('/clientes/me').then((r) => r.data);

// ── Medios de pago ─────────────────────────────────────────────────────────
export const listarMediosPagoApi = (): Promise<MedioPagoResponse[]> =>
  api.get('/clientes/me/medios-pago').then((r) => r.data);

export const agregarMedioPagoApi = (data: MedioPagoRequest): Promise<MedioPagoResponse> =>
  api.post('/clientes/me/medios-pago', data).then((r) => r.data);

export const eliminarMedioPagoApi = (id: number): Promise<void> =>
  api.delete(`/clientes/me/medios-pago/${id}`).then(() => undefined);

// ── Historial ──────────────────────────────────────────────────────────────
export const obtenerHistorialApi = (): Promise<HistorialResponse> =>
  api.get('/clientes/me/historial').then((r) => r.data);

// ── Solicitar ítem ─────────────────────────────────────────────────────────
export const solicitarItemApi = (data: SolicitudItemRequest): Promise<SolicitudItemResponse> =>
  api.post('/clientes/me/solicitudes-items', data).then((r) => r.data);

export const listarMisSolicitudesApi = (): Promise<SolicitudItemResponse[]> =>
  api.get('/clientes/me/solicitudes-items').then((r) => r.data);
