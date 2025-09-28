// src/app/auth/models/auth.models.ts - VERSIÓN CORREGIDA

/**
 * Interfaz para la petición de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interfaz para la respuesta del login
 */
export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

/**
 * Interfaz para la respuesta del registro
 */
export interface RegisterResponse {
  success: boolean;
  data?: {
    user: User;
  };
  message: string;
}

/**
 * Interfaz para los datos del usuario
 */
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  institucion_id?: number;
  institucion?: Institucion;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interfaz para los datos de institución
 */
export interface Institucion {
  id: number;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
}

/**
 * ✅ CORREGIDA: Interfaz para la petición de registro
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  institucion_id?: number;
  // ✨ CAMPOS AGREGADOS
  telefono?: string;
  dni?: string;
}

/**
 * Tipos de roles disponibles en el sistema
 */
export type UserRole = 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';

/**
 * Estado de autenticación de la aplicación
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Interfaz para errores de API
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Interfaz genérica para respuestas de API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
}

/**
 * Interfaz para refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Interfaz para refresh token response
 */
export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}