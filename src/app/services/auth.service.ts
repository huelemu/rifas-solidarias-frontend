// src/app/services/auth.service.ts - VERSIÓN LIMPIA
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

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
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    const token = this.getAccessToken();
    if (token) {
      this.getCurrentUser().then(user => {
        if (user) {
          this.currentUserSubject.next(user);
        }
      });
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.API_BASE_URL}/auth/login`, {
        email,
        password
      }).toPromise();

      if (response?.success && response.data) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        this.currentUserSubject.next(response.data.user);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response?.message || 'Error en el login' };
      }
    } catch (error: any) {
      return { success: false, message: this.getErrorMessage(error) };
    }
  }

  async register(userData: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.API_BASE_URL}/auth/register`, userData).toPromise();

      if (response?.success && response.data) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        this.currentUserSubject.next(response.data.user);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response?.message || 'Error en el registro' };
      }
    } catch (error: any) {
      return { success: false, message: this.getErrorMessage(error) };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  async getCurrentUser(): Promise<any> {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }

      const response = await this.http.get<any>(`${this.API_BASE_URL}/auth/me`).toPromise();
      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.rol === role;
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'No se pudo conectar al servidor.';
    } else if (error.error?.message) {
      return error.error.message;
    } else if (error.status === 401) {
      return 'Email o contraseña incorrectos.';
    } else {
      return 'Error de conexión.';
    }
  }
}