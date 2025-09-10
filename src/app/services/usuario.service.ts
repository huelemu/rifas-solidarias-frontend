// src/app/services/usuario.service.ts - VERSIÓN CON DEBUGGING DETALLADO
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
    this.baseUrl = this.getApiUrl();
    console.log('👥 UsuarioService inicializado con URL:', this.baseUrl);
  }

  private getApiUrl(): string {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  // Método mejorado para obtener headers con debugging detallado
  private getAuthHeaders(): HttpHeaders {
    console.log('🔍 === DEBUGGING AUTH HEADERS ===');
    
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('access_token');
    console.log('🔑 Token exists:', !!token);
    console.log('🔑 Token type:', typeof token);
    console.log('🔑 Token length:', token ? token.length : 0);
    
    if (token) {
      console.log('🔑 Token preview:', token.substring(0, 30) + '...');
      
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      // Verificar que el header se creó correctamente
      const authHeader = headers.get('Authorization');
      console.log('📤 Authorization header created:', !!authHeader);
      console.log('📤 Authorization header preview:', authHeader ? authHeader.substring(0, 30) + '...' : 'NULL');
      console.log('🔍 === END DEBUGGING ===');
      
      return headers;
    } else {
      console.log('⚠️ NO TOKEN FOUND - Enviando headers sin autorización');
      console.log('🔍 === END DEBUGGING ===');
      
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
  }

  // Método para verificar estado de autenticación
  private checkAuthState(): void {
    console.log('🔍 === ESTADO DE AUTENTICACIÓN ===');
    console.log('🔑 access_token:', localStorage.getItem('access_token') ? 'EXISTS' : 'NULL');
    console.log('🔑 refresh_token:', localStorage.getItem('refresh_token') ? 'EXISTS' : 'NULL');
    console.log('👤 user_data:', localStorage.getItem('user_data') ? 'EXISTS' : 'NULL');
    
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('👤 User role:', user.rol);
        console.log('👤 User email:', user.email);
      } catch (e) {
        console.log('❌ Error parsing user data:', e);
      }
    }
    console.log('🔍 === FIN ESTADO ===');
  }

  // Obtener todos los usuarios con debugging completo
  obtenerUsuarios(): Observable<ApiResponse<Usuario[]>> {
    console.log('🚀 === INICIANDO PETICIÓN DE USUARIOS ===');
    
    // Verificar estado antes de hacer la petición
    this.checkAuthState();
    
    const headers = this.getAuthHeaders();
    const url = `${this.baseUrl}/usuarios`;
    
    console.log('📡 Haciendo petición GET a:', url);
    console.log('📤 Headers que se enviarán:', {
      'Authorization': headers.get('Authorization') ? 'Bearer [TOKEN]' : 'NO_AUTH',
      'Content-Type': headers.get('Content-Type')
    });

    return this.http.get<ApiResponse<Usuario[]>>(url, { headers }).pipe(
      tap(response => {
        console.log('✅ Respuesta exitosa:', response);
      }),
      catchError(error => {
        console.log('❌ === ERROR EN PETICIÓN ===');
        console.log('❌ Status:', error.status);
        console.log('❌ StatusText:', error.statusText);
        console.log('❌ Error body:', error.error);
        console.log('❌ Full error:', error);
        console.log('❌ === FIN ERROR ===');
        
        // Re-verificar estado después del error
        this.checkAuthState();
        
        return throwError(error);
      })
    );
  }

  // Obtener usuario por ID
  obtenerUsuarioPorId(id: number): Observable<ApiResponse<Usuario>> {
    const headers = this.getAuthHeaders();
    console.log('📡 GET usuario por ID:', id);
    return this.http.get<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios/${id}`, { headers });
  }

  // Crear nuevo usuario
  crearUsuario(usuario: UsuarioInput): Observable<ApiResponse<Usuario>> {
    const headers = this.getAuthHeaders();
    console.log('📡 POST nuevo usuario:', usuario.email);
    return this.http.post<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios`, usuario, { headers });
  }

  // Actualizar usuario
  actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    const headers = this.getAuthHeaders();
    console.log('📡 PUT usuario:', id);
    return this.http.put<ApiResponse<Usuario>>(`${this.baseUrl}/usuarios/${id}`, usuario, { headers });
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<ApiResponse<any>> {
    const headers = this.getAuthHeaders();
    console.log('📡 DELETE usuario:', id);
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/usuarios/${id}`, { headers });
  }
}