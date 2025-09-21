// ===================================================================
// 🚪 ANGULAR LOGIN COMPONENT - IMPLEMENTACIÓN COMPLETA
// src/app/components/auth/login/login.component.ts
// ===================================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService, LoginRequest } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  
  // ==================
  // PROPIEDADES
  // ==================
  
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  successMessage = '';
  
  // Para cleanup de subscriptions
  private destroy$ = new Subject<void>();
  
  // Credenciales de prueba
  testCredentials = [
    { role: 'Admin Global', email: 'admin@test.com', password: 'admin123' },
    { role: 'Admin Institución', email: 'admin.inst@test.com', password: 'admin123' },
    { role: 'Vendedor', email: 'vendedor@test.com', password: 'vendedor123' },
    { role: 'Comprador', email: 'comprador@test.com', password: 'comprador123' }
  ];
  
  // ==================
  // CONSTRUCTOR
  // ==================
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.createForm();
  }
  
  // ==================
  // LIFECYCLE HOOKS
  // ==================
  
  ngOnInit(): void {
    // Verificar si ya está autenticado
    if (this.authService.isAuthenticated()) {
      console.log('👤 Usuario ya autenticado, redirigiendo...');
      this.authService.redirectToDashboard();
    }
    
    // Limpiar mensajes al cambiar el formulario
    this.loginForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.clearMessages();
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // ==================
  // CONFIGURACIÓN DEL FORMULARIO
  // ==================
  
  private createForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }
  
  // ==================
  // MÉTODOS DE LOGIN
  // ==================
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    
    this.performLogin();
  }
  
  private performLogin(): void {
    const credentials: LoginRequest = this.loginForm.value;
    
    console.log('🔑 Iniciando login para:', credentials.email);
    this.isLoading = true;
    this.clearMessages();
    
    this.authService.login(credentials)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Login exitoso:', response.data.user);
          this.successMessage = '¡Login exitoso! Redirigiendo...';
          
          // Redirigir después de 1 segundo
          setTimeout(() => {
            this.authService.redirectToDashboard();
          }, 1000);
        },
        error: (error) => {
          console.error('❌ Error en login:', error);
          this.handleLoginError(error);
        }
      });
  }
  
  private handleLoginError(error: any): void {
    if (error.message) {
      this.errorMessage = error.message;
    } else if (error.status === 401) {
      this.errorMessage = 'Email o contraseña incorrectos';
    } else if (error.status === 423) {
      this.errorMessage = 'Usuario bloqueado temporalmente. Intenta en 30 minutos.';
    } else if (error.status === 0) {
      this.errorMessage = 'No se puede conectar con el servidor. Verifica que esté ejecutándose.';
    } else {
      this.errorMessage = 'Error inesperado. Intenta nuevamente.';
    }
  }
  
  // ==================
  // MÉTODOS DE UI
  // ==================
  
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
  
  fillTestCredentials(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
    this.successMessage = 'Credenciales de prueba cargadas. Haz clic en "Iniciar Sesión"';
    this.errorMessage = '';
  }
  
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
  
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
  
  // ==================
  // GETTERS PARA TEMPLATE
  // ==================
  
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  
  get isEmailInvalid() {
    return this.email?.invalid && this.email?.touched;
  }
  
  get isPasswordInvalid() {
    return this.password?.invalid && this.password?.touched;
  }
  
  get canSubmit() {
    return this.loginForm.valid && !this.isLoading;
  }
  
  // ==================
  // NAVEGACIÓN
  // ==================
  
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
  
  goToHome(): void {
    this.router.navigate(['/']);
  }
}