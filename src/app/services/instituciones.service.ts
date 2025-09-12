// =====================================================
// SERVICIO DE INSTITUCIONES - ANGULAR
// src/app/services/instituciones.service.ts
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// =====================================================
// INTERFACES PARA INSTITUCIONES
// =====================================================

export interface Institucion {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  cuit?: string;
  estado: 'activa' | 'inactiva';
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface InstitucionInput {
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  cuit?: string;
  estado?: 'activa' | 'inactiva';
}

export interface InstitucionConfig {
  id: number;
  institucion_id: number;
  puede_crear_rifas: boolean;
  puede_participar_rifas: boolean;
  comision_minima: number;
  comision_maxima: number;
  numeros_minimos_asignacion: number;
  numeros_maximos_asignacion: number;
  metodos_pago_habilitados: string[];
  requiere_aprobacion_participacion: boolean;
  configuraciones_adicionales?: any;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class InstitucionesService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = this.getApiUrl();
  }

  private getApiUrl(): string {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    return isLocalhost 
      ? 'http://localhost:3100' 
      : 'https://apirifas.huelemu.com.ar';
  }

  // =====================================================
  // MÉTODOS PRINCIPALES DE INSTITUCIONES
  // =====================================================

  // Listar todas las instituciones
  listarInstituciones(): Observable<Institucion[]> {
    return this.http.get<ApiResponse<Institucion[]>>(`${this.apiUrl}/instituciones`).pipe(
      map(response => response.data)
    );
  }

  // Obtener institución específica
  obtenerInstitucion(id: number): Observable<Institucion> {
    return this.http.get<ApiResponse<Institucion>>(`${this.apiUrl}/instituciones/${id}`).pipe(
      map(response => response.data)
    );
  }

  // Crear nueva institución
  crearInstitucion(institucion: Partial<Institucion>): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/instituciones`, institucion);
  }

  // Actualizar institución
  actualizarInstitucion(id: number, institucion: Partial<Institucion>): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/instituciones/${id}`, institucion);
  }

  // Eliminar institución
  eliminarInstitucion(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/instituciones/${id}`);
  }

  // Cambiar estado de institución
  cambiarEstado(id: number, estado: 'activa' | 'inactiva'): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/instituciones/${id}/estado`, { estado });
  }

  // =====================================================
  // MÉTODOS DE CONFIGURACIÓN
  // =====================================================

  // Obtener configuración de institución
  obtenerConfiguracion(institucionId: number): Observable<InstitucionConfig> {
    return this.http.get<ApiResponse<InstitucionConfig>>(`${this.apiUrl}/instituciones/${institucionId}/config`).pipe(
      map(response => response.data)
    );
  }

  // Actualizar configuración de institución
  actualizarConfiguracion(institucionId: number, config: Partial<InstitucionConfig>): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/instituciones/${institucionId}/config`, config);
  }

  // =====================================================
  // MÉTODOS ESPECÍFICOS PARA RIFAS
  // =====================================================

  // Obtener instituciones que pueden participar en rifas
  obtenerInstitucionesParticipantes(): Observable<Institucion[]> {
    return this.http.get<ApiResponse<Institucion[]>>(`${this.apiUrl}/instituciones/participantes`).pipe(
      map(response => response.data)
    );
  }

  // Obtener instituciones que pueden crear rifas
  obtenerInstitucionesCreadoras(): Observable<Institucion[]> {
    return this.http.get<ApiResponse<Institucion[]>>(`${this.apiUrl}/instituciones/creadoras`).pipe(
      map(response => response.data)
    );
  }

  // Obtener usuarios de una institución
  obtenerUsuarios(institucionId: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/instituciones/${institucionId}/usuarios`).pipe(
      map(response => response.data)
    );
  }

  // Obtener vendedores de una institución
  obtenerVendedores(institucionId: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/instituciones/${institucionId}/vendedores`).pipe(
      map(response => response.data)
    );
  }

  // =====================================================
  // MÉTODOS DE ESTADÍSTICAS
  // =====================================================

  // Estadísticas de una institución
  obtenerEstadisticas(institucionId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/instituciones/${institucionId}/estadisticas`).pipe(
      map(response => response.data)
    );
  }

  // Estadísticas generales de todas las instituciones
  obtenerEstadisticasGenerales(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/instituciones/estadisticas`).pipe(
      map(response => response.data)
    );
  }

  // =====================================================
  // MÉTODOS AUXILIARES
  // =====================================================

  // Buscar instituciones por nombre
  buscarInstituciones(termino: string): Observable<Institucion[]> {
    return this.http.get<ApiResponse<Institucion[]>>(`${this.apiUrl}/instituciones/buscar`, {
      params: { q: termino }
    }).pipe(
      map(response => response.data)
    );
  }

  // Validar disponibilidad de nombre
  validarNombre(nombre: string, excludeId?: number): Observable<boolean> {
    const params: any = { nombre };
    if (excludeId) {
      params.exclude = excludeId.toString();
    }
    
    return this.http.get<ApiResponse<{ disponible: boolean }>>(`${this.apiUrl}/instituciones/validar-nombre`, {
      params
    }).pipe(
      map(response => response.data.disponible)
    );
  }

  // Validar CUIT
  validarCuit(cuit: string, excludeId?: number): Observable<boolean> {
    const params: any = { cuit };
    if (excludeId) {
      params.exclude = excludeId.toString();
    }
    
    return this.http.get<ApiResponse<{ disponible: boolean }>>(`${this.apiUrl}/instituciones/validar-cuit`, {
      params
    }).pipe(
      map(response => response.data.disponible)
    );
  }

  // =====================================================
  // MÉTODOS PARA DROPDOWN/SELECT
  // =====================================================

  // Obtener instituciones activas para select
  obtenerInstitucionesActivas(): Observable<Institucion[]> {
    return this.listarInstituciones().pipe(
      map(instituciones => instituciones.filter(inst => inst.estado === 'activa'))
    );
  }

  // Obtener instituciones formateadas para dropdown
  obtenerOpcionesSelect(): Observable<{value: number, label: string}[]> {
    return this.obtenerInstitucionesActivas().pipe(
      map(instituciones => 
        instituciones.map(inst => ({
          value: inst.id,
          label: inst.nombre
        }))
      )
    );
  }
}