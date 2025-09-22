// ====================================
// src/app/components/auth/register/register.component.ts
// ====================================
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

interface Institucion {
  id: number;
  nombre: string;
  activa: boolean;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-container">
      <div class="register-content">
        
        <!-- Header -->
        <div class="register-header">
          <div class="logo">
            <mat-icon class="logo-icon">casino</mat-icon>
            <h1>Rifas Solidarias</h1>
          </div>
          <p class="subtitle">Crea tu cuenta gratis</p>
        </div>

        <!-- Register Form -->
        <mat-card class="register-card">
          <mat-card-content>
            
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
              
              <!-- Nombre -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nombre Completo</mat-label>
                <input matInput 
                       type="text" 
                       formControlName="nombre"
                       placeholder="Tu nombre completo"
                       autocomplete="name">
                <mat-icon matSuffix>person</mat-icon>
                <mat-error *ngIf="registerForm.get('nombre')?.hasError('required')">
                  El nombre es obligatorio
                </mat-error>
                <mat-error *ngIf="registerForm.get('nombre')?.hasError('minlength')">
                  El nombre debe tener al menos 2 caracteres
                </mat-error>
              </mat-form-field>

              <!-- Email -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Correo Electrónico</mat-label>
                <input matInput 
                       type="email" 
                       formControlName="email"
                       placeholder="tu@email.com"
                       autocomplete="email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                  El correo electrónico es obligatorio
                </mat-error>
                <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                  Ingresa un correo electrónico válido
                </mat-error>
              </mat-form-field>

              <!-- Teléfono -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Teléfono (Opcional)</mat-label>
                <input matInput 
                       type="tel" 
                       formControlName="telefono"
                       placeholder="+54 11 1234-5678"
                       autocomplete="tel">
                <mat-icon matSuffix>phone</mat-icon>
              </mat-form-field>

              <!-- Password -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput 
                       [type]="hidePassword ? 'password' : 'text'"
                       formControlName="password"
                       placeholder="Mínimo 6 caracteres"
                       autocomplete="new-password">
                <button mat-icon-button 
                        matSuffix 
                        type="button"
                        (click)="hidePassword = !hidePassword"
                        [attr.aria-label]="'Hide password'"
                        [attr.aria-pressed]="hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                  La contraseña es obligatoria
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                  La contraseña debe tener al menos 6 caracteres
                </mat-error>
              </mat-form-field>

              <!-- Confirm Password -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirmar Contraseña</mat-label>
                <input matInput 
                       [type]="hideConfirmPassword ? 'password' : 'text'"
                       formControlName="confirmPassword"
                       placeholder="Repite tu contraseña"
                       autocomplete="new-password">
                <button mat-icon-button 
                        matSuffix 
                        type="button"
                        (click)="hideConfirmPassword = !hideConfirmPassword"
                        [attr.aria-label]="'Hide confirm password'"
                        [attr.aria-pressed]="hideConfirmPassword">
                  <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                  Confirma tu contraseña
                </mat-error>
                <mat-error *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
                  Las contraseñas no coinciden
                </mat-error>
              </mat-form-field>

              <!-- Rol -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tipo de Usuario</mat-label>
                <mat-select formControlName="rol" (selectionChange)="onRoleChange($event.value)">
                  <mat-option value="comprador">Comprador</mat-option>
                  <mat-option value="vendedor">Vendedor</mat-option>
                  <mat-option value="admin_institucion">Administrador de Institución</mat-option>
                </mat-select>
                <mat-icon matSuffix>badge</mat-icon>
                <mat-error *ngIf="registerForm.get('rol')?.hasError('required')">
                  Selecciona un tipo de usuario
                </mat-error>
              </mat-form-field>

              <!-- Institución (si no es comprador) -->
              <mat-form-field appearance="outline" class="full-width" *ngIf="needsInstitution">
                <mat-label>Institución</mat-label>
                <mat-select formControlName="institucion_id" [disabled]="loadingInstituciones">
                  <mat-option *ngFor="let inst of instituciones" [value]="inst.id">
                    {{ inst.nombre }}
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>business</mat-icon>
                <mat-error *ngIf="registerForm.get('institucion_id')?.hasError('required')">
                  Selecciona una institución
                </mat-error>
                <mat-hint *ngIf="loadingInstituciones">Cargando instituciones...</mat-hint>
              </mat-form-field>

              <!-- Submit Button -->
              <button mat-raised-button 
                      color="primary" 
                      type="submit"
                      class="submit-button full-width"
                      [disabled]="registerForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20" class="button-spinner"></mat-spinner>
                <mat-icon *ngIf="!isLoading">person_add</mat-icon>
                {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
              </button>

            </form>

            <!-- Divider -->
            <div class="divider">
              <span>o</span>
            </div>

            <!-- Login Link -->
            <div class="login-section">
              <p>¿Ya tienes cuenta?</p>
              <button mat-stroked-button 
                      color="primary" 
                      class="full-width"
                      (click)="goToLogin()">
                <mat-icon>login</mat-icon>
                Iniciar Sesión
              </button>
            </div>

          </mat-card-content>
        </mat-card>

        <!-- Footer -->
        <div class="register-footer">
          <p>Al crear una cuenta, aceptas nuestros 
            <a href="/terminos" target="_blank">Términos y Condiciones</a> y 
            <a href="/privacidad" target="_blank">Política de Privacidad</a>
          </p>
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
      padding: 1rem;
    }

    .register-content {
      width: 100%;
      max-width: 460px;
    }

    .register-header {
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

    .register-card {
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      border-radius: 16px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .register-form {
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

    .login-section {
      text-align: center;
      margin-bottom: 1rem;
    }

    .login-section p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .register-footer {
      text-align: center;
      margin-top: 2rem;
      color: white;
      opacity: 0.8;
    }

    .register-footer p {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .register-footer a {
      color: white;
      text-decoration: underline;
    }

    .register-footer a:hover {
      opacity: 0.8;
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .register-container {
        padding: 0.5rem;
        align-items: flex-start;
        padding-top: 2rem;
      }

      .register-content {
        max-width: 100%;
      }

      .logo h1 {
        font-size: 1.5rem;
      }

      .register-card {
        border-radius: 12px;
        max-height: none;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  
  // Inyección usando inject() function (Angular 17+)
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  loadingInstituciones = false;
  needsInstitution = false;
  instituciones: Institucion[] = [];
  returnUrl = '/dashboard';

  constructor() {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      rol: ['comprador', [Validators.required]],
      institucion_id: [null]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.loadInstituciones();
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onRoleChange(role: string): void {
    this.needsInstitution = role !== 'comprador';
    
    const institucionControl = this.registerForm.get('institucion_id');
    if (this.needsInstitution) {
      institucionControl?.setValidators([Validators.required]);
    } else {
      institucionControl?.clearValidators();
      institucionControl?.setValue(null);
    }
    institucionControl?.updateValueAndValidity();
  }

  loadInstituciones(): void {
    this.loadingInstituciones = true;
    
    // Obtener URL del API desde AuthService
    const apiUrl = this.authService.getEnvironmentInfo().apiUrl;
    
    this.http.get<{success: boolean, data: Institucion[]}>(`${apiUrl}/instituciones`).subscribe({
      next: (response) => {
        this.instituciones = response.data.filter(inst => inst.activa);
        this.loadingInstituciones = false;
      },
      error: (error) => {
        console.error('Error cargando instituciones:', error);
        this.loadingInstituciones = false;
        this.snackBar.open('Error al cargar instituciones', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const userData = { ...this.registerForm.value };
      delete userData.confirmPassword; // Remover confirmPassword del payload
      
      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('¡Cuenta creada exitosamente!', 'Cerrar', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          
          // Redirigir al login o auto-login
          this.goToLogin();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en registro:', error);
          
          let errorMessage = 'Error al crear la cuenta';
          if (error.status === 409) {
            errorMessage = 'Ya existe una cuenta con este correo electrónico';
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

  goToLogin(): void {
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: this.returnUrl } 
    });
  }
}