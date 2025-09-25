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

    // Validar datos mínimos antes de enviar
    if (!rifaData.nombre || !rifaData.cantidad_numeros || !rifaData.precio_numero) {
      console.error('❌ Datos insuficientes para crear rifa:', rifaData);
      throw new Error('Faltan datos requeridos para crear la rifa');
    }

    // Formatear datos para el backend
    const formattedData = {
      nombre: rifaData.nombre?.trim() || '',
      descripcion: rifaData.descripcion?.trim() || '',
      institucion_promotora_id: rifaData.institucion_promotora_id || null,
      cantidad_numeros: parseInt(rifaData.cantidad_numeros || '0'),
      precio_numero: parseFloat(rifaData.precio_numero || '0'),
      fecha_inicio: this.formatDate(rifaData.fecha_inicio),
      fecha_fin: this.formatDate(rifaData.fecha_fin),
      fecha_sorteo: rifaData.fecha_sorteo ? this.formatDate(rifaData.fecha_sorteo) : null,
      fecha_limite_participacion: rifaData.fecha_limite_participacion ? this.formatDate(rifaData.fecha_limite_participacion) : null,
      max_instituciones_participantes: rifaData.max_instituciones_participantes ? parseInt(rifaData.max_instituciones_participantes) : null,
      comision_promotora: parseFloat(rifaData.comision_promotora || '10'),
      requiere_aprobacion: rifaData.requiere_aprobacion === true || rifaData.requiere_aprobacion === 'true',
      numeros_por_institucion: rifaData.numeros_por_institucion ? parseInt(rifaData.numeros_por_institucion) : null,
      imagen_url: rifaData.imagen_url?.trim() || null,
      bases_condiciones: rifaData.bases_condiciones?.trim() || null,
      observaciones: rifaData.observaciones?.trim() || null
    };

    console.log('📤 RifasService.createRifa - Datos formateados para backend:', formattedData);

    // Validar datos formateados
    if (!formattedData.institucion_promotora_id) {
      console.error('❌ institucion_promotora_id es requerido');
      throw new Error('ID de institución promotora es requerido');
    }

    if (formattedData.cantidad_numeros <= 0) {
      console.error('❌ cantidad_numeros debe ser mayor a 0');
      throw new Error('La cantidad de números debe ser mayor a 0');
    }

    if (formattedData.precio_numero <= 0) {
      console.error('❌ precio_numero debe ser mayor a 0');
      throw new Error('El precio por número debe ser mayor a 0');
    }

    if (!formattedData.fecha_inicio) {
      console.error('❌ fecha_inicio es requerida');
      throw new Error('La fecha de inicio es requerida');
    }

    if (!formattedData.fecha_fin) {
      console.error('❌ fecha_fin es requerida');
      throw new Error('La fecha de fin es requerida');
    }

    return this.http.post<any>(`${this.baseUrl}/rifas`, formattedData).pipe(
      map(response => {
        console.log('📥 RifasService.createRifa - Respuesta exitosa del backend:', response);
        return {
          status: response.status,
          message: response.message,
          data: response.data,
          // PROPIEDADES DIRECTAS PARA TUS COMPONENTES
          id: response.data?.id || response.id,
          nombre: response.data?.nombre || response.nombre,
          estado: response.data?.estado || response.estado,
          creado_por: response.data?.creado_por || response.creado_por
        };
      }),
      catchError(error => {
        console.error('❌ RifasService.createRifa - Error del backend:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Error completo:', error.error);
        
        // Re-lanzar el error para que lo maneje el componente
        throw error;
      })
    );
  }

  /**
   * Formatear fecha para el backend (YYYY-MM-DD HH:MM:SS o YYYY-MM-DD)
   */
  private formatDate(dateValue: any): string | null {
    if (!dateValue) return null;

    try {
      let date: Date;
      
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else {
        return null;
      }

      if (isNaN(date.getTime())) {
        console.error('Fecha inválida:', dateValue);
        return null;
      }

      // Formatear como YYYY-MM-DD HH:MM:SS para el backend
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error, dateValue);
      return null;
    }
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