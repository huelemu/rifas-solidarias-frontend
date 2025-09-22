// ====================================
// src/app/services/auth.service.ts
// ====================================
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, RegisterRequest, Usuario } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Signals para estado reactivo (Angular 17+)
  private userSignal = signal<Usuario | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  // BehaviorSubjects para compatibilidad con RxJS
  private userSubject = new BehaviorSubject<Usuario | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Observables públicos
  public user$ = this.userSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  // Inicializar autenticación al cargar la app
  private initializeAuth(): void {
    const token = this.getStoredToken();
    if (token) {
      this.getCurrentUser().subscribe({
        next: (user) => {
          this.setUserState(user, true);
        },
        error: () => {
          this.clearAuthState();
        }
      });
    }
  }

  // LOGIN
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', credentials).pipe(
      tap(response => {
        if (response.success) {
          this.storeTokens(response.data.access_token, response.data.refresh_token);
          this.setUserState(response.data.user, true);
          console.log('✅ Login exitoso:', response.data.user.nombre);
        }
      }),
      catchError(error => {
        console.error('❌ Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  // REGISTRO
  register(userData: RegisterRequest): Observable<any> {
    return this.apiService.post('/auth/register', userData).pipe(
      tap(response => {
        if (response.success) {
          console.log('✅ Registro exitoso');
          // Opcionalmente auto-login después del registro
          // this.login({ email: userData.email, password: userData.password });
        }
      }),
      catchError(error => {
        console.error('❌ Error en registro:', error);
        return throwError(() => error);
      })
    );
  }

  // LOGOUT
  logout(): void {
    // Llamar al endpoint de logout del backend
    this.apiService.post('/auth/logout', {}).subscribe({
      next: () => {
        console.log('✅ Logout del servidor exitoso');
      },
      error: (error) => {
        console.warn('⚠️ Error en logout del servidor:', error);
      },
      complete: () => {
        this.clearAuthState();
        this.router.navigate(['/login']);
      }
    });
  }

  // OBTENER USUARIO ACTUAL
  getCurrentUser(): Observable<Usuario> {
    return this.apiService.get<{ success: boolean; data: Usuario }>('/auth/me').pipe(
      map(response => response.data),
      tap(user => {
        this.setUserState(user, true);
      })
    );
  }

  // REFRESH TOKEN
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apiService.post('/auth/refresh', { refresh_token: refreshToken }).pipe(
      tap(response => {
        if (response.success) {
          this.storeTokens(response.data.access_token, response.data.refresh_token);
          console.log('✅ Token refreshed successfully');
        }
      }),
      catchError(error => {
        console.error('❌ Error refreshing token:', error);
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  // GETTERS PÚBLICOS
  get currentUser(): Usuario | null {
    return this.userSignal();
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  get userRole(): string | null {
    return this.currentUser?.rol || null;
  }

  // UTILIDADES DE ROLES
  hasRole(role: string): boolean {
    return this.currentUser?.rol === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUser?.rol || '');
  }

  isAdmin(): boolean {
    return this.hasAnyRole(['admin_global', 'admin_institucion']);
  }

  isGlobalAdmin(): boolean {
    return this.hasRole('admin_global');
  }

  // GESTIÓN DE TOKENS
  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getAuthToken(): string | null {
    return this.getStoredToken();
  }

  // GESTIÓN DE ESTADO
  private setUserState(user: Usuario, isAuthenticated: boolean): void {
    this.userSignal.set(user);
    this.isAuthenticatedSignal.set(isAuthenticated);
    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  private clearAuthState(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    console.log('🔐 Auth state cleared');
  }

  // REDIRECCIONES INTELIGENTES
  redirectAfterLogin(): void {
    const user = this.currentUser;
    if (!user) return;

    switch (user.rol) {
      case 'admin_global':
        this.router.navigate(['/admin']);
        break;
      case 'admin_institucion':
        this.router.navigate(['/admin-institucion']);
        break;
      case 'vendedor':
        this.router.navigate(['/vendedor']);
        break;
      case 'comprador':
        this.router.navigate(['/rifas']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  // VERIFICAR SI EL TOKEN ESTÁ EXPIRADO
  isTokenExpired(): boolean {
    const token = this.getStoredToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  // AUTO-REFRESH TOKEN
  shouldRefreshToken(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      // Refresh si quedan menos de 5 minutos
      return timeUntilExpiry < 300;
    } catch (error) {
      return false;
    }
  }
}