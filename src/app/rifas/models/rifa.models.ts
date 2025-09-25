// src/app/rifas/models/rifa.models.ts

/**
 * Estados posibles de una rifa
 */
export type RifaEstado = 'borrador' | 'activa' | 'cerrada' | 'finalizada' | 'cancelada';

/**
 * Estados de los números de rifa
 */
export type NumeroEstado = 'disponible' | 'reservado' | 'vendido';

/**
 * Métodos de pago disponibles
 */
export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'mercadopago';

/**
 * Interfaz principal para Rifa
 */
export interface Rifa {
  institucion_id: number | undefined;
recaudado: number|undefined;
total_numeros: string|number;
  id: number;
  nombre: string;
  descripcion?: string;
  institucion_promotora_id: number;
  institucion_nombre?: string;
  cantidad_numeros: number;
  precio_numero: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_sorteo?: string;
  imagen_url?: string;
  estado: RifaEstado;
  reglas_adicionales?: string;
  
  // Campos de seguimiento
  creado_por: number;
  creador_nombre?: string;
  creador_apellido?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // Estadísticas calculadas (desde el backend)
  total_numeros_generados?: number;
  numeros_vendidos?: number;
  numeros_disponibles?: number;
  numeros_reservados?: number;
  total_recaudado?: number;
  porcentaje_vendido?: number;
  
  // Para rifas multi-institución
  max_instituciones_participantes?: number;
  comision_promotora?: number;
  requiere_aprobacion?: boolean;
  numeros_por_institucion?: number;
}

/**
 * Interfaz extendida con información completa
 */
export interface RifaDetallada extends Rifa {
  // Información de instituciones participantes
  instituciones_participantes?: Array<{
    id: number;
    nombre: string;
    estado_participacion: 'solicitada' | 'aprobada' | 'rechazada' | 'retirada';
    numeros_asignados_desde?: number;
    numeros_asignados_hasta?: number;
    numeros_vendidos: number;
    total_recaudado: number;
  }>;
  
  // Últimas ventas
  ultimas_ventas?: Array<{
    numero: number;
    comprador_nombre: string;
    fecha_venta: string;
    vendedor_nombre: string;
    metodo_pago: MetodoPago;
  }>;
}

/**
 * Interfaz para crear rifa
 */
export interface CreateRifaRequest {
  nombre: string;
  descripcion?: string | null;
  institucion_promotora_id: number;
  cantidad_numeros: number;
  precio_numero: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_sorteo?: string | null;
  fecha_limite_participacion?: string | null;
  comision_promotora?: number | null;
  max_instituciones_participantes?: number | null;
  numeros_por_institucion?: number | null;
  requiere_aprobacion?: boolean;
  imagen_url?: string | null;
  bases_condiciones?: string | null;
  observaciones?: string | null;
  borrador?: boolean;
}

/**
 * Interfaz para actualizar rifa
 */
export interface UpdateRifaRequest {
  nombre?: string;
  descripcion?: string;
  fecha_fin?: string;
  fecha_sorteo?: string;
  imagen_url?: string;
  reglas_adicionales?: string;
  estado?: RifaEstado;
}

/**
 * Interfaz para números de rifa
 */
export interface NumeroRifa {
  id: number;
  rifa_id: number;
  numero: number;
  qr_code: string;
  estado: NumeroEstado;
  
  // Información de venta
  vendedor_id?: number;
  vendedor_nombre?: string;
  vendedor_apellido?: string;
  comprador_id?: number;
  comprador_nombre?: string;
  comprador_apellido?: string;
  comprador_telefono?: string;
  comprador_email?: string;
  
  // Información de pago
  metodo_pago?: MetodoPago;
  monto_pagado?: number;
  referencia_pago?: string;
  
  // Fechas
  fecha_reserva?: string;
  fecha_venta?: string;
  fecha_expiracion_reserva?: string;
  
  observaciones?: string;
}

/**
 * Respuesta del backend para listar rifas
 */
export interface RifasListResponse {
  status: string;
  message: string;
  data: {
    rifas: Rifa[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Respuesta del backend para rifa individual
 */
export interface RifaResponse {
  status: string;
  message: string;
  data: RifaDetallada;
}

/**
 * Respuesta del backend para números de rifa
 */
export interface NumerosRifaResponse {
  status: string;
  message: string;
  data: {
    numeros: NumeroRifa[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Filtros para búsqueda de rifas
 */
export interface RifaFilters {
  search?: string;
  estado?: RifaEstado | 'todas';
  institucion_id?: number;
  creado_por?: number;
  desde_fecha?: string;
  hasta_fecha?: string;
  page?: number;
  limit?: number;
  ordenar_por?: 'nombre' | 'fecha_inicio' | 'fecha_fin' | 'fecha_creacion' | 'estado' | 'porcentaje_vendido';
  direccion_orden?: 'asc' | 'desc';
}

/**
 * Filtros para números de rifa
 */
export interface NumeroFilters {
  estado?: NumeroEstado | 'todos';
  vendedor_id?: number;
  desde?: number;
  hasta?: number;
  page?: number;
  limit?: number;
}

/**
 * Interfaz para comprar números
 */
export interface ComprarNumerosRequest {
  numeros: number[];
  comprador_info: {
    nombre: string;
    apellido: string;
    telefono?: string;
    email?: string;
  };
  metodo_pago: MetodoPago;
  observaciones?: string;
}

/**
 * Estadísticas de rifas
 */
export interface RifaStats {
  total_rifas: number;
  rifas_activas: number;
  rifas_finalizadas: number;
  total_recaudado: number;
  numeros_vendidos_total: number;
  rifa_mas_vendida?: {
    nombre: string;
    porcentaje_vendido: number;
  };
}

/**
 * Constantes útiles
 */
export const RIFA_ESTADOS: Array<{value: RifaEstado, label: string, class: string, icon: string}> = [
  { value: 'borrador', label: 'Borrador', class: 'status-draft', icon: '📝' },
  { value: 'activa', label: 'Activa', class: 'status-active', icon: '🟢' },
  { value: 'cerrada', label: 'Cerrada', class: 'status-closed', icon: '🔒' },
  { value: 'finalizada', label: 'Finalizada', class: 'status-finished', icon: '🏆' },
  { value: 'cancelada', label: 'Cancelada', class: 'status-cancelled', icon: '❌' }
];

export const NUMERO_ESTADOS: Array<{value: NumeroEstado, label: string, class: string, icon: string}> = [
  { value: 'disponible', label: 'Disponible', class: 'numero-disponible', icon: '✅' },
  { value: 'reservado', label: 'Reservado', class: 'numero-reservado', icon: '⏳' },
  { value: 'vendido', label: 'Vendido', class: 'numero-vendido', icon: '💰' }
];

export const METODOS_PAGO: Array<{value: MetodoPago, label: string, icon: string}> = [
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
  { value: 'mercadopago', label: 'MercadoPago', icon: '📱' }
];

/**
 * Configuración por defecto para rifas
 */
export const RIFA_CONFIG = {
  MIN_NUMEROS: 10,
  MAX_NUMEROS: 10000,
  MIN_PRECIO: 0.01,
  MAX_PRECIO: 100000,
  TIEMPO_RESERVA_MINUTOS: 15,
  NUMEROS_POR_PAGINA: 50,
  RIFAS_POR_PAGINA: 10
};

/**
 * Validaciones frontend
 */
export interface RifaValidation {
  nombre: {
    valid: boolean;
    errors: string[];
  };
  cantidad_numeros: {
    valid: boolean;
    errors: string[];
  };
  precio_numero: {
    valid: boolean;
    errors: string[];
  };
  fechas: {
    valid: boolean;
    errors: string[];
  };
}

/**
 * Utilidades para validación
 */
export class RifaValidator {
  static validateNombre(nombre: string): string[] {
    const errors: string[] = [];
    if (!nombre?.trim()) {
      errors.push('El nombre es requerido');
    } else if (nombre.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    } else if (nombre.trim().length > 100) {
      errors.push('El nombre no puede tener más de 100 caracteres');
    }
    return errors;
  }

  static validateCantidadNumeros(cantidad: number): string[] {
    const errors: string[] = [];
    if (!cantidad) {
      errors.push('La cantidad de números es requerida');
    } else if (cantidad < RIFA_CONFIG.MIN_NUMEROS) {
      errors.push(`Mínimo ${RIFA_CONFIG.MIN_NUMEROS} números`);
    } else if (cantidad > RIFA_CONFIG.MAX_NUMEROS) {
      errors.push(`Máximo ${RIFA_CONFIG.MAX_NUMEROS} números`);
    }
    return errors;
  }

  static validatePrecio(precio: number): string[] {
    const errors: string[] = [];
    if (!precio) {
      errors.push('El precio es requerido');
    } else if (precio < RIFA_CONFIG.MIN_PRECIO) {
      errors.push(`Precio mínimo $${RIFA_CONFIG.MIN_PRECIO}`);
    } else if (precio > RIFA_CONFIG.MAX_PRECIO) {
      errors.push(`Precio máximo $${RIFA_CONFIG.MAX_PRECIO}`);
    }
    return errors;
  }

  static validateFechas(fecha_inicio: string, fecha_fin: string, fecha_sorteo?: string): string[] {
    const errors: string[] = [];
    const hoy = new Date();
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    
    if (!fecha_inicio) {
      errors.push('Fecha de inicio requerida');
    } else if (inicio < hoy) {
      errors.push('La fecha de inicio no puede ser anterior a hoy');
    }
    
    if (!fecha_fin) {
      errors.push('Fecha de fin requerida');
    } else if (fin <= inicio) {
      errors.push('La fecha de fin debe ser posterior al inicio');
    }
    
    if (fecha_sorteo) {
      const sorteo = new Date(fecha_sorteo);
      if (sorteo < fin) {
        errors.push('La fecha de sorteo debe ser posterior al fin de la rifa');
      }
    }
    
    return errors;
  }
}

/**
 * Utilidades para formateo
 */
export class RifaUtils {
  static formatPrice(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }

  static formatDate(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  static formatDateTime(fecha: string): string {
    return new Date(fecha).toLocaleString('es-AR');
  }

  static getEstadoConfig(estado: RifaEstado) {
    return RIFA_ESTADOS.find(e => e.value === estado) || RIFA_ESTADOS[0];
  }

  static getNumeroEstadoConfig(estado: NumeroEstado) {
    return NUMERO_ESTADOS.find(e => e.value === estado) || NUMERO_ESTADOS[0];
  }

  static calcularDiasRestantes(fecha_fin: string): number {
    const hoy = new Date();
    const fin = new Date(fecha_fin);
    const diffTime = fin.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static generarNumeroAleatorio(min: number, max: number, excluidos: number[] = []): number {
    let numero;
    do {
      numero = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (excluidos.includes(numero));
    return numero;
  }
}