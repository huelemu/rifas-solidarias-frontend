// ====================================
// src/app/interfaces/institucion.interface.ts
// ====================================

export interface Institucion {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  cuit?: string;
  tipo_institucion?: string;
  estado: 'activa' | 'inactiva';
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  
  // Estadísticas opcionales
  total_rifas?: number;
  rifas_activas?: number;
  total_recaudado?: number;
}

export interface CrearInstitucionRequest {
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  cuit?: string;
  tipo_institucion?: string;
}

export interface ActualizarInstitucionRequest {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  cuit?: string;
  tipo_institucion?: string;
  estado?: 'activa' | 'inactiva';
}
