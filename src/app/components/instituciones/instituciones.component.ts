// =====================================================
// COMPONENTE INSTITUCIONES CORREGIDO
// src/app/components/instituciones/instituciones.component.ts
// =====================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// ✅ IMPORTS CORREGIDOS
import { InstitucionesService, Institucion } from '../../services/instituciones.service';
import { AuthService } from '../../services/auth.service';

// =====================================================
// INTERFACES ADICIONALES
// =====================================================

// Interface para crear/editar instituciones
export interface InstitucionInput {
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  cuit?: string;
  estado?: 'activa' | 'inactiva';
}

// Interface para errores HTTP
interface HttpError {
  message?: string;
  error?: any;
  status?: number;
}

// =====================================================
// COMPONENTE INSTITUCIONES
// =====================================================

@Component({
  selector: 'app-instituciones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './instituciones.component.html',
  styleUrls: ['./instituciones.component.css']
})
export class InstitucionesComponent implements OnInit, OnDestroy {
  
  // =====================================================
  // PROPIEDADES DEL COMPONENTE
  // =====================================================
  
  instituciones: Institucion[] = [];
  institucionesFiltradas: Institucion[] = [];
  currentUser: any;
  
  // Estados de UI
  loading = false;
  error: string | null = null;
  mostrarFormulario = false;
  modoEdicion = false;
  institucionSeleccionada: Institucion | null = null;
  
  // Filtros
  filtroEstado = '';
  filtroTexto = '';
  
  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalElementos = 0;
  totalPaginas = 0;
  
  // Formulario
  institucionForm!: FormGroup;
  
  // Estadísticas
  estadisticas = {
    total: 0,
    activas: 0,
    inactivas: 0,
    totalUsuarios: 0
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private institucionesService: InstitucionesService, // ✅ Nombre corregido
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  private inicializarFormulario(): void {
    this.institucionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      direccion: [''],
      telefono: [''],
      email: ['', [Validators.email]],
      logo_url: [''],
      cuit: [''],
      estado: ['activa', Validators.required]
    });
  }

  private cargarDatos(): void {
    this.loading = true;
    this.error = null;

    this.institucionesService.listarInstituciones().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (instituciones: Institucion[]) => {
        this.instituciones = instituciones;
        this.aplicarFiltros();
        this.calcularEstadisticas();
        this.actualizarPaginacion();
        this.loading = false;
      },
      error: (error: HttpError) => {
        this.error = 'Error al cargar las instituciones';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  // =====================================================
  // GESTIÓN DE INSTITUCIONES
  // =====================================================

  crearInstitucion(): void {
    if (!this.institucionForm || !this.institucionForm.valid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.loading = true;
    const institucionData: InstitucionInput = this.institucionForm.value;
    
    this.institucionesService.crearInstitucion(institucionData).subscribe({
      next: (response: any) => {
        this.mostrarFormulario = false;
        this.resetearFormulario();
        this.cargarDatos();
        this.mostrarMensaje('Institución creada exitosamente', 'success');
      },
      error: (error: HttpError) => {
        this.loading = false;
        this.mostrarMensaje('Error al crear la institución', 'error');
        console.error('Error:', error);
      }
    });
  }

  editarInstitucion(institucion: Institucion): void {
    if (!this.institucionForm) {
      this.inicializarFormulario();
    }

    this.modoEdicion = true;
    this.institucionSeleccionada = institucion;
    this.mostrarFormulario = true;
    
    this.institucionForm.patchValue({
      nombre: institucion.nombre,
      descripcion: institucion.descripcion,
      direccion: institucion.direccion,
      telefono: institucion.telefono,
      email: institucion.email,
      logo_url: institucion.logo_url,
      cuit: institucion.cuit,
      estado: institucion.estado
    });
  }

  actualizarInstitucion(): void {
    if (!this.institucionForm || !this.institucionSeleccionada || !this.institucionForm.valid) {
      this.mostrarMensaje('Error: Datos incompletos', 'error');
      return;
    }

    this.loading = true;
    const institucionData: InstitucionInput = this.institucionForm.value;
    
    this.institucionesService.actualizarInstitucion(this.institucionSeleccionada.id, institucionData).subscribe({
      next: () => {
        this.cancelarEdicion();
        this.cargarDatos();
        this.mostrarMensaje('Institución actualizada exitosamente', 'success');
      },
      error: (error: HttpError) => {
        this.loading = false;
        this.mostrarMensaje('Error al actualizar la institución', 'error');
        console.error('Error:', error);
      }
    });
  }

  cambiarEstadoInstitucion(institucion: Institucion, nuevoEstado: 'activa' | 'inactiva'): void {
    if (confirm(`¿Estás seguro de cambiar el estado de la institución a "${nuevoEstado}"?`)) {
      this.institucionesService.cambiarEstado(institucion.id, nuevoEstado).subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrarMensaje(`Estado cambiado a ${nuevoEstado}`, 'success');
        },
        error: (error: HttpError) => {
          this.mostrarMensaje('Error al cambiar el estado', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  eliminarInstitucion(institucion: Institucion): void {
    if (confirm(`¿Estás seguro de eliminar la institución "${institucion.nombre}"?`)) {
      this.institucionesService.eliminarInstitucion(institucion.id).subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrarMensaje('Institución eliminada exitosamente', 'success');
        },
        error: (error: HttpError) => {
          this.mostrarMensaje('Error al eliminar la institución', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  // =====================================================
  // FILTROS Y BÚSQUEDA
  // =====================================================

  aplicarFiltros(): void {
    this.institucionesFiltradas = this.instituciones.filter(institucion => {
      const pasaEstado = !this.filtroEstado || institucion.estado === this.filtroEstado;
      const pasaTexto = !this.filtroTexto || 
                       institucion.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
                       (institucion.descripcion?.toLowerCase().includes(this.filtroTexto.toLowerCase()));
      
      return pasaEstado && pasaTexto;
    });
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroTexto = '';
    this.aplicarFiltros();
  }

  // =====================================================
  // PAGINACIÓN
  // =====================================================

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  private actualizarPaginacion(): void {
    this.totalElementos = this.institucionesFiltradas.length;
    this.totalPaginas = Math.ceil(this.totalElementos / this.elementosPorPagina);
  }

  get institucionesPaginadas(): Institucion[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.institucionesFiltradas.slice(inicio, fin);
  }

  get paginasArray(): number[] {
    const paginas = [];
    const maxPaginas = 5;
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    
    if (fin - inicio < maxPaginas - 1) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  private calcularEstadisticas(): void {
    this.estadisticas = {
      total: this.instituciones.length,
      activas: this.instituciones.filter(i => i.estado === 'activa').length,
      inactivas: this.instituciones.filter(i => i.estado === 'inactiva').length,
      totalUsuarios: 0 // Se calcularía con datos adicionales
    };
  }

  // =====================================================
  // FORMULARIO Y VALIDACIONES
  // =====================================================

  private marcarCamposComoTocados(): void {
    if (!this.institucionForm) return;
    
    Object.keys(this.institucionForm.controls).forEach(key => {
      this.institucionForm.get(key)?.markAsTouched();
    });
  }

  obtenerErrorCampo(campo: string): string {
    if (!this.institucionForm) return '';
    
    const control = this.institucionForm.get(campo);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${this.getNombreCampo(campo)} es requerido`;
      if (control.errors['minlength']) return `${this.getNombreCampo(campo)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['email']) return 'Email inválido';
    }
    return '';
  }

  private getNombreCampo(campo: string): string {
    const nombres: { [key: string]: string } = {
      'nombre': 'El nombre',
      'descripcion': 'La descripción',
      'direccion': 'La dirección',
      'telefono': 'El teléfono',
      'email': 'El email',
      'cuit': 'El CUIT'
    };
    return nombres[campo] || campo;
  }

  private resetearFormulario(): void {
    if (this.institucionForm) {
      this.institucionForm.reset();
      this.inicializarFormulario();
    }
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.institucionSeleccionada = null;
    this.resetearFormulario();
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    // Implementar sistema de notificaciones
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);
  }

  // =====================================================
  // MÉTODOS DE VERIFICACIÓN DE PERMISOS
  // =====================================================

  puedeCrearInstituciones(): boolean {
    return this.currentUser?.rol === 'admin_global';
  }

  puedeEditarInstitucion(institucion: Institucion): boolean {
    return this.currentUser?.rol === 'admin_global';
  }

  puedeEliminarInstitucion(institucion: Institucion): boolean {
    return this.currentUser?.rol === 'admin_global';
  }

  // =====================================================
  // MÉTODOS PARA OBTENER CLASES CSS
  // =====================================================

  obtenerClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'activa': 'badge-success',
      'inactiva': 'badge-secondary'
    };
    return `badge ${clases[estado] || 'badge-light'}`;
  }

  // =====================================================
  // EXPORTACIÓN
  // =====================================================

  exportarInstituciones(formato: 'csv' | 'excel' = 'csv'): void {
    // Implementar exportación
    console.log(`Exportando instituciones en formato ${formato}`);
  }

  // =====================================================
  // MÉTODOS AUXILIARES
  // =====================================================

  get formularioListo(): boolean {
    return !!this.institucionForm;
  }

  get formControls() {
    return this.institucionForm?.controls || {};
  }
}