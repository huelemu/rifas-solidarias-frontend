// src/app/institutions/services/institution.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Institution,
  InstitutionExtended,
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  InstitutionsListResponse,
  InstitutionResponse,
  InstitutionFilters,
  InstitutionStats,
  InstitutionDetail,
  AssignAdminRequest,
  InstitutionOperationResponse
} from '../models/institution.models';

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {
  private readonly http = inject(HttpClient);
  
  // Detección automática de entorno
  private readonly apiUrl = this.getApiUrl();

  /**
   * Detecta automáticamente la URL de la API
   */
  private getApiUrl(): string {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  /**
   * Obtiene lista de instituciones con filtros opcionales
   */
  getInstitutions(filters: InstitutionFilters = {}): Observable<{institutions: Institution[], pagination?: any}> {
    console.log('🏢 InstitutionService: Obteniendo instituciones con filtros:', filters);
    
    // Construir parámetros de consulta
    let params = new HttpParams();
    
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.tipo && filters.tipo !== 'todas') {
      params = params.set('tipo', filters.tipo);
    }
    if (filters.estado && filters.estado !== 'todas') {
      params = params.set('estado', filters.estado);
    }
    if (filters.usuario_creador_id) {
      params = params.set('usuario_creador_id', filters.usuario_creador_id.toString());
    }
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }
    if (filters.ordenar_por) {
      params = params.set('ordenar_por', filters.ordenar_por);
    }
    if (filters.direccion_orden) {
      params = params.set('direccion_orden', filters.direccion_orden);
    }

    return this.http.get<any>(`${this.apiUrl}/instituciones`, { params })
      .pipe(
        map((response) => {
          console.log('📥 InstitutionService: Respuesta del backend:', response);
          
          // Manejar diferentes formatos de respuesta del backend
          if (response && response.data) {
            if (Array.isArray(response.data)) {
              // Formato: {status: "success", data: [...]}
              return {
                institutions: response.data,
                pagination: response.pagination
              };
            } else if (response.data.instituciones) {
              // Formato: {status: "success", data: {instituciones: [...], pagination: {...}}}
              return {
                institutions: response.data.instituciones,
                pagination: response.data.pagination
              };
            }
          }
          
          // Fallback
          return {
            institutions: response || [],
            pagination: null
          };
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error al obtener instituciones:', error);
          // Retornar array vacío en caso de error
          return of({ institutions: [], pagination: null });
        })
      );
  }

  /**
   * Obtiene una institución específica por ID
   */
  getInstitutionById(id: number): Observable<Institution> {
    console.log('🔍 InstitutionService: Obteniendo institución ID:', id);
    
    return this.http.get<any>(`${this.apiUrl}/instituciones/${id}`)
      .pipe(
        map((response) => {
          console.log('📥 InstitutionService: Respuesta institución individual:', response);
          
          let institution: Institution;
          
          // Manejar diferentes formatos de respuesta del backend
          if (response && response.data && response.data.institucion) {
            // Formato: {status: "success", data: {institucion: {...}}}
            institution = response.data.institucion;
          } else if (response && response.data && !response.data.institucion) {
            // Formato: {status: "success", data: {...}} (institución directa en data)
            institution = response.data;
          } else if (response && !response.data) {
            // Formato: {...} (institución directa)
            institution = response;
          } else {
            throw new Error('Formato de respuesta inesperado');
          }
          
          console.log('🏢 InstitutionService: Institución procesada:', institution);
          return institution;
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error al obtener institución:', error);
          throw error;
        })
      );
  }

  /**
   * Crea una nueva institución
   */
  createInstitution(institutionData: CreateInstitutionRequest): Observable<Institution> {
    console.log('➕ InstitutionService: Creando institución:', institutionData);
    
    return this.http.post<InstitutionResponse>(`${this.apiUrl}/instituciones`, institutionData)
      .pipe(
        map((response) => {
          console.log('✅ InstitutionService: Institución creada:', response);
          
          // Manejar diferentes formatos de respuesta
          if (response.data && (response.data as any).institucion) {
            return (response.data as any).institucion;
          } else if (response.data) {
            return response.data as Institution;
          }
          
          throw new Error('Formato de respuesta inesperado');
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error al crear institución:', error);
          throw error;
        })
      );
  }

/**
 * Subir logo de institución
 */
uploadLogo(institutionId: number, file: File): Observable<any> {
  console.log('🔧 Service.uploadLogo: Iniciando para ID:', institutionId);
  console.log('📎 Service.uploadLogo: Archivo:', file.name, file.type, file.size);
  
  const formData = new FormData();
  formData.append('logo', file);
  
  console.log('📤 Service.uploadLogo: Enviando POST a:', `${this.apiUrl}/instituciones/${institutionId}/logo`);
  
  return this.http.post<any>(`${this.apiUrl}/instituciones/${institutionId}/logo`, formData)
    .pipe(
      map(response => {
        console.log('✅ Service.uploadLogo: Respuesta completa del backend:', response);
        console.log('📦 Service.uploadLogo: response.data:', response.data);
        
        // Verificar estructura de respuesta
        if (!response.data) {
          console.error('⚠️ Service.uploadLogo: response.data es undefined');
          throw new Error('Respuesta del servidor inválida: falta data');
        }
        
        console.log('✅ Service.uploadLogo: Retornando:', response.data);
        return response.data;
      }),
      catchError(error => {
        console.error('❌ Service.uploadLogo: Error completo:', error);
        console.error('❌ Service.uploadLogo: error.error:', error.error);
        console.error('❌ Service.uploadLogo: error.status:', error.status);
        throw error;
      })
    );
}

/**
 * Eliminar logo de institución
 */
deleteLogo(institutionId: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/instituciones/${institutionId}/logo`)
    .pipe(
      map(response => {
        console.log('✅ Logo eliminado:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Error al eliminar logo:', error);
        throw error;
      })
    );
}

  /**
   * Actualiza una institución existente
   */
  updateInstitution(id: number, institutionData: UpdateInstitutionRequest): Observable<Institution> {
    console.log('📝 InstitutionService: Actualizando institución ID:', id, 'Datos:', institutionData);
    
    return this.http.put<any>(`${this.apiUrl}/instituciones/${id}`, institutionData)
      .pipe(
        map((response) => {
          console.log('📥 InstitutionService: Respuesta actualización institución:', response);
          
          let institution: Institution;
          
          // Manejar diferentes formatos de respuesta del backend
          if (response && response.data && response.data.institucion) {
            // Formato: {status: "success", data: {institucion: {...}}}
            institution = response.data.institucion;
          } else if (response && response.data && !response.data.institucion) {
            // Formato: {status: "success", data: {...}} (institución directa en data)
            institution = response.data;
          } else if (response && !response.data) {
            // Formato: {...} (institución directa)
            institution = response;
          } else {
            throw new Error('Formato de respuesta inesperado');
          }
          
          console.log('🏢 InstitutionService: Institución actualizada:', institution);
          return institution;
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error al actualizar institución:', error);
          throw error;
        })
      );
  }

  /**
   * Elimina/desactiva una institución
   */
  deleteInstitution(id: number, motivo?: string): Observable<InstitutionOperationResponse> {
    console.log('🗑️ InstitutionService: Eliminando institución ID:', id, 'Motivo:', motivo);
    
    const body = motivo ? { motivo } : {};
    
    return this.http.delete<InstitutionOperationResponse>(`${this.apiUrl}/instituciones/${id}`, { body })
      .pipe(
        map((response) => {
          console.log('✅ InstitutionService: Institución eliminada:', response);
          return response;
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error al eliminar institución:', error);
          throw error;
        })
      );
  }

  /**
   * Obtiene estadísticas generales de instituciones
   */
  getInstitutionStats(): Observable<InstitutionStats> {
    console.log('📊 InstitutionService: Obteniendo estadísticas de instituciones');
    
    return this.http.get<any>(`${this.apiUrl}/instituciones/stats`)
      .pipe(
        map((response) => {
          console.log('📥 InstitutionService: Estadísticas recibidas:', response);
          return response.data || response;
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error al obtener estadísticas:', error);
          // Retornar estadísticas vacías en caso de error
          return of({
            total: 0,
            activas: 0,
            inactivas: 0,
            suspendidas: 0,
            por_tipo: {
              club: 0,
              fundacion: 0,
              ong: 0,
              cooperativa: 0,
              escuela: 0,
              otro: 0
            },
            con_rifas_activas: 0,
            total_usuarios_instituciones: 0,
            promedio_usuarios_por_institucion: 0
          } as InstitutionStats);
        })
      );
  }

  /**
   * Obtiene información detallada de una institución
   */
  getInstitutionDetail(id: number): Observable<InstitutionDetail> {
    console.log('📋 InstitutionService: Obteniendo detalle completo de institución ID:', id);
    
    return this.http.get<any>(`${this.apiUrl}/instituciones/${id}/detalle`)
      .pipe(
        map((response) => {
          console.log('📥 InstitutionService: Detalle recibido:', response);
          return response.data || response;
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error al obtener detalle:', error);
          throw error;
        })
      );
  }

  /**
   * Asigna un administrador a una institución
   */
  assignAdmin(institutionId: number, adminData: AssignAdminRequest): Observable<InstitutionOperationResponse> {
    console.log('👤 InstitutionService: Asignando admin a institución ID:', institutionId, 'Admin:', adminData);
    
    return this.http.post<InstitutionOperationResponse>(`${this.apiUrl}/instituciones/${institutionId}/admin`, adminData)
      .pipe(
        map((response) => {
          console.log('✅ InstitutionService: Admin asignado:', response);
          return response;
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error al asignar admin:', error);
          throw error;
        })
      );
  }

  /**
   * Remueve un administrador de una institución
   */
  removeAdmin(institutionId: number, userId: number): Observable<InstitutionOperationResponse> {
    console.log('👤 InstitutionService: Removiendo admin de institución ID:', institutionId, 'Usuario ID:', userId);
    
    return this.http.delete<InstitutionOperationResponse>(`${this.apiUrl}/instituciones/${institutionId}/admin/${userId}`)
      .pipe(
        map((response) => {
          console.log('✅ InstitutionService: Admin removido:', response);
          return response;
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error al remover admin:', error);
          throw error;
        })
      );
  }

  /**
   * Obtiene instituciones para dropdown/select
   */
  getInstitutionsForSelect(): Observable<Array<{id: number, nombre: string, activa: boolean}>> {
    console.log('📋 InstitutionService: Obteniendo instituciones para select');
    
    return this.http.get<any>(`${this.apiUrl}/instituciones/select`)
      .pipe(
        map((response) => {
          console.log('📥 InstitutionService: Instituciones para select:', response);
          return response.data || response || [];
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error al obtener instituciones para select:', error);
          return of([]);
        })
      );
  }

  /**
   * Valida datos de institución
   */
  validateInstitution(institutionData: CreateInstitutionRequest | UpdateInstitutionRequest): Observable<{valid: boolean, errors: any}> {
    console.log('✅ InstitutionService: Validando datos de institución:', institutionData);
    
    return this.http.post<any>(`${this.apiUrl}/instituciones/validate`, institutionData)
      .pipe(
        map((response) => {
          console.log('📥 InstitutionService: Resultado validación:', response);
          return response.data || response;
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error en validación:', error);
          return of({ valid: false, errors: { general: ['Error de validación'] } });
        })
      );
  }

  /**
   * Obtiene actividad reciente de una institución
   */
  getInstitutionActivity(id: number, limit: number = 10): Observable<any[]> {
    console.log('📈 InstitutionService: Obteniendo actividad de institución ID:', id);
    
    return this.http.get<any>(`${this.apiUrl}/instituciones/${id}/actividad?limit=${limit}`)
      .pipe(
        map((response) => {
          console.log('📥 InstitutionService: Actividad recibida:', response);
          return response.data || response || [];
        }),
        catchError((error) => {
          console.error('❌ InstitutionService: Error al obtener actividad:', error);
          return of([]);
        })
      );
  }
}