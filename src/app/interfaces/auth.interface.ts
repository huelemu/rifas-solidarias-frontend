// ====================================
// src/app/interfaces/auth.interface.ts
// ====================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    user: Usuario;
  };
  message: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  rol: 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';
  institucion_id?: number;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol: string;
  institucion_id?: number;
  institucion_nombre?: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
  };
}