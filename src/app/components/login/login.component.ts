// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  status: string;
  message?: string;
  data?: {
    user: any;
    tokens: {
      access_token: string;
      refresh_token: string;
    };
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Iniciar Sesión</h2>
        <p>Sistema de Rifas Solidarias</p>

        <div *ngIf="error" class="alert alert-error">
          {{ error }}
        </div>

        <div *ngIf="success" class="alert alert-success">
          {{ success }}
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              [(ngModel)]="credentials.email" 
              required 
              email
              #emailInput="ngModel"
              [class.invalid]="emailInput.invalid && emailInput.touched"
            >
            <div *ngIf="emailInput.invalid && emailInput.touched" class="error-text">
              Email es requerido y debe ser válido
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña:</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="credentials.password" 
              required 
              minlength="6"
              #passwordInput="ngModel"
              [class.invalid]="passwordInput.invalid && passwordInput.touched"
            >
            <div *ngIf="passwordInput.invalid && passwordInput.touched" class="error-text">
              Contraseña es requerida (mínimo 6 caracteres)
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || loading"
            class="btn-login"
          >
            <span *ngIf="!loading">Iniciar Sesión</span>
            <span *ngIf="loading">Iniciando sesión...</span>
          </button>
        </form>

        <div class="register-link">
          <p>¿No tienes cuenta? <a [routerLink]="['/register']">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 10px;
    }

    p {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e1e1;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    input.invalid {
      border-color: #e74c3c;
    }

    .error-text {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 5px;
    }

    .btn-login {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .alert {
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .alert-error {
      background: #fee;
      color: #c53030;
      border: 1px solid #fed7d7;
    }

    .alert-success {
      background: #f0fff4;
      color: #2f855a;
      border: 1px solid #c6f6d5;
    }

    .register-link {
      text-align: center;
      margin-top: 20px;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
    }

    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  loading = false;
  error = '';
  success = '';
  
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.apiUrl = this.getApiUrl();
  }

  private getApiUrl(): string {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  onLogin() {
    if (!this.credentials.email || !this.credentials.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    console.log('Intentando login con:', this.credentials.email);

    this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, this.credentials)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del login:', response);
          
          if (response.status === 'success' && response.data) {
            // Guardar tokens y datos de usuario
            localStorage.setItem('access_token', response.data.tokens.access_token);
            localStorage.setItem('refresh_token', response.data.tokens.refresh_token);
            localStorage.setItem('user_data', JSON.stringify(response.data.user));
            
            this.success = 'Login exitoso. Redirigiendo...';
            
            // Redirigir al dashboard después de 1 segundo
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1000);
            
          } else {
            this.error = response.message || 'Error en el login';
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error en login:', error);
          
          if (error.status === 401) {
            this.error = 'Email o contraseña incorrectos';
          } else if (error.status === 423) {
            this.error = 'Cuenta bloqueada temporalmente. Intenta más tarde.';
          } else if (error.error?.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Error de conexión. Verifica tu internet.';
          }
          
          this.loading = false;
        }
      });
  }

  // Método para verificar si el usuario ya está logueado
  ngOnInit() {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Si ya hay token, redirigir al dashboard
      this.router.navigate(['/dashboard']);
    }
  }
}