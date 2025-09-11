// src/app/services/rifa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Rifa {
  id?: number;
  titulo: string;
  nombre?: string;      
  cantidad_numeros?: number; 
  descripcion?: string;
  precio_numero: number;
  total_numeros: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_sorteo?: string;
  estado: 'borrador' | 'activa' | 'cerrada' | 'finalizada' | 'cancelada';  // 🔥 ampliado
  numero_ganador?: number;
  ganador_id?: number;
  institucion_id: number;
  creado_por?: number;
  imagen_url?: string;
  created_at?: string;
  updated_at?: string;

  // Campos calculados (pueden ser undefined)
  institucion_nombre?: string;
  institucion_logo?: string;
  creador_nombre?: string;
  numeros_vendidos?: number;
  numeros_disponibles?: number;
  porcentaje_vendido?: string | number;
  recaudado?: string | number;
  total_potencial?: string | number;
  estadisticas?: {
    total_numeros: number;
    vendidos: number;
    reservados: number;
    disponibles: number;
  };
}

export interface NumeroRifa {
  id: number;
  rifa_id: number;
  numero: number;
  comprador_id?: number;
  fecha_compra?: string;
  estado: 'disponible' | 'reservado' | 'vendido';
  comprador_nombre?: string;
  comprador_email?: string;
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

@Injectable({
  providedIn: 'root'
})
export class RifaService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    // Detección automática del entorno
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      this.baseUrl = 'http://localhost:3100';
    } else {
      this.baseUrl = 'https://apirifas.huelemu.com.ar';
    }
  }

  // Obtener todas las rifas
  obtenerRifas(filtros?: {
    estado?: 'activa' | 'cerrada' | 'finalizada';
    institucion_id?: number;
  }): Observable<{ success: boolean; data: Rifa[]; message: string }> {
    let params = new HttpParams();
    
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }
    
    if (filtros?.institucion_id) {
      params = params.set('institucion_id', filtros.institucion_id.toString());
    }

    return this.http.get<{ success: boolean; data: Rifa[]; message: string }>(
      `${this.baseUrl}/rifas`,
      { params }
    );
  }

  // Obtener rifa por ID
  obtenerRifaPorId(id: number): Observable<{ success: boolean; data: Rifa; message: string }> {
    return this.http.get<{ success: boolean; data: Rifa; message: string }>(
      `${this.baseUrl}/rifas/${id}`
    );
  }

  // Crear nueva rifa
  crearRifa(rifa: Omit<Rifa, 'id' | 'created_at' | 'updated_at'>): Observable<{ success: boolean; data: Rifa; message: string }> {
    return this.http.post<{ success: boolean; data: Rifa; message: string }>(
      `${this.baseUrl}/rifas`,
      rifa
    );
  }

  // Actualizar rifa
  actualizarRifa(id: number, updates: Partial<Rifa>): Observable<{ success: boolean; data: Rifa; message: string }> {
    return this.http.put<{ success: boolean; data: Rifa; message: string }>(
      `${this.baseUrl}/rifas/${id}`,
      updates
    );
  }

  // Eliminar rifa
  eliminarRifa(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/rifas/${id}`
    );
  }

  // Obtener números de una rifa
  obtenerNumerosRifa(
    id: number, 
    estado?: 'disponible' | 'reservado' | 'vendido'
  ): Observable<{ success: boolean; data: NumeroRifa[]; message: string }> {
    let params = new HttpParams();
    
    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<{ success: boolean; data: NumeroRifa[]; message: string }>(
      `${this.baseUrl}/rifas/${id}/numeros`,
      { params }
    );
  }

  // Comprar números de una rifa
  comprarNumeros(id: number, numeros: number[]): Observable<CompraResponse> {
    const compra: CompraNumeros = { numeros };
    return this.http.post<CompraResponse>(
      `${this.baseUrl}/rifas/${id}/comprar`,
      compra
    );
  }

  // Obtener mis rifas (como usuario autenticado)
  obtenerMisRifas(): Observable<{ success: boolean; data: Rifa[]; message: string }> {
    return this.http.get<{ success: boolean; data: Rifa[]; message: string }>(
      `${this.baseUrl}/rifas/user/mis-rifas`
    );
  }

  // Obtener rifas por institución
  obtenerRifasPorInstitucion(institucionId: number): Observable<{ success: boolean; data: Rifa[]; message: string }> {
    return this.obtenerRifas({ institucion_id: institucionId });
  }

  // Obtener números disponibles de una rifa
  obtenerNumerosDisponibles(id: number): Observable<{ success: boolean; data: NumeroRifa[]; message: string }> {
    return this.obtenerNumerosRifa(id, 'disponible');
  }

  // Verificar si un número específico está disponible
  verificarNumeroDisponible(rifaId: number, numero: number): Observable<{ success: boolean; disponible: boolean; message: string }> {
    return this.obtenerNumerosRifa(rifaId).pipe(
      map(response => {
        if (response.success) {
          const numeroEncontrado = response.data.find(n => n.numero === numero);
          return {
            success: true,
            disponible: numeroEncontrado ? numeroEncontrado.estado === 'disponible' : false,
            message: numeroEncontrado ? 
              `Número ${numero} está ${numeroEncontrado.estado}` : 
              `Número ${numero} no encontrado`
          };
        }
        return {
          success: false,
          disponible: false,
          message: 'Error al verificar número'
        };
      })
    );
  }

  // Obtener estadísticas de una rifa
  obtenerEstadisticasRifa(id: number): Observable<any> {
    return this.obtenerRifaPorId(id).pipe(
      map(response => {
        if (response.success) {
          const rifa = response.data;
          return {
            success: true,
            data: {
              total_numeros: rifa.total_numeros,
              vendidos: rifa.estadisticas?.vendidos || 0,
              disponibles: rifa.estadisticas?.disponibles || rifa.total_numeros,
              porcentaje_vendido: rifa.porcentaje_vendido,
              recaudado: rifa.recaudado,
              total_potencial: rifa.total_potencial
            }
          };
        }
        return response;
      })
    );
  }

  // Método auxiliar para formatear precios (acepta tipos flexibles)
formatearPrecio(precio: number | string | undefined): string {
  const num = Number(precio) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(num);
}
  formatearPrecioLocal(precio: any): string {
    const num = Number(precio) || 0;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(num);
  }
  // Método auxiliar para formatear fechas
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Validar datos de rifa antes de enviar
  validarDatosRifa(rifa: Partial<Rifa>): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!rifa.titulo || rifa.titulo.trim().length < 3) {
      errores.push('El título debe tener al menos 3 caracteres');
    }

    if (!rifa.precio_numero || rifa.precio_numero <= 0) {
      errores.push('El precio por número debe ser mayor a 0');
    }

    if (!rifa.total_numeros || rifa.total_numeros < 1 || rifa.total_numeros > 10000) {
      errores.push('El total de números debe estar entre 1 y 10,000');
    }

    if (!rifa.fecha_inicio) {
      errores.push('La fecha de inicio es obligatoria');
    }

    if (!rifa.fecha_fin) {
      errores.push('La fecha de fin es obligatoria');
    }

    if (rifa.fecha_inicio && rifa.fecha_fin) {
      const inicio = new Date(rifa.fecha_inicio);
      const fin = new Date(rifa.fecha_fin);
      
      if (inicio >= fin) {
        errores.push('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      if (inicio < new Date()) {
        errores.push('La fecha de inicio no puede ser anterior a hoy');
      }
    }

    if (!rifa.institucion_id) {
      errores.push('Debe seleccionar una institución');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }
}