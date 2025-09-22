// ====================================
// src/app/services/api.service.ts
// ====================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { EnvironmentDetector } from '../utils/environment-detector';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private readonly apiUrl: string;
  
  constructor(private http: HttpClient) {
    this.apiUrl = EnvironmentDetector.getApiUrl();
    EnvironmentDetector.logEnvironmentInfo();
  }

  // Headers base para todas las peticiones
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // GET genérico
  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const httpParams = this.buildParams(params);
    
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      tap(() => this.logRequest('GET', url)),
      catchError(error => this.handleError(error))
    );
  }

  // POST genérico
  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    
    return this.http.post<T>(url, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.logRequest('POST', url)),
      catchError(error => this.handleError(error))
    );
  }

  // PUT genérico
  put<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    
    return this.http.put<T>(url, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.logRequest('PUT', url)),
      catchError(error => this.handleError(error))
    );
  }

  // DELETE genérico
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.apiUrl}${endpoint}`;
    
    return this.http.delete<T>(url, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.logRequest('DELETE', url)),
      catchError(error => this.handleError(error))
    );
  }

  // Construir parámetros HTTP
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    return httpParams;
  }

  // Manejo centralizado de errores
  private handleError(error: any): Observable<never> {
    console.error('❌ API Error:', error);
    
    let errorMessage = 'Error desconocido';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }
    
    return throwError(() => ({ 
      message: errorMessage, 
      status: error.status,
      error: error 
    }));
  }

  // Log de peticiones (solo en desarrollo)
  private logRequest(method: string, url: string): void {
    if (!EnvironmentDetector.getEnvironmentInfo().isProduction) {
      console.log(`🌐 ${method} ${url}`);
    }
  }

  // Test de conexión
  testConnection(): Observable<any> {
    return this.get('/test-db');
  }

  // Obtener información del entorno actual
  getEnvironmentInfo() {
    return {
      ...EnvironmentDetector.getEnvironmentInfo(),
      apiUrl: this.apiUrl
    };
  }
}