// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      console.log('❌ No hay usuario autenticado');
      this.router.navigate(['/login']);
      return;
    }

    console.log('✅ Usuario cargado:', this.currentUser);
    this.loading = false;
  }

  getRoleDisplayName(role: string): string {
    const roleNames = {
      'admin_global': 'Administrador Global',
      'admin_institucion': 'Administrador de Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Comprador'
    };
    return roleNames[role] || role;
  }

  getRoleIcon(role: string): string {
    const roleIcons = {
      'admin_global': '👑',
      'admin_institucion': '🏢',
      'vendedor': '💼',
      'comprador': '🛒'
    };
    return roleIcons[role] || '👤';
  }

  // Métodos de navegación específicos por rol
  navigateToInstituciones(): void {
    this.router.navigate(['/instituciones']);
  }

  navigateToUsuarios(): void {
    this.router.navigate(['/usuarios']);
  }

  navigateToRifas(): void {
    this.router.navigate(['/rifas']);
  }

  navigateToVentas(): void {
    this.router.navigate(['/ventas']);
  }

  navigateToCompras(): void {
    this.router.navigate(['/compras']);
  }

  navigateToReportes(): void {
    this.router.navigate(['/reportes']);
  }

  // Verificaciones de permisos
  canManageInstituciones(): boolean {
    return this.authService.hasAnyRole(['admin_global', 'admin_institucion']);
  }

  canManageUsuarios(): boolean {
    return this.authService.hasAnyRole(['admin_global', 'admin_institucion']);
  }

  canCreateRifas(): boolean {
    return this.authService.hasAnyRole(['admin_global', 'admin_institucion']);
  }

  canSellNumbers(): boolean {
    return this.authService.hasAnyRole(['admin_global', 'admin_institucion', 'vendedor']);
  }

  canViewReports(): boolean {
    return this.authService.hasAnyRole(['admin_global', 'admin_institucion']);
  }
}