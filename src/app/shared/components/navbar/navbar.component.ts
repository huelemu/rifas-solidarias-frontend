import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="navbar">
      <div class="navbar-content">
        <div class="navbar-left">
          <a routerLink="/dashboard" class="navbar-brand">
            🎫 Rifas Solidarias
          </a>
          <nav class="navbar-nav">
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              Dashboard
            </a>
            <a routerLink="/usuarios" routerLinkActive="active" *ngIf="canManageUsers()">
              Usuarios
            </a>
            <a routerLink="/instituciones" routerLinkActive="active" *ngIf="canManageInstitutions()">
              Instituciones
            </a>
            <a routerLink="/rifas" routerLinkActive="active">
              Rifas
            </a>
          </nav>
        </div>
        
        <div class="navbar-right">
          <div class="user-info">
            <span class="user-name">{{ authService.currentUser()?.name }}</span>
            <span class="user-role">{{ getRoleLabel() }}</span>
          </div>
          <button class="btn-logout" (click)="logout()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  canManageUsers(): boolean {
    return this.authService.currentUser()?.role === 'admin_global';
  }

  canManageInstitutions(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'admin_global' || role === 'admin_institucion';
  }

  getRoleLabel(): string {
    const role = this.authService.currentUser()?.role;
    const labels: any = {
      'admin_global': 'Administrador Global',
      'admin_institucion': 'Admin Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Participante'
    };
    return labels[role || ''] || 'Usuario';
  }

  logout(): void {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}