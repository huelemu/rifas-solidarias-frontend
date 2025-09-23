// src/app/institutions/models/institution.models.ts

/**
 * Tipos de instituciones disponibles
 */
export type InstitutionType = 'club' | 'fundacion' | 'ong' | 'cooperativa' | 'escuela' | 'otro';

/**
 * Estados de una institución
 */
export type InstitutionStatus = 'activa' | 'inactiva' | 'suspendida';

/**
 * Interfaz principal para institución
 */
export interface Institution {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: InstitutionType;
  estado: InstitutionStatus;
  logo_url?: string;
  sitio_web?: string;
  contacto_email: string;
  contacto_telefono?: string;
  contacto_whatsapp?: string;
  direccion?: string;
  cuit_cuil?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_creador_id?: number;
  observaciones?: string;
}

/**
 * Interfaz extendida con información adicional
 */
export interface InstitutionExtended extends Institution {
  // Estadísticas adicionales
  total_usuarios?: number;
  total_rifas_promotoras?: number;
  total_participaciones?: number;
  total_ventas?: number;
  usuario_creador_nombre?: string;
  // Información de administradores
  administradores?: Array<{
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    activo: boolean;
  }>;
}

/**
 * Interfaz para crear institución
 */
export interface CreateInstitutionRequest {
  nombre: string;
  descripcion?: string;
  tipo: InstitutionType;
  contacto_email: string;
  contacto_telefono?: string;
  contacto_whatsapp?: string;
  sitio_web?: string;
  direccion?: string;
  cuit_cuil?: string;
  estado?: InstitutionStatus;
  observaciones?: string;
}

/**
 * Interfaz para actualizar institución
 */
export interface UpdateInstitutionRequest {
  nombre?: string;
  descripcion?: string;
  tipo?: InstitutionType;
  contacto_email?: string;
  contacto_telefono?: string;
  contacto_whatsapp?: string;
  sitio_web?: string;
  direccion?: string;
  cuit_cuil?: string;
  estado?: InstitutionStatus;
  observaciones?: string;
  logo_url?: string;
}

/**
 * Respuesta del backend para listar instituciones
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

/**
 * Respuesta del backend para institución individual
 */
export interface InstitutionResponse {
  status: string;
  message: string;
  data: Institution | {
    institucion: Institution;
  };
}

/**
 * Filtros para búsqueda de instituciones
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
 * Estadísticas generales de instituciones
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
 * Información detallada de una institución
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

/**
 * Opciones para asignar administrador
 */
export interface AssignAdminRequest {
  usuario_id: number;
  permisos?: string[];
}

/**
 * Respuesta de operaciones
 */
export interface InstitutionOperationResponse {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

/**
 * Configuración de la institución
 */
export interface InstitutionSettings {
  permite_auto_registro: boolean;
  requiere_aprobacion_vendedores: boolean;
  comision_default: number;
  limite_rifas_simultaneas: number;
  notificaciones_email: boolean;
  notificaciones_whatsapp: boolean;
}

/**
 * Interfaz para validaciones
 */
export interface InstitutionValidation {
  nombre: {
    valid: boolean;
    errors: string[];
  };
  contacto_email: {
    valid: boolean;
    errors: string[];
  };
  tipo: {
    valid: boolean;
    errors: string[];
  };
  cuit_cuil: {
    valid: boolean;
    errors: string[];
  };
}

/**
 * Constantes útiles
 */
export const INSTITUTION_TYPES: Array<{value: InstitutionType, label: string}> = [
  { value: 'club', label: 'Club Deportivo' },
  { value: 'fundacion', label: 'Fundación' },
  { value: 'ong', label: 'ONG' },
  { value: 'cooperativa', label: 'Cooperativa' },
  { value: 'escuela', label: 'Institución Educativa' },
  { value: 'otro', label: 'Otro' }
];

export const INSTITUTION_STATUSES: Array<{value: InstitutionStatus, label: string, class: string}> = [
  { value: 'activa', label: 'Activa', class: 'status-active' },
  { value: 'inactiva', label: 'Inactiva', class: 'status-inactive' },
  { value: 'suspendida', label: 'Suspendida', class: 'status-suspended' }
];