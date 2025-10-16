// src/app/dashboard/dashboard.component.ts
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RifasService } from '../rifas/services/rifas.service';
import { AuthService } from '../auth/services/auth.service';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';

interface DashboardStats {
  rifas_activas: number;
  mis_numeros_comprados: number;
  total_invertido: number;
  mis_rifas_activas: number;
  proximos_sorteos: number;
  // Admin
  total_usuarios?: number;
  total_instituciones?: number;
  total_recaudado?: number;
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
  private readonly rifasService = inject(RifasService);
  readonly authService = inject(AuthService);

  // Signals
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly stats = signal<DashboardStats>({
    rifas_activas: 0,
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

    // Simular carga de estadísticas
    // TODO: Reemplazar con llamada real al backend
    setTimeout(() => {
      this.stats.set({
        rifas_activas: 5,
        mis_numeros_comprados: 12,
        total_invertido: 120000,
        mis_rifas_activas: 3,
        proximos_sorteos: 2,
        // Admin stats
        total_usuarios: 150,
        total_instituciones: 8,
        total_recaudado: 5000000,
        numeros_vendidos_hoy: 45
      });
      this.loading.set(false);
    }, 500);
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


  formatPrice(value: number): string {
    return `$${value.toLocaleString('es-AR')}`;
  }
}