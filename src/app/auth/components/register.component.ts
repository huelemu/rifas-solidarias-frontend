// src/app/auth/components/register.component.ts

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
      <!-- Header -->
      <div class="register-header">
        <h1>🚀 Crear Cuenta</h1>
        <p>¿Ya tienes una cuenta? 
          <button type="button" (click)="goToLogin()" class="link-button">
            Inicia sesión aquí
          </button>
        </p>
      </div>

      <div class="register-content">
        <!-- Google OAuth Button -->
        <div class="google-section">
          <button 
            type="button" 
            (click)="signUpWithGoogle()" 
            [disabled]="isLoading()"
            class="google-btn">
            <svg class="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrarse con Google
          </button>
        </div>

        <div class="divider">
          <span>O registrarse con email</span>
        </div>

        <!-- Registration Form -->
        @if (registrationStep() === 'form') {
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            
            <!-- Error Messages -->
            @if (errorMessage()) {
              <div class="error-alert">
                <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Personal Information -->
            <div class="form-section">
              <h3>📝 Información Personal</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="nombre">Nombre *</label>
                  <input 
                    id="nombre"
                    type="text" 
                    formControlName="nombre"
                    placeholder="Tu nombre"
                    [class.error]="registerForm.get('nombre')?.invalid && registerForm.get('nombre')?.touched">
                  @if (registerForm.get('nombre')?.invalid && registerForm.get('nombre')?.touched) {
                    <div class="field-error">
                      @if (registerForm.get('nombre')?.errors?.['required']) {
                        El nombre es requerido
                      }
                      @if (registerForm.get('nombre')?.errors?.['minlength']) {
                        El nombre debe tener al menos 2 caracteres
                      }
                    </div>
                  }
                </div>

                <div class="form-group">
                  <label for="apellido">Apellido *</label>
                  <input 
                    id="apellido"
                    type="text" 
                    formControlName="apellido"
                    placeholder="Tu apellido"
                    [class.error]="registerForm.get('apellido')?.invalid && registerForm.get('apellido')?.touched">
                  @if (registerForm.get('apellido')?.invalid && registerForm.get('apellido')?.touched) {
                    <div class="field-error">
                      @if (registerForm.get('apellido')?.errors?.['required']) {
                        El apellido es requerido
                      }
                      @if (registerForm.get('apellido')?.errors?.['minlength']) {
                        El apellido debe tener al menos 2 caracteres
                      }
                    </div>
                  }
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input 
                  id="email"
                  type="email" 
                  formControlName="email"
                  placeholder="tu@email.com"
                  [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                  <div class="field-error">
                    @if (registerForm.get('email')?.errors?.['required']) {
                      El email es requerido
                    }
                    @if (registerForm.get('email')?.errors?.['email']) {
                      Formato de email inválido
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Security Information -->
            <div class="form-section">
              <h3>🔒 Información de Seguridad</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="password">Contraseña *</label>
                  <div class="password-field">
                    <input 
                      id="password"
                      [type]="showPassword() ? 'text' : 'password'"
                      formControlName="password"
                      placeholder="Mínimo 6 caracteres"
                      [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                    <button 
                      type="button" 
                      (click)="togglePassword()"
                      class="password-toggle">
                      {{ showPassword() ? '🙈' : '👁️' }}
                    </button>
                  </div>
                  @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                    <div class="field-error">
                      @if (registerForm.get('password')?.errors?.['required']) {
                        La contraseña es requerida
                      }
                      @if (registerForm.get('password')?.errors?.['minlength']) {
                        La contraseña debe tener al menos 6 caracteres
                      }
                    </div>
                  }
                </div>

                <div class="form-group">
                  <label for="confirmPassword">Confirmar Contraseña *</label>
                  <div class="password-field">
                    <input 
                      id="confirmPassword"
                      [type]="showConfirmPassword() ? 'text' : 'password'"
                      formControlName="confirmPassword"
                      placeholder="Confirma tu contraseña"
                      [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                    <button 
                      type="button" 
                      (click)="toggleConfirmPassword()"
                      class="password-toggle">
                      {{ showConfirmPassword() ? '🙈' : '👁️' }}
                    </button>
                  </div>
                  @if (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) {
                    <div class="field-error">
                      @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                        Confirma tu contraseña
                      }
                      @if (registerForm.get('confirmPassword')?.errors?.['passwordMismatch']) {
                        Las contraseñas no coinciden
                      }
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Optional Information -->
            <div class="form-section">
              <h3>📞 Información Adicional (Opcional)</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="telefono">Teléfono</label>
                  <input 
                    id="telefono"
                    type="tel" 
                    formControlName="telefono"
                    placeholder="+54 11 1234-5678">
                </div>

                <div class="form-group">
                  <label for="dni">DNI</label>
                  <input 
                    id="dni"
                    type="text" 
                    formControlName="dni"
                    placeholder="12345678">
                </div>
              </div>

              <div class="form-group">
                <label for="rol">Tipo de Cuenta</label>
                <select id="rol" formControlName="rol">
                  <option value="comprador">🛒 Comprador de rifas</option>
                  <option value="vendedor">🎫 Vendedor de rifas</option>
                </select>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <button 
                type="submit" 
                [disabled]="registerForm.invalid || isLoading()"
                class="submit-btn">
                @if (isLoading()) {
                  <div class="spinner"></div>
                  Creando cuenta...
                } @else {
                  🚀 Crear Cuenta
                }
              </button>
            </div>

            <p class="terms-text">
              Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </form>
        }

        <!-- Email Verification Step -->
        @if (registrationStep() === 'verify') {
          <div class="verification-section">
            <div class="verification-icon">📧</div>
            <h2>¡Revisa tu email!</h2>
            <p>Hemos enviado un email de verificación a:</p>
            <p class="email-address">{{ registeredEmail() }}</p>
            
            <div class="verification-info">
              <p>📩 Revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.</p>
            </div>
            
            <div class="verification-actions">
              <button 
                (click)="resendVerification()" 
                [disabled]="isLoading()"
                class="btn-secondary">
                📤 Reenviar Email
              </button>
              <button 
                (click)="goToLogin()"
                class="btn-primary">
                Ir a Iniciar Sesión
              </button>
            </div>
            
            <p class="expiry-notice">
              ⏰ El enlace expira en 24 horas.<br>
              Si no recibes el email, revisa tu carpeta de spam.
            </p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
      color: white;
    }

    .register-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .register-header p {
      font-size: 1rem;
      opacity: 0.9;
    }

    .link-button {
      background: none;
      border: none;
      color: #f0f0f0;
      text-decoration: underline;
      cursor: pointer;
      font-weight: 600;
    }

    .link-button:hover {
      color: white;
    }

    .register-content {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .google-section {
      margin-bottom: 1.5rem;
    }

    .google-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      color: #374151;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .google-btn:hover {
      border-color: #d1d5db;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .google-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .google-icon {
      width: 20px;
      height: 20px;
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 1.5rem 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e5e7eb;
    }

    .divider span {
      background: white;
      padding: 0 1rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section {
      border: 1px solid #f3f4f6;
      border-radius: 8px;
      padding: 1.5rem;
      background: #fafafa;
    }

    .form-section h3 {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .form-group input,
    .form-group select {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group input.error {
      border-color: #ef4444;
    }

    .password-field {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }

    .field-error {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      color: #dc2626;
      font-size: 0.875rem;
    }

    .error-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .form-actions {
      margin-top: 1rem;
    }

    .submit-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .terms-text {
      text-align: center;
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 1rem;
      line-height: 1.5;
    }

    .verification-section {
      text-align: center;
      padding: 2rem 0;
    }

    .verification-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .verification-section h2 {
      color: #374151;
      margin-bottom: 1rem;
    }

    .email-address {
      font-weight: 600;
      color: #667eea;
      word-break: break-all;
      margin: 1rem 0;
    }

    .verification-info {
      background: #eff6ff;
      border: 1px solid #dbeafe;
      border-radius: 8px;
      padding: 1rem;
      margin: 1.5rem 0;
      color: #1e40af;
    }

    .verification-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin: 1.5rem 0;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
      border: none;
    }

    .btn-primary:hover {
      background: #5a67d8;
    }

    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-secondary:hover {
      background: #667eea;
      color: white;
    }

    .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .expiry-notice {
      font-size: 0.75rem;
      color: #6b7280;
      line-height: 1.5;
      margin-top: 1rem;
    }
  `]
}) 
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Signals para el estado del componente
  isLoading = signal(false);
  errorMessage = signal('');
  registrationStep = signal<'form' | 'verify'>('form');
  registeredEmail = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // Formulario reactivo
  registerForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      telefono: [''],
      dni: [''],
      rol: ['comprador', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator para verificar que las contraseñas coincidan
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
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
  this.errorMessage.set(null);

  const userData: RegisterRequest = this.registerForm.value;

  this.authService.register(userData).subscribe({
    next: (response) => {
      this.isLoading.set(false);
      
      // CORREGIR: verificar response directamente, no response.success
      if (response && response.data) {
        console.log('✅ RegisterComponent: Registro exitoso:', response.data.user);
        this.registeredEmail.set(userData.email);
        this.showVerificationMessage.set(true);
      } else {
        // CORREGIR: usar response.message directamente
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
  this.resendMessage.set(null);

  try {
    // CORREGIR: usar resendVerification en lugar de resendVerification
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
 * Maneja el registro con Google
 */
async signInWithGoogle(): Promise<void> {
  try {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    // CORREGIR: usar loginWithGoogle (que es el método correcto)
    this.authService.loginWithGoogle();
  } catch (error: any) {
    this.isLoading.set(false);
    console.error('Error en registro con Google:', error);
    this.errorMessage.set('Error al registrarse con Google');
  }
}

  
  // Navegación
  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  // Toggle password visibility
  togglePassword() {
    this.showPassword.update(show => !show);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(show => !show);
  }

}