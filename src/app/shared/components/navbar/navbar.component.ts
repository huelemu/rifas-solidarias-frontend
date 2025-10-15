// src/app/shared/components/navbar/navbar.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationCenterComponent],
  template: `
    <div class="navbar">
      <div class="navbar-content">
        <div class="navbar-left">
          <!-- Logo clickeable que va al home correcto -->
          <a (click)="goToHome()" class="navbar-brand" style="cursor: pointer;">
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
                    <!-- ✅ NUEVO LINK -->
            <a routerLink="/mis-numeros" routerLinkActive="active">
            🎫 Mis Números
            </a>
          </nav>
        </div>
        
        <div class="navbar-right">
          <!-- Centro de Notificaciones -->
          <app-notification-center/>
          
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

  /**
   * Navega al home correcto según si está autenticado o no
   */
  goToHome(): void {
    const isAuth = this.authService.currentUser() !== null;
    if (isAuth) {
      this.router.navigate(['/dashboard']); // Dashboard privado
    } else {
      this.router.navigate(['/']); // Dashboard público
    }
  }

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