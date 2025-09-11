// ====================================
// SOLUCIÓN 2: src/app/services/usuario.service.ts - CORREGIDO
// ====================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ IMPORTAR DESDE INTERFACES
import { Usuario } from '../interfaces/usuario.interface';

// ✅ INTERFACES TEMPORALES PARA COMPATIBILIDAD
export interface UsuarioInput {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  telefono?: string;
  dni?: string;
  rol: 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';
  institucion_id?: number;
  estado?: 'activo' | 'inactivo';
}

// ✅ RE-EXPORTAR LA INTERFAZ PARA COMPATIBILIDAD
export type { Usuario };

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // ✅ USAR LA MISMA URL QUE TU AUTHSERVICE
  private readonly API_BASE_URL = 'http://localhost:3100';

  constructor(private http: HttpClient) {
    console.log('👥 UsuarioService inicializado con URL:', this.API_BASE_URL);
  }

  // Obtener todos los usuarios
  obtenerUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/usuarios`);
  }

  // Obtener usuario por ID
  obtenerUsuarioPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/usuarios/${id}`);
  }

  // Crear nuevo usuario
  crearUsuario(usuario: UsuarioInput): Observable<any> {
    return this.http.post<any>(`${this.API_BASE_URL}/usuarios`, usuario);
  }

  // Actualizar usuario
  actualizarUsuario(id: number, usuario: Partial<UsuarioInput>): Observable<any> {
    return this.http.put<any>(`${this.API_BASE_URL}/usuarios/${id}`, usuario);
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_BASE_URL}/usuarios/${id}`);
  }

  // Obtener perfil del usuario actual
  obtenerPerfil(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/auth/me`);
  }
}