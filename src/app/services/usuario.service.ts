// src/app/services/usuario.service.ts
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
  private baseUrl = 'http://localhost:3100/api';

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  obtenerUsuarios(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.baseUrl}/usuarios`);
  }

  // Obtener usuario por ID
  obtenerUsuarioPorId(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios/${id}`);
  }

  // Crear nuevo usuario
  crearUsuario(usuario: UsuarioInput): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios`, usuario);
  }

  // Actualizar usuario
  actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios/${id}`, usuario);
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/usuarios/${id}`);
  }
}