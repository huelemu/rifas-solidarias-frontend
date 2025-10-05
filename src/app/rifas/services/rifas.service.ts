// src/app/rifas/services/rifas.service.patch.ts
// PARCHE PARA HACER EL SERVICIO 100% COMPATIBLE CON TUS COMPONENTES

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';

// INTERFACES COMPATIBLES CON TUS COMPONENTES EXISTENTES
export interface Rifa {
  id: number;
  nombre: string;
  descripcion?: string;
  institucion_promotora_id: number;
  cantidad_numeros: number;
  precio_numero: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_sorteo?: string;
  fecha_limite_participacion?: string;
  max_instituciones_participantes?: number;
  comision_promotora: number;
  requiere_aprobacion: boolean;
  numeros_por_institucion?: number;
  estado: 'borrador' | 'activa' | 'cerrada' | 'finalizada' | 'cancelada';
  creado_por: number; // ✅ CAMPO REQUERIDO POR TUS COMPONENTES
  numero_ganador?: number;
  fecha_sorteo_realizado?: string;
  imagen_url?: string;
  bases_condiciones?: string;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // Campos calculados del backend
  numeros_vendidos?: number;
  numeros_disponibles?: number;
  numeros_reservados?: number;
  total_recaudado?: number;
  porcentaje_vendido?: number;
  institucion_promotora?: {
    id: number;
    nombre: string;
  };
  // Campos adicionales del backend
  institucion_promotora_nombre?: string;
  institucion_promotora_email?: string;
  creador_nombre?: string;
  creador_apellido?: string;
  total_participantes?: number;
}

// RESPUESTA PARA CREAR RIFA (TUS COMPONENTES ESPERAN ID DIRECTO)
export interface CreateRifaResponse {
  status: 'success' | 'error';
  message?: string;
  data?: Rifa;
  // Propiedades directas para compatibilidad
  id: number;
  nombre?: string;
  estado?: string;
  creado_por?: number; // ✅ AÑADIR PARA COMPATIBILIDAD
}

// RESPUESTA PAGINADA (TUS COMPONENTES ESPERAN 'rifas' NO 'data')
export interface PaginatedRifasResponse {
  status: 'success' | 'error';
  rifas: Rifa[]; // TUS COMPONENTES USAN ESTE CAMPO
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// RESPUESTA ESTÁNDAR
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RifasService { // NOMBRE CORRECTO: RifasService
  private readonly http = inject(HttpClient);
  private readonly baseUrl: string;

  constructor() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      this.baseUrl = 'http://localhost:3100';
    } else {
      this.baseUrl = 'https://apirifas.huelemu.com.ar';
    }
  }

  // ===================================================
  // MÉTODOS ESPECÍFICAMENTE COMPATIBLES CON TUS COMPONENTES
  // ===================================================

  /**
   * Obtener rifas - MAPEA A FORMATO ESPERADO POR TUS COMPONENTES
   */
  getRifas(params?: any): Observable<PaginatedRifasResponse> {
    let httpParams = new HttpParams();
    
    if (params?.estado) httpParams = httpParams.set('estado', params.estado);
    if (params?.institucion_id) httpParams = httpParams.set('institucion_id', params.institucion_id.toString());
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<any>(`${this.baseUrl}/rifas`, { params: httpParams }).pipe(
      map(response => ({
        status: response.status,
        rifas: response.data || response.rifas || [], // MAPEAR A 'rifas' COMO ESPERAN TUS COMPONENTES
        pagination: response.pagination
      }))
    );
  }

  /**
   * Crear rifa - RETORNA ID DIRECTO Y FORMATEA DATOS CORRECTAMENTE + MEJOR DEBUG
   */
  createRifa(rifaData: any): Observable<CreateRifaResponse> {
  console.log('🔵 RifasService.createRifa - Datos recibidos:', rifaData);

  // ✅ ENVIAR DIRECTO - SIN TRANSFORMAR
  return this.http.post<any>(`${this.baseUrl}/rifas`, rifaData).pipe(
    map(response => {
      console.log('📥 Respuesta exitosa:', response);
      return {
        status: response.status,
        message: response.message,
        data: response.data,
        id: response.data?.id || response.id,
        nombre: response.data?.nombre || response.nombre,
        estado: response.data?.estado || response.estado,
        creado_por: response.data?.creado_por || response.creado_por
      };
    }),
    catchError(error => {
      console.error('❌ Error:', error);
      throw error;
    })
  );
}
 
  /**
   * Cambiar estado de rifa - MÉTODO REQUERIDO POR TUS COMPONENTES
   */
  cambiarEstadoRifa(id: number, estado: string): Observable<ApiResponse<Rifa>> {
    return this.http.patch<ApiResponse<Rifa>>(`${this.baseUrl}/rifas/${id}/estado`, { estado });
  }

  /**
   * Eliminar rifa - COMPATIBLE CON 1 O 2 PARÁMETROS
   */
  deleteRifa(id: number, motivo?: string): Observable<ApiResponse<any>> {
    const body = motivo ? { motivo } : undefined;
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/rifas/${id}`, { body });
  }

  /**
   * Obtener rifa específica
   */
  getRifa(id: number): Observable<ApiResponse<Rifa>> {
    return this.http.get<ApiResponse<Rifa>>(`${this.baseUrl}/rifas/${id}`);
  }

  /**
   * Actualizar rifa
   */
  updateRifa(id: number, rifaData: any): Observable<ApiResponse<Rifa>> {
    return this.http.put<ApiResponse<Rifa>>(`${this.baseUrl}/rifas/${id}`, rifaData);
  }

/**
 * Comprar números de una rifa
 */
comprarNumeros(rifaId: number, compraData: any): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/rifas/${rifaId}/comprar`, compraData);
}

/**
 * Obtener mis números comprados
 */
getMisNumeros(rifaId?: number): Observable<any> {
  const url = rifaId 
    ? `${this.baseUrl}/rifas/${rifaId}/mis-numeros`
    : `${this.baseUrl}/mis-numeros`;
  
  return this.http.get<any>(url);
}

/**
 * Reservar números temporalmente
 */
reservarNumeros(rifaId: number, numeros: number[]): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/rifas/${rifaId}/reservar`, { numeros });
}

/**
 * Cancelar reserva de números
 */
cancelarReserva(rifaId: number, numeros: number[]): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/rifas/${rifaId}/cancelar-reserva`, { numeros });
}

/**
 * Verificar disponibilidad de números específicos
 */
verificarDisponibilidad(rifaId: number, numeros: number[]): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/rifas/${rifaId}/verificar-disponibilidad`, { numeros });
}

/**
 * Obtener historial de compras del usuario
 */
getHistorialCompras(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/usuario/historial-compras`);
}
  
  // ===================================================
  // MÉTODOS PÚBLICOS
  // ===================================================

  getPublicRifas(params?: any): Observable<PaginatedRifasResponse> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<any>(`${this.baseUrl}/rifas/publicas`, { params: httpParams }).pipe(
      map(response => ({
        status: response.status,
        rifas: response.data || response.rifas || [],
        pagination: response.pagination
      }))
    );
  }

  getPublicRifa(id: number): Observable<ApiResponse<Rifa>> {
    return this.http.get<ApiResponse<Rifa>>(`${this.baseUrl}/rifas/publicas/${id}`);
  }

  // ===================================================
  // GESTIÓN DE NÚMEROS
  // ===================================================

  getRifaNumbers(rifaId: number, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params?.estado) httpParams = httpParams.set('estado', params.estado);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<any>(`${this.baseUrl}/rifas/${rifaId}/numeros`, { params: httpParams });
  }

  generateNumbers(rifaId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/rifas/${rifaId}/numeros/generar`, {});
  }

  // ===================================================
  // ESTADÍSTICAS
  // ===================================================

  getRifaStats(rifaId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/rifas/${rifaId}/estadisticas`);
  }

  // ===================================================
  // UTILIDADES
  // ===================================================

  getBackendUrl(): string {
    return this.baseUrl;
  }
}