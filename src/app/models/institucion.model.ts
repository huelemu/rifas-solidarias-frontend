// src/app/models/institucion.model.ts
export interface Institucion {
  id?: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email: string;
  logo_url?: string;
  estado?: 'activa' | 'inactiva';
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}