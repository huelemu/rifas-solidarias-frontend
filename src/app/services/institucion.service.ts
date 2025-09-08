// src/app/services/institucion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Institucion {
  id?: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email: string;
  logo_url?: string;
  estado?: 'activa' | 'inactiva';
  fecha_creacion?: string;
}

export interface InstitucionInput {
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email: string;
  logo_url?: string;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class InstitucionService {
  private baseUrl = 'http://localhost:3100/api';

  constructor(private http: HttpClient) {}

  // Obtener todas las instituciones
  obtenerInstituciones(): Observable<ApiResponse<Institucion[]>> {
    return this.http.get<ApiResponse<Institucion[]>>(`${this.baseUrl}/instituciones`);
  }

  // Obtener institución por ID
  obtenerInstitucionPorId(id: number): Observable<ApiResponse<Institucion>> {
    return this.http.get<ApiResponse<Institucion>>(`${this.baseUrl}/instituciones/${id}`);
  }

  // Crear nueva institución
  crearInstitucion(institucion: InstitucionInput): Observable<ApiResponse<Institucion>> {
    return this.http.post<ApiResponse<Institucion>>(`${this.baseUrl}/instituciones`, institucion);
  }

  // Actualizar institución
  actualizarInstitucion(id: number, institucion: Partial<Institucion>): Observable<ApiResponse<Institucion>> {
    return this.http.put<ApiResponse<Institucion>>(`${this.baseUrl}/instituciones/${id}`, institucion);
  }

  // Eliminar institución
  eliminarInstitucion(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/instituciones/${id}`);
  }
}