// src/app/auth/services/auth.service.ts

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
  readonly userRole = computed(() => this.authState().user?.role);

  constructor() {
    this.initializeAuth();
  }

  /**
   * Detecta automáticamente la URL de la API basada en el entorno
   */
  private getApiUrl(): string {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // IMPORTANTE: Sin /api al final porque ya lo corregiste
      return 'http://localhost:3100';
    } else {
      // IMPORTANTE: Sin /api al final porque ya lo corregiste
      return 'https://apirifas.huelemu.com.ar';
    }
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
   * Realiza el login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔐 AuthService: Iniciando login para:', credentials.email);
    console.log('🌐 URL del backend:', `${this.apiUrl}/auth/login`);
    
    // Hacemos la request al backend
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map((backendResponse) => {
          console.log('📥 AuthService: Respuesta del backend:', backendResponse);
          
          // Mapear la respuesta del backend al formato esperado por el frontend
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
   * Realiza el registro de un nuevo usuario
   */
  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, userData)
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
    // Intentar hacer logout en el servidor si tenemos token
    const refreshToken = this.authState().refreshToken;
    
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/auth/logout`, { refreshToken })
        .pipe(
          catchError((error) => {
            console.warn('Error en logout del servidor:', error);
            return of(null);
          })
        )
        .subscribe();
    }

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
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    return this.authState().user?.role === role;
  }

  /**
   * Verifica si el usuario es administrador (cualquier tipo)
   */
  isAdmin(): boolean {
    const role = this.authState().user?.role;
    return role === 'admin_global' || role === 'admin_institucion';
  }

  /**
   * Verifica si el usuario es administrador global
   */
  isGlobalAdmin(): boolean {
    return this.hasRole('admin_global');
  }

  /**
   * Verifica si el usuario pertenece a una institución específica
   */
  belongsToInstitution(institutionId: number): boolean {
    return this.authState().user?.institucion_id === institutionId;
  }

  /**
   * Redirige al usuario según su rol después del login
   */
  redirectAfterLogin(): void {
    const user = this.authState().user;
    
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Por ahora redirigimos a un dashboard genérico
    // Más adelante se puede personalizar según el rol
    this.router.navigate(['/dashboard']);
  }

  /**
   * Verifica si el usuario actual puede editar otro usuario
   */
  canEditUser(targetUserId: number): boolean {
    const currentUser = this.authState().user;
    if (!currentUser) return false;

    // Admin global puede editar cualquier usuario
    if (currentUser.role === 'admin_global') return true;

    // Admin de institución puede editar usuarios de su institución
    if (currentUser.role === 'admin_institucion') {
      // Aquí necesitarías verificar si el usuario objetivo pertenece a la misma institución
      // Por ahora retornamos false, se implementará cuando tengamos más datos
      return false;
    }

    // El usuario puede editarse a sí mismo
    return currentUser.id === targetUserId;
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Error desconocido';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Credenciales incorrectas';
      this.clearAuthState();
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 423) {
      errorMessage = 'Usuario bloqueado temporalmente por intentos fallidos';
    } else if (error.status === 429) {
      errorMessage = 'Demasiados intentos. Intenta más tarde';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión. Verifique su conexión a Internet.';
    } else if (error.status >= 500) {
      errorMessage = 'Error del servidor. Intente más tarde.';
    } else {
      errorMessage = `Error ${error.status}: ${error.message}`;
    }

    console.error('Error en AuthService:', error);
    return throwError(() => new Error(errorMessage));
  };
}