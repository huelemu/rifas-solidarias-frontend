// src/app/components/dashboard/dashboard.component.ts - VERSIÓN FINAL CORREGIDA
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

  // Helper para verificar si currentUser existe
  get user(): User | null {
    return this.currentUser;
  }

  // Helper seguro para obtener el rol
  get userRole(): string {
    return this.currentUser?.rol || '';
  }

  getRoleDisplayName(role?: string): string {
    if (!role) return '';
    
    const roleNames: { [key: string]: string } = {
      'admin_global': 'Administrador Global',
      'admin_institucion': 'Administrador de Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Comprador'
    };
    return roleNames[role] || role;
  }

  getRoleIcon(role?: string): string {
    if (!role) return '👤';
    
    const roleIcons: { [key: string]: string } = {
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

  // Helpers para el template - ESTAS SON LAS CLAVES
  isAdminGlobal(): boolean {
    return this.currentUser?.rol === 'admin_global';
  }

  isAdminInstitucion(): boolean {
    return this.currentUser?.rol === 'admin_institucion';
  }

  isVendedor(): boolean {
    return this.currentUser?.rol === 'vendedor';
  }

  isComprador(): boolean {
    return this.currentUser?.rol === 'comprador';
  }

  // Helper para obtener nombre completo
  getFullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.nombre || ''} ${this.currentUser.apellido || ''}`.trim();
  }

  // Helper para obtener iniciales
  getInitials(): string {
    if (!this.currentUser) return '';
    const nombre = this.currentUser.nombre || '';
    const apellido = this.currentUser.apellido || '';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }
}