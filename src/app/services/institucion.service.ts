// src/app/services/institucion.service.ts - CORREGIDO
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
  estado: 'activa' | 'inactiva';
  created_at?: string;
  updated_at?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface InstitucionInput {
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email: string;
  logo_url?: string;
  estado?: 'activa' | 'inactiva';
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class InstitucionService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    // Detectar automáticamente la URL de la API
    this.apiUrl = this.getApiUrl();
    console.log('🏢 InstitucionService inicializado con URL:', this.apiUrl);
  }

  private getApiUrl(): string {
    // Detectar automáticamente según el hostname
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  obtenerInstituciones(): Observable<ApiResponse<Institucion[]>> {
    console.log('📡 GET', `${this.apiUrl}/instituciones`);
    return this.http.get<ApiResponse<Institucion[]>>(`${this.apiUrl}/instituciones`);
  }

  obtenerInstitucion(id: number): Observable<ApiResponse<Institucion>> {
    console.log('📡 GET', `${this.apiUrl}/instituciones/${id}`);
    return this.http.get<ApiResponse<Institucion>>(`${this.apiUrl}/instituciones/${id}`);
  }

  crearInstitucion(institucion: InstitucionInput): Observable<ApiResponse<Institucion>> {
    console.log('📡 POST', `${this.apiUrl}/instituciones`, institucion);
    return this.http.post<ApiResponse<Institucion>>(`${this.apiUrl}/instituciones`, institucion);
  }

  actualizarInstitucion(id: number, institucion: Partial<Institucion>): Observable<ApiResponse<Institucion>> {
    console.log('📡 PUT', `${this.apiUrl}/instituciones/${id}`, institucion);
    return this.http.put<ApiResponse<Institucion>>(`${this.apiUrl}/instituciones/${id}`, institucion);
  }

  eliminarInstitucion(id: number): Observable<ApiResponse<any>> {
    console.log('📡 DELETE', `${this.apiUrl}/instituciones/${id}`);
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/instituciones/${id}`);
  }
}