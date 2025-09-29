// src/app/auth/components/register.component.ts

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterRequest, UserRole } from '../models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <!-- Header -->
        <div class="register-header">
          <div class="logo">
            <h1>🎯</h1>
          </div>
          <h2>Crear Nueva Cuenta</h2>
          <p>Únete a Rifas Solidarias</p>
        </div>

        <!-- Métodos de registro -->
        <div class="register-methods">
          <!-- Registro con Google -->
          <button 
            type="button"
            class="google-register-btn"
            (click)="registerWithGoogle()"
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

          <!-- Separador -->
          <div class="separator">
            <div class="separator-line"></div>
            <span class="separator-text">o</span>
            <div class="separator-line"></div>
          </div>
        </div>

        <!-- Formulario de registro manual -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          
          <!-- Nombres -->
          <div class="form-row">
            <div class="form-group">
              <label for="nombre" class="form-label">
                <span class="label-icon">👤</span>
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                formControlName="nombre"
                class="form-input"
                [class.invalid]="isFieldInvalid('nombre')"
                placeholder="Juan"
                autocomplete="given-name">
              
              @if (isFieldInvalid('nombre')) {
                <div class="field-error">
                  @for (error of getFieldErrors('nombre'); track error) {
                    <span>{{ error }}</span>
                  }
                </div>
              }
            </div>

            <div class="form-group">
              <label for="apellido" class="form-label">
                <span class="label-icon">👤</span>
                Apellido
              </label>
              <input
                id="apellido"
                type="text"
                formControlName="apellido"
                class="form-input"
                [class.invalid]="isFieldInvalid('apellido')"
                placeholder="Pérez"
                autocomplete="family-name">
              
              @if (isFieldInvalid('apellido')) {
                <div class="field-error">
                  @for (error of getFieldErrors('apellido'); track error) {
                    <span>{{ error }}</span>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email" class="form-label">
              <span class="label-icon">📧</span>
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-input"
              [class.invalid]="isFieldInvalid('email')"
              placeholder="tu@email.com"
              autocomplete="email">
            
            @if (isFieldInvalid('email')) {
              <div class="field-error">
                @for (error of getFieldErrors('email'); track error) {
                  <span>{{ error }}</span>
                }
              </div>
            }
          </div>

          <!-- Contraseña -->
          <div class="form-group">
            <label for="password" class="form-label">
              <span class="label-icon">🔒</span>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-input"
              [class.invalid]="isFieldInvalid('password')"
              placeholder="••••••••"
              autocomplete="new-password">
            
            @if (isFieldInvalid('password')) {
              <div class="field-error">
                @for (error of getFieldErrors('password'); track error) {
                  <span>{{ error }}</span>
                }
              </div>
            }
          </div>

          <!-- Confirmar contraseña -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">
              <span class="label-icon">🔒</span>
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              class="form-input"
              [class.invalid]="isFieldInvalid('confirmPassword')"
              placeholder="••••••••"
              autocomplete="new-password">
            
            @if (isFieldInvalid('confirmPassword')) {
              <div class="field-error">
                @for (error of getFieldErrors('confirmPassword'); track error) {
                  <span>{{ error }}</span>
                }
              </div>
            }
          </div>

          <!-- Campos opcionales -->
          <div class="form-row">
            <div class="form-group">
              <label for="telefono" class="form-label">
                <span class="label-icon">📱</span>
                Teléfono (opcional)
              </label>
              <input
                id="telefono"
                type="tel"
                formControlName="telefono"
                class="form-input"
                placeholder="+54 9 11 1234-5678"
                autocomplete="tel">
            </div>

            <div class="form-group">
              <label for="dni" class="form-label">
                <span class="label-icon">🆔</span>
                DNI (opcional)
              </label>
              <input
                id="dni"
                type="text"
                formControlName="dni"
                class="form-input"
                placeholder="12345678"
                maxlength="8">
            </div>
          </div>

          <!-- Rol -->
          <div class="form-group">
            <label for="rol" class="form-label">
              <span class="label-icon">🏷️</span>
              Tipo de Usuario
            </label>
            <select
              id="rol"
              formControlName="rol"
              class="form-select">
              <option value="comprador">🛒 Comprador - Quiero comprar números</option>
              <option value="vendedor">💼 Vendedor - Quiero vender números</option>
              <option value="admin_institucion">🏛️ Admin Institución - Administrar mi institución</option>
            </select>
            
            <div class="field-help">
              Selecciona el tipo de cuenta que mejor describe tu uso
            </div>
          </div>

          <!-- Error general -->
          @if (errorMessage()) {
            <div class="alert alert-error">
              <span class="alert-icon">❌</span>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Success message -->
          @if (successMessage()) {
            <div class="alert alert-success">
              <span class="alert-icon">✅</span>
              <span>{{ successMessage() }}</span>
            </div>
          }

          <!-- Términos y condiciones -->
          <div class="terms-section">
            <label class="checkbox-label">
              <input
                type="checkbox"
                formControlName="acceptTerms"
                class="checkbox-input">
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">
                Acepto los 
                <a href="/terminos" target="_blank" class="link">términos y condiciones</a>
                y la 
                <a href="/privacidad" target="_blank" class="link">política de privacidad</a>
              </span>
            </label>
            
            @if (isFieldInvalid('acceptTerms')) {
              <div class="field-error">
                <span>Debes aceptar los términos y condiciones</span>
              </div>
            }
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            class="register-button"
            [disabled]="registerForm.invalid || isLoading()">
            @if (isLoading()) {
              <span class="loading-spinner"></span>
              Creando cuenta...
            } @else {
              <span class="btn-icon">🚀</span>
              Crear Cuenta
            }
          </button>
        </form>

        <!-- Footer -->
        <div class="register-footer">
          <p>
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="link">Inicia sesión aquí</a>
          </p>
          
          <!-- Información de testing -->
          @if (isDevelopment()) {
            <div class="test-info">
              <h4>🧪 Para Testing:</h4>
              <p>Backend: <span class="backend-url">{{ getBackendUrl() }}</span></p>
              <small>Registro automático según el entorno</small>
            </div>
          }
        </div>
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
      padding: 2rem 1rem;
    }

    .register-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 2.5rem;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo h1 {
      font-size: 3rem;
      margin: 0;
    }

    .register-header h2 {
      color: #333;
      margin: 0.5rem 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .register-header p {
      color: #666;
      margin: 0;
      font-size: 1rem;
    }

    .register-methods {
      margin-bottom: 2rem;
    }

    .google-register-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 12px;
      background: white;
      color: #333;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .google-register-btn:hover:not(:disabled) {
      border-color: #4285F4;
      box-shadow: 0 2px 8px rgba(66, 133, 244, 0.1);
      transform: translateY(-1px);
    }

    .google-register-btn:disabled {
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
      font-weight: 500;
    }

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

    .form-label {
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .label-icon {
      font-size: 1rem;
    }

    .form-input, .form-select {
      padding: 0.875rem;
      border: 2px solid #e1e5e9;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.invalid, .form-select.invalid {
      border-color: #e74c3c;
    }

    .form-input.invalid:focus, .form-select.invalid:focus {
      box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }

    .field-error {
      color: #e74c3c;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .field-help {
      color: #666;
      font-size: 0.8rem;
    }

    .terms-section {
      margin: 1rem 0;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .checkbox-input {
      display: none;
    }

    .checkbox-custom {
      width: 20px;
      height: 20px;
      border: 2px solid #e1e5e9;
      border-radius: 4px;
      background: white;
      position: relative;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .checkbox-input:checked + .checkbox-custom {
      background: #667eea;
      border-color: #667eea;
    }

    .checkbox-input:checked + .checkbox-custom::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .checkbox-text {
      color: #333;
    }

    .link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover {
      text-decoration: underline;
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem;
      border-radius: 8px;
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

    .register-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 1rem;
    }

    .register-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .register-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .register-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #f0f0f0;
    }

    .register-footer p {
      color: #666;
      margin: 0 0 1rem 0;
    }

    .test-info {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .test-info h4 {
      margin: 0 0 0.5rem 0;
      color: #495057;
      font-size: 0.9rem;
    }

    .test-info p {
      margin: 0;
      font-size: 0.8rem;
      color: #6c757d;
    }

    .backend-url {
      font-family: monospace;
      background: #e9ecef;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .register-container {
        padding: 1rem;
      }

      .register-card {
        padding: 2rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .register-card {
        padding: 1.5rem;
      }

      .logo h1 {
        font-size: 2.5rem;
      }

      .register-header h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  // Servicios
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals para estado del componente
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Formulario reactivo
  readonly registerForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    telefono: [''],
    dni: ['', [Validators.pattern(/^\d{7,8}$/)]],
    rol: ['comprador', Validators.required],
    acceptTerms: [false, Validators.requiredTrue]
  }, {
    validators: [this.passwordMatchValidator]
  });

  constructor() {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    console.log('🚀 RegisterComponent inicializado');
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  /**
   * Verifica si estamos en entorno de desarrollo
   */
  isDevelopment(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  /**
   * Obtiene la URL del backend para mostrar en la UI
   */
  getBackendUrl(): string {
    if (this.isDevelopment()) {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  /**
   * Verifica si un campo específico es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene los errores de un campo específico
   */
  getFieldErrors(fieldName: string): string[] {
    const field = this.registerForm.get(fieldName);
    const errors: string[] = [];

    if (!field || !field.errors) return errors;

    const errorMappings: { [key: string]: string } = {
      required: 'Este campo es requerido',
      minlength: `Mínimo ${field.errors['minlength']?.requiredLength} caracteres`,
      maxlength: `Máximo ${field.errors['maxlength']?.requiredLength} caracteres`,
      email: 'Ingrese un email válido',
      pattern: 'Formato inválido',
      passwordMismatch: 'Las contraseñas no coinciden'
    };

    Object.keys(field.errors).forEach(errorKey => {
      if (errorMappings[errorKey]) {
        errors.push(errorMappings[errorKey]);
      }
    });

    // Error especial para confirmPassword
    if (fieldName === 'confirmPassword' && this.registerForm.hasError('passwordMismatch')) {
      errors.push('Las contraseñas no coinciden');
    }

    return errors;
  }

  /**
   * Maneja el envío del formulario de registro
   */
  onSubmit(): void {
    console.log('📝 RegisterComponent: Enviando formulario...');
    console.log('📝 Datos del formulario:', this.registerForm.value);
    
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      console.log('❌ Formulario inválido:', this.registerForm.errors);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // Preparar datos para enviar al backend (coinciden con RegisterRequest corregido)
    const registerData: RegisterRequest = {
      nombre: this.registerForm.get('nombre')?.value.trim(),
      apellido: this.registerForm.get('apellido')?.value.trim(),
      email: this.registerForm.get('email')?.value.trim(),
      password: this.registerForm.get('password')?.value,
      rol: this.registerForm.get('rol')?.value as UserRole,
      telefono: this.registerForm.get('telefono')?.value?.trim() || undefined,
      dni: this.registerForm.get('dni')?.value?.trim() || undefined
    };

    console.log('🔄 RegisterComponent: Datos enviados al backend:', registerData);

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('✅ RegisterComponent: Registro exitoso:', response);
        
        if (response.success) {
          this.successMessage.set('¡Cuenta creada exitosamente! Redirigiendo...');
          
          // Si el registro devuelve tokens, guardar estado
          if (response.data?.tokens) {
            console.log('🔑 Tokens recibidos, usuario queda logueado');
            // El AuthService ya maneja esto automáticamente
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1500);
          } else {
            // Sin auto-login, redirigir al login
            setTimeout(() => {
              this.router.navigate(['/login'], {
                queryParams: { email: registerData.email, registered: 'true' }
              });
            }, 1500);
          }
        } else {
          this.errorMessage.set(response.message || 'Error en el registro');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('❌ RegisterComponent: Error en registro:', error);
        
        let errorMsg = 'Error en el registro. Intenta nuevamente.';
        
        if (error?.error?.message) {
          errorMsg = error.error.message;
        } else if (error?.message) {
          errorMsg = error.message;
        }
        
        this.errorMessage.set(errorMsg);
      }
    });
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
   * Registro con Google
   */
  registerWithGoogle(): void {
    console.log('🔄 RegisterComponent: Registro con Google...');
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.authService.registerWithGoogle().subscribe({
      next: (response) => {
        console.log('✅ RegisterComponent: URL de Google obtenida:', response.authUrl);
        // Redirigir a Google OAuth
        window.location.href = response.authUrl;
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('❌ RegisterComponent: Error en registro con Google:', error);
        this.errorMessage.set('Error al conectar con Google. Intenta nuevamente.');
      }
    });
  }
}