// src/app/dashboard/dashboard.component.ts - VERSIÓN MEJORADA PARA PRODUCCIÓN

import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/services/auth.service';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { NotificationService } from '../shared/services/notification.service';
import { ChartService } from '../shared/services/chart.service';
import { firstValueFrom } from 'rxjs';

// Interfaces para estadísticas
interface DashboardStats {
  rifas_activas: number;
  rifas_finalizadas: number;
  total_recaudado: number;
  numeros_vendidos: number;
  mis_numeros: number;
  proximos_sorteos: number;
}

interface QuickAction {
  icon: string;
  label: string;
  route: string;
  color: string;
  disabled?: boolean;
}

interface TopRifa {
  id: number;
  nombre: string;
  numeros_vendidos: number;
  total_recaudado: number;
  porcentaje_vendido: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <div class="dashboard-container">
      <!-- Header compacto -->
      <header class="dashboard-header">
        <div class="header-content">
          <div class="welcome-section">
            <h1>Hola, {{ authService.currentUser()?.name }}! 👋</h1>
            <p class="subtitle">{{ getRoleLabel() }} · {{ getCurrentDate() }}</p>
          </div>
          
          <!-- Estado de conexión compacto -->
          <div class="connection-badge" [class]="getConnectionClass()">
            <span class="status-dot"></span>
            <span>{{ getConnectionText() }}</span>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        
        <!-- Estadísticas principales - Grid compacto 3x2 -->
        <section class="stats-section">
          <h2 class="section-title">📊 Resumen General</h2>
          
          <div class="stats-grid">
            <!-- Rifas Activas -->
            <div class="stat-card stat-primary">
              <div class="stat-icon">🎰</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats().rifas_activas }}</div>
                <div class="stat-label">Rifas Activas</div>
              </div>
            </div>

            <!-- Rifas Finalizadas -->
            <div class="stat-card stat-success">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats().rifas_finalizadas }}</div>
                <div class="stat-label">Finalizadas</div>
              </div>
            </div>

            <!-- Total Recaudado -->
            <div class="stat-card stat-info">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <div class="stat-value">{{ formatCurrency(stats().total_recaudado) }}</div>
                <div class="stat-label">Recaudado</div>
              </div>
            </div>

            <!-- Números Vendidos -->
            <div class="stat-card stat-warning">
              <div class="stat-icon">🎫</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats().numeros_vendidos }}</div>
                <div class="stat-label">Números Vendidos</div>
              </div>
            </div>

            <!-- Mis Números -->
            <div class="stat-card stat-accent">
              <div class="stat-icon">🎁</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats().mis_numeros }}</div>
                <div class="stat-label">Mis Números</div>
              </div>
            </div>

            <!-- Próximos Sorteos -->
            <div class="stat-card stat-danger">
              <div class="stat-icon">🎲</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats().proximos_sorteos }}</div>
                <div class="stat-label">Próximos Sorteos</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Acciones Rápidas - Grid compacto -->
        <section class="actions-section">
          <h2 class="section-title">⚡ Acciones Rápidas</h2>
          
          <div class="actions-grid">
            @for (action of quickActions; track action.route) {
              <button 
                class="action-card"
                [class.disabled]="action.disabled"
                [disabled]="action.disabled"
                [style.--action-color]="action.color"
                (click)="navigateTo(action.route)">
                <span class="action-icon">{{ action.icon }}</span>
                <span class="action-label">{{ action.label }}</span>
              </button>
            }
          </div>
        </section>

        <!-- Gráfico de Actividad (Placeholder para Chart.js) -->
        <section class="chart-section">
          <h2 class="section-title">📈 Actividad Reciente</h2>
          <div class="chart-container">
            <canvas id="activityChart"></canvas>
          </div>
        </section>

      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding-bottom: 2rem;
    }

    /* Header compacto */
    .dashboard-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 1.5rem 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .welcome-section h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #2d3748;
    }

    .subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
      color: #718096;
    }

    .connection-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .connection-badge.connected {
      background: #c6f6d5;
      color: #22543d;
    }

    .connection-badge.disconnected {
      background: #fed7d7;
      color: #742a2a;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Main content */
    .dashboard-main {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Stats Grid - 3 columnas x 2 filas en desktop */
    .stats-section {
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 12px rgba(0,0,0,0.15);
    }

    .stat-icon {
      font-size: 2.5rem;
      line-height: 1;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #718096;
      font-weight: 500;
    }

    /* Colores de tarjetas */
    .stat-primary .stat-value { color: #667eea; }
    .stat-success .stat-value { color: #48bb78; }
    .stat-info .stat-value { color: #4299e1; }
    .stat-warning .stat-value { color: #ed8936; }
    .stat-accent .stat-value { color: #9f7aea; }
    .stat-danger .stat-value { color: #f56565; }

    /* Actions Grid - 4 columnas compactas */
    .actions-section {
      margin-bottom: 2rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .action-card {
      background: white;
      border: none;
      border-radius: 12px;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .action-card:hover:not(.disabled) {
      transform: translateY(-4px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
      background: var(--action-color, #667eea);
      color: white;
    }

    .action-card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-icon {
      font-size: 2rem;
      line-height: 1;
    }

    .action-label {
      font-size: 0.875rem;
      font-weight: 600;
      text-align: center;
    }

    /* Chart Section */
    .chart-section {
      margin-bottom: 2rem;
    }

    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      min-height: 300px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .actions-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard-main {
        padding: 1rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  router = inject(Router);
  notificationService = inject(NotificationService);
  chartService = inject(ChartService);
  http = inject(HttpClient);

  // Chart instance
  private activityChart: any = null;

  // Signals para datos reactivos
  stats = signal<DashboardStats>({
    rifas_activas: 0,
    rifas_finalizadas: 0,
    total_recaudado: 0,
    numeros_vendidos: 0,
    mis_numeros: 0,
    proximos_sorteos: 0
  });

  topRifas = signal<TopRifa[]>([]);

  // Computed para verificar si es admin
  isAdmin = computed(() => {
    const rol = this.authService.currentUser()?.role;
    return rol === 'admin_global' || rol === 'admin_institucion';
  });

  // Acciones rápidas según el rol
  quickActions: QuickAction[] = [];

  ngOnInit(): void {
    this.loadStatistics();
    this.setupQuickActions();
    this.showWelcomeNotification();
    
    // Cargar gráfico después de que el DOM esté listo
    setTimeout(() => {
      this.loadActivityChart();
    }, 100);
  }

  ngOnDestroy(): void {
    // Limpiar gráfico al destruir componente
    if (this.activityChart) {
      this.chartService.destroyChart(this.activityChart);
    }
  }

  /**
   * Carga estadísticas del dashboard
   */
  private async loadStatistics(): Promise<void> {
    try {
      // Intentar obtener datos del backend
      const response: any = await firstValueFrom(
        this.http.get('http://localhost:3100/estadisticas/dashboard')
      );
      
      if (response.status === 'success') {
        this.stats.set(response.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Fallback a datos mock si falla
      this.stats.set({
        rifas_activas: 3,
        rifas_finalizadas: 1,
        total_recaudado: 125000,
        numeros_vendidos: 1250,
        mis_numeros: 15,
        proximos_sorteos: 2
      });
    }

    // Cargar top rifas si es admin
    if (this.isAdmin()) {
      await this.loadTopRifas();
    }
  }

  /**
   * Carga las rifas más vendidas
   */
  private async loadTopRifas(): Promise<void> {
    try {
      // TODO: Implementar endpoint en backend
      // Por ahora datos mock
      this.topRifas.set([
        {
          id: 1,
          nombre: 'Rifa Cruz Roja 2024',
          numeros_vendidos: 85,
          total_recaudado: 127500,
          porcentaje_vendido: 85
        },
        {
          id: 2,
          nombre: 'Rifa DEMO Finalizada',
          numeros_vendidos: 100,
          total_recaudado: 150000,
          porcentaje_vendido: 100
        }
      ]);
    } catch (error) {
      console.error('Error cargando top rifas:', error);
    }
  }

  /**
   * Configura acciones rápidas según el rol
   */
  private setupQuickActions(): void {
    const user = this.authService.currentUser();
    const isAdmin = user?.role === 'admin_global' || user?.role === 'admin_institucion';

    this.quickActions = [
      {
        icon: '🎰',
        label: 'Rifas Activas',
        route: '/rifas',
        color: '#667eea'
      },
      {
        icon: '🎁',
        label: 'Mis Números',
        route: '/mis-numeros',
        color: '#9f7aea'
      },
      {
        icon: '🌐',
        label: 'Rifas Públicas',
        route: '/rifas/publicas',
        color: '#4299e1'
      },
      {
        icon: '➕',
        label: 'Crear Rifa',
        route: '/rifas/crear',
        color: '#48bb78',
        disabled: !isAdmin
      },
      {
        icon: '📊',
        label: 'Reportes',
        route: '/reportes',
        color: '#ed8936',
        disabled: !isAdmin
      },
      {
        icon: '👥',
        label: 'Usuarios',
        route: '/usuarios',
        color: '#f56565',
        disabled: user?.role !== 'admin_global'
      },
      {
        icon: '🏢',
        label: 'Instituciones',
        route: '/instituciones',
        color: '#38b2ac',
        disabled: user?.role !== 'admin_global'
      },
      {
        icon: '⚙️',
        label: 'Configuración',
        route: '/configuracion',
        color: '#718096'
      }
    ];
  }

  /**
   * Muestra notificación de bienvenida
   */
  private showWelcomeNotification(): void {
    const user = this.authService.currentUser();
    // Comentado temporalmente hasta que se implemente showSuccess
    // this.notificationService.showSuccess(
    //   `¡Bienvenido/a ${user?.nombre}!`,
    //   `Sistema de Rifas Solidarias`
    // );
    console.log(`👋 Bienvenido/a ${user?.name} al Sistema de Rifas Solidarias`);
  }

  /**
   * Carga el gráfico de actividad
   */
  private async loadActivityChart(): Promise<void> {
    try {
      // Verificar que Chart.js esté disponible
      if (typeof ChartService === 'undefined') {
        console.warn('⚠️ Chart.js no está disponible. El gráfico no se mostrará.');
        return;
      }

      const ventasData = await this.chartService.getVentasPorMes();
      const chartData = this.chartService.ventasToChartData(ventasData);
      
      this.activityChart = this.chartService.createLineChart(
        'activityChart',
        chartData,
        'Ventas y Recaudación - Últimos 6 Meses'
      );

      if (!this.activityChart) {
        console.warn('⚠️ No se pudo crear el gráfico de actividad');
      } else {
        console.log('✅ Gráfico de actividad cargado correctamente');
      }
    } catch (error) {
      console.error('❌ Error cargando gráfico:', error);
    }
  }

  /**
   * Navegación a rutas
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  goToUsuarios(): void {
    this.router.navigate(['/usuarios']);
  }

  verRifa(rifaId: number): void {
    this.router.navigate(['/rifas', rifaId]);
  }

  /**
   * Helpers
   */
  getRoleLabel(): string {
    const rol = this.authService.currentUser()?.role;
    const labels: Record<string, string> = {
      'admin_global': 'Administrador Global',
      'admin_institucion': 'Administrador de Institución',
      'vendedor': 'Vendedor',
      'participante': 'Participante'
    };
    return labels[rol || ''] || 'Usuario';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getConnectionClass(): string {
    return this.authService.isAuthenticated() ? 'connected' : 'disconnected';
  }

  getConnectionText(): string {
    return this.authService.isAuthenticated() ? 'Conectado' : 'Desconectado';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatPrice(value: number): string {
    return this.formatCurrency(value);
  }
}