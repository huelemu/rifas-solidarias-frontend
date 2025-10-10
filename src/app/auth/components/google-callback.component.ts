// src/app/auth/components/google-callback.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-card">
        @if (isProcessing) {
          <div class="processing">
            <div class="spinner"></div>
            <h2>Conectando con Google...</h2>
            <p>Por favor espera mientras procesamos tu autenticación.</p>
          </div>
        } @else if (hasError) {
          <div class="error">
            <div class="error-icon">❌</div>
            <h2>Error de Autenticación</h2>
            <p>{{ errorMessage }}</p>
            <button (click)="goToLogin()" class="retry-btn">
              Volver al Login
            </button>
          </div>
        } @else {
          <div class="success">
            <div class="success-icon">✅</div>
            <h2>¡Autenticación Exitosa!</h2>
            <p>Redirigiendo...</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .callback-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 3rem;
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    .processing, .error, .success {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-icon, .success-icon {
      font-size: 3rem;
    }

    h2 {
      color: #333;
      margin: 0;
      font-size: 1.5rem;
    }

    p {
      color: #666;
      margin: 0;
      line-height: 1.5;
    }

    .retry-btn {
      padding: 0.75rem 2rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 1rem;
    }

    .retry-btn:hover {
      background: #5a6fd8;
      transform: translateY(-2px);
    }
  `]
})
export class GoogleCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  isProcessing = true;
  hasError = false;
  errorMessage = '';

  ngOnInit(): void {
    this.processCallback();
  }

  private async processCallback(): Promise<void> {
  try {
    const params = await this.route.queryParams.pipe(take(1)).toPromise();
    
    if (!params) {
      this.handleError('No se recibieron parámetros de autenticación.');
      return;
    }

    const access_token = params['access_token'] as string | undefined;
    const refresh_token = params['refresh_token'] as string | undefined;
    const returnUrl = params['returnUrl'] as string | undefined; // ✅ NUEVO
    const error = params['error'] as string | undefined;

    if (error) {
      this.handleError(this.getErrorMessage(error));
      return;
    }

    if (access_token && refresh_token) {
      console.log('✅ OAuth callback exitoso, procesando tokens...');
      console.log('📍 returnUrl recibido:', returnUrl); // ✅ NUEVO
      
      // Procesar tokens
      this.authService.processGoogleCallback({
        access_token,
        refresh_token
      });

      // Esperar a que se complete el proceso
      await this.waitForCompleteAuthState();

      this.isProcessing = false;
      
      // ✅ USAR returnUrl DE LOS QUERY PARAMS (no de sessionStorage)
      if (returnUrl) {
        console.log('🎯 Redirigiendo a returnUrl:', returnUrl);
        this.router.navigateByUrl(decodeURIComponent(returnUrl));
      } else {
        console.log('ℹ️ No hay returnUrl, redirigiendo a dashboard');
        this.router.navigate(['/dashboard']);
      }

    } else {
      this.handleError('No se recibieron tokens de autenticación.');
    }
  } catch (error) {
    console.error('❌ Error procesando callback OAuth:', error);
    this.handleError('Error procesando la autenticación.');
  }
}

  /**
   * ✅ ESPERAR A QUE SE COMPLETE TODO EL PROCESO DE AUTENTICACIÓN
   */
  private async waitForCompleteAuthState(): Promise<void> {
    return new Promise((resolve) => {
      const checkAuth = () => {
        const isAuthenticated = this.authService.isAuthenticated();
        const currentUser = this.authService.currentUser();
        
        if (isAuthenticated && currentUser) {
          console.log('✅ Estado de autenticación completo confirmado');
          resolve();
        } else if (isAuthenticated && !currentUser) {
          console.log('⏳ Esperando información del usuario...');
          setTimeout(checkAuth, 100);
        } else {
          console.log('⏳ Esperando estado de autenticación...');
          setTimeout(checkAuth, 100);
        }
      };
      
      setTimeout(checkAuth, 50);
    });
  }

  private handleError(message: string): void {
    this.isProcessing = false;
    this.hasError = true;
    this.errorMessage = message;
  }

  private getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'oauth_denied': 'Has cancelado la autenticación con Google.',
      'no_code': 'No se recibió código de autorización de Google.',
      'token_error': 'Error al obtener tokens de Google.',
      'user_info_error': 'Error al obtener información del usuario.',
      'user_inactive': 'Tu cuenta está inactiva.',
      'server_error': 'Error interno del servidor.'
    };

    return errorMessages[error] || 'Error desconocido en la autenticación.';
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}