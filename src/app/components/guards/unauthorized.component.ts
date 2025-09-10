// unauthorized.component.ts - Componente para acceso no autorizado
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <div class="unauthorized-icon">🚫</div>
        <h1>Acceso No Autorizado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
        <div class="user-info" *ngIf="currentUser">
          <p><strong>Usuario:</strong> {{ currentUser.email }}</p>
          <p><strong>Rol:</strong> {{ getRoleDisplayName(currentUser.rol) }}</p>
        </div>
        <div class="action-buttons">
          <button class="btn btn-primary" (click)="goToDashboard()">
            🏠 Ir al Dashboard
          </button>
          <button class="btn btn-secondary" (click)="logout()">
            🚪 Cerrar Sesión
          </button>
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
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      padding: 20px;
    }

    .unauthorized-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
    }

    .unauthorized-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    h1 {
      color: #333;
      margin-bottom: 15px;
      font-weight: 600;
    }

    p {
      color: #666;
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .user-info {
      background: rgba(255, 107, 107, 0.1);
      border-radius: 10px;
      padding: 15px;
      margin: 20px 0;
      border: 1px solid rgba(255, 107, 107, 0.2);
    }

    .user-info p {
      margin: 5px 0;
      color: #333;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      font-size: 1rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: #333;
      border: 2px solid #ddd;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 480px) {
      .action-buttons {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }
  `]
})
export class UnauthorizedComponent implements OnInit {
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

 getRoleDisplayName(role: string): string {
  const roleNames: { [key: string]: string } = {
    'admin_global': 'Admin Global',
    'admin_institucion': 'Admin Institución', 
    'vendedor': 'Vendedor',
    'comprador': 'Comprador'
  };
  return roleNames[role] || role;
}

  
  goToDashboard(): void {
    this.authService.redirectToDashboard();
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}