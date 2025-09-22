// ===================================================================
// 📊 ANGULAR DASHBOARD COMPONENT - IMPLEMENTACIÓN COMPLETA
// src/app/components/dashboard/dashboard.component.ts
// ===================================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, UserRole, User, UserRoleType } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route?: string;
  action?: () => void;
  color: string;
}

interface DashboardStats {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  currentUser: User | null = null;
  isLoading = false;
  quickActions: QuickAction[] = [];
  dashboardStats: DashboardStats[] = [];
  recentActivity: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          console.log('👤 Usuario cargado en dashboard:', user.email, 'Rol:', user.rol);
          this.setupDashboardByRole(user.rol);
        }
      });
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.loadRecentActivity();
      this.isLoading = false;
    }, 1000);
  }

  private loadRecentActivity(): void {
    this.recentActivity = [
      { id: 1, type: 'login', description: 'Inicio de sesión exitoso', timestamp: new Date(Date.now() - 30*60*1000), icon: '🔐' },
      { id: 2, type: 'info', description: 'Dashboard cargado correctamente', timestamp: new Date(), icon: '📊' }
    ];
  }

  private setupDashboardByRole(role: string): void {
    switch (role) {
      case UserRole.ADMIN_GLOBAL: this.setupAdminGlobalDashboard(); break;
      case UserRole.ADMIN_INSTITUCION: this.setupAdminInstitucionDashboard(); break;
      case UserRole.VENDEDOR: this.setupVendedorDashboard(); break;
      case UserRole.COMPRADOR: this.setupCompradorDashboard(); break;
      default: this.setupDefaultDashboard();
    }
  }

  private setupAdminGlobalDashboard(): void {
    this.quickActions = [
      { title: 'Gestionar Instituciones', description: 'Crear, editar y administrar instituciones', icon: '🏢', route: '/admin/instituciones', color: 'blue' },
      { title: 'Gestionar Usuarios', description: 'Administrar usuarios del sistema', icon: '👥', route: '/admin/usuarios', color: 'green' },
      { title: 'Ver Todas las Rifas', description: 'Supervisar todas las rifas activas', icon: '🎯', route: '/admin/rifas', color: 'purple' },
      { title: 'Reportes Globales', description: 'Estadísticas y reportes del sistema', icon: '📊', route: '/admin/reportes', color: 'orange' }
    ];

    this.dashboardStats = [
      { label: 'Total Instituciones', value: 15, icon: '🏢', color: 'blue' },
      { label: 'Total Usuarios', value: 247, icon: '👥', color: 'green' },
      { label: 'Rifas Activas', value: 8, icon: '🎯', color: 'purple' },
      { label: 'Ventas del Mes', value: '$45,230', icon: '💰', color: 'orange' }
    ];
  }

  private setupAdminInstitucionDashboard(): void {
    this.quickActions = [
      { title: 'Crear Nueva Rifa', description: 'Configurar una nueva rifa para tu institución', icon: '🎯', route: '/rifas/crear', color: 'blue' },
      { title: 'Gestionar Rifas', description: 'Ver y administrar rifas de tu institución', icon: '📋', route: '/rifas/gestionar', color: 'green' },
      { title: 'Gestionar Vendedores', description: 'Administrar vendedores de tu institución', icon: '👨‍💼', route: '/vendedores', color: 'purple' },
      { title: 'Reportes', description: 'Estadísticas de tu institución', icon: '📊', route: '/reportes', color: 'orange' }
    ];

    this.dashboardStats = [
      { label: 'Rifas Activas', value: 3, icon: '🎯', color: 'blue' },
      { label: 'Vendedores', value: 12, icon: '👨‍💼', color: 'green' },
      { label: 'Números Vendidos', value: 1450, icon: '🎫', color: 'purple' },
      { label: 'Ingresos del Mes', value: '$12,850', icon: '💰', color: 'orange' }
    ];
  }

  private setupVendedorDashboard(): void {
    this.quickActions = [
      { title: 'Vender Números', description: 'Vender números de las rifas disponibles', icon: '🎫', route: '/vender', color: 'blue' },
      { title: 'Mis Ventas', description: 'Ver historial de ventas realizadas', icon: '📈', route: '/mis-ventas', color: 'green' },
      { title: 'Rifas Disponibles', description: 'Ver rifas disponibles para venta', icon: '🎯', route: '/rifas', color: 'purple' },
      { title: 'Mi Comisión', description: 'Ver comisiones ganadas', icon: '💰', route: '/comisiones', color: 'orange' }
    ];

    this.dashboardStats = [
      { label: 'Números Vendidos Hoy', value: 23, icon: '🎫', color: 'blue' },
      { label: 'Ventas del Mes', value: 145, icon: '📈', color: 'green' },
      { label: 'Comisión del Mes', value: '$850', icon: '💰', color: 'purple' },
      { label: 'Rifas Disponibles', value: 5, icon: '🎯', color: 'orange' }
    ];
  }

  private setupCompradorDashboard(): void {
    this.quickActions = [
      { title: 'Comprar Números', description: 'Explorar y comprar números de rifas', icon: '🛒', route: '/rifas', color: 'blue' },
      { title: 'Mis Números', description: 'Ver números que has comprado', icon: '🎫', route: '/mis-numeros', color: 'green' },
      { title: 'Resultados', description: 'Ver resultados de sorteos', icon: '🏆', route: '/resultados', color: 'purple' },
      { title: 'Mi Perfil', description: 'Actualizar información personal', icon: '👤', route: '/perfil', color: 'orange' }
    ];

    this.dashboardStats = [
      { label: 'Números Comprados', value: 12, icon: '🎫', color: 'blue' },
      { label: 'Rifas Participando', value: 3, icon: '🎯', color: 'green' },
      { label: 'Premios Ganados', value: 0, icon: '🏆', color: 'purple' },
      { label: 'Total Invertido', value: '$240', icon: '💰', color: 'orange' }
    ];
  }

  private setupDefaultDashboard(): void {
    this.quickActions = [
      { title: 'Ver Rifas', description: 'Explorar rifas disponibles', icon: '🎯', route: '/rifas', color: 'blue' },
      { title: 'Mi Perfil', description: 'Actualizar información personal', icon: '👤', route: '/perfil', color: 'green' }
    ];

    this.dashboardStats = [
      { label: 'Rifas Disponibles', value: 8, icon: '🎯', color: 'blue' },
      { label: 'Usuarios Registrados', value: 247, icon: '👥', color: 'green' }
    ];
  }

  navigateToAction(action: QuickAction): void {
    if (action.route) this.router.navigate([action.route]);
    else if (action.action) action.action();
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      [UserRole.ADMIN_GLOBAL]: 'Administrador Global',
      [UserRole.ADMIN_INSTITUCION]: 'Administrador de Institución',
      [UserRole.VENDEDOR]: 'Vendedor',
      [UserRole.COMPRADOR]: 'Comprador'
    };
    return roleNames[role] || role;
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} horas`;
    return `Hace ${Math.floor(diffMins / 1440)} días`;
  }

  logout(): void {
    // 🚪 Logout directo sin Observable
    this.authService.logout();
    console.log('👋 Sesión cerrada desde dashboard');
  }
}
