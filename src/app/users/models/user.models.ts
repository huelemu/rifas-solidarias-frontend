// src/app/users/models/user.models.ts

import { UserRole } from '../../auth/models/auth.models';

/**
 * Interfaz para usuario extendida (para gestión)
 */
export interface UserExtended {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: UserRole;
  estado: 'activo' | 'inactivo' | 'suspendido';
  institucion_id?: number;
  institucion_nombre?: string;
  created_at: string;
  updated_at: string;
  ultimo_acceso?: string;
}

/**
 * Interfaz para crear usuario
 */
export interface CreateUserRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: UserRole;
  institucion_id?: number;
  estado?: 'activo' | 'inactivo';
}

/**
 * Interfaz para actualizar usuario
 */
export interface UpdateUserRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  rol?: UserRole;
  institucion_id?: number;
  estado?: 'activo' | 'inactivo' | 'suspendido';
}

/**
 * Respuesta del backend para listar usuarios
 */
export interface UsersListResponse {
  status: string;
  message: string;
  data: {
    usuarios: UserExtended[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Respuesta del backend para usuario individual
 */
export interface UserResponse {
  status: string;
  message: string;
  data: {
    usuario: UserExtended;
  };
}

/**
 * Filtros para búsqueda de usuarios
 */
export interface UserFilters {
  search?: string;
  rol?: UserRole | 'todos';
  estado?: 'activo' | 'inactivo' | 'suspendido' | 'todos';
  institucion_id?: number;
  page?: number;
  limit?: number;
}

/**
 * Estadísticas de usuarios
 */
export interface UserStats {
  total: number;
  activos: number;
  inactivos: number;
  por_rol: {
    admin_global: number;
    admin_institucion: number;
    vendedor: number;
    comprador: number;
  };
  por_institucion: Array<{
    institucion_id: number;
    institucion_nombre: string;
    cantidad: number;
  }>;
}