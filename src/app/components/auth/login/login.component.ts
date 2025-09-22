// ====================================
// src/app/components/auth/login/login.component.ts
// ====================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-content">
        
        <!-- Header -->
        <div class="login-header">
          <div class="logo">
            <mat-icon class="logo-icon">casino</mat-icon>
            <h1>Rifas Solidarias</h1>
          </div>
          <p class="subtitle">Inicia sesión en tu cuenta</p>
        </div>

        <!-- Login Form -->
        <mat-card class="login-card">
          <mat-card-content>
            
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              
              <!-- Email Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Correo Electrónico</mat-label>
                <input matInput 
                       type="email" 
                       formControlName="email"
                       placeholder="tu@email.com"
                       autocomplete="email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  El correo electrónico es obligatorio
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  Ingresa un correo electrónico válido
                </mat-error>
              </mat-form-field>

              <!-- Password Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput 
                       [type]="hidePassword ? 'password' : 'text'"
                       formControlName="password"
                       placeholder="Tu contraseña"
                       autocomplete="current-password">
                <button mat-icon-button 
                        matSuffix 
                        type="button"
                        (click)="hidePassword = !hidePassword"
                        [attr.aria-label]="'Hide password'"
                        [attr.aria-pressed]="hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  La contraseña es obligatoria
                </mat-error>
                <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                  La contraseña debe tener al menos 6 caracteres
                </mat-error>
              </mat-form-field>

              <!-- Submit Button -->
              <button mat-raised-button 
                      color="primary" 
                      type="submit"
                      class="submit-button full-width"
                      [disabled]="loginForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20" class="button-spinner"></mat-spinner>
                <mat-icon *ngIf="!isLoading">login</mat-icon>
                {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
              </button>

            </form>

            <!-- Divider -->
            <div class="divider">
              <span>o</span>
            </div>

            <!-- Register Link -->
            <div class="register-section">
              <p>¿No tienes cuenta?</p>
              <button mat-stroked-button 
                      color="primary" 
                      class="full-width"
                      (click)="goToRegister()">
                <mat-icon>person_add</mat-icon>
                Crear una cuenta
              </button>
            </div>

            <!-- Forgot Password -->
            <div class="forgot-password">
              <button mat-button color="primary" (click)="forgotPassword()">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

          </mat-card-content>
        </mat-card>

        <!-- Footer -->
        <div class="login-footer">
          <p>Al iniciar sesión, aceptas nuestros 
            <a href="/terminos" target="_blank">Términos y Condiciones</a> y 
            <a href="/privacidad" target="_blank">Política de Privacidad</a>
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

    .login-content {
      width: 100%;
      max-width: 420px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
      color: white;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .logo h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 300;
    }

    .subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .login-card {
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      border-radius: 16px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .submit-button {
      height: 48px;
      font-size: 1rem;
      margin-top: 1rem;
      position: relative;
    }

    .button-spinner {
      position: absolute;
      left: 16px;
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 2rem 0;
      color: #666;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e0e0e0;
    }

    .divider span {
      background: white;
      padding: 0 1rem;
      position: relative;
    }

    .register-section {
      text-align: center;
      margin-bottom: 1rem;
    }

    .register-section p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .forgot-password {
      text-align: center;
      margin-top: 1rem;
    }

    .login-footer {
      text-align: center;
      margin-top: 2rem;
      color: white;
      opacity: 0.8;
    }

    .login-footer p {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .login-footer a {
      color: white;
      text-decoration: underline;
    }

    .login-footer a:hover {
      opacity: 0.8;
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .login-container {
        padding: 0.5rem;
      }

      .login-content {
        max-width: 100%;
      }

      .logo h1 {
        font-size: 1.5rem;
      }

      .login-card {
        border-radius: 12px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Obtener URL de retorno de los query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const credentials = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('¡Bienvenido! Sesión iniciada correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Redireccionar según el rol del usuario o URL de retorno
          if (this.returnUrl && this.returnUrl !== '/dashboard') {
            this.router.navigate([this.returnUrl]);
          } else {
            this.authService.redirectAfterLogin();
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en login:', error);
          
          let errorMessage = 'Error al iniciar sesión';
          if (error.status === 401) {
            errorMessage = 'Credenciales incorrectas';
          } else if (error.status === 423) {
            errorMessage = 'Usuario bloqueado temporalmente';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register'], { 
      queryParams: { returnUrl: this.returnUrl } 
    });
  }

  forgotPassword(): void {
    this.snackBar.open('Funcionalidad próximamente disponible', 'Cerrar', {
      duration: 3000
    });
  }
}