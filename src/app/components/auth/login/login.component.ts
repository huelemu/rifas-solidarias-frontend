// src/app/components/auth/login/login.component.ts - VERSIÓN CORREGIDA
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.authService.redirectToDashboard();
    }
  }

 onSubmit(): void {
  console.log('🚀 onSubmit() ejecutado!');
  console.log('📝 Form value:', this.loginForm.value);
  console.log('✅ Form valid:', this.loginForm.valid);
  console.log('⏳ Loading state:', this.isLoading);

  if (this.loginForm.valid && !this.isLoading) {
    console.log('✅ Condiciones cumplidas, iniciando login...');
    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    console.log('📡 Enviando credenciales:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('📥 Respuesta recibida:', response);
        if (response.status) {
          console.log('✅ Login exitoso');
          console.log('🔄 Llamando redirectToDashboard...');
          this.authService.redirectToDashboard();
          console.log('✅ redirectToDashboard llamado');
        } else {
          console.log('❌ Login fallido:', response.message);
          this.errorMessage = response.message || 'Error en el login';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.errorMessage = error || 'Error de conexión. Intenta nuevamente.';
        this.isLoading = false;
      }
    });
  } else {
    console.log('❌ Condiciones NO cumplidas:');
    console.log('   - Form valid:', this.loginForm.valid);
    console.log('   - Loading:', this.isLoading);
    this.markFormGroupTouched();
  }
}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  // Getters para facilitar el acceso a los campos del formulario
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}