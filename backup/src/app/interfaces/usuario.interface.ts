// ====================================
// src/app/interfaces/usuario.interface.ts
// ====================================

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  dni: string;
  rol: 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';
  estado: 'activo' | 'inactivo';
  institucion_id?: number;
  institucion_nombre?: string;
  fecha_creacion?: string;
  fecha_ultimo_acceso?: string;
  
  // Para estadísticas
  total_compras?: number;
  total_invertido?: number;
}

export interface CrearUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
  rol: 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';
  institucion_id?: number;
}

export interface ActualizarUsuarioRequest {
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  rol?: 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';
  estado?: 'activo' | 'inactivo';
  institucion_id?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: Usuario;
  };
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
  institucion_id?: number;
}
