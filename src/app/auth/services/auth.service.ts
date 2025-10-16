// src/app/auth/services/auth.service.ts - VERSIÓN CORREGIDA

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { 
  LoginRequest, 
  LoginResponse, 
  User, 
  AuthState, 
  RegisterRequest, 
  RegisterResponse,
  UserRole,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ApiError
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Detección automática de entorno
  private readonly apiUrl = this.getApiUrl();
  
  // Signals para manejo de estado reactivo
  private readonly authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null
  });

  // Computed signals para acceso fácil
  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly currentUser = computed(() => this.authState().user);
  readonly userRole = computed(() => this.authState().user?.rol);

  constructor() {
    this.initializeAuth();
    this.handleOAuthCallback();
  }

  /**
   * Detecta automáticamente la URL de la API basada en el entorno
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
   * ⭐ NUEVA FUNCIÓN HELPER: Mapea datos del backend al modelo User
   */
  private mapBackendUserToFrontend(backendUser: any): User {
    return {
      id: backendUser.id,
      email: backendUser.email,
      nombre: backendUser.nombre,
      apellido: backendUser.apellido,
      rol: backendUser.rol as UserRole,
      telefono: backendUser.telefono,
      dni: backendUser.dni,
      institucion_id: backendUser.institucion_id,
      activa: backendUser.activa,
      fecha_creacion: backendUser.fecha_creacion,
      fecha_actualizacion: backendUser.fecha_actualizacion,
      institucion: backendUser.institucion_nombre ? {
        id: backendUser.institucion_id || 0,
        nombre: backendUser.institucion_nombre,
        descripcion: backendUser.institucion_descripcion,
        activa: backendUser.institucion_activa
      } : undefined,
      // Computed properties para retrocompatibilidad
      name: `${backendUser.nombre} ${backendUser.apellido}`.trim(),
      role: backendUser.rol
    };
  }

  /**
   * Inicia el proceso de autenticación con Google
   */
  loginWithGoogle(returnUrl?: string): Observable<{authUrl: string}> {
    console.log('🔑 AuthService: Iniciando login con Google...');
    
    let url = `${this.apiUrl}/auth/google/login`;
    if (returnUrl && returnUrl !== '/dashboard') {
      url += `?returnUrl=${encodeURIComponent(returnUrl)}`;
    }
    
    return this.http.get<any>(url).pipe(
      map((response) => {
        console.log('📥 AuthService: URL de Google OAuth obtenida');
        return { authUrl: response.data.authUrl };
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Inicia el proceso de registro con Google
   */
  registerWithGoogle(returnUrl?: string): Observable<{authUrl: string}> {
    console.log('🔑 AuthService: Iniciando registro con Google...');
    
    let url = `${this.apiUrl}/auth/google/login`;
    if (returnUrl && returnUrl !== '/dashboard') {
      url += `?returnUrl=${encodeURIComponent(returnUrl)}`;
    }
    
    return this.http.get<any>(url).pipe(
      map((response) => {
        return { authUrl: response.data.authUrl };
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Procesa tokens de Google OAuth (desde callback)
   */
  processGoogleCallback(tokens: {access_token: string, refresh_token: string}): void {
    console.log('🔑 AuthService: Procesando callback de Google OAuth');
    
    const newAuthState: AuthState = {
      isAuthenticated: true,
      user: null,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    };
    
    this.saveAuthState(newAuthState);
    
    this.getProfile().subscribe({
      next: (user) => {
        const completeState: AuthState = {
          ...newAuthState,
          user: user
        };
        this.saveAuthState(completeState);
      },
      error: (error) => {
        console.warn('⚠️ Error obteniendo perfil:', error);
      }
    });
  }

  /**
   * Maneja el callback de OAuth
   */
  private handleOAuthCallback(): void {
    const urlParams = new URLSearchParams(window.location.search);
    
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const error = urlParams.get('error');

    if (error) {
      console.error('❌ Error en OAuth callback:', error);
      this.router.navigate(['/login'], { 
        queryParams: { error: 'oauth_error' } 
      });
      return;
    }

    if (accessToken && refreshToken) {
      console.log('✅ OAuth callback exitoso');
      this.processOAuthTokens(accessToken, refreshToken);
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  /**
   * Procesa los tokens de OAuth
   */
  private processOAuthTokens(accessToken: string, refreshToken: string): void {
    this.http.get<any>(`${this.apiUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const userData = response.data;
          const user = this.mapBackendUserToFrontend(userData);
          
          const newAuthState: AuthState = {
            isAuthenticated: true,
            user: user,
            accessToken,
            refreshToken
          };
          
          this.saveAuthState(newAuthState);
        }
      },
      error: (error) => {
        console.error('❌ Error obteniendo perfil OAuth:', error);
        this.router.navigate(['/login'], { 
          queryParams: { error: 'profile_error' } 
        });
      }
    });
  }

  /**
   * Inicializa el estado de autenticación desde localStorage
   */
  private initializeAuth(): void {
    try {
      const storedState = localStorage.getItem('authState');
      if (storedState) {
        const parsedState: AuthState = JSON.parse(storedState);
        if (this.isTokenValid(parsedState.accessToken)) {
          this.authState.set(parsedState);
        } else {
          this.tryRefreshToken(parsedState.refreshToken);
        }
      }
    } catch (error) {
      console.error('Error al cargar estado de autenticación:', error);
      this.clearAuthState();
    }
  }

  /**
   * Verifica si un token es válido
   */
  private isTokenValid(token: string | null): boolean {
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Intenta renovar el token
   */
  private tryRefreshToken(refreshToken: string | null): void {
    if (!refreshToken) {
      this.clearAuthState();
      return;
    }

    this.refreshToken(refreshToken).subscribe({
      next: (response) => {
        if (response.success) {
          const currentState = this.authState();
          const newState: AuthState = {
            ...currentState,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken
          };
          this.saveAuthState(newState);
        }
      },
      error: () => {
        this.clearAuthState();
      }
    });
  }

  /**
   * Guarda el estado de autenticación
   */
  private saveAuthState(state: AuthState): void {
    try {
      localStorage.setItem('authState', JSON.stringify(state));
      this.authState.set(state);
    } catch (error) {
      console.error('Error al guardar estado:', error);
    }
  }

  /**
   * Limpia el estado de autenticación
   */
  private clearAuthState(): void {
    localStorage.removeItem('authState');
    this.authState.set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null
    });
  }

  /**
   * Login tradicional
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map((backendResponse) => {
          const user = this.mapBackendUserToFrontend(backendResponse.data.user);
          
          const mappedResponse: LoginResponse = {
            success: backendResponse.status === 'success',
            message: backendResponse.message,
            data: {
              user: user,
              accessToken: backendResponse.data.tokens.accessToken,
              refreshToken: backendResponse.data.tokens.refreshToken
            }
          };
          
          return mappedResponse;
        }),
        tap((response) => {
          if (response.success && response.data) {
            const newAuthState: AuthState = {
              isAuthenticated: true,
              user: response.data.user,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken
            };
            this.saveAuthState(newAuthState);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Forgot password
   */
  forgotPassword(email: string): Observable<{success: boolean, message: string}> {
    return this.http.post<{status: string, message: string}>(
      `${this.apiUrl}/auth/forgot-password`,
      { email }
    ).pipe(
      map(response => ({
        success: response.status === 'success',
        message: response.message
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Validate reset token
   */
  validateResetToken(token: string): Observable<boolean> {
    return this.http.post<{status: string, valid: boolean}>(
      `${this.apiUrl}/auth/validate-reset-token`,
      { token }
    ).pipe(
      map(response => response.valid),
      catchError(() => of(false))
    );
  }

  /**
   * Reset password
   */
  resetPassword(token: string, newPassword: string): Observable<{success: boolean, message: string}> {
    return this.http.post<{status: string, message: string}>(
      `${this.apiUrl}/auth/reset-password`,
      { token, newPassword }
    ).pipe(
      map(response => ({
        success: response.status === 'success',
        message: response.message
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Get Google Auth URL
   */
  getGoogleAuthUrl(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/google/login`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Sign in with Google (alias)
   */
  signInWithGoogle(): void {
    this.loginWithGoogle();
  }

  /**
   * Register
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        map((backendResponse) => {
          const mappedResponse: RegisterResponse = {
            success: backendResponse.status === 'success',
            message: backendResponse.message,
            data: backendResponse.data ? {
              user: this.mapBackendUserToFrontend(backendResponse.data.user),
              ...(backendResponse.data.tokens && {
                tokens: {
                  accessToken: backendResponse.data.tokens.accessToken,
                  refreshToken: backendResponse.data.tokens.refreshToken,
                  expiresIn: backendResponse.data.tokens.expiresIn,
                  tokenType: backendResponse.data.tokens.tokenType
                }
              })
            } : undefined
          };
          
          return mappedResponse;
        }),
        tap((response) => {
          if (response.success && response.data?.tokens) {
            const newAuthState: AuthState = {
              isAuthenticated: true,
              user: response.data.user,
              accessToken: response.data.tokens.accessToken,
              refreshToken: response.data.tokens.refreshToken
            };
            this.saveAuthState(newAuthState);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Resend verification
   */
  resendVerification(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/resend-verification`, { email })
      .pipe(catchError(this.handleError));
  }

  /**
   * Refresh token
   */
  refreshToken(refreshToken: string): Observable<RefreshTokenResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/auth/refresh`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get profile
   */
  getProfile(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`)
      .pipe(
        map(response => {
          if (response.status === 'success' && response.data) {
            const userData = response.data.user || response.data;
            return this.mapBackendUserToFrontend(userData);
          }
          
          throw new Error('Formato de respuesta inválido');
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logout
   */
  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      next: () => console.log('✅ Logout exitoso'),
      error: (error) => console.warn('⚠️ Error en logout:', error)
    });
    
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.authState().accessToken;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.authState().refreshToken;
  }

  /**
   * Is global admin
   */
  isGlobalAdmin(): boolean {
    return this.authState().user?.rol === 'admin_global';
  }

  /**
   * Is admin
   */
  isAdmin(): boolean {
    const rol = this.authState().user?.rol;
    return rol === 'admin_global' || rol === 'admin_institucion';
  }

  /**
   * Is institution admin
   */
  isInstitutionAdmin(): boolean {
    return this.authState().user?.rol === 'admin_institucion';
  }

  /**
   * Is seller
   */
  isSeller(): boolean {
    return this.authState().user?.rol === 'vendedor';
  }

  /**
   * Is buyer
   */
  isBuyer(): boolean {
    return this.authState().user?.rol === 'comprador';
  }

  /**
   * Redirect after login
   */
  redirectAfterLogin(): void {
    const returnUrl = sessionStorage.getItem('returnUrl');
    
    if (returnUrl) {
      sessionStorage.removeItem('returnUrl');
      this.router.navigateByUrl(returnUrl);
      return;
    }

    const rol = this.userRole();
    
    switch (rol) {
      case 'admin_global':
        this.router.navigate(['/admin']);
        break;
      case 'admin_institucion':
        this.router.navigate(['/dashboard']);
        break;
      case 'vendedor':
        this.router.navigate(['/ventas']);
        break;
      case 'comprador':
        this.router.navigate(['/mis-numeros']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor';
      } else if (error.status === 401) {
        errorMessage = 'Credenciales inválidas';
        this.clearAuthState();
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    const apiError: ApiError = {
      success: false,
      message: errorMessage,
      errors: error.error?.errors
    };

    return throwError(() => apiError);
  }
}