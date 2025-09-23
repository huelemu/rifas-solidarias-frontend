// src/app/auth/components/login.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
          </div>

          <!-- Error general -->
          @if (errorMessage()) {
            <div class="alert alert-error">
              {{ errorMessage() }}
            </div>
          }

          <!-- Submit button -->
          <button
            type="submit"
            class="login-button"
            [disabled]="loginForm.invalid || isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Iniciando sesión...
            } @else {
              Iniciar Sesión
            }
          </button>
        </form>

        <div class="login-footer">
          <p>¿No tienes cuenta? 
            <a href="/register" class="link">Regístrate aquí</a>
          </p>
          
          <!-- Información de testing -->
          <div class="test-info">
            <h4>🧪 Para Testing:</h4>
            <p>Backend: <span class="backend-url">{{ getBackendUrl() }}</span></p>
            <small>Se conecta automáticamente según el entorno</small>
          </div>
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
      padding: 1rem;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 420px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-header h1 {
      color: #333;
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .login-header p {
      color: #666;
      margin: 0;
      font-size: 1rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
    }

    input {
      padding: 0.75rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
      font-family: inherit;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    input.error {
      border-color: #e74c3c;
    }

    input.error:focus {
      box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .alert {
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .alert-error {
      background-color: #ffeaea;
      color: #c62828;
      border: 1px solid #ffcdd2;
    }

    .login-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: inherit;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff30;
      border-top: 2px solid #ffffff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .login-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e1e5e9;
    }

    .login-footer p {
      color: #666;
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
    }

    .link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover {
      text-decoration: underline;
    }

    .test-info {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1rem;
    }

    .test-info h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 0.9rem;
    }

    .test-info p {
      margin: 0.25rem 0;
      font-size: 0.8rem;
      color: #555;
    }

    .test-info small {
      color: #888;
      font-size: 0.75rem;
    }

    .backend-url {
      font-family: 'Courier New', monospace;
      background-color: #e9ecef;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-weight: 500;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 1.5rem;
        margin: 1rem;
      }
      
      .login-header h1 {
        font-size: 1.5rem;
      }

      .form-group {
        gap: 0.4rem;
      }

      input {
        padding: 0.6rem;
        font-size: 16px; /* Previene zoom en iOS */
      }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals para estado del componente
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Formulario reactivo
  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.authService.redirectAfterLogin();
    }

    // Para testing - rellenar formulario automáticamente en desarrollo
    if (this.isDevelopment()) {
      this.prefillTestData();
    }
  }

  /**
   * Verifica si estamos en entorno de desarrollo
   */
  private isDevelopment(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  /**
   * Rellena el formulario con datos de test en desarrollo
   */
  private prefillTestData(): void {
    this.loginForm.patchValue({
      email: 'admin@test.com',
      password: '123456'
    });
  }

  /**
   * Obtiene la URL del backend para mostrar en la UI
   */
  getBackendUrl(): string {
    if (this.isDevelopment()) {
      return 'http://localhost:3100';  // Sin /api
    } else {
      return 'https://apirifas.huelemu.com.ar';  // Sin /api
    }
  }

  /**
   * Verifica si un campo específico es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Maneja el envío del formulario de login
   */
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
        this.errorMessage.set(error.message);
      }
    });
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}