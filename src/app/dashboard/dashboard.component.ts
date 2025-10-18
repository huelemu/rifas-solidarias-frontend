// src/app/dashboard/dashboard.component.ts
import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../environments/environment.development';

interface DashboardStats {
  rifas_activas: number;
  rifas_finalizadas?: number;
  mis_numeros_comprados?: number;
  total_invertido?: number;
  mis_rifas_activas?: number;
  proximos_sorteos?: number;
  // Admin stats
  total_usuarios?: number;
  total_instituciones?: number;
  total_recaudado?: number;
  numeros_vendidos?: number;
  numeros_vendidos_hoy?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  readonly router = inject(Router);
  readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Signals
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly stats = signal<DashboardStats>({
    rifas_activas: 0,
    rifas_finalizadas: 0,
    mis_numeros_comprados: 0,
    total_invertido: 0,
    mis_rifas_activas: 0,
    proximos_sorteos: 0
  });

  // Computed
  readonly userName = computed(() => {
    const user = this.authService.currentUser();
    return user?.name || user?.nombre || 'Usuario';
  });

  readonly userRole = computed(() => {
    const role = this.authService.currentUser()?.role;
    const labels: Record<string, string> = {
      'admin_global': '🔑 Administrador Global',
      'admin_institucion': '🏛️ Admin Institución',
      'vendedor': '💼 Vendedor',
      'comprador': '🎫 Participante'
    };
    return labels[role || ''] || 'Usuario';
  });

  readonly isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'admin_global' || role === 'admin_institucion';
  });

  readonly isVendedor = computed(() => {
    return this.authService.currentUser()?.role === 'vendedor';
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    // ✅ CARGAR DATOS REALES DESDE LA API
    this.http.get<any>(`${this.apiUrl}/estadisticas/dashboard`).subscribe({
      next: (response) => {
        console.log('✅ Dashboard stats:', response);
        if (response.status === 'success' && response.data) {
          // ✅ Asegurar que todos los valores numéricos tengan un valor por defecto
          this.stats.set({
            rifas_activas: response.data.rifas_activas || 0,
            rifas_finalizadas: response.data.rifas_finalizadas || 0,
            mis_numeros_comprados: response.data.mis_numeros_comprados || 0,
            total_invertido: response.data.total_invertido || 0,
            mis_rifas_activas: response.data.mis_rifas_activas || 0,
            proximos_sorteos: response.data.proximos_sorteos || 0,
            total_usuarios: response.data.total_usuarios || 0,
            total_instituciones: response.data.total_instituciones || 0,
            total_recaudado: response.data.total_recaudado || 0,
            numeros_vendidos: response.data.numeros_vendidos || 0,
            numeros_vendidos_hoy: response.data.numeros_vendidos_hoy || 0
          });
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error cargando dashboard:', err);
        this.error.set('Error al cargar las estadísticas');
        this.loading.set(false);
        
        // Mantener valores por defecto en caso de error
        this.stats.set({
          rifas_activas: 0,
          rifas_finalizadas: 0,
          mis_numeros_comprados: 0,
          total_invertido: 0,
          mis_rifas_activas: 0,
          proximos_sorteos: 0
        });
      }
    });
  }

  refreshDashboard(): void {
    this.loadDashboard();
  }

  // Navegación
  goToRifas(): void {
    this.router.navigate(['/rifas']);
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

  goToVentas(): void {
    this.router.navigate(['/vendedor/mis-ventas']);
  }

  // ✅ CORREGIDO: Ahora acepta number | undefined
  formatPrice(value: number | undefined): string {
    if (value === undefined || value === null) {
      return '$0';
    }
    return `$${value.toLocaleString('es-AR')}`;
  }
}