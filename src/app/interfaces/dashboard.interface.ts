// ====================================
// src/app/interfaces/dashboard.interface.ts
// ====================================

export interface DashboardStats {
  // Estadísticas generales
  total_rifas: number;
  rifas_activas: number;
  total_usuarios: number;
  total_instituciones: number;
  
  // Estadísticas de ventas
  total_recaudado: number;
  ventas_este_mes: number;
  numeros_vendidos_total: number;
  
  // Rifas más populares
  rifas_populares: Rifa[];
  
  // Actividad reciente
  actividad_reciente: ActividadReciente[];
}

export interface ActividadReciente {
  id: number;
  tipo: 'compra' | 'nueva_rifa' | 'registro' | 'sorteo';
  descripcion: string;
  fecha: string;
  usuario?: string;
  rifa?: string;
}

export interface EstadisticasPersonales {
  mis_rifas_count: number;
  total_invertido: number;
  numeros_comprados: number;
  rifas_ganadas: number;
  proximos_sorteos: Rifa[];
}