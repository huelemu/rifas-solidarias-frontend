// src/app/auth/components/forgot-password.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <div class="forgot-password-header">
          <h1>🔑 Recuperar Contraseña</h1>
          <p>Ingresa tu email y te enviaremos instrucciones</p>
        </div>

        @if (!emailSent()) {
          <!-- Formulario de solicitud -->
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="forgot-password-form">
            <!-- Email -->
            <div class="form-group">
              <label for="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                placeholder="tu@email.com"
                [class.error]="isFieldInvalid('email')"
                autocomplete="email"
              />
              @if (isFieldInvalid('email')) {
                <span class="error-message">
                  @if (forgotPasswordForm.get('email')?.hasError('required')) {
                    El email es requerido
                  }
                  @if (forgotPasswordForm.get('email')?.hasError('email')) {
                    Ingrese un email válido
                  }
                </span>
              }
            </div>

            <!-- Error general -->
            @if (errorMessage()) {
              <div class="alert alert-error">
                ❌ {{ errorMessage() }}
                @if (errorMessage()?.includes('Google')) {
                  <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #feb2b2;">
                    <a routerLink="/login" style="color: #c53030; font-weight: 600; text-decoration: underline;">
                      ← Volver al login
                    </a>
                  </div>
                }
              </div>
            }

            <!-- Submit button -->
            <button
              type="submit"
              class="submit-button"
              [disabled]="isLoading()"
            >
              @if (isLoading()) {
                <span class="spinner"></span>
                Enviando...
              } @else {
                📧 Enviar instrucciones
              }
            </button>

            <!-- Volver al login -->
            <div class="back-to-login">
              <a routerLink="/login">← Volver al inicio de sesión</a>
            </div>
          </form>
        } @else {
          <!-- Mensaje de éxito -->
          <div class="success-message">
            <div class="success-icon">✅</div>
            <h2>¡Email enviado!</h2>
            <p>
              Hemos enviado instrucciones para restablecer tu contraseña a:
            </p>
            <p class="email-sent">{{ emailSentTo() }}</p>
            <p class="instructions">
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
              El enlace expirará en <strong>1 hora</strong>.
            </p>
            <div class="actions">
              <button (click)="resetForm()" class="secondary-button">
                📧 Enviar a otro email
              </button>
              <a routerLink="/login" class="primary-button">
                ← Volver al login
              </a>
            </div>
          </div>
        }
      </div>

      <!-- Información adicional -->
      <div class="info-card">
        <h3>💡 ¿No recibes el email?</h3>
        <ul>
          <li>Verifica tu carpeta de spam o correo no deseado</li>
          <li>Asegúrate de haber ingresado el email correcto</li>
          <li>El enlace de recuperación expira en 1 hora</li>
          <li>Si tienes problemas, contacta al soporte</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      gap: 1.5rem;
    }

    .forgot-password-card {
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

    .forgot-password-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .forgot-password-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      color: #1a202c;
    }

    .forgot-password-header p {
      margin: 0;
      color: #718096;
      font-size: 0.95rem;
    }

    .forgot-password-form {
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

    .success-message {
      text-align: center;
      padding: 1rem 0;
    }

    .success-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .success-message h2 {
      color: #1a202c;
      margin: 0 0 1rem 0;
    }

    .success-message p {
      color: #4a5568;
      margin: 0.5rem 0;
      line-height: 1.6;
    }

    .email-sent {
      font-weight: 600;
      color: #667eea;
      font-size: 1.1rem;
      margin: 1rem 0 !important;
    }

    .instructions {
      background: #edf2f7;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1.5rem !important;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 2rem;
    }

    .primary-button,
    .secondary-button {
      padding: 0.875rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
      text-align: center;
      border: none;
    }

    .primary-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .primary-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .secondary-button {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .secondary-button:hover {
      background: #f7fafc;
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
      .forgot-password-container {
        padding: 1rem;
      }

      .forgot-password-card,
      .info-card {
        padding: 1.5rem;
      }

      .forgot-password-header h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly emailSent = signal(false);
  readonly emailSentTo = signal<string>('');

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  /**
   * Verifica si un campo específico es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.emailSent.set(true);
        this.emailSentTo.set(email);
        console.log('✅ Email de recuperación enviado exitosamente');
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('❌ Error al enviar email de recuperación:', error);
        
        // ⭐ Detectar si es usuario de Google
        if (error.error?.code === 'GOOGLE_AUTH_USER') {
          this.errorMessage.set('Esta cuenta usa autenticación de Google. Por favor, inicia sesión con el botón "Continuar con Google".');
        } else {
          this.errorMessage.set(error.message || 'Error al enviar el email de recuperación');
        }
      }
    });
  }

  /**
   * Resetea el formulario para enviar a otro email
   */
  resetForm(): void {
    this.emailSent.set(false);
    this.emailSentTo.set('');
    this.forgotPasswordForm.reset();
    this.errorMessage.set(null);
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      this.forgotPasswordForm.get(key)?.markAsTouched();
    });
  }
}