// src/app/institutions/components/institution-list.component.ts
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { InstitutionService } from '../services/institution.service';
import {
  Institution,
  InstitutionFilters,
  InstitutionStats,
  INSTITUTION_TYPES,
  INSTITUTION_STATUSES
} from '../models/institution.models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ViewToggleComponent } from '../../shared/components/view-toggle/view-toggle.component';
import { ViewPreferenceService, ViewMode } from '../../shared/services/view-preference.service';

@Component({
  selector: 'app-institution-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, ViewToggleComponent],
  templateUrl: './institution-list.component.html',
  styleUrls: ['./institution-list.component.scss']
})
export class InstitutionListComponent implements OnInit {
  // Servicios
  private readonly authService = inject(AuthService);
  private readonly institutionService = inject(InstitutionService);
  private readonly router = inject(Router);
  private readonly viewPreferenceService = inject(ViewPreferenceService);

  // Signals
  readonly institutions = signal<Institution[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly stats = signal<InstitutionStats | null>(null);
  readonly selectedInstitution = signal<Institution | null>(null);
  readonly showDeleteModal = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly pagination = signal<any>(null);

  // View mode
  readonly viewMode$: Observable<ViewMode> = this.viewPreferenceService.getViewMode$();

  // Filtros
  readonly currentFilters = signal<InstitutionFilters>({
    search: '',
    tipo: 'todas',
    estado: 'todas',
    page: 1,
    limit: 12,
    ordenar_por: 'nombre',
    direccion_orden: 'asc'
  });

  // Computed properties
  readonly filteredInstitutions = computed(() => {
    const institutions = this.institutions();
    const filters = this.currentFilters();

    if (!institutions) return [];

    return institutions.filter(institution => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch = 
          institution.nombre.toLowerCase().includes(search) ||
          (institution.descripcion && institution.descripcion.toLowerCase().includes(search)) ||
          institution.email.toLowerCase().includes(search);
        
        if (!matchesSearch) return false;
      }

      if (filters.tipo && filters.tipo !== 'todas') {
        if (institution.tipo !== filters.tipo) return false;
      }

      if (filters.estado && filters.estado !== 'todas') {
        if (institution.estado !== filters.estado) return false;
      }

      return true;
    });
  });

  readonly hasInstitutions = computed(() => this.institutions().length > 0);
  readonly hasFilteredResults = computed(() => this.filteredInstitutions().length > 0);

  // Constantes
  readonly institutionTypes = INSTITUTION_TYPES;
  readonly institutionStatuses = INSTITUTION_STATUSES;

  ngOnInit() {
    this.loadInstitutions();
    this.loadStats();
  }

  /**
   * Carga las instituciones
   */
  async loadInstitutions(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const filters = this.currentFilters();
      const result = await this.institutionService.getInstitutions(filters).toPromise();

      if (result) {
        this.institutions.set(result.institutions || []);
        this.pagination.set(result.pagination);
      }
    } catch (error) {
      console.error('❌ Error al cargar instituciones:', error);
      this.error.set('Error al cargar las instituciones. Por favor, recarga la página.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Carga las estadísticas
   */
  async loadStats(): Promise<void> {
    try {
      const stats = await this.institutionService.getInstitutionStats().toPromise();
      this.stats.set(stats || null);
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
    }
  }

  /**
   * Aplica filtros
   */
  applyFilters(): void {
    this.currentFilters.update(filters => ({ ...filters, page: 1 }));
    this.loadInstitutions();
  }

  /**
   * Limpia filtros
   */
  clearFilters(): void {
    this.currentFilters.set({
      search: '',
      tipo: 'todas',
      estado: 'todas',
      page: 1,
      limit: 12,
      ordenar_por: 'nombre',
      direccion_orden: 'asc'
    });
    this.loadInstitutions();
  }

  /**
   * Cambia página
   */
  changePage(page: number): void {
    this.currentFilters.update(filters => ({ ...filters, page }));
    this.loadInstitutions();
  }

  // ===================================================
  // NAVEGACIÓN
  // ===================================================

  createInstitution(): void {
    this.router.navigate(['/instituciones/nueva']);
  }

  editInstitution(institution: Institution): void {
    this.router.navigate(['/instituciones', institution.id, 'editar']);
  }

  viewInstitution(institution: Institution): void {
    this.router.navigate(['/instituciones', institution.id, 'editar']);
  }

  // ===================================================
  // MODALES
  // ===================================================

  openDeleteModal(institution: Institution): void {
    this.selectedInstitution.set(institution);
    this.showDeleteModal.set(true);
  }

  closeModals(): void {
    this.showDeleteModal.set(false);
    this.selectedInstitution.set(null);
  }

  async deleteInstitution(): Promise<void> {
    const selected = this.selectedInstitution();
    if (!selected) return;

    try {
      this.submitting.set(true);

      await this.institutionService.deleteInstitution(selected.id, 'Eliminado desde la interfaz').toPromise();
      
      this.institutions.update(institutions =>
        institutions.filter(inst => inst.id !== selected.id)
      );
      
      this.loadStats();
      this.closeModals();
    } catch (error: any) {
      console.error('❌ Error al eliminar institución:', error);
      this.error.set(error.error?.message || 'Error al eliminar la institución');
    } finally {
      this.submitting.set(false);
    }
  }

  async toggleInstitutionStatus(institution: Institution): Promise<void> {
    const nuevoEstado = institution.estado === 'activa' ? 'inactiva' : 'activa';
    
    try {
      const updated = await this.institutionService.updateInstitution(institution.id, { 
        estado: nuevoEstado 
      }).toPromise();
      
      if (updated) {
        this.institutions.update(institutions =>
          institutions.map(inst => 
            inst.id === institution.id ? { ...inst, estado: nuevoEstado } : inst
          )
        );
        this.loadStats();
      }
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      this.error.set('Error al cambiar el estado de la institución');
    }
  }

  // ===================================================
  // HELPERS
  // ===================================================

  private get baseUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    }
    return 'https://apirifas.huelemu.com.ar';
  }

  getInstitutionLogoUrl(institution: Institution): string {
    if (!institution.logo_url) return '';
    if (institution.logo_url.startsWith('http')) return institution.logo_url;
    return `${this.baseUrl}${institution.logo_url}`;
  }

  getTotalInstitutions(): number {
    return this.stats()?.total || 0;
  }

  getActiveInstitutions(): number {
    return this.stats()?.activas || 0;
  }

  getInstitutionsByType(tipo: string): number {
    const stats = this.stats();
    if (!stats) return 0;
    return (stats.por_tipo as any)[tipo] || 0;
  }

  getInstitutionCardClass(institution: Institution): string {
    switch (institution.estado) {
      case 'inactiva': return 'inactive';
      case 'suspendida': return 'suspended';
      default: return '';
    }
  }

  getTypeIcon(tipo: string): string {
    switch (tipo) {
      case 'club': return '⚽';
      case 'fundacion': return '🤝';
      case 'ong': return '❤️';
      case 'cooperativa': return '🏛️';
      case 'escuela': return '🎓';
      default: return '🏢';
    }
  }

  canManageInstitutions(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'admin_global';
  }

  canDeleteInstitution(institution: Institution): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'admin_global';
}
}