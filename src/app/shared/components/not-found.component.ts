// src/app/shared/components/not-found.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-card">
        <div class="icon">
          🔍
        </div>
        <h1>404</h1>
        <h2>Página No Encontrada</h2>
        <p>La página que buscas no existe o ha sido movida.</p>
        <p class="sub-text">Verifica la URL o utiliza el menú de navegación.</p>
        
        <div class="actions">
          <button (click)="goToDashboard()" class="primary-button">
            🏠 Ir al Dashboard
          </button>
          <button (click)="goBack()" class="secondary-button">
            ← Volver Atrás
          </button>
        </div>
        
        <!-- Enlaces útiles -->
        <div class="useful-links">
          <h3>Enlaces Útiles:</h3>
          <div class="links-grid">
            <a (click)="goToDashboard()" class="link-item">
              🎯 Dashboard Principal
            </a>
            <a (click)="goToUsers()" class="link-item">
              👥 Gestión de Usuarios
            </a>
            <a (click)="goToInstitutions()" class="link-item">
              🏢 Gestión de Instituciones
            </a>
            <a (click)="goToDiagnostic()" class="link-item">
              🔧 Diagnóstico del Sistema
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .not-found-card {
      background: white;
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
    }

    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-20px);
      }
      60% {
        transform: translateY(-10px);
      }
    }

    h1 {
      color: #e74c3c;
      margin: 0;
      font-size: 4rem;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    h2 {
      color: #333;
      margin: 0.5rem 0 1rem 0;
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

    .primary-button, .secondary-button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      font-family: inherit;
    }

    .primary-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .primary-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }

    .secondary-button {
      background: #f8f9fa;
      color: #495057;
      border: 2px solid #dee2e6;
    }

    .secondary-button:hover {
      background: #e9ecef;
      border-color: #adb5bd;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .useful-links {
      border-top: 1px solid #e9ecef;
      padding-top: 2rem;
      margin-top: 1rem;
    }

    .useful-links h3 {
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .links-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .link-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1rem;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      color: #495057;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .link-item:hover {
      background: #e9ecef;
      border-color: #667eea;
      color: #667eea;
      transform: translateY(-1px);
    }

    @media (max-width: 480px) {
      .not-found-card {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }
      
      h1 {
        font-size: 3rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      .icon {
        font-size: 3rem;
      }

      .actions {
        gap: 0.75rem;
      }

      .primary-button, .secondary-button {
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
      }

      .links-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  /**
   * Navega al dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Vuelve a la página anterior
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * Navega a usuarios
   */
  goToUsers(): void {
    this.router.navigate(['/usuarios']);
  }

  /**
   * Navega a instituciones
   */
  goToInstitutions(): void {
    this.router.navigate(['/instituciones']);
  }

  /**
   * Navega a diagnóstico
   */
  goToDiagnostic(): void {
    this.router.navigate(['/diagnostico']);
  }
}