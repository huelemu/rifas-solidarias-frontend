// src/app/rifas/components/rifa-detail/rifa-detail.component.ts

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-rifa-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './rifa-detail.component.html',
  styleUrls: ['./rifa-detail.component.scss']
})
export class RifaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly authService = inject(AuthService);

  // Signals
  readonly rifa = signal<any>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  private rifaId: number = 0;

  ngOnInit() {
    // Obtener ID de la rifa de la ruta
    this.route.params.subscribe(params => {
      this.rifaId = +params['id'];
      if (this.rifaId) {
        this.loadRifa();
      } else {
        this.error.set('ID de rifa inválido');
        this.loading.set(false);
      }
    });
  }

  /**
   * Cargar datos de la rifa
   */
  loadRifa(): void {
    this.loading.set(true);
    this.error.set(null);

    this.rifasService.getRifa(this.rifaId).subscribe({
      next: (response) => {
        console.log('📦 Detalle de rifa cargado:', response);
        this.rifa.set(response.data || response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando rifa:', error);
        this.error.set(error?.error?.message || 'Error al cargar la rifa');
        this.loading.set(false);
      }
    });
  }

  /**
   * Volver a la lista
   */
  goBack(): void {
    this.router.navigate(['/rifas']);
  }

  /**
   * Editar rifa
   */
  editarRifa(): void {
    this.router.navigate(['/rifas', this.rifaId, 'editar']);
  }

  /**
   * Ver números
   */
  verNumeros(): void {
    this.router.navigate(['/rifas', this.rifaId, 'numeros']);
  }

  /**
   * Ver estadísticas
   */
  verEstadisticas(): void {
    this.router.navigate(['/rifas', this.rifaId, 'estadisticas']);
  }

  /**
   * Activar rifa
   */
  activarRifa(): void {
    if (!confirm('¿Estás seguro de que deseas activar esta rifa?')) return;
    
    this.rifasService.updateRifa(this.rifaId, { estado: 'activa' }).subscribe({
      next: () => {
        console.log('✅ Rifa activada');
        this.loadRifa(); // Recargar datos
      },
      error: (error) => {
        alert('Error al activar la rifa: ' + (error?.error?.message || error.message));
      }
    });
  }

  /**
   * Pausar rifa
   */
  pausarRifa(): void {
    if (!confirm('¿Estás seguro de que deseas pausar esta rifa?')) return;
    
    this.rifasService.updateRifa(this.rifaId, { estado: 'pausada' }).subscribe({
      next: () => {
        console.log('✅ Rifa pausada');
        this.loadRifa(); // Recargar datos
      },
      error: (error) => {
        alert('Error al pausar la rifa: ' + (error?.error?.message || error.message));
      }
    });
  }

  /** Asignar numeros a Vendedor */
  irAAsignarNumeros(): void {
  this.router.navigate(['/rifas', this.rifaId, 'asignar-numeros']);
}

  /**
   * Verificar permisos de gestión
   */
  canManageRifa(rifa: any): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.role === 'admin_global' || rifa.creado_por === currentUser?.id;
  }

  /**
   * Obtener configuración del estado
   */
  getEstadoConfig(estado: string): any {
  const estadosConfig: { [key: string]: any } = {
    'borrador': { label: 'Borrador', icon: '📝', class: 'borrador' },
    'activa': { label: 'Activa', icon: '✅', class: 'activa' },
    'pausada': { label: 'Pausada', icon: '⏸️', class: 'pausada' },
    'cerrada': { label: 'Cerrada', icon: '🔒', class: 'cerrada' },
    'finalizada': { label: 'Finalizada', icon: '🏁', class: 'finalizada' },
    'cancelada': { label: 'Cancelada', icon: '❌', class: 'cancelada' }
  };

  return estadosConfig[estado] || { label: 'Desconocido', icon: '❓', class: 'desconocido' };
}

  /**
   * Obtener clase CSS del estado
   */
  getEstadoClass(estado: string): string {
    return 'status-' + this.getEstadoConfig(estado).class;
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }

// En rifa-detail.component.ts
comprarNumeros(): void {
  this.router.navigate(['/rifas', this.rifaId, 'comprar']);
}

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'No definida';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }
}