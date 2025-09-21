// ===================================================================
// 🔧 AUTH SERVICE COMPLETO Y CORREGIDO
// src/app/services/auth.service.ts
// ===================================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

// ===================================================================
// 📋 INTERFACES PARA TYPESAFETY
// ===================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  dni?: string;
  rol: string;
  institucion_id?: number;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  institucion_id?: number;
  institucion_nombre?: string;
  estado: string;
  created_at: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export enum UserRole {
  ADMIN_GLOBAL = 'admin_global',
  ADMIN_INSTITUCION = 'admin_institucion',
  VENDEDOR = 'vendedor',
  COMPRADOR = 'comprador'
}

// ===================================================================
// 🔧 AUTH SERVICE PRINCIPAL
// ===================================================================

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // ==================
  // CONFIGURACIÓN
  // ==================
  
  private readonly API_BASE_URL = 'http://localhost:3100'; // 🔧 Cambiar según tu backend
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_DATA_KEY = 'user_data';
  
  // ==================
  // ESTADO REACTIVO
  // ==================
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  // Observables públicos para componentes
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  // ==================
  // CONSTRUCTOR
  // ==================
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🔧 AuthService inicializado');
    this.loadAuthStateFromStorage();
    this.startTokenRefreshTimer();
  }
  
  // ===================================================================
  // 🔑 MÉTODOS DE AUTENTICACIÓN
  // ===================================================================
  
  /**
   * 🚪 LOGIN - Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔑 Iniciando login para:', credentials.email);
    
    return this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            console.log('✅ Login exitoso');
            this.handleAuthSuccess(response.data);
          } else {
            console.error('❌ Login fallido:', response.message);
          }
        }),
        catchError(error => {
          console.error('❌ Error en login:', error);
          return throwError(() => this.handleAuthError(error));
        })
      );
  }
  
  /**
   * 📝 REGISTER - Registrar nuevo usuario
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    console.log('📝 Registrando usuario:', userData.email);
    
    return this.http.post<RegisterResponse>(`${this.API_BASE_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            console.log('✅ Registro exitoso');
            this.handleAuthSuccess(response.data);
          } else {
            console.error('❌ Registro fallido:', response.message);
          }
        }),
        catchError(error => {
          console.error('❌ Error en registro:', error);
          return throwError(() => this.handleAuthError(error));
        })
      );
  }
  
  /**
   * 👋 LOGOUT - Cerrar sesión
   */
  logout(): Observable<any> {
    console.log('👋 Cerrando sesión...');
    
    const logoutRequest = this.http.post(`${this.API_BASE_URL}/auth/logout`, {})
      .pipe(
        catchError(error => {
          console.log('⚠️ Error notificando logout al servidor:', error);
          return throwError(() => error);
        })
      );
    
    // Limpiar estado local independientemente del resultado del servidor
    this.clearAuthData();
    this.redirectToLogin();
    
    return logoutRequest;
  }
  
  /**
   * 🔄 REFRESH TOKEN - Renovar token automáticamente
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      console.log('❌ No hay refresh token disponible');
      this.clearAuthData();
      return throwError(() => new Error('No refresh token available'));
    }
    
    console.log('🔄 Renovando token...');
    
    return this.http.post<any>(`${this.API_BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    }).pipe(
      tap(response => {
        if (response.success) {
          console.log('✅ Token renovado exitosamente');
          this.setAccessToken(response.data.accessToken);
          
          if (response.data.refreshToken) {
            this.setRefreshToken(response.data.refreshToken);
          }
        }
      }),
      catchError(error => {
        console.error('❌ Error renovando token:', error);
        this.clearAuthData();
        this.redirectToLogin();
        return throwError(() => error);
      })
    );
  }
  
  // ===================================================================
  // 💾 GESTIÓN DE TOKENS Y ESTADO
  // ===================================================================
  
  private handleAuthSuccess(data: { user: User; accessToken: string; refreshToken: string }): void {
    this.setAccessToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);
    this.setUserData(data.user);
    this.updateAuthState(data.user);
  }
  
  private handleAuthError(error: any): Error {
    let errorMessage = 'Error de autenticación';
    
    if (error.status === 401) {
      errorMessage = 'Credenciales inválidas';
    } else if (error.status === 423) {
      errorMessage = 'Usuario bloqueado temporalmente';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión con el servidor';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return new Error(errorMessage);
  }
  
  // ==================
  // ✅ MÉTODOS PÚBLICOS DE TOKENS (CORREGIDOS)
  // ==================
  
  public setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }
  
  public setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }
  
  public setUserData(user: User): void {
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
  }
  
  public getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  
  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  private clearAuthData(): void {
    console.log('🗑️ Limpiando datos de autenticación...');
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    this.updateAuthState(null);
  }
  
  private updateAuthState(user: User | null): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }
  
  private loadAuthStateFromStorage(): void {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    const accessToken = this.getAccessToken();
    
    if (userData && accessToken) {
      try {
        const user = JSON.parse(userData);
        this.updateAuthState(user);
        console.log('✅ Estado de autenticación cargado desde storage');
      } catch (error) {
        console.error('❌ Error parseando datos de usuario:', error);
        this.clearAuthData();
      }
    }
  }
  
  // ===================================================================
  // 🔄 AUTO-REFRESH DE TOKENS
  // ===================================================================
  
  private startTokenRefreshTimer(): void {
    // Verificar token cada 5 minutos
    timer(0, 5 * 60 * 1000).subscribe(() => {
      if (this.isAuthenticated() && this.shouldRefreshToken()) {
        this.refreshToken().subscribe({
          next: () => console.log('🔄 Token renovado automáticamente'),
          error: (error) => console.log('❌ Error en auto-refresh:', error)
        });
      }
    });
  }
  
  private shouldRefreshToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    
    try {
      // Decodificar JWT para verificar expiración (simplificado)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const bufferTime = 5 * 60; // 5 minutos antes de expirar
      
      return payload.exp && (payload.exp - now) < bufferTime;
    } catch (error) {
      console.error('❌ Error verificando expiración de token:', error);
      return true; // Si hay error, intentar renovar
    }
  }
  
  // ===================================================================
  // 🔐 VERIFICACIONES DE AUTENTICACIÓN Y ROLES
  // ===================================================================
  
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getCurrentUser();
  }
  
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.USER_DATA_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('❌ Error parseando datos de usuario:', error);
        return null;
      }
    }
    return null;
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
      [UserRole.ADMIN_GLOBAL]: 4,
      [UserRole.ADMIN_INSTITUCION]: 3,
      [UserRole.VENDEDOR]: 2,
      [UserRole.COMPRADOR]: 1
    };

    const userLevel = roleHierarchy[user.rol as UserRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole as UserRole] || 0;

    return userLevel >= requiredLevel;
  }
  
  // ✅ MÉTODOS ADICIONALES PARA COMPATIBILIDAD
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? (user.rol === UserRole.ADMIN_GLOBAL || user.rol === UserRole.ADMIN_INSTITUCION) : false;
  }
  
  // ===================================================================
  // 🗺️ NAVEGACIÓN Y REDIRECCIÓN
  // ===================================================================
  
  redirectToLogin(): void {
    console.log('🚪 Redirigiendo al login...');
    this.router.navigate(['/login']);
  }
  
  redirectToDashboard(): void {
    console.log('🏠 Redirigiendo al dashboard...');
    const user = this.getCurrentUser();
    
    if (user) {
      console.log('👤 Usuario:', user.email, 'Rol:', user.rol);
      
      // Redirigir según rol
      switch (user.rol) {
        case UserRole.ADMIN_GLOBAL:
          this.router.navigate(['/admin']);
          break;
        case UserRole.ADMIN_INSTITUCION:
          this.router.navigate(['/admin/instituciones']);
          break;
        default:
          this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
  
  // ===================================================================
  // 🌐 REQUESTS AUTENTICADOS
  // ===================================================================
  
  authenticatedRequest(endpoint: string, options: any = {}): Observable<any> {
    // El interceptor se encarga de agregar headers automáticamente
    const method = options.method || 'GET';
    const url = `${this.API_BASE_URL}${endpoint}`;
    
    return this.http.request(method, url, options);
  }
  
  // ===================================================================
  // 🏢 MÉTODOS AUXILIARES
  // ===================================================================
  
  /**
   * Obtener lista de instituciones (público)
   */
  getInstituciones(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/instituciones`)
      .pipe(
        catchError(error => {
          console.error('❌ Error cargando instituciones:', error);
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Verificar estado de autenticación con el servidor
   */
  validateTokenWithServer(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/auth/me`)
      .pipe(
        tap(response => {
          if (response && (response as any).data) {
            this.setUserData((response as any).data);
            this.updateAuthState((response as any).data);
          }
        }),
        catchError(error => {
          console.log('❌ Token inválido en servidor, limpiando sesión');
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Obtener headers de autorización
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
  
  /**
   * Método para obtener nombre de rol para mostrar
   */
  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      [UserRole.ADMIN_GLOBAL]: 'Administrador Global',
      [UserRole.ADMIN_INSTITUCION]: 'Administrador de Institución',
      [UserRole.VENDEDOR]: 'Vendedor',
      [UserRole.COMPRADOR]: 'Comprador'
    };
    return roleNames[role] || role;
  }
}