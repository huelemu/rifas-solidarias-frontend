// src/app/services/usuario.service.ts - CORREGIDO CON AUTENTICACIÓN
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  dni?: string;
  rol: 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';
  estado?: 'activo' | 'inactivo';
  institucion_nombre?: string;
  institucion_id?: number;
  fecha_creacion?: string;
}

export interface UsuarioInput {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  dni?: string;
  rol: string;
  institucion_id?: number;
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
export class UsuarioService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    // Detectar automáticamente la URL de la API
    this.baseUrl = this.getApiUrl();
    console.log('👥 UsuarioService inicializado con URL:', this.baseUrl);
  }

  private getApiUrl(): string {
    // Detectar automáticamente según el hostname
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  // Método para obtener headers con token de autorización
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Obtener todos los usuarios
  obtenerUsuarios(): Observable<ApiResponse<Usuario[]>> {
    const headers = this.getAuthHeaders();
    console.log('📡 GET', `${this.baseUrl}/usuarios`, 'with auth headers');
    return this.http.get<ApiResponse<Usuario[]>>(`${this.baseUrl}/usuarios`, { headers });
  }

  // Obtener usuario por ID
  obtenerUsuarioPorId(id: number): Observable<ApiResponse<Usuario>> {
    const headers = this.getAuthHeaders();
    console.log('📡 GET', `${this.baseUrl}/usuarios/${id}`, 'with auth headers');
    return this.http.get<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios/${id}`, { headers });
  }

  // Crear nuevo usuario
  crearUsuario(usuario: UsuarioInput): Observable<ApiResponse<Usuario>> {
    const headers = this.getAuthHeaders();
    console.log('📡 POST', `${this.baseUrl}/usuarios`, usuario, 'with auth headers');
    return this.http.post<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios`, usuario, { headers });
  }

  // Actualizar usuario
  actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    const headers = this.getAuthHeaders();
    console.log('📡 PUT', `${this.baseUrl}/usuarios/${id}`, usuario, 'with auth headers');
    return this.http.put<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios/${id}`, usuario, { headers });
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    console.log('📡 DELETE', `${this.baseUrl}/usuarios/${id}`, 'with auth headers');
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/usuarios/${id}`, { headers });
  }
}