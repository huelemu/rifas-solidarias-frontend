// src/app/institutions/components/institution-list.component.ts - CORREGIDO

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
  INSTITUTION_STATUSES,
  CreateInstitutionRequest,
  UpdateInstitutionRequest
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
  readonly showCreateModal = signal<boolean>(false);
  readonly showEditModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);
  readonly showDetailModal = signal<boolean>(false);

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

  // Formulario signals
  readonly formData = signal<CreateInstitutionRequest>({
    nombre: '',
    descripcion: '',
    tipo: 'club',
    contacto_email: '',
    contacto_telefono: '',
    contacto_whatsapp: '',
    sitio_web: '',
    direccion: '',
    cuit_cuil: '',
    estado: 'activa',
    observaciones: ''
  });

  readonly editFormData = signal<UpdateInstitutionRequest>({});
  readonly formErrors = signal<any>({});
  readonly submitting = signal<boolean>(false);

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
          institution.contacto_email.toLowerCase().includes(search);
        
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

  /**
   * Abre modal para crear institución
   */
  openCreateModal(): void {
    this.resetForm();
    this.showCreateModal.set(true);
  }

  /**
   * Abre modal para editar institución
   */
  openEditModal(institution: Institution): void {
    this.selectedInstitution.set(institution);
    this.editFormData.set({
      nombre: institution.nombre,
      descripcion: institution.descripcion || '',
      tipo: institution.tipo,
      contacto_email: institution.contacto_email,
      contacto_telefono: institution.contacto_telefono || '',
      contacto_whatsapp: institution.contacto_whatsapp || '',
      sitio_web: institution.sitio_web || '',
      direccion: institution.direccion || '',
      cuit_cuil: institution.cuit_cuil || '',
      estado: institution.estado,
      observaciones: institution.observaciones || ''
    });
    this.showEditModal.set(true);
  }

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
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.showDetailModal.set(false);
    this.selectedInstitution.set(null);
    this.resetForm();
  }

  /**
   * Resetea el formulario
   */
  resetForm(): void {
    this.formData.set({
      nombre: '',
      descripcion: '',
      tipo: 'club',
      contacto_email: '',
      contacto_telefono: '',
      contacto_whatsapp: '',
      sitio_web: '',
      direccion: '',
      cuit_cuil: '',
      estado: 'activa',
      observaciones: ''
    });
    this.editFormData.set({});
    this.formErrors.set({});
  }

  /**
   * Crea una nueva institución
   */
  async createInstitution(): Promise<void> {
    try {
      this.submitting.set(true);
      this.formErrors.set({});

      // Validaciones básicas
      const errors = this.validateForm(this.formData());
      if (Object.keys(errors).length > 0) {
        this.formErrors.set(errors);
        return;
      }

      const newInstitution = await this.institutionService.createInstitution(this.formData()).toPromise();
      
      if (newInstitution) {
        // Agregar a la lista
        this.institutions.update(institutions => [newInstitution, ...institutions]);
        
        // Actualizar estadísticas
        this.loadStats();
        
        // Cerrar modal
        this.closeModals();
        
        console.log('✅ Institución creada exitosamente:', newInstitution);
      }
    } catch (error: any) {
      console.error('❌ Error al crear institución:', error);
      
      if (error.error && error.error.errors) {
        this.formErrors.set(error.error.errors);
      } else {
        this.formErrors.set({ 
          general: error.error?.message || 'Error al crear la institución' 
        });
      }
    } finally {
      this.submitting.set(false);
    }
  }

  /**
   * Actualiza una institución
   */
  async updateInstitution(): Promise<void> {
    const selected = this.selectedInstitution();
    if (!selected) return;

    try {
      this.submitting.set(true);
      this.formErrors.set({});

      // Validaciones básicas
      const errors = this.validateForm(this.editFormData());
      if (Object.keys(errors).length > 0) {
        this.formErrors.set(errors);
        return;
      }

      const updatedInstitution = await this.institutionService.updateInstitution(selected.id, this.editFormData()).toPromise();
      
      if (updatedInstitution) {
        // Actualizar en la lista
        this.institutions.update(institutions =>
          institutions.map(inst => inst.id === selected.id ? updatedInstitution : inst)
        );
        
        // Actualizar estadísticas
        this.loadStats();
        
        // Cerrar modal
        this.closeModals();
        
        console.log('✅ Institución actualizada exitosamente:', updatedInstitution);
      }
    } catch (error: any) {
      console.error('❌ Error al actualizar institución:', error);
      
      if (error.error && error.error.errors) {
        this.formErrors.set(error.error.errors);
      } else {
        this.formErrors.set({ 
          general: error.error?.message || 'Error al actualizar la institución' 
        });
      }
    } finally {
      this.submitting.set(false);
    }
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

  /**
   * Valida el formulario
   */
  private validateForm(formData: CreateInstitutionRequest | UpdateInstitutionRequest): any {
    const errors: any = {};

    // Validar nombre
    if (!formData.nombre || formData.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    if (!formData.contacto_email) {
      errors.contacto_email = 'El email de contacto es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contacto_email)) {
      errors.contacto_email = 'El email no tiene un formato válido';
    }

    // Validar tipo
    if (!formData.tipo) {
      errors.tipo = 'Debe seleccionar un tipo de institución';
    }

    // Validar CUIT/CUIL si se proporciona
    if (formData.cuit_cuil && formData.cuit_cuil.length > 0) {
      if (!/^\d{2}-?\d{8}-?\d{1}$/.test(formData.cuit_cuil)) {
        errors.cuit_cuil = 'El formato de CUIT/CUIL no es válido';
      }
    }

    // Validar URL del sitio web si se proporciona
    if (formData.sitio_web && formData.sitio_web.length > 0) {
      try {
        new URL(formData.sitio_web);
      } catch {
        errors.sitio_web = 'La URL del sitio web no es válida';
      }
    }

    return errors;
  }

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
   * Navega al detalle de una institución
   */
  goToInstitutionDetail(institution: Institution): void {
    this.router.navigate(['/instituciones', institution.id]);
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