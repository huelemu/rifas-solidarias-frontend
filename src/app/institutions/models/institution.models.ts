// src/app/institutions/models/institution.models.ts - AJUSTADO A TABLA REAL

export type InstitutionType = 'club' | 'fundacion' | 'ong' | 'cooperativa' | 'escuela' | 'otro';
export type InstitutionStatus = 'activa' | 'inactiva' | 'suspendida';

/**
 * Interfaz principal - COINCIDE CON LA TABLA DE BD
 */
export interface Institution {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: InstitutionType;
  email: string;              // ← BD usa 'email'
  telefono?: string;          // ← BD usa 'telefono'
  direccion?: string;
  cuit?: string;              // ← BD usa 'cuit'
  logo_url?: string;
  estado: InstitutionStatus;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

/**
 * Interfaz extendida con info adicional
 */
export interface InstitutionExtended extends Institution {
  total_usuarios?: number;
  total_rifas_promotoras?: number;
  total_participaciones?: number;
  total_ventas?: number;
  usuario_creador_nombre?: string;
  administradores?: Array<{
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    activo: boolean;
  }>;
}

/**
 * Para CREAR institución - mapea al backend
 */
export interface CreateInstitutionRequest {
  nombre: string;
  descripcion?: string;
  tipo: InstitutionType;
  email: string;              // ← Frontend usa 'contacto_email' pero envía como 'email'
  telefono?: string;          // ← Frontend usa 'contacto_telefono' pero envía como 'telefono'
  direccion?: string;
  cuit?: string;              // ← Frontend usa 'cuit_cuil' pero envía como 'cuit'
  logo_url?: string;
  estado?: InstitutionStatus;
}

/**
 * Para ACTUALIZAR institución - mapea al backend
 */
export interface UpdateInstitutionRequest {
  nombre?: string;
  descripcion?: string;
  tipo?: InstitutionType;
  email?: string;             // ← Mapea contacto_email → email
  telefono?: string;          // ← Mapea contacto_telefono → telefono
  direccion?: string;
  cuit?: string;              // ← Mapea cuit_cuil → cuit
  logo_url?: string;
  estado?: InstitutionStatus;
}

/**
 * Respuestas del backend
 */
export interface InstitutionsListResponse {
  status: string;
  message: string;
  data: Institution[] | {
    instituciones: Institution[];
    pagination?: {
      current_page: number;
      total_pages: number;
      total_records: number;
      per_page: number;
    };
  };
}

export interface InstitutionResponse {
  status: string;
  message: string;
  data: Institution | {
    institucion: Institution;
  };
}

/**
 * Filtros para búsqueda
 */
export interface InstitutionFilters {
  search?: string;
  tipo?: InstitutionType | 'todas';
  estado?: InstitutionStatus | 'todas';
  usuario_creador_id?: number;
  page?: number;
  limit?: number;
  ordenar_por?: 'nombre' | 'fecha_creacion' | 'total_usuarios' | 'total_rifas';
  direccion_orden?: 'asc' | 'desc';
}

/**
 * Estadísticas
 */
export interface InstitutionStats {
  total: number;
  activas: number;
  inactivas: number;
  suspendidas: number;
  por_tipo: {
    club: number;
    fundacion: number;
    ong: number;
    cooperativa: number;
    escuela: number;
    otro: number;
  };
  con_rifas_activas: number;
  total_usuarios_instituciones: number;
  promedio_usuarios_por_institucion: number;
}

/**
 * Detalle completo
 */
export interface InstitutionDetail {
  institucion: InstitutionExtended;
  estadisticas: {
    usuarios: {
      total: number;
      activos: number;
      por_rol: {
        admin_institucion: number;
        vendedor: number;
        comprador: number;
      };
    };
    rifas: {
      promotoras: number;
      participaciones: number;
      activas: number;
      finalizadas: number;
    };
    ventas: {
      total_numeros_vendidos: number;
      total_recaudado: number;
      mes_actual: number;
    };
  };
  actividad_reciente: Array<{
    tipo: 'rifa_creada' | 'usuario_agregado' | 'venta_realizada';
    descripcion: string;
    fecha: string;
    usuario?: string;
  }>;
}

export interface AssignAdminRequest {
  usuario_id: number;
  permisos?: string[];
}

export interface InstitutionOperationResponse {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

/**
 * Constantes
 */
export const INSTITUTION_TYPES = [
  { value: 'club', label: '⚽ Club Deportivo' },
  { value: 'fundacion', label: '🤝 Fundación' },
  { value: 'ong', label: '❤️ ONG' },
  { value: 'cooperativa', label: '🏛️ Cooperativa' },
  { value: 'escuela', label: '🎓 Escuela' },
  { value: 'otro', label: '📋 Otro' }
];

export const INSTITUTION_STATUSES = [
  { value: 'activa', label: '✅ Activa' },
  { value: 'inactiva', label: '⏸️ Inactiva' },
  { value: 'suspendida', label: '🚫 Suspendida' }
];