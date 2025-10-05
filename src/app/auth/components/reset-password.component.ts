// src/app/auth/components/reset-password.component.ts

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="reset-password-container">
      <div class="reset-password-card">
        <div class="reset-password-header">
          <h1>🔐 Restablecer Contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        @if (!tokenValid()) {
          <!-- Token inválido o expirado -->
          <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h2>Token inválido o expirado</h2>
            <p>
              El enlace de restablecimiento ha expirado o no es válido.
              Por favor, solicita un nuevo enlace de recuperación.
            </p>
            <a routerLink="/forgot-password" class="primary-button">
              📧 Solicitar nuevo enlace
            </a>
          </div>
        } @else if (!passwordReset()) {
          <!-- Formulario de reset -->
          <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="reset-password-form">
            
            <!-- Nueva contraseña -->
            <div class="form-group">
              <label for="password">Nueva Contraseña</label>
              <input
                type="password"
                id="password"
                formControlName="password"
                placeholder="Mínimo 6 caracteres"
                [class.error]="isFieldInvalid('password')"
                autocomplete="new-password"
              />
              @if (isFieldInvalid('password')) {
                <span class="error-message">
                  @if (resetPasswordForm.get('password')?.hasError('required')) {
                    La contraseña es requerida
                  }
                  @if (resetPasswordForm.get('password')?.hasError('minlength')) {
                    La contraseña debe tener al menos 6 caracteres
                  }
                </span>
              }
              <!-- Indicador de fortaleza -->
              @if (resetPasswordForm.get('password')?.value) {
                <div class="password-strength">
                  <div class="strength-bar" [class]="getPasswordStrength()"></div>
                  <span class="strength-label">{{ getPasswordStrengthLabel() }}</span>
                </div>
              }
            </div>

            <!-- Confirmar contraseña -->
            <div class="form-group">
              <label for="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                formControlName="confirmPassword"
                placeholder="Repite la contraseña"
                [class.error]="isFieldInvalid('confirmPassword') || resetPasswordForm.hasError('passwordMismatch')"
                autocomplete="new-password"
              />
              @if (isFieldInvalid('confirmPassword')) {
                <span class="error-message">
                  Confirma la contraseña
                </span>
              }
              @if (resetPasswordForm.hasError('passwordMismatch') && resetPasswordForm.get('confirmPassword')?.touched) {
                <span class="error-message">
                  Las contraseñas no coinciden
                </span>
              }
            </div>

            <!-- Error general -->
            @if (errorMessage()) {
              <div class="alert alert-error">
                ❌ {{ errorMessage() }}
              </div>
            }

            <!-- Submit button -->
            <button
              type="submit"
              class="submit-button"
              [disabled]="isLoading() || resetPasswordForm.invalid"
            >
              @if (isLoading()) {
                <span class="spinner"></span>
                Restableciendo...
              } @else {
                🔒 Restablecer contraseña
              }
            </button>

            <!-- Volver al login -->
            <div class="back-to-login">
              <a routerLink="/login">← Volver al inicio de sesión</a>
            </div>
          </form>
        } @else {
          <!-- Contraseña restablecida exitosamente -->
          <div class="success-message">
            <div class="success-icon">✅</div>
            <h2>¡Contraseña restablecida!</h2>
            <p>
              Tu contraseña ha sido actualizada exitosamente.
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <a routerLink="/login" class="primary-button">
              ← Ir al inicio de sesión
            </a>
          </div>
        }
      </div>

      <!-- Tips de seguridad -->
      @if (tokenValid() && !passwordReset()) {
        <div class="info-card">
          <h3>🔐 Tips de seguridad</h3>
          <ul>
            <li>Usa al menos 8 caracteres</li>
            <li>Combina letras mayúsculas y minúsculas</li>
            <li>Incluye números y símbolos</li>
            <li>No uses información personal obvia</li>
            <li>No reutilices contraseñas de otras cuentas</li>
          </ul>
        </div>
      }
    </div>
  `,
  styles: [`
    .reset-password-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      gap: 1.5rem;
    }

    .reset-password-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 2.5rem;
      width: 100%;
      max-width: 450px;
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

    .reset-password-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .reset-password-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      color: #1a202c;
    }

    .reset-password-header p {
      margin: 0;
      color: #718096;
      font-size: 0.95rem;
    }

    .reset-password-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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

    .password-strength {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.25rem;
    }

    .strength-bar {
      flex: 1;
      height: 4px;
      border-radius: 2px;
      background: #e2e8f0;
      transition: all 0.3s;
    }

    .strength-bar.weak {
      background: linear-gradient(90deg, #fc8181 30%, #e2e8f0 30%);
    }

    .strength-bar.medium {
      background: linear-gradient(90deg, #f6ad55 60%, #e2e8f0 60%);
    }

    .strength-bar.strong {
      background: linear-gradient(90deg, #48bb78 100%, #e2e8f0 100%);
    }

    .strength-label {
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .strength-bar.weak + .strength-label {
      color: #fc8181;
    }

    .strength-bar.medium + .strength-label {
      color: #f6ad55;
    }

    .strength-bar.strong + .strength-label {
      color: #48bb78;
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

    .submit-button {
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
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

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    .back-to-login {
      text-align: center;
      padding-top: 1rem;
    }

    .back-to-login a {
      color: #667eea;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }

    .back-to-login a:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    .error-state,
    .success-message {
      text-align: center;
      padding: 1rem 0;
    }

    .error-icon,
    .success-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .error-state h2,
    .success-message h2 {
      color: #1a202c;
      margin: 0 0 1rem 0;
    }

    .error-state p,
    .success-message p {
      color: #4a5568;
      margin: 0.5rem 0 1.5rem 0;
      line-height: 1.6;
    }

    .primary-button {
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
      border: none;
      margin-top: 1rem;
    }

    .primary-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .info-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      width: 100%;
      max-width: 450px;
    }

    .info-card h3 {
      margin: 0 0 1rem 0;
      color: #1a202c;
      font-size: 1.1rem;
    }

    .info-card ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #4a5568;
      line-height: 1.8;
    }

    .info-card li {
      margin-bottom: 0.5rem;
    }

    @media (max-width: 640px) {
      .reset-password-container {
        padding: 1rem;
      }

      .reset-password-card,
      .info-card {
        padding: 1.5rem;
      }

      .reset-password-header h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly passwordReset = signal(false);
  readonly tokenValid = signal(true);
  private token = signal<string>('');

  resetPasswordForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: [this.passwordMatchValidator]
  });

  ngOnInit(): void {
    // Obtener el token de la URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (!token) {
        console.error('❌ No se encontró token en la URL');
        this.tokenValid.set(false);
        return;
      }
      
      this.token.set(token);
      console.log('✅ Token obtenido de la URL');
      
      // Opcionalmente, validar el token con el backend
      this.validateToken(token);
    });
  }

  /**
   * Valida el token con el backend
   */
  private validateToken(token: string): void {
    this.authService.validateResetToken(token).subscribe({
      next: (valid) => {
        this.tokenValid.set(valid);
        if (!valid) {
          console.error('❌ Token inválido o expirado');
        }
      },
      error: (error) => {
        console.error('❌ Error validando token:', error);
        this.tokenValid.set(false);
      }
    });
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
   * Verifica si un campo específico es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Calcula la fortaleza de la contraseña
   */
  getPasswordStrength(): string {
    const password = this.resetPasswordForm.get('password')?.value || '';
    
    if (password.length === 0) return '';
    
    let strength = 0;
    
    // Criterios de fortaleza
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  /**
   * Obtiene la etiqueta de fortaleza
   */
  getPasswordStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    
    switch (strength) {
      case 'weak': return 'Débil';
      case 'medium': return 'Media';
      case 'strong': return 'Fuerte';
      default: return '';
    }
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const newPassword = this.resetPasswordForm.get('password')?.value;
    const token = this.token();

    this.authService.resetPassword(token, newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.passwordReset.set(true);
        console.log('✅ Contraseña restablecida exitosamente');
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('❌ Error al restablecer contraseña:', error);
        
        if (error.status === 400 || error.status === 404) {
          this.tokenValid.set(false);
        } else {
          this.errorMessage.set(error.message || 'Error al restablecer la contraseña');
        }
      }
    });
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      this.resetPasswordForm.get(key)?.markAsTouched();
    });
  }
}