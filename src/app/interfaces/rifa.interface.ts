// ====================================
// src/app/interfaces/rifa.interface.ts
// ====================================

export interface Rifa {
  id: number;
  titulo: string;
  nombre?: string; // Para compatibilidad con backend
  descripcion?: string;
  precio_numero: number;
  total_numeros: number;
  cantidad_numeros?: number; // Para compatibilidad con backend
  fecha_inicio: string;
  fecha_fin: string;
  fecha_sorteo: string;
  estado: 'activa' | 'cerrada' | 'finalizada';
  institucion_id?: number;
  institucion_nombre?: string;
  creado_por?: number;
  imagen_url?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  
  // Estadísticas calculadas del backend
  numeros_vendidos?: number;
  numeros_disponibles?: number;
  porcentaje_vendido?: string | number;
  recaudado?: string | number;
  total_potencial?: string | number;
  
  // Estadísticas estructuradas
  estadisticas?: {
    vendidos: number;
    disponibles: number;
    recaudado: number;
    total_potencial: number;
  };
  
  // Para el componente "Mis Rifas"
  mis_numeros?: number[];
  mi_inversion?: number;
}

export interface NumeroRifa {
  id: number;
  rifa_id: number;
  numero: number;
  estado: 'disponible' | 'reservado' | 'vendido';
  comprador_id?: number;
  comprador_nombre?: string;
  fecha_venta?: string;
  qr_code?: string;
}

export interface CompraNumeros {
  numeros: number[];
}

export interface CompraResponse {
  success: boolean;
  data: {
    rifa_id: number;
    numeros_comprados: number[];
    cantidad: number;
    precio_unitario: number;
    total_pagado: number;
  };
  message: string;
}

export interface FiltrosRifa {
  estado?: 'activa' | 'cerrada' | 'finalizada';
  institucion_id?: number;
  creado_por?: number;
  desde_fecha?: string;
  hasta_fecha?: string;
}

export interface CrearRifaRequest {
  titulo: string;
  descripcion?: string;
  precio_numero: number;
  total_numeros: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_sorteo: string;
  institucion_id?: number;
  imagen_url?: string;
}

export interface ActualizarRifaRequest {
  titulo?: string;
  descripcion?: string;
  fecha_fin?: string;
  estado?: 'activa' | 'cerrada' | 'finalizada';
}
