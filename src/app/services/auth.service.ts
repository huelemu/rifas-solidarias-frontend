import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

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
    descripcion: string;
  };
  fecha_creacion: string;
}

export interface LoginRequest {
  email: string;
  password: string;
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

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';
  institucion_id?: number;
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly API_BASE_URL = this.getApiUrl(); // Hacer público para acceso externo
  private readonly TOKEN_KEY = 'rifas_access_token';
  private readonly REFRESH_TOKEN_KEY = 'rifas_refresh_token';
  private readonly USER_KEY = 'rifas_user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  // Observable para el estado de autenticación
  public isAuthenticated$ = this.currentUser$.pipe(
    map(user => !!user)
  );

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkTokenOnInit();
  }

  private getApiUrl(): string {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  private checkTokenOnInit(): void {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    
    if (token && user) {
      if (this.isTokenExpired(token)) {
        this.refreshToken().subscribe({
          next: () => {
            console.log('Token refreshed successfully on init');
          },
          error: () => {
            this.logout();
          }
        });
      }
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      
      console.log('⏰ Verificando expiración del token:');
      console.log('  - Token expira en:', new Date(payload.exp * 1000));
      console.log('  - Hora actual:', new Date());
      console.log('  - ¿Está expirado?', isExpired);
      
      return isExpired;
    } catch (error) {
      console.log('❌ Error parseando token:', error);
      return true;
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setTokens(response.data.accessToken, response.data.refreshToken);
            this.setUser(response.data.user);
            this.currentUserSubject.next(response.data.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_BASE_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setTokens(response.data.accessToken, response.data.refreshToken);
            this.setUser(response.data.user);
            this.currentUserSubject.next(response.data.user);
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    
    if (refreshToken) {
      this.http.post(`${this.API_BASE_URL}/auth/logout`, { refreshToken })
        .subscribe({
          next: () => console.log('Logout successful'),
          error: (error) => console.error('Logout error:', error)
        });
    }

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => 'No refresh token available');
    }

    return this.http.post<any>(`${this.API_BASE_URL}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          if (response.success && response.data.accessToken) {
            this.setTokens(response.data.accessToken, refreshToken);
          }
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    
    console.log('🔐 Verificando autenticación...');
    console.log('📝 Token encontrado:', token ? 'SÍ' : 'NO');
    console.log('👤 Usuario encontrado:', user ? 'SÍ' : 'NO');
    
    if (!token || !user) {
      console.log('❌ No hay token o usuario');
      return false;
    }

    if (this.isTokenExpired(token)) {
      console.log('⏰ Token expirado, intentando refresh...');
      this.refreshToken().subscribe({
        error: () => {
          console.log('❌ Refresh falló, cerrando sesión');
          this.logout();
        }
      });
      return false;
    }

    console.log('✅ Usuario autenticado correctamente');
    return true;
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.rol === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.rol) : false;
  }

  isAdmin(): boolean {
    return this.hasAnyRole(['admin_global', 'admin_institucion']);
  }

  isGlobalAdmin(): boolean {
    return this.hasRole('admin_global');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  // Método authenticatedRequest que faltaba
  authenticatedRequest(url: string, options: any = {}): Observable<any> {
    const fullUrl = url.startsWith('http') ? url : `${this.API_BASE_URL}${url}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: this.getAuthHeaders(),
      ...options
    };

    if (defaultOptions.method === 'GET') {
      return this.http.get(fullUrl, { headers: defaultOptions.headers });
    } else if (defaultOptions.method === 'POST') {
      return this.http.post(fullUrl, options.body, { headers: defaultOptions.headers });
    } else if (defaultOptions.method === 'PUT') {
      return this.http.put(fullUrl, options.body, { headers: defaultOptions.headers });
    } else if (defaultOptions.method === 'DELETE') {
      return this.http.delete(fullUrl, { headers: defaultOptions.headers });
    }

    return this.http.get(fullUrl, { headers: defaultOptions.headers });
  }

  redirectToDashboard(): void {
    const user = this.getCurrentUser();
    console.log('🏠 redirectToDashboard() llamado');
    console.log('👤 Usuario actual:', user);
    
    if (user) {
      console.log('➡️ Navegando a /dashboard...');
      this.router.navigate(['/dashboard']).then(success => {
        console.log('✅ Navegación a dashboard:', success ? 'EXITOSA' : 'FALLÓ');
      });
    } else {
      console.log('➡️ No hay usuario, navegando a /home...');
      this.router.navigate(['/home']).then(success => {
        console.log('✅ Navegación a home:', success ? 'EXITOSA' : 'FALLÓ');
      });
    }
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth Service Error:', error);
    
    let errorMessage = 'Ocurrió un error inesperado';
    
    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => errorMessage);
  }
}