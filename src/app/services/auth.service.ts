// src/app/services/auth.service.ts - VERSIÓN COMPLETAMENTE CORREGIDA
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, tap, switchMap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';
  institucion_id?: number;
  institucion?: {
    id: number;
    nombre: string;
    tipo: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

// INTERFAZ CORREGIDA PARA BACKEND REAL
export interface LoginResponse {
  status: string;
  data?: {
    tokens: {
      access_token: string;
      refresh_token: string;
    };
    user: User;
  };
  message?: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  rol: string;
  institucion_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = 'http://localhost:3100';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_DATA_KEY = 'user_data';

  // BehaviorSubjects para estado reactivo
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserData());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verificar autenticación al inicializar
    this.checkAuthenticationStatus();
  }

  // ==================
  // MÉTODOS DE AUTENTICACIÓN CORREGIDOS
  // ==================

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('🔍 Respuesta completa del backend:', response);
          
          // Backend devuelve: { status: "success", data: { tokens: {...}, user: {...} } }
          if (response.status === 'success' && response.data) {
            const { tokens, user } = response.data;
            
            if (tokens && tokens.access_token && tokens.refresh_token) {
              this.setTokens(tokens.access_token, tokens.refresh_token);
              this.setUserData(user);
              this.updateAuthState(user);
              console.log('✅ Login exitoso:', user.email);
              console.log('✅ Token guardado:', tokens.access_token.substring(0, 20) + '...');
            } else {
              console.error('❌ Estructura de tokens incorrecta:', tokens);
            }
          } else {
            console.error('❌ Respuesta del backend incorrecta:', response);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.API_BASE_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          console.log('🔍 Respuesta de registro:', response);
          
          if (response.status === 'success' && response.data) {
            const { tokens, user } = response.data;
            
            if (tokens && tokens.access_token && tokens.refresh_token) {
              this.setTokens(tokens.access_token, tokens.refresh_token);
              this.setUserData(user);
              this.updateAuthState(user);
              console.log('✅ Registro exitoso:', user.email);
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/auth/logout`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        this.clearAuthData();
        this.updateAuthState(null);
        this.router.navigate(['/login']);
        console.log('✅ Logout exitoso');
      }),
      catchError(() => {
        // Incluso si falla el logout en el servidor, limpiamos localmente
        this.clearAuthData();
        this.updateAuthState(null);
        this.router.navigate(['/login']);
        return throwError('Logout failed');
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError('No refresh token available');
    }

    return this.http.post<any>(`${this.API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        console.log('🔍 Respuesta refresh token:', response);
        
        if (response.status === 'success' && response.data) {
          // Para refresh, el backend devuelve solo access_token
          this.setTokens(response.data.access_token, refreshToken);
          console.log('✅ Token renovado exitosamente');
        }
      }),
      catchError(error => {
        console.log('❌ Error renovando token, cerrando sesión');
        this.clearAuthData();
        this.updateAuthState(null);
        this.router.navigate(['/login']);
        return throwError(error);
      })
    );
  }

  // ==================
  // GESTIÓN DE TOKENS
  // ==================

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    console.log('✅ Tokens guardados en localStorage');
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ==================
  // GESTIÓN DE USUARIO
  // ==================

  private setUserData(user: User): void {
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
  }

  getUserData(): User | null {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
  }

  private updateAuthState(user: User | null): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }

  // ==================
  // VERIFICACIONES DE ROL
  // ==================

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.rol === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.rol) : false;
  }

  canAccess(requiredRole: string): boolean {
    if (!this.isAuthenticated()) return false;
    
    const user = this.getCurrentUser();
    if (!user) return false;

    // Jerarquía de roles
    const roleHierarchy: { [key: string]: number } = {
      'admin_global': 4,
      'admin_institucion': 3,
      'vendedor': 2,
      'comprador': 1
    };

    const userLevel = roleHierarchy[user.rol] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  // ==================
  // REQUESTS AUTENTICADOS
  // ==================

  authenticatedRequest(endpoint: string, options: any = {}): Observable<any> {
    const headers = this.getAuthHeaders();
    
    const requestOptions = {
      ...options,
      headers: headers
    };

    return this.http.request(
      options.method || 'GET',
      `${this.API_BASE_URL}${endpoint}`,
      requestOptions
    ).pipe(
      catchError(error => {
        if (error.status === 401) {
          // Token expirado, intentar renovar
          return this.refreshToken().pipe(
            switchMap(() => {
              // Reintentar la petición con el nuevo token
              const newHeaders = this.getAuthHeaders();
              return this.http.request(
                options.method || 'GET',
                `${this.API_BASE_URL}${endpoint}`,
                { ...requestOptions, headers: newHeaders }
              );
            })
          );
        }
        return throwError(error);
      })
    );
  }

  // ==================
  // MÉTODOS DE UTILIDAD
  // ==================

  private checkAuthenticationStatus(): void {
    if (this.isAuthenticated()) {
      // Verificar que el token sea válido
      this.authenticatedRequest('/auth/me').subscribe(
        (response) => {
          if (response.status === 'success' && response.data) {
            this.setUserData(response.data);
            this.updateAuthState(response.data);
          }
        },
        (error) => {
          console.log('❌ Token inválido, limpiando sesión');
          this.clearAuthData();
          this.updateAuthState(null);
        }
      );
    }
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  redirectToDashboard(): void {
    const user = this.getCurrentUser();
    if (user) {
      console.log('✅ Redirigiendo al dashboard para rol:', user.rol);
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  // Método para obtener instituciones (público)
  getInstituciones(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/instituciones`)
      .pipe(catchError(this.handleError));
  }

  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'Error desconocido';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    console.error('❌ Error en AuthService:', errorMessage);
    return throwError(errorMessage);
  };
  
// ✅ MÉTODO A AGREGAR EN AuthService
isAdmin(): boolean {
  const user = this.getCurrentUser();
  if (!user) return false;
  
  return user.rol === 'admin_global' || user.rol === 'admin_institucion';
}

// ✅ MÉTODO ADICIONAL ÚTIL: Verificar si puede gestionar rifas
canManageRifas(): boolean {
  const user = this.getCurrentUser();
  if (!user) return false;
  
  return ['admin_global', 'admin_institucion', 'vendedor'].includes(user.rol);
}

// ✅ MÉTODO ADICIONAL ÚTIL: Verificar si puede acceder a administración
canAccessAdmin(): boolean {
  const user = this.getCurrentUser();
  if (!user) return false;
  
  return user.rol === 'admin_global' || user.rol === 'admin_institucion';
}
}
