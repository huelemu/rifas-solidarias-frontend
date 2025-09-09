// src/app/services/usuario.service.ts - CORREGIDO
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  // Obtener todos los usuarios
  obtenerUsuarios(): Observable<ApiResponse<Usuario[]>> {
    console.log('📡 GET', `${this.baseUrl}/usuarios`);
    return this.http.get<ApiResponse<Usuario[]>>(`${this.baseUrl}/usuarios`);
  }

  // Obtener usuario por ID
  obtenerUsuarioPorId(id: number): Observable<ApiResponse<Usuario>> {
    console.log('📡 GET', `${this.baseUrl}/usuarios/${id}`);
    return this.http.get<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios/${id}`);
  }

  // Crear nuevo usuario
  crearUsuario(usuario: UsuarioInput): Observable<ApiResponse<Usuario>> {
    console.log('📡 POST', `${this.baseUrl}/usuarios`, usuario);
    return this.http.post<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios`, usuario);
  }

  // Actualizar usuario
  actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    console.log('📡 PUT', `${this.baseUrl}/usuarios/${id}`, usuario);
    return this.http.put<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios/${id}`, usuario);
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<ApiResponse<any>> {
    console.log('📡 DELETE', `${this.baseUrl}/usuarios/${id}`);
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/usuarios/${id}`);
  }
}