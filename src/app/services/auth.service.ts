// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, Subject, timer } from 'rxjs';
import { tap, catchError, filter, take } from 'rxjs/operators';

// ================== TIPOS ==================
export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  institucion_id?: number;
  estado: string;
  created_at: string;
}

export enum UserRole {
  ADMIN_GLOBAL = 'admin_global',
  ADMIN_INSTITUCION = 'admin_institucion',
  VENDEDOR = 'vendedor',
  COMPRADOR = 'comprador'
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: string;
  institucion_id?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// src/app/services/auth.service.ts

export interface LoginRequest {
  email: string;
  password: string;
}


// ================== SERVICIO ==================
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API_BASE_URL = 'http://localhost:3100';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_DATA_KEY = 'user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private refreshingToken = false;
  private refreshTokenSubject: Subject<string | null> = new Subject();

  constructor(private http: HttpClient, private router: Router) {
    console.log('[AuthService] Inicializado');
    this.loadAuthState();
    this.startAutoRefresh();
  }

  // ================== LOGIN / LOGOUT ==================
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_BASE_URL}/auth/login`, { email, password }).pipe(
      tap(res => this.handleAuthSuccess(res.data)),
      catchError(err => throwError(() => this.handleAuthError(err)))
    );
  }

  logout(): void {
    console.log('[AuthService] Logout iniciado');
    this.clearAuthData();
    this.router.navigate(['/login']);
    this.http.post(`${this.API_BASE_URL}/auth/logout`, {}).subscribe({
      next: () => console.log('[AuthService] Logout notificado al servidor'),
      error: () => console.warn('[AuthService] Error notificando logout al servidor')
    });
  }

  // ================== REGISTER ==================
  register(userData: RegisterRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_BASE_URL}/auth/register`, userData).pipe(
      tap(res => {
        if (res.success) console.log('[AuthService] Usuario registrado:', res.data);
      }),
      catchError(err => {
        console.error('[AuthService] Error en registro:', err);
        return throwError(() => err);
      })
    );
  }

  // ================== TOKENS ==================
  getAccessToken(): string | null { return localStorage.getItem(this.ACCESS_TOKEN_KEY); }
  getRefreshToken(): string | null { return localStorage.getItem(this.REFRESH_TOKEN_KEY); }
  setAccessToken(token: string) { localStorage.setItem(this.ACCESS_TOKEN_KEY, token); }
  setRefreshToken(token: string) { localStorage.setItem(this.REFRESH_TOKEN_KEY, token); }
  setUser(user: User) { 
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.currentUserSubject.value;
  }

  private clearAuthData() {
    console.log('[AuthService] Limpiando datos de auth');
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private handleAuthSuccess(data: { user: User, accessToken: string, refreshToken: string }) {
    this.setAccessToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);
    this.setUser(data.user);
  }

  private handleAuthError(error: any): Error {
    let msg = 'Error de autenticación';
    if (error.status === 401) msg = 'Credenciales inválidas';
    else if (error.status === 423) msg = 'Usuario bloqueado';
    else if (error.status === 500) msg = 'Error del servidor';
    else if (error.error?.message) msg = error.error.message;
    return new Error(msg);
  }

  // ================== REFRESH TOKEN ==================
  refreshToken(): Observable<string> {
    const token = this.getRefreshToken();
    if (!token) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    if (this.refreshingToken) {
      return this.refreshTokenSubject.pipe(
        filter(t => t !== null),
        take(1)
      ) as Observable<string>;
    }

    this.refreshingToken = true;
    this.refreshTokenSubject.next(null);

    return this.http.post<any>(`${this.API_BASE_URL}/auth/refresh`, { refreshToken: token }).pipe(
      tap(res => {
        this.setAccessToken(res.data.accessToken);
        if (res.data.refreshToken) this.setRefreshToken(res.data.refreshToken);
        this.refreshingToken = false;
        this.refreshTokenSubject.next(res.data.accessToken);
        console.log('[AuthService] Token renovado');
      }),
      catchError(err => {
        this.refreshingToken = false;
        this.logout();
        return throwError(() => err);
      })
    );
  }

  private startAutoRefresh() {
    timer(0, 60 * 1000).subscribe(() => {
      if (this.isAuthenticated() && this.shouldRefreshToken()) {
        this.refreshToken().subscribe({ next: () => console.log('[AuthService] Auto-refresh OK'), error: () => console.warn('[AuthService] Auto-refresh fallido') });
      }
    });
  }

  private shouldRefreshToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return (payload.exp - now) < 300;
    } catch { return true; }
  }

  private loadAuthState() {
    const user = localStorage.getItem(this.USER_DATA_KEY);
    const token = this.getAccessToken();
    if (user && token) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
        this.isAuthenticatedSubject.next(true);
      } catch { this.clearAuthData(); }
    }
  }

  // ================== GENERIC AUTH REQUEST ==================
  authenticatedRequest<T>(endpoint: string, options: { method?: string; body?: any; headers?: HttpHeaders } = {}): Observable<T> {
    const url = `${this.API_BASE_URL}${endpoint}`;
    const method = options.method || 'GET';
    return this.http.request<T>(method, url, {
      ...options,
      headers: this.getAuthHeaders(),
      observe: 'body' as const
    });
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' });
  }

  // ================== ROLES ==================
  redirectToDashboard(): void {
    const user = this.currentUserSubject.value;
    if (!user) {
      this.router.navigate(['/dashboard']);
      return;
    }
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
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.rol) : false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.rol === role : false;
  }

  isAdmin(): boolean {
    const r = this.currentUserSubject.value?.rol;
    return r === UserRole.ADMIN_GLOBAL || r === UserRole.ADMIN_INSTITUCION;
  }

  canAccess(requiredRole: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    const hierarchy: Record<string, number> = {
      [UserRole.ADMIN_GLOBAL]: 4,
      [UserRole.ADMIN_INSTITUCION]: 3,
      [UserRole.VENDEDOR]: 2,
      [UserRole.COMPRADOR]: 1
    };
    return (hierarchy[user.rol] ?? 0) >= (hierarchy[requiredRole] ?? 0);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
