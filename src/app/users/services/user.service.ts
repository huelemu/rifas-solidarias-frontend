// src/app/users/services/user.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  UserExtended,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
  UserResponse,
  UserFilters,
  UserStats
} from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  
  // Detección automática de entorno
  private readonly apiUrl = this.getApiUrl();

  /**
   * Detecta automáticamente la URL de la API
   */
  private getApiUrl(): string {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  /**
   * Obtiene lista de usuarios con filtros opcionales
   */
  getUsers(filters: UserFilters = {}): Observable<{users: UserExtended[], pagination?: any}> {
    console.log('📋 UserService: Obteniendo usuarios con filtros:', filters);
    
    let params = new HttpParams();
    
    // Agregar filtros como parámetros de consulta
    if (filters.search && filters.search.trim()) {
      params = params.set('search', filters.search.trim());
      console.log('🔍 UserService: Agregando filtro search:', filters.search.trim());
    }
    
    if (filters.rol && filters.rol !== 'todos') {
      params = params.set('rol', filters.rol);
      console.log('👥 UserService: Agregando filtro rol:', filters.rol);
    }
    
    if (filters.estado && filters.estado !== 'todos') {
      params = params.set('estado', filters.estado);
      console.log('📊 UserService: Agregando filtro estado:', filters.estado);
    }
    
    if (filters.institucion_id) {
      params = params.set('institucion_id', filters.institucion_id.toString());
      console.log('🏢 UserService: Agregando filtro institucion_id:', filters.institucion_id);
    }
    
    if (filters.page) {
      params = params.set('page', filters.page.toString());
      console.log('📄 UserService: Agregando filtro page:', filters.page);
    }
    
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
      console.log('📊 UserService: Agregando filtro limit:', filters.limit);
    }

    const finalUrl = `${this.apiUrl}/usuarios?${params.toString()}`;
    console.log('🌐 UserService: URL final con parámetros:', finalUrl);

    return this.http.get<any>(finalUrl)
      .pipe(
        map((response) => {
          console.log('📥 UserService: Respuesta usuarios con filtros:', response);
          
          // Manejar diferentes formatos de respuesta del backend
          let users: UserExtended[] = [];
          let pagination = null;
          
          if (response && response.data) {
            // Formato: {status: "success", data: {usuarios: [...], pagination: {...}}}
            users = response.data.usuarios || response.data || [];
            pagination = response.data.pagination;
          } else if (Array.isArray(response)) {
            // Formato: [...] (array directo)
            users = response;
          } else if (response && Array.isArray(response.usuarios)) {
            // Formato: {usuarios: [...]}
            users = response.usuarios;
            pagination = response.pagination;
          }
          
          // Asegurar que users sea siempre un array
          if (!Array.isArray(users)) {
            console.warn('⚠️ UserService: Respuesta no contiene array de usuarios:', response);
            users = [];
          }
          
          console.log('✅ UserService: Usuarios procesados:', users.length, 'usuarios encontrados');
          
          return {
            users,
            pagination
          };
        }),
        catchError((error) => {
          console.error('❌ UserService: Error al obtener usuarios:', error);
          
          // Retornar estructura válida en caso de error
          return of({
            users: [],
            pagination: null
          });
        })
      );
  }

  /**
   * Obtiene un usuario por ID
   */
  getUserById(id: number): Observable<UserExtended> {
    console.log('👤 UserService: Obteniendo usuario ID:', id);
    
    return this.http.get<any>(`${this.apiUrl}/usuarios/${id}`)
      .pipe(
        map((response) => {
          console.log('📥 UserService: Respuesta usuario completa:', response);
          
          let user: UserExtended;
          
          // Manejar diferentes formatos de respuesta del backend
          if (response && response.data && response.data.usuario) {
            // Formato: {status: "success", data: {usuario: {...}}}
            user = response.data.usuario;
          } else if (response && response.data && !response.data.usuario) {
            // Formato: {status: "success", data: {...}} (usuario directo en data)
            user = response.data;
          } else if (response && !response.data) {
            // Formato: {...} (usuario directo)
            user = response;
          } else {
            throw new Error('Formato de respuesta inesperado');
          }
          
          console.log('👤 UserService: Usuario procesado:', user);
          return user;
        }),
        catchError((error) => {
          console.error('❌ UserService: Error al obtener usuario:', error);
          throw error;
        })
      );
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(userData: CreateUserRequest): Observable<UserExtended> {
    console.log('➕ UserService: Creando usuario:', userData);
    
    return this.http.post<UserResponse>(`${this.apiUrl}/usuarios`, userData)
      .pipe(
        map((response) => {
          console.log('✅ UserService: Usuario creado:', response);
          return response.data.usuario;
        }),
        catchError((error) => {
          console.error('❌ UserService: Error al crear usuario:', error);
          throw error;
        })
      );
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(id: number, userData: UpdateUserRequest): Observable<UserExtended> {
    console.log('📝 UserService: Actualizando usuario ID:', id, 'Datos:', userData);
    
    return this.http.put<any>(`${this.apiUrl}/usuarios/${id}`, userData)
      .pipe(
        map((response) => {
          console.log('📥 UserService: Respuesta actualización usuario:', response);
          
          let user: UserExtended;
          
          // Manejar diferentes formatos de respuesta del backend
          if (response && response.data && response.data.usuario) {
            // Formato: {status: "success", data: {usuario: {...}}}
            user = response.data.usuario;
          } else if (response && response.data && !response.data.usuario) {
            // Formato: {status: "success", data: {...}} (usuario directo en data)
            user = response.data;
          } else if (response && !response.data) {
            // Formato: {...} (usuario directo)
            user = response;
          } else {
            throw new Error('Formato de respuesta inesperado en actualización');
          }
          
          console.log('✅ UserService: Usuario actualizado procesado:', user);
          return user;
        }),
        catchError((error) => {
          console.error('❌ UserService: Error al actualizar usuario:', error);
          throw error;
        })
      );
  }

  /**
   * Elimina un usuario
   */
  deleteUser(id: number): Observable<boolean> {
    console.log('🗑️ UserService: Eliminando usuario ID:', id);
    
    return this.http.delete<{status: string, message: string}>(`${this.apiUrl}/usuarios/${id}`)
      .pipe(
        map((response) => {
          console.log('✅ UserService: Usuario eliminado:', response);
          return response.status === 'success';
        }),
        catchError((error) => {
          console.error('❌ UserService: Error al eliminar usuario:', error);
          throw error;
        })
      );
  }

  /**
   * Cambia el estado de un usuario (activar/desactivar/suspender)
   */
  changeUserStatus(id: number, estado: 'activo' | 'inactivo' | 'suspendido'): Observable<UserExtended> {
    console.log('🔄 UserService: Cambiando estado usuario ID:', id, 'Nuevo estado:', estado);
    
    return this.updateUser(id, { estado }).pipe(
      map((updatedUser) => {
        console.log('✅ UserService: Estado cambiado, usuario actualizado:', updatedUser);
        return updatedUser;
      }),
      catchError((error) => {
        console.error('❌ UserService: Error al cambiar estado:', error);
        throw error;
      })
    );
  }

  /**
   * Restablece la contraseña de un usuario
   */
  resetPassword(id: number, newPassword: string): Observable<boolean> {
    console.log('🔑 UserService: Restableciendo contraseña usuario ID:', id);
    
    return this.http.post<{status: string, message: string}>(`${this.apiUrl}/usuarios/${id}/reset-password`, {
      password: newPassword
    })
      .pipe(
        map((response) => {
          console.log('✅ UserService: Contraseña restablecida:', response);
          return response.status === 'success';
        }),
        catchError((error) => {
          console.error('❌ UserService: Error al restablecer contraseña:', error);
          throw error;
        })
      );
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  getUserStats(): Observable<UserStats> {
    console.log('📊 UserService: Obteniendo estadísticas de usuarios');
    
    return this.http.get<{status: string, data: UserStats}>(`${this.apiUrl}/usuarios/stats`)
      .pipe(
        map((response) => {
          console.log('📥 UserService: Estadísticas:', response);
          return response.data;
        }),
        catchError((error) => {
          console.error('❌ UserService: Error al obtener estadísticas:', error);
          throw error;
        })
      );
  }

  /**
   * Busca usuarios por término de búsqueda
   */
  searchUsers(searchTerm: string): Observable<UserExtended[]> {
    console.log('🔍 UserService: Buscando usuarios:', searchTerm);
    
    return this.getUsers({ search: searchTerm, limit: 50 })
      .pipe(
        map(result => result.users)
      );
  }

  /**
   * Obtiene usuarios de una institución específica
   */
  getUsersByInstitution(institutionId: number): Observable<UserExtended[]> {
    console.log('🏢 UserService: Obteniendo usuarios de institución:', institutionId);
    
    return this.getUsers({ institucion_id: institutionId })
      .pipe(
        map(result => result.users)
      );
  }

  /**
   * Valida si un email ya existe
   */
  checkEmailExists(email: string, excludeUserId?: number): Observable<boolean> {
    console.log('📧 UserService: Verificando email:', email);
    
    let params = new HttpParams().set('email', email);
    if (excludeUserId) {
      params = params.set('exclude_id', excludeUserId.toString());
    }

    return this.http.get<{exists: boolean}>(`${this.apiUrl}/usuarios/check-email`, { params })
      .pipe(
        map((response) => {
          console.log('📥 UserService: Email existe:', response.exists);
          return response.exists;
        }),
        catchError((error) => {
          console.error('❌ UserService: Error al verificar email:', error);
          return [false]; // En caso de error, asumir que no existe
        })
      );
  }
}