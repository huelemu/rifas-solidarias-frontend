// src/app/shared/components/unauthorized.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <div class="icon">
          ⛔
        </div>
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
        <p class="sub-text">Verifica que tengas el rol adecuado o contacta al administrador.</p>
        
        <div class="actions">
          <button (click)="goBack()" class="back-button">
            ← Volver al Dashboard
          </button>
          <button (click)="goToLogin()" class="login-button">
            🔐 Ir al Login
          </button>
        </div>
        
        <!-- Info de debug -->
        <div class="debug-info">
          <small>Si crees que esto es un error, contacta al soporte técnico.</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .unauthorized-card {
      background: white;
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      max-width: 450px;
      width: 100%;
    }

    .icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    h1 {
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    p {
      color: #666;
      margin: 0 0 0.5rem 0;
      line-height: 1.6;
    }

    .sub-text {
      font-size: 0.9rem;
      color: #888;
      margin-bottom: 2rem;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .back-button, .login-button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border: none;
      font-family: inherit;
    }

    .back-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .login-button {
      background: #f8f9fa;
      color: #495057;
      border: 2px solid #dee2e6;
    }

    .back-button:hover, .login-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .login-button:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }

    .debug-info {
      padding-top: 1.5rem;
      border-top: 1px solid #e9ecef;
    }

    .debug-info small {
      color: #6c757d;
      font-size: 0.8rem;
    }

    @media (max-width: 480px) {
      .unauthorized-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }
      
      h1 {
        font-size: 1.5rem;
      }

      .icon {
        font-size: 3rem;
      }

      .actions {
        gap: 0.75rem;
      }

      .back-button, .login-button {
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
      }
    }
  `]
})
export class UnauthorizedComponent {
  private readonly router = inject(Router);

  /**
   * Vuelve al dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Va a la página de login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}