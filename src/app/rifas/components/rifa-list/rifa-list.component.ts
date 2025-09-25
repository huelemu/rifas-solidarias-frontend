// src/app/rifas/components/rifa-list/rifa-list.component.ts - COMPLETO

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
    styleUrls: ['../../styles/rifas-global.scss']
})
export class RifaListComponent implements OnInit {
  // Servicios
  private readonly authService = inject(AuthService);
  private readonly rifasService = inject(RifasService);
  private readonly router = inject(Router);

  // Signals para estado del componente
  readonly rifas = signal<Rifa[]>([]);
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

    this.rifasService.getRifas(this.currentFilters()).subscribe({
      next: (result) => {
        this.rifas.set(result.rifas);
        this.pagination.set(result.pagination);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar rifas:', error);
        this.error.set('Error al cargar las rifas');
        this.loading.set(false);
      }
    });
  }

  recargarRifas(): void {
    this.loadRifas();
  }

  // =====================================================
  // MÉTODOS DE FILTRADO Y PAGINACIÓN
  // =====================================================

  onFilterChange(): void {
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
            this.loadRifas();
          }
        },
        error: (error) => {
          console.error('Error al activar rifa:', error);
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
            this.loadRifas();
          }
        },
        error: (error) => {
          console.error('Error al pausar rifa:', error);
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
              this.loadRifas();
            }
          },
          error: (error) => {
            console.error('Error al eliminar rifa:', error);
            this.error.set('Error al eliminar la rifa');
          }
        });
      }
    }
  }

  duplicarRifa(rifaId: number): void {
    console.log('Duplicar rifa:', rifaId);
    alert('Funcionalidad en desarrollo');
  }

  exportarRifa(rifaId: number): void {
    console.log('Exportar rifa:', rifaId);
    alert('Funcionalidad en desarrollo');
  }

  // =====================================================
  // MÉTODOS DE UTILIDAD
  // =====================================================

  canCreateRifa(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'admin_global' || user?.role === 'admin_institucion';
  }

  canManageRifa(rifa: Rifa): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    
    if (user.role === 'admin_global') return true;
    if (user.role === 'admin_institucion' && user.institucion_id === rifa.institucion_promotora_id) return true;
    
    return false;
  }

  getActivasCount(): number {
    return this.rifas().filter(r => r.estado === 'activa').length;
  }

  getFinalizadasCount(): number {
    return this.rifas().filter(r => r.estado === 'finalizada').length;
  }

  getCardClass(rifa: Rifa): string {
    return `rifa-card card-${rifa.estado}`;
  }

  getEstadoClass(estado: string): string {
    const config = this.getEstadoConfig(estado as any);
    return config.class;
  }

  getEstadoConfig(estado: string) {
    return RifaUtils.getEstadoConfig(estado as any);
  }

  formatPrice(precio: number): string {
    return RifaUtils.formatPrice(precio);
  }

  formatDate(fecha: string): string {
    return RifaUtils.formatDate(fecha);
  }

  getDiasRestantes(fechaFin: string): number {
    return RifaUtils.calcularDiasRestantes(fechaFin);
  }
}