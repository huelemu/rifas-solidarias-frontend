// src/app/services/api.service.ts - CORREGIDO
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    // Detectar automáticamente la URL de la API
    this.baseUrl = this.getApiUrl();
    console.log('🔧 ApiService inicializado con URL:', this.baseUrl);
  }

  private getApiUrl(): string {
    // Detectar automáticamente según el hostname
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  // GET request
  get<T>(endpoint: string): Observable<T> {
    console.log('📡 GET', `${this.baseUrl}${endpoint}`);
    return this.http.get<T>(`${this.baseUrl}${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // POST request
  post<T>(endpoint: string, data: any): Observable<T> {
    console.log('📡 POST', `${this.baseUrl}${endpoint}`, data);
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // PUT request
  put<T>(endpoint: string, data: any): Observable<T> {
    console.log('📡 PUT', `${this.baseUrl}${endpoint}`, data);
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // DELETE request
  delete<T>(endpoint: string): Observable<T> {
    console.log('📡 DELETE', `${this.baseUrl}${endpoint}`);
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Manejo de errores mejorado
  private handleError(error: HttpErrorResponse) {
    console.error('❌ Error en API:', error);
    
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error de conexión: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 404) {
        errorMessage = 'Endpoint no encontrado';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => errorMessage);
  }

  // Test de conexión
  testConnection(): Observable<any> {
    return this.get('/test-db');
  }

  // Método para verificar el estado del servidor
  getServerStatus(): Observable<any> {
    return this.get('/');
  }

  // Test específico de CORS
  testCors(): Observable<any> {
    return this.get('/test-cors');
  }
}