// src/app/rifas/components/rifa-list/rifa-list.component.ts

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
  RIFA_CONFIG
} from '../../models/rifa.models';
import { ViewToggleComponent } from '../../../shared/components/view-toggle/view-toggle.component';
import { RifaCardComponent } from '../rifa-card/rifa-card.component';
import { ViewPreferenceService, ViewMode } from '../../../shared/services/view-preference.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rifa-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ViewToggleComponent, 
    RifaCardComponent,
    NavbarComponent 
  ],
  templateUrl: './rifa-list.component.html',
  styleUrls: ['./rifa-list.component.scss']
})
export class RifaListComponent implements OnInit {
  // =====================================================
  // SERVICIOS INYECTADOS
  // =====================================================
  private readonly authService = inject(AuthService);
  private readonly rifasService = inject(RifasService);
  private readonly router = inject(Router);
  private readonly viewPreferenceService = inject(ViewPreferenceService);

  // =====================================================
  // SIGNALS Y ESTADO
  // =====================================================
  readonly rifas = signal<any[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly pagination = signal<any>(null);
  readonly viewMode$: Observable<ViewMode> = this.viewPreferenceService.getViewMode$();

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

  // =====================================================
  // LIFECYCLE
  // =====================================================
  ngOnInit() {
    this.loadRifas();
  }

  // =====================================================
  // MÉTODOS DE CARGA DE DATOS
  // =====================================================

  /**
   * Carga las rifas desde el backend
   */
  private loadRifas(): void {
    this.loading.set(true);
    this.error.set(null);

    console.log('📡 Cargando rifas con filtros:', this.currentFilters());
    
    this.rifasService.getRifas(this.currentFilters()).subscribe({
      next: (result: any) => {
        console.log('✅ Rifas cargadas:', result);
        
        try {
          // Extraer rifas del resultado
          const rifasData = result?.rifas || result?.data?.rifas || result?.data || [];
          
          this.rifas.set(Array.isArray(rifasData) ? rifasData : []);
          
          // Actualizar paginación
          if (result?.pagination) {
            this.pagination.set(result.pagination);
          } else if (result?.data?.pagination) {
            this.pagination.set(result.data.pagination);
          }
          
          this.loading.set(false);
        } catch (err) {
          console.error('❌ Error procesando rifas:', err);
          this.error.set('Error procesando los datos');
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('❌ Error cargando rifas:', err);
        this.error.set(err?.error?.message || 'Error al cargar las rifas');
        this.loading.set(false);
        this.rifas.set([]);
      }
    });
  }

  /**
   * Recarga las rifas
   */
  recargarRifas(): void {
    this.loadRifas();
  }

  // =====================================================
  // MÉTODOS DE FILTRADO
  // =====================================================

  /**
   * Maneja cambios en los filtros
   */
  onFilterChange(): void {
    // Resetear a página 1 cuando cambian los filtros
    this.currentFilters.update(filters => ({
      ...filters,
      page: 1
    }));
    this.loadRifas();
  }

  /**
   * Cambia de página
   */
  cambiarPagina(page: number): void {
    this.currentFilters.update(filters => ({
      ...filters,
      page
    }));
    this.loadRifas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Genera array de páginas para la paginación
   */
  getPaginationPages(): number[] {
    const pag = this.pagination();
    if (!pag) return [];

    const pages: number[] = [];
    const maxPages = 7; // Máximo de páginas a mostrar
    const current = pag.page;
    const total = pag.totalPages || pag.pages;

    if (total <= maxPages) {
      // Mostrar todas las páginas
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar con puntos suspensivos
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1); // Representa "..."
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      }
    }

    return pages;
  }

  // =====================================================
  // MÉTODOS DE ESTADÍSTICAS
  // =====================================================

  /**
   * Cuenta rifas activas
   */
  getActivasCount(): number {
    return this.rifas().filter(r => r.estado === 'activa').length;
  }

  /**
   * Cuenta rifas finalizadas
   */
  getFinalizadasCount(): number {
    return this.rifas().filter(r => r.estado === 'finalizada').length;
  }

  /**
   * Cuenta rifas en borrador
   */
  getBorradorCount(): number {
    return this.rifas().filter(r => r.estado === 'borrador').length;
  }

  // =====================================================
  // MÉTODOS DE NAVEGACIÓN Y ACCIONES
  // =====================================================

  /**
   * Verifica si el usuario puede crear rifas
   */
  canCreateRifa(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    
    return user.role === 'admin_global' || user.role === 'admin_institucion';
  }

  /**
   * Navega a crear nueva rifa
   */
  crearRifa(): void {
    this.router.navigate(['/rifas/crear']);
  }

  /**
   * Maneja evento de eliminar rifa
   */
  onDeleteRifa(rifaId: number): void {
    console.log('🗑️ Eliminando rifa:', rifaId);
    
    this.rifasService.deleteRifa(rifaId).subscribe({
      next: () => {
        console.log('✅ Rifa eliminada exitosamente');
        // Recargar la lista
        this.loadRifas();
      },
      error: (err) => {
        console.error('❌ Error al eliminar rifa:', err);
        alert(err?.error?.message || 'Error al eliminar la rifa');
      }
    });
  }

  /**
   * Maneja evento de editar rifa
   */
  onEditRifa(rifaId: number): void {
    console.log('✏️ Editando rifa:', rifaId);
    this.router.navigate(['/rifas', rifaId, 'editar']);
  }

  /**
   * Maneja evento de ver detalles
   */
  onViewRifa(rifaId: number): void {
    console.log('👁️ Viendo detalles de rifa:', rifaId);
    this.router.navigate(['/rifas', rifaId]);
  }
}