// ====================================
// src/app/components/layout/header/header.component.ts
// ====================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../interfaces/auth.interface';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <mat-toolbar color="primary" class="app-header">
      <!-- Logo y título -->
      <div class="header-brand" (click)="goHome()">
        <mat-icon class="brand-icon">casino</mat-icon>
        <span class="brand-text">Rifas Solidarias</span>
      </div>

      <!-- Spacer -->
      <span class="spacer"></span>

      <!-- Navigation menu (desktop) -->
      <nav class="nav-menu" *ngIf="!isMobile">
        <a mat-button routerLink="/rifas" routerLinkActive="active">
          <mat-icon>list</mat-icon>
          Rifas
        </a>
        
        <a mat-button routerLink="/mis-compras" routerLinkActive="active" *ngIf="currentUser">
          <mat-icon>shopping_cart</mat-icon>
          Mis Compras
        </a>
        
        <a mat-button routerLink="/crear-rifa" routerLinkActive="active" 
           *ngIf="currentUser && canCreateRifas">
          <mat-icon>add_circle</mat-icon>
          Crear Rifa
        </a>
      </nav>

      <!-- Usuario autenticado -->
      <div class="user-section" *ngIf="currentUser; else loginSection">
        <!-- Notificaciones -->
        <button mat-icon-button [matMenuTriggerFor]="notificationsMenu">
          <mat-icon matBadge="3" matBadgeColor="warn" matBadgeSize="small">notifications</mat-icon>
        </button>
        
        <!-- Menu de usuario -->
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
          <div class="user-info">
            <span class="user-name">{{ currentUser.nombre }}</span>
            <span class="user-role">{{ getRoleDisplayName(currentUser.rol) }}</span>
          </div>
          <mat-icon>account_circle</mat-icon>
        </button>
      </div>

      <!-- Usuario no autenticado -->
      <ng-template #loginSection>
        <div class="auth-buttons">
          <button mat-button routerLink="/login">
            <mat-icon>login</mat-icon>
            Iniciar Sesión
          </button>
          <button mat-raised-button color="accent" routerLink="/register">
            <mat-icon>person_add</mat-icon>
            Registrarse
          </button>
        </div>
      </ng-template>

      <!-- Mobile menu button -->
      <button mat-icon-button class="mobile-menu-button" *ngIf="isMobile" (click)="toggleMobileMenu()">
        <mat-icon>menu</mat-icon>
      </button>
    </mat-toolbar>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu" class="user-menu">
      <div class="menu-user-info">
        <div class="menu-user-name">{{ currentUser?.nombre }}</div>
        <div class="menu-user-email">{{ currentUser?.email }}</div>
        <div class="menu-user-institution" *ngIf="currentUser?.institucion_nombre">
          {{ currentUser.institucion_nombre }}
        </div>
      </div>
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item routerLink="/dashboard">
        <mat-icon>dashboard</mat-icon>
        Dashboard
      </button>
      
      <button mat-menu-item routerLink="/perfil">
        <mat-icon>person</mat-icon>
        Mi Perfil
      </button>
      
      <button mat-menu-item routerLink="/configuracion">
        <mat-icon>settings</mat-icon>
        Configuración
      </button>
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item (click)="logout()" class="logout-button">
        <mat-icon>logout</mat-icon>
        Cerrar Sesión
      </button>
    </mat-menu>

    <!-- Notifications Menu -->
    <mat-menu #notificationsMenu="matMenu" class="notifications-menu">
      <div class="menu-header">Notificaciones</div>
      
      <button mat-menu-item class="notification-item">
        <mat-icon>info</mat-icon>
        <div class="notification-content">
          <div class="notification-title">Nueva rifa disponible</div>
          <div class="notification-time">Hace 2 horas</div>
        </div>
      </button>
      
      <button mat-menu-item class="notification-item">
        <mat-icon>celebration</mat-icon>
        <div class="notification-content">
          <div class="notification-title">¡Ganaste un premio!</div>
          <div class="notification-time">Hace 1 día</div>
        </div>
      </button>
      
      <mat-divider></mat-divider>
      
      <button mat-menu-item class="view-all-button">
        Ver todas las notificaciones
      </button>
    </mat-menu>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-brand {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .header-brand:hover {
      opacity: 0.8;
    }

    .brand-icon {
      font-size: 1.5rem;
      margin-right: 0.5rem;
    }

    .brand-text {
      font-size: 1.2rem;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .nav-menu {
      display: flex;
      gap: 1rem;
      margin-right: 1rem;
    }

    .nav-menu a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-menu a.active {
      background-color: rgba(255,255,255,0.1);
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: right;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 500;
      line-height: 1.2;
    }

    .user-role {
      font-size: 0.75rem;
      opacity: 0.8;
      line-height: 1;
    }

    .auth-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .auth-buttons button {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .mobile-menu-button {
      display: none;
    }

    /* Menu Styles */
    ::ng-deep .user-menu {
      min-width: 250px;
    }

    .menu-user-info {
      padding: 1rem;
      background-color: #f5f5f5;
    }

    .menu-user-name {
      font-weight: 500;
      font-size: 1rem;
    }

    .menu-user-email {
      font-size: 0.85rem;
      color: #666;
      margin-top: 0.25rem;
    }

    .menu-user-institution {
      font-size: 0.8rem;
      color: #888;
      margin-top: 0.25rem;
      font-style: italic;
    }

    .logout-button {
      color: #f44336;
    }

    .notifications-menu {
      min-width: 300px;
      max-height: 400px;
      overflow-y: auto;
    }

    .menu-header {
      padding: 1rem;
      font-weight: 500;
      background-color: #f5f5f5;
      border-bottom: 1px solid #ddd;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
      border-bottom: 1px solid #eee;
      white-space: normal;
      height: auto;
      line-height: 1.4;
    }

    .notification-item mat-icon {
      margin-right: 0.75rem;
      margin-top: 0.25rem;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .notification-time {
      font-size: 0.75rem;
      color: #666;
    }

    .view-all-button {
      text-align: center;
      color: #1976d2;
      font-weight: 500;
    }

    /* Mobile Styles */
    @media (max-width: 768px) {
      .nav-menu {
        display: none;
      }

      .mobile-menu-button {
        display: block;
      }

      .user-info {
        display: none;
      }

      .auth-buttons {
        gap: 0.25rem;
      }

      .auth-buttons button span {
        display: none;
      }

      .brand-text {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .header-brand .brand-text {
        display: none;
      }
      
      .user-button .user-info {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  
  currentUser: Usuario | null = null;
  isMobile = false;
  canCreateRifas = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado del usuario
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.canCreateRifas = user ? this.authService.hasAnyRole(['admin_global', 'admin_institucion']) : false;
    });

    // Detectar viewport móvil
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth < 768;
  }

  goHome(): void {
    this.router.navigate(['/rifas']);
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    // Implementar toggle del menú móvil
    console.log('Toggle mobile menu');
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'admin_global': 'Administrador Global',
      'admin_institucion': 'Admin Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Comprador'
    };
    return roleNames[role] || role;
  }
}