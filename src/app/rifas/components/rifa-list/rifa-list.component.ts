// src/app/rifas/components/rifa-list/rifa-list.component.ts - CORREGIDO

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
  styleUrls: ['./rifa-list.component.scss'] // 🔧 CORREGIDO: usar archivo específico
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
    next: (result: any) => { // <- Usar any temporalmente
      console.log('📦 Respuesta completa del backend:', result);
      console.log('📦 Tipo de respuesta:', typeof result);
      console.log('📦 Es array?', Array.isArray(result));
      
      if (result && Array.isArray(result.rifas)) {
        console.log('✅ Usando result.rifas:', result.rifas);
        this.rifas.set(result.rifas as any[]); // <- Casting a any
        this.pagination.set(result.pagination);
      } else if (Array.isArray(result)) {
        console.log('✅ Usando result directo:', result);
        this.rifas.set(result as any[]); // <- Casting a any
        this.pagination.set(null);
      } else {
        console.warn('⚠️ Estructura inesperada:', result);
        this.rifas.set([]);
        this.pagination.set(null);
      }
      
      this.loading.set(false);
    },
    error: (error: any) => {
      console.error('❌ Error completo:', error);
      this.error.set('Error al cargar las rifas');
      this.loading.set(false);
    }
  });
 }
 

  recargarRifas(): void {
    console.log('🔄 Recargando rifas...');
    this.loadRifas();
  }

  // =====================================================
  // MÉTODOS DE FILTRADO Y PAGINACIÓN
  // =====================================================

  onFilterChange(): void {
    console.log('🔍 Filtros cambiados:', this.currentFilters());
    this.currentFilters.update(filters => ({
      ...filters,
      page: 1
    }));
    this.loadRifas();
  }

  cambiarPagina(page: number): void {
    this.currentFilters.update(filters => ({
      ...filters,
      page
    }));
    this.loadRifas();
  }

  getPaginationPages(): number[] {
    const pagination = this.pagination();
    if (!pagination) return [];

    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;
    const pages: number[] = [];

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // =====================================================
  // MÉTODOS DE NAVEGACIÓN
  // =====================================================

  crearRifa(): void {
    this.router.navigate(['/rifas/crear']);
  }

  verDetalle(rifaId: number): void {
    this.router.navigate(['/rifas', rifaId]);
  }

  editarRifa(rifaId: number): void {
    this.router.navigate(['/rifas', rifaId, 'editar']);
  }

  verNumeros(rifaId: number): void {
    this.router.navigate(['/rifas', rifaId, 'numeros']);
  }

  // =====================================================
  // MÉTODOS DE ACCIONES
  // =====================================================

  activarRifa(rifaId: number): void {
    if (confirm('¿Estás seguro de que quieres activar esta rifa?')) {
      this.rifasService.cambiarEstadoRifa(rifaId, 'activa').subscribe({
        next: (success) => {
          if (success) {
            console.log('✅ Rifa activada correctamente');
            this.loadRifas();
          } else {
            this.error.set('No se pudo activar la rifa');
          }
        },
        error: (error) => {
          console.error('❌ Error al activar rifa:', error);
          this.error.set('Error al activar la rifa');
        }
      });
    }
  }

  pausarRifa(rifaId: number): void {
    if (confirm('¿Estás seguro de que quieres pausar esta rifa?')) {
      this.rifasService.cambiarEstadoRifa(rifaId, 'cerrada').subscribe({
        next: (success) => {
          if (success) {
            console.log('✅ Rifa pausada correctamente');
            this.loadRifas();
          } else {
            this.error.set('No se pudo pausar la rifa');
          }
        },
        error: (error) => {
          console.error('❌ Error al pausar rifa:', error);
          this.error.set('Error al pausar la rifa');
        }
      });
    }
  }

  eliminarRifa(rifaId: number): void {
    const motivo = prompt('¿Por qué razón quieres eliminar esta rifa? (opcional)');
    if (motivo !== null) {
      if (confirm('¿Estás seguro de que quieres eliminar esta rifa? Esta acción no se puede deshacer.')) {
        this.rifasService.deleteRifa(rifaId, motivo || undefined).subscribe({
          next: (success) => {
            if (success) {
              console.log('✅ Rifa eliminada correctamente');
              this.loadRifas();
            } else {
              this.error.set('No se pudo eliminar la rifa');
            }
          },
          error: (error) => {
            console.error('❌ Error al eliminar rifa:', error);
            this.error.set('Error al eliminar la rifa');
          }
        });
      }
    }
  }

  duplicarRifa(rifaId: number): void {
    console.log('📋 Duplicar rifa:', rifaId);
    alert('Funcionalidad en desarrollo');
  }

  exportarRifa(rifaId: number): void {
    console.log('📊 Exportar rifa:', rifaId);
    alert('Funcionalidad en desarrollo');
  }

  // =====================================================
  // MÉTODOS DE UTILIDAD Y PERMISOS
  // =====================================================

  canCreateRifa(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'admin_global' || user?.role === 'admin_institucion';
  }

  canManageRifa(rifa: Rifa): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    
    if (user.role === 'admin_global') return true;
    
    // Verificar tanto institucion_promotora_id como si es la misma institución
    if (user.role === 'admin_institucion') {
      return user.institucion_id === rifa.institucion_promotora_id;
    }
    
    return false;
  }

  // =====================================================
  // MÉTODOS DE ESTADÍSTICAS - AGREGADOS
  // =====================================================

  getActivasCount(): number {
    return this.rifas().filter(r => r.estado === 'activa').length;
  }

  getFinalizadasCount(): number {
    return this.rifas().filter(r => r.estado === 'finalizada').length;
  }

  // 🔧 AGREGADO: Método que faltaba
  getBorradoresCount(): number {
    return this.rifas().filter(r => r.estado === 'borrador').length;
  }

  // 🔧 AGREGADO: Método para rifas cerradas/pausadas
  getCerradasCount(): number {
    return this.rifas().filter(r => r.estado === 'cerrada').length;
  }

  // =====================================================
  // MÉTODOS DE FORMATO Y PRESENTACIÓN
  // =====================================================

  getCardClass(rifa: Rifa): string {
    switch (rifa.estado) {
      case 'borrador': return 'draft';
      case 'activa': return 'active';
      case 'finalizada': return 'finished';
      case 'cerrada': return 'closed';
      case 'cancelada': return 'closed'; // 🔧 AGREGADO: Estado cancelada
      default: return '';
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'borrador': return 'draft';
      case 'activa': return 'active'; 
      case 'finalizada': return 'finished';
      case 'cerrada': return 'closed';
      case 'cancelada': return 'closed';
      default: return 'draft';
    }
  }

  getEstadoConfig(estado: string) {
    try {
      return RifaUtils.getEstadoConfig(estado as any);
    } catch (error) {
      console.warn('⚠️ Estado no reconocido:', estado);
      // Fallback para estados desconocidos
      return {
        icon: '❓',
        label: estado || 'Desconocido',
        color: '#6c757d'
      };
    }
  }

  // 🔧 MEJORADO: Mejor manejo de precios
  formatPrice(precio: number | undefined | null): string {
    if (precio === null || precio === undefined || isNaN(precio)) {
      return '$0';
    }
    try {
      return RifaUtils.formatPrice(precio);
    } catch (error) {
      console.warn('⚠️ Error al formatear precio:', precio);
      return `$${precio.toLocaleString()}`;
    }
  }

  // 🔧 MEJORADO: Mejor manejo de fechas
  formatDate(fecha: string | undefined | null): string {
    if (!fecha) return 'No definida';
    
    try {
      return RifaUtils.formatDate(fecha);
    } catch (error) {
      console.warn('⚠️ Error al formatear fecha:', fecha);
      return new Date(fecha).toLocaleDateString();
    }
  }

  getDiasRestantes(fechaFin: string | undefined | null): number {
    if (!fechaFin) return 0;
    
    try {
      return RifaUtils.calcularDiasRestantes(fechaFin);
    } catch (error) {
      console.warn('⚠️ Error al calcular días restantes:', fechaFin);
      const fecha = new Date(fechaFin);
      const hoy = new Date();
      const diferencia = fecha.getTime() - hoy.getTime();
      return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    }
  }

  // =====================================================
  // MÉTODOS DE DEBUG - TEMPORALES
  // =====================================================

// Agregar este método temporal para debug
debugComponent(): void {
  console.log('🐛 DEBUG INFO:', {
    rifasLength: this.rifas().length,
    loading: this.loading(),
    error: this.error(),
    filters: this.currentFilters()
  });
}

  // 🔧 AGREGADO: Para debug - remover en producción
  logRifaData(rifa: Rifa): void {
    console.log('📊 Datos de rifa:', {
      id: rifa.id,
      nombre: rifa.nombre,
      estado: rifa.estado,
      cantidad_numeros: rifa.cantidad_numeros,
      total_numeros: (rifa as any).total_numeros,
      numeros_vendidos: rifa.numeros_vendidos,
      institucion_nombre: (rifa as any).institucion_nombre,
      institucion_promotora_id: rifa.institucion_promotora_id,
      institucion_id: (rifa as any).institucion_id
    });
  }
}