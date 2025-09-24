// src/app/rifas/services/rifas.service.ts - COMPLETO

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
import {
  Rifa,
  RifaDetallada,
  CreateRifaRequest,
  UpdateRifaRequest,
  RifasListResponse,
  RifaResponse,
  RifaFilters,
  NumeroRifa,
  NumerosRifaResponse,
  NumeroFilters,
  ComprarNumerosRequest,
  RifaStats
} from '../models/rifa.models';

@Injectable({
  providedIn: 'root'
})
export class RifasService {
  private readonly http = inject(HttpClient);
  
  // Detección automática de entorno
  private readonly baseUrl = this.getApiUrl();
  
  // Estados reactivos
  private readonly _rifas = new BehaviorSubject<Rifa[]>([]);
  private readonly _rifaActual = new BehaviorSubject<RifaDetallada | null>(null);
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);

  // Observables públicos
  readonly rifas$ = this._rifas.asObservable();
  readonly rifaActual$ = this._rifaActual.asObservable();
  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();

  constructor() {
    console.log('🎫 RifasService inicializado con URL:', this.baseUrl);
  }

  /**
   * Detecta automáticamente la URL de la API basada en el entorno
   */
  private getApiUrl(): string {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  // =====================================================
  // MÉTODOS PÚBLICOS - CRUD BÁSICO
  // =====================================================

  /**
   * Obtener lista de rifas con filtros
   */
  getRifas(filters?: RifaFilters): Observable<{rifas: Rifa[], pagination: any}> {
    console.log('📋 RifasService: Obteniendo rifas con filtros:', filters);
    
    this._loading.next(true);
    this._error.next(null);
    
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.estado && filters.estado !== 'todas') params = params.set('estado', filters.estado);
      if (filters.institucion_id) params = params.set('institucion_id', filters.institucion_id.toString());
      if (filters.creado_por) params = params.set('creado_por', filters.creado_por.toString());
      if (filters.desde_fecha) params = params.set('desde_fecha', filters.desde_fecha);
      if (filters.hasta_fecha) params = params.set('hasta_fecha', filters.hasta_fecha);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.ordenar_por) params = params.set('ordenar_por', filters.ordenar_por);
      if (filters.direccion_orden) params = params.set('direccion_orden', filters.direccion_orden);
    }

    return this.http.get<RifasListResponse>(`${this.baseUrl}/rifas`, { params })
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta rifas:', response);
          
          let rifas: Rifa[] = [];
          let pagination = null;
          
          if (response && response.status === 'success' && response.data) {
            if (Array.isArray(response.data)) {
              rifas = response.data;
            } else if (response.data.rifas) {
              rifas = response.data.rifas;
              pagination = response.data.pagination;
            }
          }
          
          this._rifas.next(rifas);
          this._loading.next(false);
          
          return { rifas, pagination };
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al obtener rifas:', error);
          this._error.next('Error al cargar las rifas');
          this._loading.next(false);
          return of({ rifas: [], pagination: null });
        })
      );
  }

  /**
   * Obtener rifa por ID
   */
  getRifaById(id: number): Observable<RifaDetallada | null> {
    console.log('🎫 RifasService: Obteniendo rifa ID:', id);
    
    this._loading.next(true);
    this._error.next(null);

    return this.http.get<RifaResponse>(`${this.baseUrl}/rifas/${id}`)
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta rifa individual:', response);
          
          let rifa: RifaDetallada | null = null;
          
          if (response && response.status === 'success' && response.data) {
            rifa = response.data;
          }
          
          this._rifaActual.next(rifa);
          this._loading.next(false);
          
          return rifa;
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al obtener rifa:', error);
          this._error.next('Error al cargar la rifa');
          this._loading.next(false);
          return of(null);
        })
      );
  }

  /**
   * Crear nueva rifa
   */
  createRifa(rifaData: CreateRifaRequest): Observable<Rifa | null> {
    console.log('➕ RifasService: Creando rifa:', rifaData);
    
    this._loading.next(true);
    this._error.next(null);

    return this.http.post<RifaResponse>(`${this.baseUrl}/rifas`, rifaData)
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta crear rifa:', response);
          
          if (response && response.status === 'success' && response.data) {
            // Actualizar lista local
            const rifasActuales = this._rifas.value;
            this._rifas.next([response.data, ...rifasActuales]);
            
            this._loading.next(false);
            return response.data;
          }
          
          this._loading.next(false);
          return null;
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al crear rifa:', error);
          this._error.next('Error al crear la rifa');
          this._loading.next(false);
          return of(null);
        })
      );
  }

  /**
   * Actualizar rifa existente
   */
  updateRifa(id: number, rifaData: UpdateRifaRequest): Observable<Rifa | null> {
    console.log('✏️ RifasService: Actualizando rifa ID:', id, rifaData);
    
    this._loading.next(true);
    this._error.next(null);

    return this.http.put<RifaResponse>(`${this.baseUrl}/rifas/${id}`, rifaData)
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta actualizar rifa:', response);
          
          if (response && response.status === 'success' && response.data) {
            // Actualizar lista local
            const rifasActuales = this._rifas.value;
            const index = rifasActuales.findIndex(r => r.id === id);
            if (index !== -1) {
              rifasActuales[index] = response.data;
              this._rifas.next([...rifasActuales]);
            }
            
            // Actualizar rifa actual si es la misma
            if (this._rifaActual.value?.id === id) {
              this._rifaActual.next(response.data);
            }
            
            this._loading.next(false);
            return response.data;
          }
          
          this._loading.next(false);
          return null;
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al actualizar rifa:', error);
          this._error.next('Error al actualizar la rifa');
          this._loading.next(false);
          return of(null);
        })
      );
  }

  /**
   * Eliminar rifa
   */
  deleteRifa(id: number, motivo?: string): Observable<boolean> {
    console.log('🗑️ RifasService: Eliminando rifa ID:', id);
    
    this._loading.next(true);
    this._error.next(null);

    const body = motivo ? { motivo } : {};

    return this.http.delete<any>(`${this.baseUrl}/rifas/${id}`, { body })
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta eliminar rifa:', response);
          
          if (response && response.status === 'success') {
            // Remover de lista local
            const rifasActuales = this._rifas.value;
            const rifasFiltradas = rifasActuales.filter(r => r.id !== id);
            this._rifas.next(rifasFiltradas);
            
            // Limpiar rifa actual si es la misma
            if (this._rifaActual.value?.id === id) {
              this._rifaActual.next(null);
            }
            
            this._loading.next(false);
            return true;
          }
          
          this._loading.next(false);
          return false;
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al eliminar rifa:', error);
          this._error.next('Error al eliminar la rifa');
          this._loading.next(false);
          return of(false);
        })
      );
  }

  // =====================================================
  // MÉTODOS PARA GESTIÓN DE NÚMEROS
  // =====================================================

  /**
   * Obtener números de una rifa
   */
  getNumerosRifa(rifaId: number, filters?: NumeroFilters): Observable<{numeros: NumeroRifa[], pagination: any}> {
    console.log('🔢 RifasService: Obteniendo números de rifa:', rifaId, filters);
    
    let params = new HttpParams();
    
    if (filters) {
      if (filters.estado && filters.estado !== 'todos') params = params.set('estado', filters.estado);
      if (filters.vendedor_id) params = params.set('vendedor_id', filters.vendedor_id.toString());
      if (filters.desde) params = params.set('desde', filters.desde.toString());
      if (filters.hasta) params = params.set('hasta', filters.hasta.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<NumerosRifaResponse>(`${this.baseUrl}/rifas/${rifaId}/numeros`, { params })
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta números:', response);
          
          let numeros: NumeroRifa[] = [];
          let pagination = null;
          
          if (response && response.status === 'success' && response.data) {
            if (Array.isArray(response.data)) {
              numeros = response.data;
            } else if (response.data.numeros) {
              numeros = response.data.numeros;
              pagination = response.data.pagination;
            }
          }
          
          return { numeros, pagination };
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al obtener números:', error);
          this._error.next('Error al cargar los números');
          return of({ numeros: [], pagination: null });
        })
      );
  }

  /**
   * Comprar números de rifa
   */
  comprarNumeros(rifaId: number, compraData: ComprarNumerosRequest): Observable<boolean> {
    console.log('💰 RifasService: Comprando números:', rifaId, compraData);
    
    this._loading.next(true);
    this._error.next(null);

    return this.http.post<any>(`${this.baseUrl}/rifas/${rifaId}/numeros/comprar`, compraData)
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta comprar números:', response);
          
          if (response && response.status === 'success') {
            this._loading.next(false);
            return true;
          }
          
          this._loading.next(false);
          return false;
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al comprar números:', error);
          this._error.next('Error al comprar los números');
          this._loading.next(false);
          return of(false);
        })
      );
  }

  /**
   * Reservar números temporalmente
   */
  reservarNumeros(rifaId: number, numeros: number[], tiempoMinutos?: number): Observable<boolean> {
    console.log('⏳ RifasService: Reservando números:', rifaId, numeros);
    
    const body = {
      numeros,
      tiempo_reserva: tiempoMinutos || 15
    };

    return this.http.post<any>(`${this.baseUrl}/rifas/${rifaId}/numeros/reservar`, body)
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta reservar números:', response);
          return response && response.status === 'success';
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al reservar números:', error);
          this._error.next('Error al reservar los números');
          return of(false);
        })
      );
  }

  // =====================================================
  // MÉTODOS PARA RIFAS PÚBLICAS
  // =====================================================

  /**
   * Obtener rifas públicas (sin autenticación)
   */
  getRifasPublicas(): Observable<Rifa[]> {
    console.log('🌐 RifasService: Obteniendo rifas públicas');
    
    return this.http.get<RifasListResponse>(`${this.baseUrl}/rifas/publicas`)
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta rifas públicas:', response);
          
          if (response && response.status === 'success' && response.data) {
            return Array.isArray(response.data) ? response.data : response.data.rifas || [];
          }
          
          return [];
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al obtener rifas públicas:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtener rifa pública por ID
   */
  getRifaPublica(id: number): Observable<Rifa | null> {
    console.log('🌐 RifasService: Obteniendo rifa pública ID:', id);
    
    return this.http.get<RifaResponse>(`${this.baseUrl}/rifas/publicas/${id}`)
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta rifa pública:', response);
          
          if (response && response.status === 'success' && response.data) {
            return response.data;
          }
          
          return null;
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al obtener rifa pública:', error);
          return of(null);
        })
      );
  }

  // =====================================================
  // MÉTODOS PARA ESTADÍSTICAS
  // =====================================================

  /**
   * Obtener estadísticas generales de rifas
   */
  getEstadisticas(): Observable<RifaStats | null> {
    console.log('📊 RifasService: Obteniendo estadísticas');
    
    return this.http.get<any>(`${this.baseUrl}/rifas/estadisticas`)
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta estadísticas:', response);
          
          if (response && response.status === 'success' && response.data) {
            return response.data;
          }
          
          return null;
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al obtener estadísticas:', error);
          return of(null);
        })
      );
  }

  /**
   * Obtener estadísticas de una rifa específica
   */
  getEstadisticasRifa(rifaId: number): Observable<any> {
    console.log('📊 RifasService: Obteniendo estadísticas de rifa:', rifaId);
    
    return this.http.get<any>(`${this.baseUrl}/rifas/${rifaId}/estadisticas`)
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta estadísticas rifa:', response);
          
          if (response && response.status === 'success' && response.data) {
            return response.data;
          }
          
          return null;
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al obtener estadísticas de rifa:', error);
          return of(null);
        })
      );
  }

  // =====================================================
  // MÉTODOS AUXILIARES
  // =====================================================

  /**
   * Limpiar estado
   */
  clearState(): void {
    this._rifas.next([]);
    this._rifaActual.next(null);
    this._loading.next(false);
    this._error.next(null);
  }

  /**
   * Limpiar errores
   */
  clearError(): void {
    this._error.next(null);
  }

  /**
   * Obtener rifa del estado actual
   */
  getCurrentRifa(): RifaDetallada | null {
    return this._rifaActual.value;
  }

  /**
   * Obtener rifas del estado actual
   */
  getCurrentRifas(): Rifa[] {
    return this._rifas.value;
  }

  /**
   * Verificar si está cargando
   */
  isLoading(): boolean {
    return this._loading.value;
  }

  /**
   * Obtener error actual
   */
  getCurrentError(): string | null {
    return this._error.value;
  }

  /**
   * Recargar rifas
   */
  reloadRifas(filters?: RifaFilters): Observable<{rifas: Rifa[], pagination: any}> {
    return this.getRifas(filters);
  }

  /**
   * Cambiar estado de rifa
   */
  cambiarEstadoRifa(id: number, nuevoEstado: string, motivo?: string): Observable<boolean> {
    console.log('🔄 RifasService: Cambiando estado de rifa:', id, nuevoEstado);
    
    const body: any = { estado: nuevoEstado };
    if (motivo) body.motivo = motivo;

    return this.http.patch<any>(`${this.baseUrl}/rifas/${id}/estado`, body)
      .pipe(
        map(response => {
          console.log('📥 RifasService: Respuesta cambiar estado:', response);
          
          if (response && response.status === 'success') {
            // Actualizar en lista local
            const rifasActuales = this._rifas.value;
            const index = rifasActuales.findIndex(r => r.id === id);
            if (index !== -1) {
              rifasActuales[index] = { ...rifasActuales[index], estado: nuevoEstado as any };
              this._rifas.next([...rifasActuales]);
            }
            
            return true;
          }
          
          return false;
        }),
        catchError(error => {
          console.error('❌ RifasService: Error al cambiar estado:', error);
          this._error.next('Error al cambiar el estado de la rifa');
          return of(false);
        })
      );
  }

  /**
   * Validar si el usuario puede gestionar la rifa
   */
  canManageRifa(rifa: Rifa, userRole: string, userInstitutionId?: number): boolean {
    if (userRole === 'admin_global') return true;
    if (userRole === 'admin_institucion' && userInstitutionId === rifa.institucion_promotora_id) return true;
    return false;
  }

  /**
   * Obtener color de estado
   */
  getEstadoColor(estado: string): string {
    const colores: {[key: string]: string} = {
      'borrador': '#6c757d',
      'activa': '#28a745',
      'cerrada': '#ffc107',
      'finalizada': '#17a2b8',
      'cancelada': '#dc3545'
    };
    return colores[estado] || '#6c757d';
  }
}