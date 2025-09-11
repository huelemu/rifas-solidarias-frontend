// ====================================
// src/app/services/institucion.service.ts - ACTUALIZADO
// ====================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

// Importar interfaces
import { 
  Institucion, 
  CrearInstitucionRequest, 
  ActualizarInstitucionRequest,
  ApiResponse 
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class InstitucionService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {
    this.baseUrl = this.apiService.getApiUrl();
  }

  // Obtener todas las instituciones
  obtenerInstituciones(): Observable<ApiResponse<Institucion[]>> {
    return this.http.get<ApiResponse<Institucion[]>>(`${this.baseUrl}/instituciones`);
  }

  // Obtener institución por ID
  obtenerInstitucionPorId(id: number): Observable<ApiResponse<Institucion>> {
    return this.http.get<ApiResponse<Institucion>>(`${this.baseUrl}/instituciones/${id}`);
  }

  // Crear nueva institución
  crearInstitucion(institucion: CrearInstitucionRequest): Observable<ApiResponse<Institucion>> {
    return this.http.post<ApiResponse<Institucion>>(`${this.baseUrl}/instituciones`, institucion);
  }

  // Actualizar institución
  actualizarInstitucion(id: number, institucion: ActualizarInstitucionRequest): Observable<ApiResponse<Institucion>> {
    return this.http.put<ApiResponse<Institucion>>(`${this.baseUrl}/instituciones/${id}`, institucion);
  }

  // Eliminar institución
  eliminarInstitucion(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/instituciones/${id}`);
  }

  // Obtener instituciones activas
  obtenerInstitucionesActivas(): Observable<ApiResponse<Institucion[]>> {
    return this.http.get<ApiResponse<Institucion[]>>(`${this.baseUrl}/instituciones?estado=activa`);
  }
}