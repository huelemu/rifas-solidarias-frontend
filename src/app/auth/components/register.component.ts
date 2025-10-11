// src/app/auth/components/register.component.ts

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterRequest, UserRole } from '../models/auth.models';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <!-- Header compacto -->
        <div class="register-header">
          <h1>🎯</h1>
          <h2>Crear Cuenta</h2>
        </div>

        <!-- Registro con Google -->
        <button 
          type="button"
          class="google-btn"
          (click)="registerWithGoogle()"
          [disabled]="isLoading()">
          <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          @if (isLoading()) {
            <span class="spinner"></span>
          } @else {
            Google
          }
        </button>

        <!-- Separador -->
        <div class="separator">
          <span>o</span>
        </div>

        <!-- Formulario compacto -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          
          <input
            type="email"
            formControlName="email"
            class="input"
            [class.invalid]="isFieldInvalid('email')"
            placeholder="Email"
            autocomplete="email">
          
          <input
              type="text"
              formControlName="nombre"
              class="input"
              [class.invalid]="isFieldInvalid('nombre')"
              placeholder="Nombre"
              autocomplete="given-name">
            
            <input
              type="text"
              formControlName="apellido"
              class="input"
              [class.invalid]="isFieldInvalid('apellido')"
              placeholder="Apellido"
              autocomplete="family-name">
          <input
            type="password"
            formControlName="password"
            class="input"
            [class.invalid]="isFieldInvalid('password')"
            placeholder="Contraseña (mín. 6 caracteres)"
            autocomplete="new-password">

          <input
            type="password"
            formControlName="confirmPassword"
            class="input"
            [class.invalid]="isFieldInvalid('confirmPassword')"
            placeholder="Confirmar contraseña"
            autocomplete="new-password">

          <label class="checkbox">
            <input type="checkbox" formControlName="acceptTerms">
            <span>
              Acepto 
              <a routerLink="/terminos-condiciones" target="_blank">Términos</a> 
              y 
              <a routerLink="/politica-privacidad" target="_blank">Privacidad</a>
            </span>
          </label>

          @if (errorMessage()) {
            <div class="error">{{ errorMessage() }}</div>
          }

          <button 
            type="submit" 
            class="submit-btn"
            [disabled]="isLoading() || registerForm.invalid">
            @if (isLoading()) {
              <span class="spinner"></span>
            } @else {
              Crear Cuenta
            }
          </button>
        </form>

        <!-- Footer -->
        <p class="footer">
          ¿Ya tienes cuenta? 
          <a routerLink="/login">Inicia sesión</a>
        </p>
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
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .register-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .register-header h1 {
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
    }

    .register-header h2 {
      margin: 0;
      font-size: 1.4rem;
      color: #333;
      font-weight: 600;
    }

    .google-btn {
      width: 100%;
      padding: 0.75rem;
      background: white;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      color: #333;
    }

    .google-btn:hover:not(:disabled) {
      border-color: #4285F4;
      box-shadow: 0 2px 6px rgba(66, 133, 244, 0.15);
    }

    .google-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .google-icon {
      width: 18px;
      height: 18px;
    }

    .separator {
      display: flex;
      align-items: center;
      margin: 1rem 0;
      text-align: center;
    }

    .separator::before,
    .separator::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid #e1e5e9;
    }

    .separator span {
      padding: 0 0.75rem;
      color: #999;
      font-size: 0.85rem;
      font-weight: 500;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .input-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .input {
      padding: 0.75rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    .input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .input.invalid {
      border-color: #e74c3c;
    }

    .input::placeholder {
      color: #999;
    }

    .checkbox {
      display: flex;
      align-items: start;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.85rem;
      color: #555;
      line-height: 1.4;
    }

    .checkbox input {
      margin-top: 0.15rem;
      cursor: pointer;
      flex-shrink: 0;
    }

    .checkbox a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .checkbox a:hover {
      text-decoration: underline;
    }

    .error {
      padding: 0.75rem;
      background: #fee;
      color: #c33;
      border-radius: 6px;
      font-size: 0.85rem;
      border: 1px solid #fcc;
    }

    .submit-btn {
      width: 100%;
      padding: 0.85rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .footer {
      text-align: center;
      margin: 1rem 0 0 0;
      padding-top: 1rem;
      border-top: 1px solid #f0f0f0;
      color: #666;
      font-size: 0.85rem;
    }

    .footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .register-card {
        padding: 1.5rem;
      }

      .input-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  returnUrl: string = '/dashboard';

  readonly registerForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, Validators.requiredTrue]
  }, {
    validators: [this.passwordMatchValidator]
  });

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  registerWithGoogle(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.loginWithGoogle().subscribe({
      next: (response) => {
        if (response.authUrl) {
          if (this.returnUrl !== '/dashboard') {
            localStorage.setItem('returnUrl', this.returnUrl);
          }
          window.location.href = response.authUrl;
        } else {
          this.isLoading.set(false);
          this.errorMessage.set('No se pudo obtener la URL de autenticación');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('❌ Error al iniciar sesión con Google:', error);
        
        const errorMsg = error.error?.message 
          || 'Error al conectar con Google. Inténtalo nuevamente.';
        
        this.errorMessage.set(errorMsg);
        this.notificationService.error(errorMsg, 'Error');
      }
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      this.notificationService.warning(
        'Por favor completa todos los campos correctamente',
        'Formulario incompleto'
      );
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const registerData: RegisterRequest = {
      nombre: this.registerForm.get('nombre')?.value.trim(),
      apellido: this.registerForm.get('apellido')?.value.trim(),
      email: this.registerForm.get('email')?.value.trim(),
      password: this.registerForm.get('password')?.value,
      rol: 'comprador' as UserRole
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        
        if (response.success) {
          this.notificationService.success(
            '¡Tu cuenta ha sido creada exitosamente!',
            'Registro completado'
          );
          
          setTimeout(() => {
            this.router.navigate([this.returnUrl]);
          }, 1500);
        } else {
          this.errorMessage.set(response.message || 'Error al crear la cuenta');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('❌ Error en registro:', error);
        
        const errorMsg = error.error?.message 
          || error.message 
          || 'Error al crear la cuenta. Inténtalo nuevamente.';
        
        this.errorMessage.set(errorMsg);
        this.notificationService.error(errorMsg, 'Error en registro');
      }
    });
  }
}