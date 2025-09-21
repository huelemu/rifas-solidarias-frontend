// src/app/services/auth.service.ts - CORREGIDO
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    user: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = 'http://localhost:3100';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verificar si hay un usuario logueado al inicializar
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    const token = this.getAccessToken();
    if (token && !this.isTokenExpired(token)) {
      // Si hay token válido, obtener info del usuario
      this.getCurrentUser().then(user => {
        if (user) {
          this.currentUserSubject.next(user);
        }
      });
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/login`, {
        email,
        password
      }).toPromise();

      if (response?.success && response.data) {
        // Guardar tokens
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        // Actualizar usuario actual
        this.currentUserSubject.next(response.data.user);
        
        console.log('✅ Login exitoso');
        return response;
      } else {
        return {
          success: false,
          message: response?.message || 'Error en el login'
        };
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  async register(userData: any): Promise<LoginResponse> {
    try {
      const response = await this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/register`, userData).toPromise();

      if (response?.success && response.data) {
        // Guardar tokens automáticamente después del registro
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        // Actualizar usuario actual
        this.currentUserSubject.next(response.data.user);
        
        console.log('✅ Registro exitoso');
        return response;
      } else {
        return {
          success: false,
          message: response?.message || 'Error en el registro'
        };
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await this.http.post(`${this.API_BASE_URL}/auth/logout`, {
          refresh_token: refreshToken
        }).toPromise();
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local
      this.clearAuthData();
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null && !this.isTokenExpired(token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getCurrentUser(): Promise<any> {
    return new Promise(async (resolve) => {
      try {
        if (!this.isAuthenticated()) {
          resolve(null);
          return;
        }

        const response = await this.http.get<any>(`${this.API_BASE_URL}/auth/me`).toPromise();
        if (response?.data) {
          resolve(response.data);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error('Error obteniendo usuario actual:', error);
        resolve(null);
      }
    });
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol === role;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp;
    } catch (error) {
      return true;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'No se pudo conectar al servidor. Verifica tu conexión.';
    } else if (error.error?.message) {
      return error.error.message;
    } else if (error.status === 401) {
      return 'Email o contraseña incorrectos.';
    } else if (error.status === 423) {
      return 'Usuario bloqueado. Intenta más tarde.';
    } else {
      return 'Error de conexión. Intenta nuevamente.';
    }
  }
}