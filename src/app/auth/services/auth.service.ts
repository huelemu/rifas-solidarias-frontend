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

//-------



/**
 * Inicia el proceso de autenticación con Google
 */
loginWithGoogle(): Observable<{authUrl: string}> {
  console.log('🔐 AuthService: Iniciando login con Google...');
  
  return this.http.get<any>(`${this.apiUrl}/auth/google/login`)
    .pipe(
      map((response) => {
        console.log('📥 AuthService: URL de Google OAuth obtenida:', response.data.authUrl);
        return { authUrl: response.data.authUrl };
      }),
      catchError(this.handleError)
    );
}

/**
 * Inicia el proceso de registro con Google (usa la misma URL que login)
 */
registerWithGoogle(): Observable<{authUrl: string}> {
  console.log('🔐 AuthService: Iniciando registro con Google...');
  
  // ✅ CAMBIO: Usar la misma ruta que login ya que Google maneja ambos casos
  return this.http.get<any>(`${this.apiUrl}/auth/google/login`)
    .pipe(
      map((response) => {
        console.log('📥 AuthService: URL de Google OAuth para registro obtenida:', response.data.authUrl);
        return { authUrl: response.data.authUrl };
      }),
      catchError(this.handleError)
    );
}

/**
 * Procesa tokens de Google OAuth (desde callback)
 */
processGoogleCallback(tokens: {access_token: string, refresh_token: string}): void {
  console.log('🔐 AuthService: Procesando callback de Google OAuth');
  
  // ✅ GUARDAR ESTADO INMEDIATAMENTE PARA QUE AUTHGUARD LO DETECTE
  const newAuthState: AuthState = {
    isAuthenticated: true,
    user: null, // Se llenará con getProfile
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token
  };
  
  this.saveAuthState(newAuthState);
  console.log('✅ AuthService: Estado básico guardado inmediatamente');
  
  // ✅ OBTENER PERFIL EN SEGUNDO PLANO (SIN BLOQUEAR EL FLUJO)
  this.getProfile().subscribe({
    next: (user) => {
      // Actualizar con información del usuario
      const completeState: AuthState = {
        ...newAuthState,
        user: user
      };
      this.saveAuthState(completeState);
      console.log('✅ AuthService: Información del usuario agregada al estado');
    },
    error: (error) => {
      console.warn('⚠️ AuthService: Error obteniendo perfil (no crítico):', error);
      // El usuario ya está autenticado, esto no es crítico
    }
  });
  

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
  console.log('🔐 AuthService: Procesando tokens OAuth de Google');
  console.log('🔑 Access Token:', accessToken ? 'Presente (length: ' + accessToken.length + ')' : 'Ausente');
  console.log('🔑 Refresh Token:', refreshToken ? 'Presente (length: ' + refreshToken.length + ')' : 'Ausente');
  
  // Obtener perfil del usuario con el token
  this.http.get<any>(`${this.apiUrl}/auth/me`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  }).subscribe({
    next: (response) => {
      console.log('📥 processOAuthTokens: Respuesta completa de /auth/me:', response);
      
      if (response.status === 'success' && response.data) {
        // ✅ FIX: El usuario viene directamente en response.data, NO en response.data.user
        const userData = response.data;
        console.log('👤 processOAuthTokens: Datos del usuario:', userData);
        
        // CRÍTICO: Mapear correctamente nombre y apellido
        const user: User = {
          id: userData.id,
          email: userData.email,
          // ✅ ESTE ES EL FIX: Concatenar nombre y apellido correctamente
          name: `${userData.nombre || ''} ${userData.apellido || ''}`.trim(),
          role: userData.rol as UserRole,
          institucion_id: userData.institucion_id,
          institucion: userData.institucion_nombre ? {
            id: userData.institucion_id || 0,
            nombre: userData.institucion_nombre
          } : undefined
        };
        
        console.log('✅ processOAuthTokens: Usuario mapeado correctamente:');
        console.log('   - ID:', user.id);
        console.log('   - Email:', user.email);
        console.log('   - Nombre completo:', user.name);
        console.log('   - Rol:', user.role);
        console.log('   - Institución ID:', user.institucion_id);
        
        const newAuthState: AuthState = {
          isAuthenticated: true,
          user: user,
          accessToken,
          refreshToken
        };
        
        this.saveAuthState(newAuthState);
        console.log('💾 processOAuthTokens: Estado OAuth guardado correctamente en localStorage');
        console.log('🔍 Estado actual del authState signal:', this.authState());
        console.log('🔍 currentUser() signal:', this.currentUser());
        console.log('🔍 isAuthenticated() signal:', this.isAuthenticated());
      } else {
        console.error('❌ processOAuthTokens: Formato de respuesta inesperado:', response);
        this.router.navigate(['/login'], { 
          queryParams: { error: 'invalid_response' } 
        });
      }
    },
    error: (error) => {
      console.error('❌ processOAuthTokens: Error obteniendo perfil OAuth:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ Message:', error.message);
      console.error('❌ Error completo:', error);
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
   * Alias para loginWithGoogle (para compatibilidad)
   */
  signInWithGoogle(): void {
    this.loginWithGoogle();
  }


/**
 * Realiza el registro de un nuevo usuario
 */
register(userData: RegisterRequest): Observable<RegisterResponse> {
  console.log('🔐 AuthService: Iniciando registro para:', userData.email);
  console.log('🌐 URL del backend:', `${this.apiUrl}/auth/register`);
  console.log('📝 Datos enviados:', userData);
  
  return this.http.post<any>(`${this.apiUrl}/auth/register`, userData)
    .pipe(
      map((backendResponse) => {
        console.log('📥 AuthService: Respuesta del backend en registro:', backendResponse);
        
        // Mapear la respuesta del backend al formato esperado por el frontend
        const mappedResponse: RegisterResponse = {
          success: backendResponse.status === 'success',
          message: backendResponse.message,
          data: backendResponse.data ? {
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
            // ✅ Tokens opcional
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
        
        console.log('🔄 AuthService: Respuesta de registro mapeada:', mappedResponse);
        return mappedResponse;
      }),
      tap((response) => {
        if (response.success && response.data?.tokens) {
          console.log('✅ AuthService: Registro exitoso con auto-login');
          console.log('👤 Usuario:', response.data.user);
          console.log('🔑 Token recibido:', response.data.tokens.accessToken ? 'Sí' : 'No');
          
          // Auto-login: guardar estado de autenticación
          const newAuthState: AuthState = {
            isAuthenticated: true,
            user: response.data.user,
            accessToken: response.data.tokens.accessToken,
            refreshToken: response.data.tokens.refreshToken
          };
          this.saveAuthState(newAuthState);
          console.log('💾 Estado de autenticación guardado después del registro');
        } else {
          console.log('ℹ️ AuthService: Registro exitoso sin auto-login');
        }
      }),
      catchError((error) => {
        console.error('❌ AuthService: Error en registro:', error);
        return this.handleError(error);
      })
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
  return this.http.get<any>(`${this.apiUrl}/auth/me`)
    .pipe(
      map(response => {
        console.log('📥 getProfile: Respuesta completa:', response);
        
        if (response.status === 'success' && response.data) {
          // ✅ FIX: El backend puede devolver el usuario de DOS formas:
          // 1. response.data (directo) <- Google OAuth
          // 2. response.data.user (anidado) <- Login normal
          const userData = response.data.user || response.data;
          
          console.log('👤 getProfile: Datos del usuario extraídos:', userData);
          
          // Mapear correctamente el usuario
          const user: User = {
            id: userData.id,
            email: userData.email,
            // ✅ CRÍTICO: Concatenar nombre y apellido
            name: `${userData.nombre || ''} ${userData.apellido || ''}`.trim(),
            role: userData.rol as UserRole,
            institucion_id: userData.institucion_id,
            institucion: userData.institucion_nombre ? {
              id: userData.institucion_id || 0,
              nombre: userData.institucion_nombre
            } : undefined
          };
          
          console.log('✅ getProfile: Usuario mapeado correctamente:');
          console.log('   - ID:', user.id);
          console.log('   - Email:', user.email);
          console.log('   - Nombre completo:', user.name);
          console.log('   - Rol:', user.role);
          
          return user;
        }
        
        console.error('❌ getProfile: Formato de respuesta inválido:', response);
        throw new Error('Formato de respuesta inválido');
      }),
      catchError((error) => {
        console.error('❌ getProfile: Error:', error);
        return this.handleError(error);
      })
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