// src/app/auth/components/register.component.ts - VERSIÓN COMPLETA SIN ERRORES

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>🎯 Rifas Solidarias</h1>
          <p>Crear Cuenta</p>
        </div>

        <!-- Mostrar mensaje de verificación si el registro fue exitoso -->
        @if (showVerificationMessage()) {
          <div class="verification-section">
            <div class="verification-card">
              <div class="verification-icon">📧</div>
              <h3>¡Registro Exitoso!</h3>
              <p>Hemos enviado un email de verificación a:</p>
              <strong>{{ registeredEmail() }}</strong>
              <p>Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.</p>
              
              <div class="verification-actions">
                <button 
                  (click)="resendVerification()" 
                  class="resend-button"
                  [disabled]="isResending()">
                  @if (isResending()) {
                    <span class="spinner"></span>
                    Reenviando...
                  } @else {
                    📮 Reenviar Email
                  }
                </button>
                
                <button (click)="goToLogin()" class="login-button">
                  🔐 Ir al Login
                </button>
              </div>
              
              @if (resendMessage()) {
                <div class="resend-message" [class.success]="resendMessage()!.includes('exitosamente')" [class.error]="!resendMessage()!.includes('exitosamente')">
                  {{ resendMessage() }}
                </div>
              }
            </div>
          </div>
        } @else {
          <!-- Formulario de registro -->
          
          <!-- Botón de Google OAuth -->
          <div class="google-auth-section">
            <button
              type="button"
              (click)="signInWithGoogle()"
              class="google-button"
              [disabled]="isLoading()"
            >
              <svg class="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Registrarse con Google</span>
            </button>
          </div>

          <!-- Separador -->
          <div class="separator">
            <div class="separator-line"></div>
            <span class="separator-text">O regístrate con email</span>
            <div class="separator-line"></div>
          </div>

          <!-- Formulario tradicional -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            <!-- Nombre y Apellido -->
            <div class="form-row">
              <div class="form-group">
                <label for="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  formControlName="nombre"
                  placeholder="Tu nombre"
                  [class.error]="isFieldInvalid('nombre')"
                />
                @if (isFieldInvalid('nombre')) {
                  <span class="error-message">
                    @if (registerForm.get('nombre')?.hasError('required')) {
                      El nombre es requerido
                    }
                    @if (registerForm.get('nombre')?.hasError('minlength')) {
                      El nombre debe tener al menos 2 caracteres
                    }
                  </span>
                }
              </div>

              <div class="form-group">
                <label for="apellido">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  formControlName="apellido"
                  placeholder="Tu apellido"
                  [class.error]="isFieldInvalid('apellido')"
                />
                @if (isFieldInvalid('apellido')) {
                  <span class="error-message">
                    @if (registerForm.get('apellido')?.hasError('required')) {
                      El apellido es requerido
                    }
                    @if (registerForm.get('apellido')?.hasError('minlength')) {
                      El apellido debe tener al menos 2 caracteres
                    }
                  </span>
                }
              </div>
            </div>

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
                  @if (registerForm.get('email')?.hasError('required')) {
                    El email es requerido
                  }
                  @if (registerForm.get('email')?.hasError('email')) {
                    Ingrese un email válido
                  }
                </span>
              }
            </div>

            <!-- Contraseña -->
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
                  @if (registerForm.get('password')?.hasError('required')) {
                    La contraseña es requerida
                  }
                  @if (registerForm.get('password')?.hasError('minlength')) {
                    La contraseña debe tener al menos 6 caracteres
                  }
                </span>
              }
            </div>

            <!-- Confirmar Contraseña -->
            <div class="form-group">
              <label for="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                formControlName="confirmPassword"
                placeholder="••••••••"
                [class.error]="isFieldInvalid('confirmPassword')"
              />
              @if (isFieldInvalid('confirmPassword')) {
                <span class="error-message">
                  @if (registerForm.get('confirmPassword')?.hasError('required')) {
                    Confirma tu contraseña
                  }
                  @if (registerForm.hasError('passwordMismatch')) {
                    Las contraseñas no coinciden
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
              class="register-button"
              [disabled]="registerForm.invalid || isLoading()"
            >
              @if (isLoading()) {
                <span class="spinner"></span>
                Registrando...
              } @else {
                Crear Cuenta
              }
            </button>
          </form>
          
          <!-- Footer -->
          <div class="register-footer">
            <p>¿Ya tienes cuenta? 
              <a href="/login" class="link">Inicia sesión aquí</a>
            </p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .register-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 450px;
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .register-header h1 {
      color: #333;
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .register-header p {
      color: #666;
      margin: 0;
      font-size: 1rem;
    }

    /* Verificación de email */
    .verification-section {
      text-align: center;
    }

    .verification-card {
      padding: 2rem 1rem;
    }

    .verification-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .verification-card h3 {
      color: #27ae60;
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }

    .verification-card p {
      color: #666;
      margin: 0.5rem 0;
      line-height: 1.5;
    }

    .verification-card strong {
      color: #333;
      font-weight: 600;
    }

    .verification-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 2rem;
    }

    .resend-button, .login-button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .resend-button {
      background: #f8f9fa;
      color: #495057;
      border: 2px solid #dee2e6;
    }

    .login-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .resend-button:hover:not(:disabled) {
      background: #e9ecef;
      transform: translateY(-1px);
    }

    .login-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .resend-message {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .resend-message.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .resend-message.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    /* Google OAuth */
    .google-auth-section {
      margin-bottom: 1.5rem;
    }

    .google-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      background: white;
      color: #333;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .google-button:hover:not(:disabled) {
      border-color: #dadce0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .google-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .google-icon {
      width: 20px;
      height: 20px;
    }

    /* Separador */
    .separator {
      display: flex;
      align-items: center;
      margin: 1.5rem 0;
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
      white-space: nowrap;
    }

    /* Formulario */
    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    .register-button {
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

    .register-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .register-button:disabled {
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

    .register-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e1e5e9;
    }

    .register-footer p {
      color: #666;
      margin: 0;
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

    @media (max-width: 480px) {
      .register-card {
        padding: 1.5rem;
        margin: 1rem;
      }
      
      .register-header h1 {
        font-size: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      input {
        padding: 0.6rem;
        font-size: 16px; /* Previene zoom en iOS */
      }

      .verification-actions {
        gap: 0.75rem;
      }
    }
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals para estado del componente
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showVerificationMessage = signal(false);
  readonly registeredEmail = signal('');
  readonly isResending = signal(false);
  readonly resendMessage = signal<string | null>(null);

  // Formulario reactivo
  readonly registerForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(control: any) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  /**
   * Verifica si un campo específico es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Maneja el envío del formulario de registro
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const userData: RegisterRequest = {
      name: `${this.registerForm.value.nombre} ${this.registerForm.value.apellido}`,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: 'comprador'
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        
        if (response && response.data) {
          console.log('✅ RegisterComponent: Registro exitoso:', response.data.user);
          this.registeredEmail.set(userData.email);
          this.showVerificationMessage.set(true);
        } else {
          this.errorMessage.set(response?.message || 'Error en el registro');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('❌ RegisterComponent: Error en registro:', error);
        this.errorMessage.set(error.message || 'Error en el registro');
      }
    });
  }

  /**
   * Reenvía el email de verificación
   */
  async resendVerification(): Promise<void> {
    if (!this.registeredEmail()) return;

    this.isResending.set(true);
    this.resendMessage.set('');

    try {
      await this.authService.resendVerification(this.registeredEmail()).toPromise();
      this.resendMessage.set('Email de verificación reenviado exitosamente');
    } catch (error: any) {
      this.resendMessage.set('Error al reenviar email de verificación');
      console.error('Error reenviando verificación:', error);
    } finally {
      this.isResending.set(false);
    }
  }

  /**
   * Maneja el registro con Google (CORREGIDO: signInWithGoogle en lugar de signUpWithGoogle)
   */
  signInWithGoogle(): void {
    try {
      this.isLoading.set(true);
      this.errorMessage.set('');
      
      this.authService.signInWithGoogle();
    } catch (error: any) {
      this.isLoading.set(false);
      console.error('Error en registro con Google:', error);
      this.errorMessage.set('Error al registrarse con Google');
    }
  }

  /**
   * Va a la página de login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}