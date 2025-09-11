// ====================================
// SOLUCIÓN 1: src/app/services/institucion.service.ts - CORREGIDO
// ====================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ IMPORTAR DESDE INTERFACES (NO DECLARAR AQUÍ)
import { Institucion } from '../interfaces/institucion.interface';

// ✅ INTERFACES TEMPORALES PARA COMPATIBILIDAD (hasta que actualices los componentes)
export interface InstitucionInput {
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  estado?: 'activa' | 'inactiva';
}

// ✅ RE-EXPORTAR LA INTERFAZ PARA COMPATIBILIDAD
export type  { Institucion };

@Injectable({
  providedIn: 'root'
})
export class InstitucionService {
  // ✅ USAR LA MISMA URL QUE TU AUTHSERVICE
  private readonly API_BASE_URL = 'http://localhost:3100';

  constructor(private http: HttpClient) {
    console.log('🏢 InstitucionService inicializado con URL:', this.API_BASE_URL);
  }

  // Obtener todas las instituciones
  obtenerInstituciones(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/instituciones`);
  }

  // Obtener institución por ID
  obtenerInstitucionPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/instituciones/${id}`);
  }

  // Crear nueva institución
  crearInstitucion(institucion: InstitucionInput): Observable<any> {
    return this.http.post<any>(`${this.API_BASE_URL}/instituciones`, institucion);
  }

  // Actualizar institución
  actualizarInstitucion(id: number, institucion: Partial<InstitucionInput>): Observable<any> {
    return this.http.put<any>(`${this.API_BASE_URL}/instituciones/${id}`, institucion);
  }

  // Eliminar institución
  eliminarInstitucion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_BASE_URL}/instituciones/${id}`);
  }

  // Obtener instituciones activas
  obtenerInstitucionesActivas(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/instituciones?estado=activa`);
  }
}