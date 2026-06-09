export interface UsuarioResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  categoria: string;
  admitido: string;
  rol?: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  usuario: UsuarioResponse;
}

export interface LoginRequest {
  email: string;
  clavePersonal: string;
}

export interface RegistroStep1Request {
  nombre: string;
  apellido: string;
  email: string;
  numeroDocumento: string;
  documentoFrente?: string;
  documentoDorso?: string;
  domicilio?: string;
  numeroPais?: number;
}

export interface RegistroStep2Request {
  token: string;
  clavePersonal: string;
}

export interface ApiError {
  error: string;
  campos?: Record<string, string>;
}

export interface SubastaResponse {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  ubicacion: string;
  categoria: string;
  moneda: string;
  subastador?: string;
  puedeAcceder: boolean;
}

export interface ItemResponse {
  id: number;
  numeroPieza: number;
  descripcion: string;
  precioBase?: number;
  subastado: string;
  fotoIds: number[];
  descripcionCompleta?: string;
  disenador?: string;
  origenDilenador?: string;
}

export interface PerfilResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  documento?: string;
  direccion?: string;
  numeroPais?: number;
  categoria: string;
  admitido: string;
}

export interface MedioPagoResponse {
  id: number;
  tipo: string;
  entidad: string;
  numero: string;
  montoGarantizado?: number;
  verificado: string;
}

export interface MedioPagoRequest {
  tipo: string;
  entidad: string;
  numero: string;
  montoGarantizado?: number;
}

export interface ConectarResponse {
  asistenteId: number;
  numeroPostor: number;
}

export interface PujaRequest {
  itemId: number;
  monto: number;
}

export interface PujaResponse {
  id: number;
  asistenteId: number;
  numeroPostor: number;
  monto: number;
  ganador: string;
  esPropio: boolean;
}

export interface PujaHistorialItem {
  pujaId: number;
  subastaId: number;
  itemId: number;
  monto: number;
  ganador: string;
}

export interface HistorialResponse {
  subastasAsistidas: number;
  subastasGanadas: number;
  importeTotalOfertado: number;
  pujas: PujaHistorialItem[];
}

export interface SolicitudItemRequest {
  descripcion: string;
  descripcionCompleta?: string;
  precioSugerido?: number;
  fotoIds?: number[];
}

export interface PreRegistracionResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  fechaSolicitud: string;
}

export interface SolicitudItemResponse {
  id: number;
  descripcion: string;
  descripcionCompleta?: string;
  precioSugerido?: number;
  estado: string;
  fechaSolicitud: string;
  fotoIds?: number[];
}
