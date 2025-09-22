// ====================================
// src/app/services/auth.service.ts
// ====================================
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, timer, of } from 'rxjs';
import { map, catchError, tap, switchMap, take } from 'rxjs/operators';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  Usuario, 
  RefreshTokenResponse 
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // Base API URL con auto-detección de entorno
  private readonly apiUrl: string;
  
  // Signals para estado reactivo (Angular 17+)
  private userSignal = signal<Usuario | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private isLoadingSignal = signal<boolean>(false);
  
  // BehaviorSubjects para compatibilidad con RxJS
  private userSubject = new BehaviorSubject<Usuario | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  
  // Observables públicos
  public user$ = this.userSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();
  
  // Computed signals
  public userRole = computed(() => this.userSignal()?.rol || null);
  public isAdmin = computed(() => {
    const role = this.userSignal()?.rol;
    return role === 'admin_global' || role === 'admin_institucion';
  });
  public isGlobalAdmin = computed(() => this.userSignal()?.rol === 'admin_global');
  
  // Timer para auto-refresh
  private refreshTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.apiUrl = this.getApiUrl();
    this.initializeAuth();
    console.log('🔐 AuthService inicializado con API:', this.apiUrl);
  }

  // Auto-detección de entorno
  private getApiUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    }
    return 'https://apirifas.huelemu.com.ar';
  }

  // Inicializar autenticación al cargar la app
  private initializeAuth(): void {
    const token = this.getStoredToken();
    if (token && !this.isTokenExpired()) {
      this.setLoadingState(true);
      this.getCurrentUser().subscribe({
        next: (user) => {
          this.setUserState(user, true);
          this.startTokenRefreshTimer();
          console.log('✅ Usuario autenticado:', user.nombre);
        },
        error: (error) => {
          console.warn('⚠️ Token inválido, limpiando estado');
          this.clearAuthState();
        },
        complete: () => {
          this.setLoadingState(false);
        }
      });
    } else if (token) {
      // Token expirado
      this.attemptTokenRefresh();
    }
  }

  // ==========================================
  // MÉTODOS DE AUTENTICACIÓN
  // ==========================================

  /**
   * Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoadingState(true);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success) {
          this.storeTokens(response.data.access_token, response.data.refresh_token);
          this.setUserState(response.data.user, true);
          this.startTokenRefreshTimer();
          console.log('✅ Login exitoso:', response.data.user.nombre);
        }
      }),
      catchError(error => this.handleAuthError(error, 'login')),
      tap(() => this.setLoadingState(false))
    );
  }

  /**
   * Registrar nuevo usuario
   */
  register(userData: RegisterRequest): Observable<any> {
    this.setLoadingState(true);
    
    return this.http.post(`${this.apiUrl}/auth/register`, userData).pipe(
      tap(response => {
        if (response.success) {
          console.log('✅ Registro exitoso');
          // Opcionalmente auto-login después del registro
          // this.login({ email: userData.email, password: userData.password });
        }
      }),
      catchError(error => this.handleAuthError(error, 'register')),
      tap(() => this.setLoadingState(false))
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.setLoadingState(true);
    
    // Llamar al endpoint de logout del backend
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      next: () => {
        console.log('✅ Logout del servidor exitoso');
      },
      error: (error) => {
        console.warn('⚠️ Error en logout del servidor:', error);
      },
      complete: () => {
        this.clearAuthState();
        this.stopTokenRefreshTimer();
        this.setLoadingState(false);
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Observable<Usuario> {
    return this.http.get<{ success: boolean; data: Usuario }>(`${this.apiUrl}/auth/me`).pipe(
      map(response => response.data),
      tap(user => {
        this.setUserState(user, true);
      }),
      catchError(error => {
        console.error('❌ Error obteniendo usuario actual:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Renovar token de acceso
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/auth/refresh`, { 
      refresh_token: refreshToken 
    }).pipe(
      tap(response => {
        if (response.success) {
          this.storeTokens(response.data.access_token, response.data.refresh_token);
          console.log('✅ Token renovado exitosamente');
        }
      }),
      catchError(error => {
        console.error('❌ Error renovando token:', error);
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  // ==========================================
  // GETTERS PÚBLICOS
  // ==========================================

  get currentUser(): Usuario | null {
    return this.userSignal();
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  get isLoading(): boolean {
    return this.isLoadingSignal();
  }

  get userRoleValue(): string | null {
    return this.userRole();
  }

  // ==========================================
  // UTILIDADES DE ROLES
  // ==========================================

  hasRole(role: string): boolean {
    return this.currentUser?.rol === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUser?.rol || '');
  }

  canCreateRifas(): boolean {
    return this.hasAnyRole(['admin_global', 'admin_institucion']);
  }

  canManageUsers(): boolean {
    return this.hasAnyRole(['admin_global', 'admin_institucion']);
  }

  canAccessAdminPanel(): boolean {
    return this.isAdmin();
  }

  // ==========================================
  // GESTIÓN DE TOKENS
  // ==========================================

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

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // ==========================================
  // VERIFICACIÓN DE TOKENS
  // ==========================================

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

  shouldRefreshToken(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      // Refresh si quedan menos de 5 minutos
      return timeUntilExpiry < 300 && timeUntilExpiry > 0;
    } catch (error) {
      return false;
    }
  }

  // ==========================================
  // AUTO-REFRESH DE TOKENS
  // ==========================================

  private startTokenRefreshTimer(): void {
    this.stopTokenRefreshTimer();
    
    // Verificar cada minuto si necesita refresh
    this.refreshTimer = timer(60000, 60000).subscribe(() => {
      if (this.shouldRefreshToken()) {
        this.attemptTokenRefresh();
      }
    });
  }

  private stopTokenRefreshTimer(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = null;
    }
  }

  private attemptTokenRefresh(): void {
    this.refreshToken().subscribe({
      next: () => {
        console.log('🔄 Token renovado automáticamente');
      },
      error: () => {
        console.warn('⚠️ Error en renovación automática, cerrando sesión');
        this.clearAuthState();
        this.router.navigate(['/login']);
      }
    });
  }

  // ==========================================
  // GESTIÓN DE ESTADO
  // ==========================================

  private setUserState(user: Usuario, isAuthenticated: boolean): void {
    this.userSignal.set(user);
    this.isAuthenticatedSignal.set(isAuthenticated);
    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  private setLoadingState(isLoading: boolean): void {
    this.isLoadingSignal.set(isLoading);
    this.isLoadingSubject.next(isLoading);
  }

  private clearAuthState(): void {
    this.clearTokens();
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.userSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.stopTokenRefreshTimer();
    console.log('🔐 Estado de autenticación limpiado');
  }

  // ==========================================
  // REDIRECCIONES INTELIGENTES
  // ==========================================

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

  // ==========================================
  // MANEJO DE ERRORES
  // ==========================================

  private handleAuthError(error: HttpErrorResponse, context: string): Observable<never> {
    console.error(`❌ Error en ${context}:`, error);
    
    let errorMessage = 'Error desconocido';
    
    switch (error.status) {
      case 401:
        errorMessage = context === 'login' ? 'Credenciales incorrectas' : 'No autorizado';
        break;
      case 403:
        errorMessage = 'No tienes permisos para realizar esta acción';
        break;
      case 409:
        errorMessage = 'Ya existe una cuenta con este correo electrónico';
        break;
      case 423:
        errorMessage = 'Usuario bloqueado temporalmente por seguridad';
        this.clearAuthState();
        break;
      case 0:
        errorMessage = 'Error de conexión. Verifica tu conexión a internet';
        break;
      default:
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
    }
    
    return throwError(() => ({ 
      message: errorMessage, 
      status: error.status,
      error: error 
    }));
  }

  // ==========================================
  // UTILIDADES PÚBLICAS
  // ==========================================

  /**
   * Verificar conexión con el backend
   */
  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test-db`).pipe(
      catchError(error => {
        console.error('❌ Error de conexión con el backend:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener información del entorno actual
   */
  getEnvironmentInfo() {
    return {
      apiUrl: this.apiUrl,
      isLocalhost: window.location.hostname === 'localhost',
      isProduction: window.location.hostname.includes('huelemu.com.ar'),
      currentUser: this.currentUser,
      isAuthenticated: this.isAuthenticated
    };
  }

  /**
   * Forzar logout por inactividad
   */
  forceLogoutDueToInactivity(): void {
    console.warn('⚠️ Cerrando sesión por inactividad');
    this.clearAuthState();
    this.router.navigate(['/login'], { 
      queryParams: { reason: 'inactivity' } 
    });
  }
}