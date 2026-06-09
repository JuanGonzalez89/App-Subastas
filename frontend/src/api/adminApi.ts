import api from './axiosInstance';
import { MedioPagoResponse, PreRegistracionResponse, SolicitudItemResponse } from '../types';

export interface CrearSubastaRequest {
  fecha: string;
  hora: string;
  ubicacion: string;
  capacidadAsistentes: number;
  categoria: string;
  moneda: string;
  tieneDeposito: string;
  seguridadPropia: string;
}

export interface CrearProductoRequest {
  descripcionCatalogo: string;
  descripcionCompleta: string;
  duenio: number;
}

export interface VincularItemCatalogoRequest {
  productoId: number;
  precioBase: number;
  comision: number;
}

export const listarSolicitudesUsuariosApi = (): Promise<PreRegistracionResponse[]> =>
  api.get('/admin/solicitudes-usuarios').then((r) => r.data);

export const listarSolicitudesAdminApi = (): Promise<SolicitudItemResponse[]> =>
  api.get('/admin/solicitudes-items').then((r) => r.data);

export const aprobarSolicitudItemAdminApi = (id: number): Promise<void> =>
  api.post(`/admin/solicitudes-items/${id}/aprobar`).then(() => undefined);

export const crearSubastaAdminApi = (data: CrearSubastaRequest): Promise<void> =>
  api.post('/admin/subastas', data).then(() => undefined);

export const crearProductoAdminApi = (data: CrearProductoRequest): Promise<void> =>
  api.post('/admin/productos', data).then(() => undefined);

export const crearCatalogoAdminApi = (subastaId: number, descripcion: string): Promise<void> =>
  api.post(`/admin/catalogos/${subastaId}?descripcion=${encodeURIComponent(descripcion)}`).then(() => undefined);

export const vincularItemCatalogoAdminApi = (catalogoId: number, data: VincularItemCatalogoRequest): Promise<void> =>
  api.post(`/admin/itemscatalogo/${catalogoId}`, data).then(() => undefined);

export const aprobarPreRegistroAdminApi = (preRegistracionId: number, categoria: string, rol: string = 'USER'): Promise<void> =>
  api.post(`/auth/admin/aprobar/${preRegistracionId}?categoria=${categoria}&rol=${rol}`).then(() => undefined);

export const listarMediosPagoAdminApi = (): Promise<MedioPagoResponse[]> =>
  api.get('/admin/medios-pago').then((r) => r.data);

export const aprobarMedioPagoAdminApi = (id: number): Promise<void> =>
  api.post(`/admin/medios-pago/${id}/aprobar`).then(() => undefined);
