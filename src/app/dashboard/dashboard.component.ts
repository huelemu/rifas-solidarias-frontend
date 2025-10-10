// src/app/dashboard/dashboard.component.ts

import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { StatsService, DashboardStats, RifaResumen } from '../shared/services/stats.service';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly statsService = inject(StatsService);
  private readonly notificationService = inject(NotificationService);

  // Signals
  readonly stats = signal<DashboardStats | null>(null);
  readonly misRifas = signal<RifaResumen[]>([]);
  readonly topRifas = signal<RifaResumen[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  // Computed
  readonly isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'admin_global' || role === 'admin_institucion';
  });

  readonly userName = computed(() => {
    return this.authService.currentUser()?.name || 'Usuario';
  });

  readonly userRole = computed(() => {
    const role = this.authService.currentUser()?.role;
    const labels: { [key: string]: string } = {
      'admin_global': 'Administrador Global',
      'admin_institucion': 'Administrador de Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Comprador'
    };
    return labels[role || ''] || 'Usuario';
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Cargar datos del dashboard
   */
  private loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    // Cargar estadísticas
    this.statsService.getDashboardStats().subscribe({
      next: (response) => {
        this.stats.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this.error.set('No se pudieron cargar las estadísticas');
        this.loading.set(false);
        
        // Mostrar notificación de error
        this.notificationService.error(
          'No se pudieron cargar las estadísticas del dashboard',
          'Error al cargar'
        );
      }
    });

    // Cargar mis rifas activas
    this.statsService.getMisRifasActivas().subscribe({
      next: (response) => {
        this.misRifas.set(response.data || []);
      },
      error: (err) => {
        console.error('Error cargando mis rifas:', err);
      }
    });

    // Si es admin, cargar top rifas
    if (this.isAdmin()) {
      this.statsService.getTopRifas(5).subscribe({
        next: (response) => {
          this.topRifas.set(response.data || []);
        },
        error: (err) => {
          console.error('Error cargando top rifas:', err);
        }
      });
    }
  }

  /**
   * Refrescar dashboard
   */
  refreshDashboard(): void {
    this.notificationService.info('Actualizando dashboard...', 'Actualización');
    this.loadDashboardData();
  }

  /**
   * Formatear precio
   */
  formatPrice(value: number | undefined): string {
    if (!value) return '$0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Navegación
   */
  goToRifas(): void {
    this.router.navigate(['/rifas']);
  }

  goToCreateRifa(): void {
    this.router.navigate(['/rifas/crear']);
  }

  goToMisNumeros(): void {
    this.router.navigate(['/mis-numeros']);
  }

  goToUsuarios(): void {
    this.router.navigate(['/usuarios']);
  }

  goToInstituciones(): void {
    this.router.navigate(['/instituciones']);
  }

  verRifa(rifaId: number): void {
    this.router.navigate(['/rifas', rifaId]);
  }
}