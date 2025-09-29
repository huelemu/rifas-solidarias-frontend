// src/app/auth/components/login.component.ts - ACTUALIZADO

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // ✅ Agregado RouterModule
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🎯 Rifas Solidarias</h1>
          <p>Iniciar Sesión</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          

          <!-- Separador 
          <div class="separator">
            <div class="separator-line"></div>
            <span class="separator-text">o</span>
            <div class="separator-line"></div>
          </div>
          -->
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
            [disabled]="loginForm.invalid || isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Iniciando sesión...
            } @else {
              Iniciar Sesión
            }
          </button>

                    <!-- Botón de Google Login -->
          <button
            type="button"
            class="google-login-btn"
            (click)="loginWithGoogle()"
            [disabled]="isLoading()">
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            @if (isLoading()) {
              <span class="loading-spinner"></span>
              Conectando...
            } @else {
              Continuar con Google
            }
          </button>
          
        </form>

        <div class="login-footer">
          <p>
            ¿No tienes cuenta?
            <a routerLink="/register" class="link">Regístrate aquí</a>
          </p>
          
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
      transition: all 0.3s ease;
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
      font-weight: 500;
    }

    .alert {
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .alert-error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .alert-success {
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }

    .login-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .login-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .google-login-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      background: white;
      color: #333;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1rem;
    }

    .google-login-btn:hover:not(:disabled) {
      border-color: #4285F4;
      box-shadow: 0 2px 8px rgba(66, 133, 244, 0.1);
      transform: translateY(-1px);
    }

    .google-login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .google-icon {
      width: 20px;
      height: 20px;
    }

    .separator {
      display: flex;
      align-items: center;
      margin: 1rem 0;
      gap: 1rem;
    }

    .separator-line {
      flex: 1;
      height: 1px;
      background: #e1e5e9;
    }

    .separator-text {
      color: #666;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(66, 133, 244, 0.3);
      border-top: 2px solid #4285F4;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .login-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f0f0f0;
    }

    .login-footer p {
      color: #666;
      margin: 0 0 1rem 0;
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
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
      text-align: left;
    }

    .test-info h4, .test-info h5 {
      margin: 0 0 0.5rem 0;
      color: #495057;
      font-size: 0.9rem;
    }

    .test-info h5 {
      font-size: 0.8rem;
      margin-top: 1rem;
    }

    .test-info p {
      margin: 0.25rem 0;
      font-size: 0.8rem;
      color: #6c757d;
    }

    .backend-url {
      font-family: monospace;
      background: #e9ecef;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
    }

    .test-credentials {
      margin-top: 1rem;
      padding-top: 0.5rem;
      border-top: 1px solid #dee2e6;
    }

    .btn-test {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      margin-top: 0.5rem;
    }

    .btn-test:hover {
      background: #218838;
    }

    @media (max-width: 480px) {
      .login-card {
        margin: 1rem;
        padding: 1.5rem;
      }
    }
  `]
})
export class LoginComponent {
  // Servicios
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  // Signals para estado del componente
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly registrationSuccess = signal<string | null>(null);

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

    // Verificar si viene del registro exitoso
    this.checkRegistrationSuccess();
  }

  /**
   * Maneja el login con Google
   */
  loginWithGoogle(): void {
    console.log('🔐 LoginComponent: Iniciando login con Google...');
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.loginWithGoogle().subscribe({
      next: (response) => {
        console.log('✅ LoginComponent: URL de Google obtenida:', response.authUrl);
        // Redirigir a Google OAuth
        window.location.href = response.authUrl;
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('❌ LoginComponent: Error en login con Google:', error);
        this.errorMessage.set('Error al conectar con Google. Intenta nuevamente.');
      }
    });
  }

  /**
   * Verifica si estamos en entorno de desarrollo
   */
  isDevelopment(): boolean {  // ✅ Cambiar de private a public
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
   * Rellena credenciales de prueba manualmente
   */
  fillTestCredentials(): void {
    this.loginForm.patchValue({
      email: 'admin@test.com',
      password: '123456'
    });
    this.loginForm.markAllAsTouched();
  }

  /**
   * Verifica si viene del registro exitoso
   */
  private checkRegistrationSuccess(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const registered = urlParams.get('registered');
    const email = urlParams.get('email');
    
    if (registered === 'true') {
      this.registrationSuccess.set('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
      if (email) {
        this.loginForm.patchValue({ email });
      }
    }
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