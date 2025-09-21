import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoading = false;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'admin_global': 'Administrador Global',
      'admin_institucion': 'Administrador de Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Comprador'
    };
    return roleNames[role] || role;
  }

  getRoleIcon(role: string): string {
    const roleIcons: { [key: string]: string } = {
      'admin_global': '👑',
      'admin_institucion': '🏢',
      'vendedor': '💼',
      'comprador': '🛒'
    };
    return roleIcons[role] || '👤';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getQuickActions() {
    if (!this.currentUser) return [];

    const actions = [];

    // Acciones comunes para todos los usuarios autenticados
    actions.push(
      { icon: '🏠', label: 'Inicio', route: '/home', color: 'primary' },
      { icon: '🔧', label: 'Diagnóstico', route: '/diagnostico', color: 'info' }
    );

    // Acciones específicas por rol
    switch (this.currentUser.rol) {
      case 'admin_global':
        actions.push(
          { icon: '🏢', label: 'Instituciones', route: '/instituciones', color: 'success' },
          { icon: '👥', label: 'Usuarios', route: '/usuarios', color: 'warning' }
        );
        break;
      
      case 'admin_institucion':
        actions.push(
          { icon: '👥', label: 'Usuarios', route: '/usuarios', color: 'warning' },
          { icon: '🏢', label: 'Mi Institución', route: '/instituciones', color: 'success' }
        );
        break;
      
      case 'vendedor':
        actions.push(
          { icon: '🎲', label: 'Mis Rifas', route: '/rifas', color: 'success' },
          { icon: '📊', label: 'Ventas', route: '/ventas', color: 'info' }
        );
        break;
      
      case 'comprador':
        actions.push(
          { icon: '🎲', label: 'Rifas Disponibles', route: '/rifas', color: 'success' },
          { icon: '🛒', label: 'Mis Compras', route: '/compras', color: 'info' }
        );
        break;
    }

    return actions;
  }
}