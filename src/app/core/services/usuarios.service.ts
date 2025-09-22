// src/app/services/usuarios.service.ts - CORREGIDO
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly API_BASE_URL = 'http://localhost:3100';

  constructor(private http: HttpClient) {
    console.log('👥 UsuariosService inicializado con URL:', this.API_BASE_URL);
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
  crearUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.API_BASE_URL}/usuarios`, usuario);
  }

  // Actualizar usuario
  actualizarUsuario(id: number, usuario: any): Observable<any> {
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

  // Cambiar estado de usuario
  cambiarEstadoUsuario(id: number, estado: 'activo' | 'inactivo'): Observable<any> {
    return this.http.patch<any>(`${this.API_BASE_URL}/usuarios/${id}/estado`, { estado });
  }

  // Resetear contraseña
  resetearPassword(id: number): Observable<any> {
    return this.http.post<any>(`${this.API_BASE_URL}/usuarios/${id}/reset-password`, {});
  }
}