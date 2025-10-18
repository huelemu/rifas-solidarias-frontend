// src/app/auth/components/login.component.ts
import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';
import { environment } from '../../../environments/environment.development';

interface LoginRequest {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  private returnUrl: string = '/dashboard';

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly registrationSuccess = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.registrationSuccess.set('Cuenta creada exitosamente. Ya puedes iniciar sesión.');
        const email = params['email'];
        if (email) {
          this.loginForm.patchValue({ email });
        }
      }
      if (params['passwordReset'] === 'true') {
        this.registrationSuccess.set('Contraseña restablecida exitosamente. Ya puedes iniciar sesión.');
        const email = params['email'];
        if (email) {
          this.loginForm.patchValue({ email });
        }
      }
    });
  }

  ngOnInit(): void {
    // Obtener returnUrl del queryParam o sessionStorage
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 
                     sessionStorage.getItem('returnUrl') || 
                     '/dashboard';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

 onSubmit(): void {
  if (this.loginForm.invalid) {
    this.markAllFieldsAsTouched();
    return;
  }

  this.isLoading.set(true);
  this.errorMessage.set(null);

  const credentials: LoginRequest = this.loginForm.value;

  this.authService.login(credentials).subscribe({
    next: (response) => {
      this.isLoading.set(false);
      if (response.success) {
        console.log('✅ LoginComponent: Login exitoso:', response.data.user);
        
        // ✅ TOAST DE BIENVENIDA
        this.notificationService.success(
          `Bienvenido ${response.data.user.name}`,
          'Sesión iniciada'
        );

        // ✅ OBTENER ROL DEL USUARIO
        const userRole = response.data.user.role || response.data.user.rol;
        console.log('👤 Rol del usuario:', userRole);
        
        let redirectUrl = this.returnUrl;
        console.log('📍 ReturnUrl inicial:', redirectUrl);

        // ✅ SI NO HAY RETURNURL ESPECÍFICA, REDIRIGIR SEGÚN ROL
        if (!redirectUrl || redirectUrl === '/dashboard') {
          switch (userRole) {
            case 'vendedor':
              redirectUrl = '/vendedor/mis-ventas';
              console.log('🎯 Usuario vendedor, redirigiendo a:', redirectUrl);
              break;
            case 'comprador':
              redirectUrl = '/rifas';
              console.log('🎯 Usuario comprador, redirigiendo a:', redirectUrl);
              break;
            case 'admin_global':
            case 'admin_institucion':
              redirectUrl = '/dashboard';
              console.log('🎯 Usuario admin, redirigiendo a:', redirectUrl);
              break;
            default:
              redirectUrl = '/dashboard';
              console.log('🎯 Rol desconocido, redirigiendo a dashboard:', redirectUrl);
          }
        }

        sessionStorage.removeItem('returnUrl');
        console.log('🎯 URL FINAL de redirección:', redirectUrl);
        this.router.navigateByUrl(redirectUrl);
      }
    },
    error: (error) => {
      this.isLoading.set(false);
      console.error('❌ LoginComponent: Error en login:', error);
      
      this.notificationService.error(
        error.message || 'Credenciales incorrectas',
        'Error de autenticación'
      );
      
      if (error.message && error.message.includes('Google')) {
        this.errorMessage.set('Esta cuenta fue creada con Google. Por favor, usa el botón "Continuar con Google" para iniciar sesión.');
      } else {
        this.errorMessage.set(error.message);
      }
    }
  });
}

  loginWithGoogle(): void {
  console.log('═══════════════════════════════════════');
  console.log('🔐 LOGIN CON GOOGLE - DIAGNÓSTICO');
  console.log('═══════════════════════════════════════');
  console.log('📡 API URL:', environment.apiUrl);
  console.log('📍 Return URL:', this.returnUrl);
  console.log('🌐 Window location:', window.location.href);
  
  this.errorMessage.set(null);

  this.authService.loginWithGoogle(this.returnUrl).subscribe({
    next: (response) => {
      console.log('✅ Respuesta recibida del backend:');
      console.log('   - Objeto completo:', response);
      console.log('   - authUrl:', response.authUrl);
      console.log('   - Tipo:', typeof response.authUrl);
      
      if (response.authUrl) {
        console.log('🔄 Redirigiendo a Google OAuth...');
        console.log('   URL completa:', response.authUrl);
        window.location.href = response.authUrl;
      } else {
        console.error('❌ ERROR: No se recibió authUrl');
        console.error('   Respuesta completa:', JSON.stringify(response, null, 2));
        this.errorMessage.set('Error: No se recibió URL de Google');
      }
    },
    error: (error) => {
      console.error('═══════════════════════════════════════');
      console.error('❌ ERROR EN LOGIN CON GOOGLE');
      console.error('═══════════════════════════════════════');
      console.error('Error completo:', error);
      console.error('Mensaje:', error.message);
      console.error('Status:', error.status);
      console.error('StatusText:', error.statusText);
      console.error('URL:', error.url);
      console.error('═══════════════════════════════════════');
      
      this.errorMessage.set('Error al conectar con Google. Intenta nuevamente.');
    }
  });
}

  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}