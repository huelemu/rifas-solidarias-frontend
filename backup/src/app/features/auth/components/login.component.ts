// src/app/components/auth/login/login.component.ts - CORREGIDO
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>🎯 Rifas Solidarias</h2>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="login-form">
          <!-- Email -->
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email"
              formControlName="email"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              placeholder="tu@email.com">
            <div class="error-message" 
                 *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Email válido es requerido
            </div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password"
              formControlName="password"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              placeholder="••••••••">
            <div class="error-message" 
                 *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Contraseña es requerida (mínimo 6 caracteres)
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="login-btn"
            [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="!isLoading">Iniciar Sesión</span>
            <span *ngIf="isLoading" class="loading">🔄 Iniciando...</span>
          </button>

          <!-- Error Message -->
          <div class="error-alert" *ngIf="error">
            ❌ {{ error }}
          </div>

          <!-- Register Link -->
          <div class="register-link">
            <p>¿No tienes cuenta? 
              <a (click)="goToRegister()" class="link">Regístrate aquí</a>
            </p>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 15px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h2 {
      color: #333;
      font-size: 1.8em;
      margin-bottom: 10px;
    }

    .login-header p {
      color: #666;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e1e1;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group input.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 5px;
    }

    .login-btn {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 15px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 20px;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .error-alert {
      background: #ffeaea;
      color: #e74c3c;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
    }

    .register-link {
      text-align: center;
    }

    .register-link p {
      color: #666;
      margin: 0;
    }

    .link {
      color: #667eea;
      cursor: pointer;
      text-decoration: none;
      font-weight: 600;
    }

    .link:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Verificar si ya está logueado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = '';

    const formValue = this.loginForm.value;
    
    // CORREGIDO: Suscribirse al Observable
    this.authService.login(formValue.email, formValue.password).subscribe({
      next: (result) => {
        if (result.success) {
          console.log('✅ Login exitoso');
          this.router.navigate(['/dashboard']);
        } else {
          this.error = result.message || 'Error al iniciar sesión';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.error = error.message || 'Error de conexión';
        this.isLoading = false;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(field => {
      const control = this.loginForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}