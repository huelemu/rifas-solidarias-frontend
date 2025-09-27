// src/app/rifas/components/rifa-list/rifa-list.component.ts - VERSIÓN CORREGIDA

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { RifasService } from '../../services/rifas.service';
import {
  Rifa,
  RifaFilters,
  RIFA_ESTADOS,
  RifaUtils,
  RIFA_CONFIG
} from '../../models/rifa.models';

@Component({
  selector: 'app-rifa-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rifa-list.component.html',
  styleUrls: ['./rifa-list.component.scss']
})
export class RifaListComponent implements OnInit {
  // Servicios
  private readonly authService = inject(AuthService);
  private readonly rifasService = inject(RifasService);
  private readonly router = inject(Router);

  // Signals para estado del componente
  readonly rifas = signal<any[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly pagination = signal<any>(null);

  // Filtros
  readonly currentFilters = signal<RifaFilters>({
    search: '',
    estado: 'todas',
    page: 1,
    limit: RIFA_CONFIG.RIFAS_POR_PAGINA,
    ordenar_por: 'fecha_creacion',
    direccion_orden: 'desc'
  });

  // Constantes
  readonly rifaEstados = RIFA_ESTADOS;
  readonly Math = Math;

  // Computed properties
  readonly filteredRifas = computed(() => this.rifas());

  ngOnInit() {
    this.loadRifas();
  }

  // =====================================================
  // MÉTODOS DE CARGA DE DATOS
  // =====================================================

  private loadRifas(): void {
    this.loading.set(true);
    this.error.set(null);

    console.log('📡 Haciendo petición con filtros:', this.currentFilters());
    
    this.rifasService.getRifas(this.currentFilters()).subscribe({
      next: (result: any) => {
        console.log('📦 Respuesta completa del backend:', result);
        
        try {
          // Extraer rifas del resultado según el formato de respuesta
          const rifasData = result?.rifas || result?.data?.rifas || result?.data || [];
          
          this.rifas.set(Array.isArray(rifasData) ? rifasData : []);
          this.pagination.set(result?.pagination || null);
          this.loading.set(false);
          
          console.log('✅ Rifas cargadas exitosamente:', this.rifas().length);
        } catch (err) {
          console.error('❌ Error procesando respuesta:', err);
          this.error.set('Error procesando la respuesta del servidor');
          this.rifas.set([]);
          this.loading.set(false);
        }
      },
      error: (error) => {
        console.error('❌ Error cargando rifas:', error);
        this.error.set(error?.error?.message || 'Error al cargar las rifas');
        this.rifas.set([]);
        this.loading.set(false);
      }
    });
  }

  // =====================================================
  // MÉTODOS DE NAVEGACIÓN - LOS QUE FALTABAN
  // =====================================================

  /**
   * Ver detalle de una rifa
   */
  verDetalle(rifaId: number): void {
    console.log('👁️ Navegando a ver detalle de rifa:', rifaId);
    this.router.navigate(['/rifas', rifaId]);
  }

  /**
   * Editar una rifa
   */
  editarRifa(rifaId: number): void {
    console.log('✏️ Navegando a editar rifa:', rifaId);
    this.router.navigate(['/rifas', rifaId, 'editar']);
  }

  /**
   * Ver números de una rifa
   */
  verNumeros(rifaId: number): void {
    console.log('🔢 Navegando a números de rifa:', rifaId);
    this.router.navigate(['/rifas', rifaId, 'numeros']);
  }

  /**
   * Crear nueva rifa
   */
  crearRifa(): void {
    console.log('➕ Navegando a crear nueva rifa');
    this.router.navigate(['/rifas/crear']);
  }

  // =====================================================
  // MÉTODOS DE GESTIÓN DE ESTADO - CORREGIDOS
  // =====================================================

  /**
   * Activar una rifa
   */
  activarRifa(rifaId: number): void {
    if (!confirm('¿Estás seguro de que deseas activar esta rifa?')) return;
    
    console.log('🟢 Activando rifa:', rifaId);
    this.rifasService.updateRifa(rifaId, { estado: 'activa' }).subscribe({
      next: () => {
        console.log('✅ Rifa activada exitosamente');
        this.loadRifas(); // Recargar lista
      },
      error: (error) => {
        console.error('❌ Error activando rifa:', error);
        alert('Error al activar la rifa: ' + (error?.error?.message || error.message));
      }
    });
  }

  /**
   * Pausar una rifa
   */
  pausarRifa(rifaId: number): void {
    if (!confirm('¿Estás seguro de que deseas pausar esta rifa?')) return;
    
    console.log('⏸️ Pausando rifa:', rifaId);
    this.rifasService.updateRifa(rifaId, { estado: 'pausada' }).subscribe({
      next: () => {
        console.log('✅ Rifa pausada exitosamente');
        this.loadRifas(); // Recargar lista
      },
      error: (error) => {
        console.error('❌ Error pausando rifa:', error);
        alert('Error al pausar la rifa: ' + (error?.error?.message || error.message));
      }
    });
  }

  // =====================================================
  // MÉTODOS DEL DROPDOWN "MÁS" - LOS QUE FALTABAN
  // =====================================================

  /**
   * Duplicar una rifa
   */
  duplicarRifa(rifaId: number): void {
    if (!confirm('¿Deseas crear una copia de esta rifa?')) return;
    
    console.log('📋 Duplicando rifa:', rifaId);
    // TODO: Implementar lógica de duplicación en el servicio
    alert('Función de duplicar en desarrollo');
  }

  /**
   * Exportar datos de una rifa
   */
  exportarRifa(rifaId: number): void {
    console.log('📊 Exportando rifa:', rifaId);
    // TODO: Implementar lógica de exportación
    alert('Función de exportar en desarrollo');
  }

  /**
   * Eliminar una rifa
   */
  eliminarRifa(rifaId: number): void {
    const motivo = prompt('¿Por qué deseas eliminar esta rifa? (opcional)');
    if (motivo === null) return; // Usuario canceló
    
    console.log('🗑️ Eliminando rifa:', rifaId);
    this.rifasService.deleteRifa(rifaId, motivo || '').subscribe({
      next: () => {
        console.log('✅ Rifa eliminada exitosamente');
        this.loadRifas(); // Recargar lista
      },
      error: (error) => {
        console.error('❌ Error eliminando rifa:', error);
        alert('Error al eliminar la rifa: ' + (error?.error?.message || error.message));
      }
    });
  }

  // =====================================================
  // MÉTODOS DE UTILIDAD - CORREGIDOS
  // =====================================================

  /**
   * Obtener configuración del estado - MÉTODO CORREGIDO
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
   * Obtener clase CSS de la card según el estado
   */
  getCardClass(rifa: any): string {
    return 'rifa-card-' + this.getEstadoConfig(rifa.estado).class;
  }

  /**
   * Verificar si el usuario puede gestionar la rifa
   */
  canManageRifa(rifa: any): boolean {
    const currentUser = this.authService.currentUser();
    
    // Admin puede gestionar todas
    if (currentUser?.role === 'admin_global') return true;
    
    // Usuario solo puede gestionar sus rifas
    return rifa.creado_por === currentUser?.id;
  }

  /**
   * Verificar si el usuario puede crear rifas
   */
  canCreateRifa(): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.role === 'admin_global' || currentUser?.role === 'admin_institucion';
  }

  /**
 * Navegar a comprar números de una rifa
 */
comprarNumeros(rifaId: number): void {
  console.log('🛒 Navegando a comprar números de rifa:', rifaId);
  this.router.navigate(['/rifas', rifaId, 'comprar']);
}

/**
 * Verificar si el usuario puede comprar números
 */
puedeComprarNumeros(): boolean {
  const currentUser = this.authService.currentUser();
  
  // Todos los usuarios autenticados pueden comprar números
  return currentUser !== null;
}

/**
 * Navegar a "Mis números"
 */
verMisNumeros(): void {
  console.log('🎫 Navegando a mis números');
  this.router.navigate(['/mis-numeros']);
}

  // =====================================================
  // MÉTODOS DE FORMATEO
  // =====================================================

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
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

  /**
   * Calcular días restantes
   */
  getDiasRestantes(fechaFin: string): number {
    if (!fechaFin) return 0;
    
    try {
      const fin = new Date(fechaFin);
      const hoy = new Date();
      const diferencia = fin.getTime() - hoy.getTime();
      return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  // =====================================================
  // MÉTODOS DE FILTROS Y PAGINACIÓN
  // =====================================================

  /**
   * Recargar rifas
   */
  recargarRifas(): void {
    console.log('🔄 Recargando rifas...');
    this.loadRifas();
  }

  /**
   * Cambiar filtros
   */
onFilterChange(): void {
  this.currentFilters.update(current => ({
    ...current,
    page: 1 // Resetear página al cambiar filtros
  }));
  this.loadRifas();
}

  /**
   * Cambiar página
   */
  cambiarPagina(page: number): void {
    this.currentFilters.update(current => ({
      ...current,
      page
    }));
    this.loadRifas();
  }

  /**
   * Obtener páginas para paginación
   */
  getPaginationPages(): number[] {
    const pagination = this.pagination();
    if (!pagination) return [];
    
    const pages: number[] = [];
    const current = pagination.page;
    const total = pagination.totalPages || pagination.pages;
    
    // Mostrar máximo 5 páginas
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // =====================================================
  // MÉTODOS DE ESTADÍSTICAS
  // =====================================================

  /**
   * Contar rifas activas
   */
  getActivasCount(): number {
    return this.rifas().filter(r => r.estado === 'activa').length;
  }

  /**
   * Contar rifas finalizadas
   */
  getFinalizadasCount(): number {
    return this.rifas().filter(r => r.estado === 'finalizada').length;
  }

  /**
   * Contar rifas en borrador
   */
  getBorradorCount(): number {
    return this.rifas().filter(r => r.estado === 'borrador').length;
  }
}