import api from './axiosInstance';
import {
  CompraResponse,
  HistorialResponse,
  MedioPagoRequest,
  MedioPagoResponse,
  MultaResponse,
  PagoResultResponse,
  PerfilResponse,
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
export const solicitarItemApi = async (descripcion: string, descripcionCompleta: string | undefined, precioSugerido: number | undefined, fotosUris: string[]): Promise<SolicitudItemResponse> => {
  const formData = new FormData();

  formData.append('descripcion', descripcion);
  if (descripcionCompleta?.trim()) {
    formData.append('descripcionCompleta', descripcionCompleta.trim());
  }
  if (precioSugerido != null && !isNaN(precioSugerido)) {
    formData.append('precioSugerido', String(precioSugerido));
  }

  fotosUris.forEach((uri) => {
    const filename = uri.split('/').pop() || 'foto.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const mime = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('fotos', {
      uri,
      name: filename,
      type: mime,
    } as any);
  });

  const response = await api.post('/clientes/me/solicitudes-items', formData);
  return response.data;
};

export const listarMisSolicitudesApi = (): Promise<SolicitudItemResponse[]> =>
  api.get('/clientes/me/solicitudes-items').then((r) => r.data);

export const aceptarCondicionesApi = (id: number): Promise<SolicitudItemResponse> =>
  api.post(`/clientes/me/solicitudes-items/${id}/aceptar`).then((r) => r.data);

export const rechazarCondicionesApi = (id: number): Promise<SolicitudItemResponse> =>
  api.post(`/clientes/me/solicitudes-items/${id}/rechazar-condiciones`).then((r) => r.data);

// ── Mis compras (bienes ganados) ─────────────────────────────────────────────
export const listarComprasApi = (): Promise<CompraResponse[]> =>
  api.get('/clientes/me/compras').then((r) => r.data);

export const pagarCompraApi = (registroId: number, medioPagoId: number): Promise<PagoResultResponse> =>
  api.post(`/clientes/me/compras/${registroId}/pagar`, { medioPagoId }).then((r) => r.data);

// ── Multas ───────────────────────────────────────────────────────────────────
export const listarMultasApi = (): Promise<MultaResponse[]> =>
  api.get('/clientes/me/multas').then((r) => r.data);

export const pagarMultaApi = (id: number): Promise<MultaResponse> =>
  api.post(`/clientes/me/multas/${id}/pagar`).then((r) => r.data);
