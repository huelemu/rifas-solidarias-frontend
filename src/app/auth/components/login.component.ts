// src/app/auth/components/login.component.ts - VERSIÓN CORREGIDA

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🎯 Rifas Solidarias</h1>
          <p>Iniciar Sesión</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          
          <!-- Email -->
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              placeholder="tu@email.com"
              [class.error]="isFieldInvalid('email')"
            />
            @if (isFieldInvalid('email')) {
              <span class="error-message">
                @if (loginForm.get('email')?.hasError('required')) {
                  El email es requerido
                }
                @if (loginForm.get('email')?.hasError('email')) {
                  Ingrese un email válido
                }
              </span>
            }
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              placeholder="••••••••"
              [class.error]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <span class="error-message">
                @if (loginForm.get('password')?.hasError('required')) {
                  La contraseña es requerida
                }
                @if (loginForm.get('password')?.hasError('minlength')) {
                  La contraseña debe tener al menos 6 caracteres
                }
              </span>
            }
            
            <!-- Enlace de olvidé mi contraseña -->
            <div class="forgot-password-link">
              <a routerLink="/forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
          </div>

          <!-- Error general -->
          @if (errorMessage()) {
            <div class="alert alert-error">
              ❌ {{ errorMessage() }}
            </div>
          }

          <!-- Mensaje de éxito del registro -->
          @if (registrationSuccess()) {
            <div class="alert alert-success">
              ✅ {{ registrationSuccess() }}
            </div>
          }

          <!-- Submit button -->
          <button
            type="submit"
            class="login-button"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Iniciando sesión...
            } @else {
              🚀 Iniciar sesión
            }
          </button>

          <!-- Separador -->
          <div class="separator">
            <div class="separator-line"></div>
            <span class="separator-text">o</span>
            <div class="separator-line"></div>
          </div>

          <!-- Google OAuth Button -->
          <button 
            type="button" 
            class="google-button"
            (click)="loginWithGoogle()"
          >
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <!-- Registro -->
          <div class="register-link">
            ¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      color: #1a202c;
    }

    .login-header p {
      margin: 0;
      color: #718096;
      font-size: 1rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      color: #2d3748;
      font-size: 0.9rem;
    }

    .form-group input {
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group input.error {
      border-color: #fc8181;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.85rem;
      margin-top: -0.25rem;
    }

    .forgot-password-link {
      text-align: right;
      margin-top: 0.25rem;
    }

    .forgot-password-link a {
      color: #667eea;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .forgot-password-link a:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    .alert {
      padding: 0.875rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .alert-error {
      background-color: #fff5f5;
      border: 1px solid #feb2b2;
      color: #c53030;
    }

    .alert-success {
      background-color: #f0fff4;
      border: 1px solid #9ae6b4;
      color: #22543d;
    }

    .login-button,
    .google-button {
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .login-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .google-button {
      background: white;
      color: #1a202c;
      border: 2px solid #e2e8f0;
    }

    .google-button:hover {
      background: #f7fafc;
      border-color: #cbd5e0;
    }

    .google-icon {
      width: 20px;
      height: 20px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .separator {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 0.5rem 0;
    }

    .separator-line {
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    .separator-text {
      color: #a0aec0;
      font-size: 0.875rem;
    }

    .register-link {
      text-align: center;
      color: #4a5568;
      font-size: 0.9rem;
      padding-top: 0.5rem;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 640px) {
      .login-container {
        padding: 1rem;
      }

      .login-card {
        padding: 1.5rem;
      }

      .login-header h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly registrationSuccess = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.registrationSuccess.set('Cuenta creada exitosamente. Ya puedes iniciar sesión.');
        const email = params['email'];
        if (email) {
          this.loginForm.patchValue({ email });
        }
      }
      if (params['passwordReset'] === 'true') {
        this.registrationSuccess.set('Contraseña restablecida exitosamente. Ya puedes iniciar sesión.');
        const email = params['email'];
        if (email) {
          this.loginForm.patchValue({ email });
        }
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          console.log('✅ LoginComponent: Login exitoso:', response.data.user);
          this.authService.redirectAfterLogin();
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('❌ LoginComponent: Error en login:', error);
        
        if (error.message && error.message.includes('Google')) {
          this.errorMessage.set('Esta cuenta fue creada con Google. Por favor, usa el botón "Continuar con Google" para iniciar sesión.');
        } else {
          this.errorMessage.set(error.message);
        }
      }
    });
  }

  /**
   * Maneja el login con Google
   */
  loginWithGoogle(): void {
    console.log('🔐 LoginComponent: Click en botón de Google');
    console.log('🔐 LoginComponent: Iniciando login con Google...');
    
    this.errorMessage.set(null);

    this.authService.loginWithGoogle().subscribe({
      next: (response) => {
        console.log('✅ LoginComponent: URL de Google obtenida:', response.authUrl);
        console.log('🔄 Redirigiendo a Google...');
        // Redirigir a Google OAuth
        window.location.href = response.authUrl;
      },
      error: (error) => {
        console.error('❌ LoginComponent: Error en login con Google:', error);
        this.errorMessage.set('Error al conectar con Google. Intenta nuevamente.');
      }
    });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}