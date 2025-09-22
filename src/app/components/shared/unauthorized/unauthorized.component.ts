// ====================================
// src/app/components/shared/unauthorized/unauthorized.component.ts
// ====================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <mat-icon class="error-icon">block</mat-icon>
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
        
        <div class="user-info" *ngIf="currentUser">
          <p><strong>Usuario:</strong> {{ currentUser.nombre }}</p>
          <p><strong>Rol:</strong> {{ currentUser.rol }}</p>
          <p><strong>Institución:</strong> {{ currentUser.institucion_nombre || 'N/A' }}</p>
        </div>

        <div class="actions">
          <button mat-raised-button color="primary" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Volver
          </button>
          
          <button mat-raised-button (click)="goHome()">
            <mat-icon>home</mat-icon>
            Ir al Inicio
          </button>
          
          <button mat-stroked-button (click)="logout()">
            <mat-icon>logout</mat-icon>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .unauthorized-content {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    .error-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #f56565;
      margin-bottom: 1rem;
    }

    h1 {
      color: #2d3748;
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    p {
      color: #4a5568;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .user-info {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      margin: 1.5rem 0;
      text-align: left;
    }

    .user-info p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 2rem;
    }

    .actions button {
      min-width: 120px;
    }

    @media (max-width: 600px) {
      .unauthorized-content {
        padding: 2rem;
        margin: 1rem;
      }

      .actions {
        flex-direction: column;
        align-items: center;
      }

      .actions button {
        width: 100%;
        max-width: 200px;
      }
    }
  `]
})
export class UnauthorizedComponent {
  
  currentUser = this.authService.currentUser;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    if (this.currentUser) {
      this.authService.redirectAfterLogin();
    } else {
      this.router.navigate(['/rifas']);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}