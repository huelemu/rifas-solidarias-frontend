// src/app/auth/services/auth.service.ts - VERSIÓN COMPLETA Y CORREGIDA

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
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
  readonly userRole = computed(() => this.authState().user?.role);

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
   * Maneja el callback de OAuth (Google)
   */
  private handleOAuthCallback(): void {
    // Verificar si estamos en una URL de callback
    const urlParams = new URLSearchParams(window.location.search);
    
    // Si hay tokens en la URL (callback de Google)
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
      console.log('✅ OAuth callback exitoso, procesando tokens...');
      
      // Hacer request para obtener información del usuario
      this.processOAuthTokens(accessToken, refreshToken);
      
      // Limpiar la URL
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  /**
   * Procesa los tokens de OAuth y obtiene información del usuario
   */
  private processOAuthTokens(accessToken: string, refreshToken: string): void {
    // Primero intentar obtener perfil del usuario con el token
    this.http.get<any>(`${this.apiUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log('✅ Perfil de usuario obtenido:', response.data);
          
          const newAuthState: AuthState = {
            isAuthenticated: true,
            user: response.data,
            accessToken,
            refreshToken
          };
          
          this.saveAuthState(newAuthState);
          console.log('💾 Estado OAuth guardado correctamente');
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
        // Verificar que el token no esté expirado
        if (this.isTokenValid(parsedState.accessToken)) {
          this.authState.set(parsedState);
        } else {
          // Token expirado, intentar refresh
          this.tryRefreshToken(parsedState.refreshToken);
        }
      }
    } catch (error) {
      console.error('Error al cargar estado de autenticación:', error);
      this.clearAuthState();
    }
  }

  /**
   * Verifica si un token es válido (no expirado)
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
   * Intenta renovar el token usando el refresh token
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
   * Guarda el estado de autenticación en localStorage
   */
  private saveAuthState(state: AuthState): void {
    try {
      localStorage.setItem('authState', JSON.stringify(state));
      this.authState.set(state);
    } catch (error) {
      console.error('Error al guardar estado de autenticación:', error);
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
   * Realiza el login del usuario (método tradicional)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔐 AuthService: Iniciando login para:', credentials.email);
    console.log('🌐 URL del backend:', `${this.apiUrl}/auth/login`);
    
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map((backendResponse) => {
          console.log('📥 AuthService: Respuesta del backend:', backendResponse);
          
          const mappedResponse: LoginResponse = {
            success: backendResponse.status === 'success',
            message: backendResponse.message,
            data: {
              user: {
                id: backendResponse.data.user.id,
                email: backendResponse.data.user.email,
                name: `${backendResponse.data.user.nombre} ${backendResponse.data.user.apellido}`,
                role: backendResponse.data.user.rol as UserRole,
                institucion_id: backendResponse.data.user.institucion_id,
                institucion: backendResponse.data.user.institucion_nombre ? {
                  id: backendResponse.data.user.institucion_id || 0,
                  nombre: backendResponse.data.user.institucion_nombre
                } : undefined
              },
              accessToken: backendResponse.data.tokens.accessToken,
              refreshToken: backendResponse.data.tokens.refreshToken
            }
          };
          
          console.log('🔄 AuthService: Respuesta mapeada:', mappedResponse);
          return mappedResponse;
        }),
        tap((response) => {
          if (response.success && response.data) {
            console.log('✅ AuthService: Login exitoso, guardando estado');
            console.log('👤 Usuario:', response.data.user);
            console.log('🔑 Token recibido:', response.data.accessToken ? 'Sí' : 'No');
            
            const newAuthState: AuthState = {
              isAuthenticated: true,
              user: response.data.user,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken
            };
            this.saveAuthState(newAuthState);
            console.log('💾 Estado guardado correctamente');
          } else {
            console.warn('⚠️ AuthService: Login sin success o sin data');
          }
        }),
        catchError((error) => {
          console.error('❌ AuthService: Error en login:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Obtiene la URL de Google OAuth para login
   */
  getGoogleAuthUrl(): Observable<any> {
    console.log('🔐 AuthService: Obteniendo URL de Google OAuth...');
    
    return this.http.get<any>(`${this.apiUrl}/auth/google/login`)
      .pipe(
        tap((response) => {
          console.log('📥 AuthService: Respuesta de Google OAuth URL:', response);
        }),
        catchError((error) => {
          console.error('❌ AuthService: Error obteniendo URL de Google OAuth:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Inicia el proceso de login con Google
   */
  loginWithGoogle(): void {
    console.log('🔐 AuthService: Redirigiendo a Google OAuth...');
    
    // Guardar la URL actual para redirección después del login
    const returnUrl = this.router.url;
    if (returnUrl && returnUrl !== '/login') {
      localStorage.setItem('returnUrl', returnUrl);
    }
    
    // Obtener URL de Google y redirigir
    this.getGoogleAuthUrl().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data?.authUrl) {
          window.location.href = response.data.authUrl;
        } else {
          console.error('❌ No se pudo obtener URL de Google OAuth');
        }
      },
      error: (error) => {
        console.error('❌ Error en Google OAuth:', error);
      }
    });
  }

  /**
   * Alias para loginWithGoogle (para compatibilidad)
   */
  signInWithGoogle(): void {
    this.loginWithGoogle();
  }

  /**
   * Realiza el registro de un nuevo usuario
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Reenvía verificación de email
   */
  resendVerification(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/resend-verification`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Renueva el token de acceso
   */
  refreshToken(refreshToken: string): Observable<RefreshTokenResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/auth/refresh`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  getProfile(): Observable<User> {
    return this.http.get<{success: boolean, data: User}>(`${this.apiUrl}/auth/me`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    console.log('🚪 AuthService: Cerrando sesión...');
    
    // Llamar al endpoint de logout en el backend si existe
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      next: () => console.log('✅ Logout del backend exitoso'),
      error: (error) => console.warn('⚠️ Error en logout del backend:', error)
    });
    
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  /**
   * Obtiene el token de acceso actual
   */
  getAccessToken(): string | null {
    return this.authState().accessToken;
  }

  /**
   * Obtiene el refresh token actual
   */
  getRefreshToken(): string | null {
    return this.authState().refreshToken;
  }

  /**
   * Verifica si el usuario es administrador global
   */
  isGlobalAdmin(): boolean {
    return this.authState().user?.role === 'admin_global';
  }

  /**
   * Verifica si el usuario es administrador (global o de institución)
   */
  isAdmin(): boolean {
    const role = this.authState().user?.role;
    return role === 'admin_global' || role === 'admin_institucion';
  }

  /**
   * Verifica si el usuario es administrador de institución
   */
  isInstitutionAdmin(): boolean {
    return this.authState().user?.role === 'admin_institucion';
  }

  /**
   * Verifica si el usuario es vendedor
   */
  isSeller(): boolean {
    return this.authState().user?.role === 'vendedor';
  }

  /**
   * Verifica si el usuario es comprador
   */
  isBuyer(): boolean {
    return this.authState().user?.role === 'comprador';
  }

  /**
   * Redirige al usuario después del login según su rol
   */
  redirectAfterLogin(): void {
    console.log('🔄 AuthService: Redirigiendo después del login...');
    
    // Verificar si hay una URL de retorno guardada
    const returnUrl = localStorage.getItem('returnUrl');
    if (returnUrl) {
      localStorage.removeItem('returnUrl');
      this.router.navigate([returnUrl]);
      return;
    }

    // Redirección por defecto al dashboard
    this.router.navigate(['/dashboard']);
  }

  /**
   * Maneja errores de HTTP de manera consistente
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ AuthService: Error HTTP:', error);
    
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = error.error.message;
    } else {
      // Error del lado del servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor';
      } else if (error.status === 401) {
        errorMessage = 'Credenciales inválidas';
        // Si es 401, limpiar el estado de autenticación
        this.clearAuthState();
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para realizar esta acción';
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