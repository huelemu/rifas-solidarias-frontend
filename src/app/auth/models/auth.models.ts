// src/app/auth/models/auth.models.ts - INTERFACES COMPLETAS Y CORREGIDAS

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
 * ⭐ CORREGIDO: Interfaz para la petición de registro
 * MAPEA EXACTAMENTE CON LO QUE ESPERA EL BACKEND
 */
export interface RegisterRequest {
  nombre: string;        // ✅ Backend espera 'nombre'
  apellido: string;      // ✅ Backend espera 'apellido'
  email: string;         // ✅ Campo requerido
  password: string;      // ✅ Campo requerido
  rol?: UserRole;        // ✅ Backend espera 'rol' (opcional, default 'comprador')
  institucion_id?: number; // ✅ Campo opcional
  telefono?: string;     // ✅ Campo opcional
  dni?: string;          // ✅ Campo opcional
}

/**
 * ⭐ CORREGIDO: Interfaz para la respuesta del registro
 * TOKENS OPCIONAL PORQUE EL BACKEND PODRÍA NO INCLUIRLOS
 */
export interface RegisterResponse {
  success: boolean;
  data?: {
    user: User;
    tokens?: {           // ✅ Opcional - el backend podría no hacer auto-login
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
      tokenType: string;
    };
  };
  message: string;
}

/**
 * Interfaz para los datos del usuario
 */
export interface User {
  id: number;
  email: string;
  name: string;          // Mapeado desde nombre + apellido del backend
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