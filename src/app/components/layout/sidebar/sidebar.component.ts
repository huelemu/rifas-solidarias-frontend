// ====================================
// src/app/components/layout/sidebar/sidebar.component.ts
// ====================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../interfaces/auth.interface';

interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  roles?: string[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule
  ],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>{{ getWelcomeMessage() }}</h3>
        <p class="user-role" *ngIf="currentUser">{{ getRoleDisplayName(currentUser.rol) }}</p>
      </div>

      <mat-divider></mat-divider>

      <mat-nav-list class="sidebar-nav">
        <!-- Menu items -->
        <ng-container *ngFor="let item of getFilteredMenuItems()">
          
          <!-- Item with children -->
          <mat-expansion-panel *ngIf="item.children" class="menu-expansion">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>{{ item.icon }}</mat-icon>
                <span>{{ item.title }}</span>
              </mat-panel-title>
            </mat-expansion-panel-header>
            
            <mat-nav-list>
              <a mat-list-item 
                 *ngFor="let child of getFilteredMenuItems(item.children)"
                 [routerLink]="child.route"
                 routerLinkActive="active">
                <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                <span matListItemTitle>{{ child.title }}</span>
              </a>
            </mat-nav-list>
          </mat-expansion-panel>

          <!-- Single item -->
          <a mat-list-item 
             *ngIf="!item.children && item.route"
             [routerLink]="item.route"
             routerLinkActive="active">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.title }}</span>
          </a>

        </ng-container>
      </mat-nav-list>

      <!-- Sidebar footer -->
      <div class="sidebar-footer">
        <mat-divider></mat-divider>
        <div class="footer-info">
          <p class="app-version">v1.0.0</p>
          <p class="environment-info" *ngIf="showEnvironmentInfo">
            {{ isLocalhost ? 'Desarrollo' : 'Producción' }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      height: 100vh;
      background: white;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      width: 250px;
      position: fixed;
      left: 0;
      top: 64px;
      z-index: 999;
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 1.5rem 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .sidebar-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .user-role {
      margin: 0;
      font-size: 0.85rem;
      opacity: 0.9;
    }

    .sidebar-nav {
      flex: 1;
      padding: 0.5rem 0;
    }

    .sidebar-nav a {
      margin: 0.25rem 0.5rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .sidebar-nav a:hover {
      background-color: #f5f5f5;
    }

    .sidebar-nav a.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .sidebar-nav a.active mat-icon {
      color: #1976d2;
    }

    .menu-expansion {
      margin: 0.25rem 0.5rem;
      box-shadow: none;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .menu-expansion .mat-expansion-panel-header {
      padding: 0 1rem;
      height: 48px;
    }

    .menu-expansion mat-panel-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sidebar-footer {
      margin-top: auto;
      padding: 1rem;
    }

    .footer-info {
      text-align: center;
      margin-top: 0.5rem;
    }

    .app-version {
      font-size: 0.75rem;
      color: #666;
      margin: 0.25rem 0;
    }

    .environment-info {
      font-size: 0.7rem;
      color: #999;
      margin: 0;
      font-style: italic;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .sidebar.open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  
  currentUser: Usuario | null = null;
  isLocalhost = false;
  showEnvironmentInfo = false;

  private menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      title: 'Rifas',
      icon: 'casino',
      children: [
        { title: 'Ver Rifas', icon: 'list', route: '/rifas' },
        { title: 'Mis Rifas', icon: 'folder', route: '/mis-rifas' },
        { title: 'Crear Rifa', icon: 'add_circle', route: '/crear-rifa', roles: ['admin_global', 'admin_institucion'] }
      ]
    },
    {
      title: 'Compras',
      icon: 'shopping_cart',
      children: [
        { title: 'Mis Compras', icon: 'receipt', route: '/mis-compras' },
        { title: 'Historial', icon: 'history', route: '/historial-compras' }
      ]
    },
    {
      title: 'Administración',
      icon: 'admin_panel_settings',
      roles: ['admin_global', 'admin_institucion'],
      children: [
        { title: 'Usuarios', icon: 'people', route: '/admin/usuarios', roles: ['admin_global', 'admin_institucion'] },
        { title: 'Instituciones', icon: 'business', route: '/admin/instituciones', roles: ['admin_global'] },
        { title: 'Reportes', icon: 'analytics', route: '/admin/reportes', roles: ['admin_global', 'admin_institucion'] },
        { title: 'Configuración', icon: 'settings', route: '/admin/configuracion', roles: ['admin_global'] }
      ]
    },
    {
      title: 'Perfil',
      icon: 'person',
      route: '/perfil'
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });

    // Detectar entorno
    this.isLocalhost = window.location.hostname === 'localhost';
    this.showEnvironmentInfo = !window.location.hostname.includes('huelemu.com.ar');
  }

  getWelcomeMessage(): string {
    if (!this.currentUser) return 'Bienvenido';
    
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
      greeting = 'Buenos días';
    } else if (hour < 18) {
      greeting = 'Buenas tardes';
    } else {
      greeting = 'Buenas noches';
    }
    
    const firstName = this.currentUser.nombre.split(' ')[0];
    return `${greeting}, ${firstName}`;
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

  getFilteredMenuItems(items: MenuItem[] = this.menuItems): MenuItem[] {
    if (!this.currentUser) return [];

    return items.filter(item => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.includes(this.currentUser!.rol);
    });
  }
}