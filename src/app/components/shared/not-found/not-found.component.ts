// ====================================
// src/app/components/shared/not-found/not-found.component.ts
// ====================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <mat-icon class="error-icon">search_off</mat-icon>
        <h1>Página No Encontrada</h1>
        <p>La página que buscas no existe o ha sido movida.</p>

        <div class="actions">
          <button mat-raised-button color="primary" (click)="goHome()">
            <mat-icon>home</mat-icon>
            Ir al Inicio
          </button>
          
          <button mat-stroked-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Volver
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .not-found-content {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    .error-code {
      font-size: 5rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 1rem;
      line-height: 1;
    }

    .error-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #a0aec0;
      margin-bottom: 1rem;
    }

    h1 {
      color: #2d3748;
      margin-bottom: 1rem;
      font-size: 1.8rem;
    }

    p {
      color: #4a5568;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .actions button {
      min-width: 120px;
    }

    @media (max-width: 600px) {
      .not-found-content {
        padding: 2rem;
        margin: 1rem;
      }

      .error-code {
        font-size: 4rem;
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
export class NotFoundComponent {

  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/rifas']);
  }

  goBack(): void {
    window.history.back();
  }
}