// src/app/institutions/components/institution-list.component.ts - CON NAVEGACIÓN

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { InstitutionService } from '../services/institution.service';
import {
  Institution,
  InstitutionFilters,
  InstitutionStats,
  INSTITUTION_TYPES,
  INSTITUTION_STATUSES
} from '../models/institution.models';

@Component({
  selector: 'app-institution-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './institution-list.component.html',
  styleUrls: ['./institution-list.component.scss']
})
export class InstitutionListComponent implements OnInit {
  // Servicios
  private readonly authService = inject(AuthService);
  private readonly institutionService = inject(InstitutionService);
  private readonly router = inject(Router);

  // Signals para estado del componente
  readonly institutions = signal<Institution[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly stats = signal<InstitutionStats | null>(null);
  readonly selectedInstitution = signal<Institution | null>(null);
  
  // Solo mantenemos el modal de eliminación (acción destructiva)
  readonly showDeleteModal = signal<boolean>(false);
  readonly showDetailModal = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);

  // Filtros y paginación
  readonly currentFilters = signal<InstitutionFilters>({
    search: '',
    tipo: 'todas',
    estado: 'todas',
    page: 1,
    limit: 10,
    ordenar_por: 'nombre',
    direccion_orden: 'asc'
  });

  readonly pagination = signal<any>(null);

  // Computed properties
  readonly filteredInstitutions = computed(() => {
    const institutions = this.institutions();
    const filters = this.currentFilters();

    if (!institutions) return [];

    return institutions.filter(institution => {
      // Filtro por búsqueda
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch = 
          institution.nombre.toLowerCase().includes(search) ||
          (institution.descripcion && institution.descripcion.toLowerCase().includes(search)) ||
          institution.email.toLowerCase().includes(search);
        
        if (!matchesSearch) return false;
      }

      // Filtro por tipo
      if (filters.tipo && filters.tipo !== 'todas') {
        if (institution.tipo !== filters.tipo) return false;
      }

      // Filtro por estado
      if (filters.estado && filters.estado !== 'todas') {
        if (institution.estado !== filters.estado) return false;
      }

      return true;
    });
  });

  readonly hasInstitutions = computed(() => this.institutions().length > 0);
  readonly hasFilteredResults = computed(() => this.filteredInstitutions().length > 0);

  // Constantes para templates
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

      console.log('✅ Instituciones cargadas:', this.institutions().length);
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
    console.log('🔍 Aplicando filtros:', this.currentFilters());
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
      limit: 10,
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

  /**
   * Cambia ordenamiento
   */
  changeSort(campo: string): void {
    this.currentFilters.update(filters => ({
      ...filters,
      ordenar_por: campo as any,
      direccion_orden: filters.ordenar_por === campo && filters.direccion_orden === 'asc' ? 'desc' : 'asc'
    }));
    this.loadInstitutions();
  }

  // ===================================================
  // MÉTODOS DE NAVEGACIÓN (REEMPLAZAN LOS MODALES)
  // ===================================================

  /**
   * Navega para crear institución
   */
  createInstitution(): void {
    this.router.navigate(['/instituciones/nueva']);
  }

  /**
   * Navega para editar institución
   */
  editInstitution(institution: Institution): void {
    this.router.navigate(['/instituciones', institution.id, 'editar']);
  }

  /**
   * Ver detalles de institución (por ahora redirige a editar)
   */
  viewInstitution(institution: Institution): void {
    this.router.navigate(['/instituciones', institution.id, 'editar']);
  }

  // ===================================================
  // MODALES (SOLO PARA ELIMINACIÓN Y DETALLES)
  // ===================================================

  /**
   * Abre modal para eliminar institución
   */
  openDeleteModal(institution: Institution): void {
    this.selectedInstitution.set(institution);
    this.showDeleteModal.set(true);
  }

  /**
   * Abre modal de detalles
   */
  openDetailModal(institution: Institution): void {
    this.selectedInstitution.set(institution);
    this.showDetailModal.set(true);
  }

  /**
   * Cierra todos los modales
   */
  closeModals(): void {
    this.showDeleteModal.set(false);
    this.showDetailModal.set(false);
    this.selectedInstitution.set(null);
  }

  /**
   * Elimina una institución
   */
  async deleteInstitution(): Promise<void> {
    const selected = this.selectedInstitution();
    if (!selected) return;

    try {
      this.submitting.set(true);

      await this.institutionService.deleteInstitution(selected.id, 'Eliminado desde la interfaz').toPromise();
      
      // Remover de la lista
      this.institutions.update(institutions =>
        institutions.filter(inst => inst.id !== selected.id)
      );
      
      // Actualizar estadísticas
      this.loadStats();
      
      // Cerrar modal
      this.closeModals();
      
      console.log('✅ Institución eliminada exitosamente');
    } catch (error: any) {
      console.error('❌ Error al eliminar institución:', error);
      this.error.set(error.error?.message || 'Error al eliminar la institución');
    } finally {
      this.submitting.set(false);
    }
  }

  /**
   * Cambia el estado de una institución
   */
  async toggleInstitutionStatus(institution: Institution): Promise<void> {
    const nuevoEstado = institution.estado === 'activa' ? 'inactiva' : 'activa';
    
    try {
      const updated = await this.institutionService.updateInstitution(institution.id, { 
        estado: nuevoEstado 
      }).toPromise();
      
      if (updated) {
        // Actualizar en la lista
        this.institutions.update(institutions =>
          institutions.map(inst => inst.id === institution.id ? updated : inst)
        );
        
        // Actualizar estadísticas
        this.loadStats();
        
        console.log(`✅ Estado de institución cambiado a: ${nuevoEstado}`);
      }
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
    }
  }

  // ===================================================
  // PERMISOS
  // ===================================================

  /**
   * Verifica permisos para gestionar instituciones
   */
  canManageInstitutions(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'admin_global';
  }

  /**
   * Verifica si puede editar una institución específica
   */
  canEditInstitution(institution: Institution): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;

    // Admin global puede editar cualquier institución
    if (user.role === 'admin_global') return true;

    // Admin de institución solo puede editar su propia institución
    if (user.role === 'admin_institucion') {
      return user.institucion_id === institution.id;
    }

    return false;
  }

  /**
   * Verifica si puede eliminar una institución
   */
  canDeleteInstitution(institution: Institution): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;

    // Solo admin global puede eliminar instituciones
    return user.role === 'admin_global';
  }

  // ===================================================
  // HELPERS Y UTILIDADES
  // ===================================================

  /**
   * Obtiene el total de instituciones
   */
  getTotalInstitutions(): number {
    return this.stats()?.total || 0;
  }

  /**
   * Obtiene el número de instituciones activas
   */
  getActiveInstitutions(): number {
    return this.stats()?.activas || 0;
  }

  /**
   * Obtiene el número de instituciones por tipo
   */
  getInstitutionsByType(tipo: string): number {
    const stats = this.stats();
    if (!stats) return 0;
    return (stats.por_tipo as any)[tipo] || 0;
  }

  /**
   * Obtiene la clase CSS para la tarjeta de institución
   */
  getInstitutionCardClass(institution: Institution): string {
    switch (institution.estado) {
      case 'inactiva': return 'inactive';
      case 'suspendida': return 'suspended';
      default: return '';
    }
  }

  /**
   * Obtiene la clase CSS para el estado
   */
  getStatusClass(estado: string): string {
    switch (estado) {
      case 'activa': return 'status-active';
      case 'inactiva': return 'status-inactive';
      case 'suspendida': return 'status-suspended';
      default: return '';
    }
  }

  /**
   * Obtiene el ícono para el tipo de institución
   */
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

  /**
   * Navega a la gestión de usuarios de una institución
   */
  goToInstitutionUsers(institution: Institution): void {
    this.router.navigate(['/usuarios'], { 
      queryParams: { institucion_id: institution.id } 
    });
  }

  /**
   * Obtiene la clase CSS para el tipo de institución
   */
  getTypeClass(tipo: string): string {
    switch (tipo) {
      case 'club': return 'type-club';
      case 'fundacion': return 'type-fundacion';
      case 'ong': return 'type-ong';
      case 'cooperativa': return 'type-cooperativa';
      case 'escuela': return 'type-escuela';
      default: return 'type-otro';
    }
  }

  /**
   * Obtiene la etiqueta legible para el tipo
   */
  getTypeLabel(tipo: string): string {
    switch (tipo) {
      case 'club': return 'Club';
      case 'fundacion': return 'Fundación';
      case 'ong': return 'ONG';
      case 'cooperativa': return 'Cooperativa';
      case 'escuela': return 'Escuela';
      default: return 'Otro';
    }
  }

  /**
   * Obtiene la etiqueta legible para el estado
   */
  getStatusLabel(estado: string): string {
    switch (estado) {
      case 'activa': return 'ACT';
      case 'inactiva': return 'INA';
      case 'suspendida': return 'SUS';
      default: return 'N/A';
    }
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }

  /**
   * Navega de vuelta al dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: any): void {
    event.target.src = '/assets/images/institution-placeholder.png';
  }
}