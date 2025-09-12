// =====================================================
// FIXES PARA ERRORES TYPESCRIPT - RIFAS COMPONENT
// src/app/components/rifas/rifas.component.ts
// =====================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RifasService, Rifa } from '../../services/rifas.service';
import { AuthService } from '../../services/auth.service';
import { InstitucionesService } from '../../services/instituciones.service';

@Component({
  selector: 'app-rifas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './rifas.component.html',
  styleUrls: ['./rifas.component.css']
})
export class RifasComponent implements OnInit, OnDestroy {
  
  // =====================================================
  // PROPIEDADES DEL COMPONENTE
  // =====================================================
  
  rifas: Rifa[] = [];
  rifasFiltradas: Rifa[] = [];
  instituciones: any[] = [];
  currentUser: any;
  
  // Estados de UI
  loading = false;
  error: string | null = null;
  mostrarFormulario = false;
  modoEdicion = false;
  rifaSeleccionada: Rifa | null = null;
  
  // Filtros
  filtroEstado = '';
  filtroInstitucion = '';
  filtroTexto = '';
  
  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalElementos = 0;
  totalPaginas = 0;
  
  // Formulario - DEFINIR COMO NON-NULL
  rifaForm!: FormGroup; // ← Usar ! para indicar que se inicializará
  
  // Estadísticas
  estadisticas = {
    total: 0,
    activas: 0,
    finalizadas: 0,
    totalRecaudado: 0,
    promedioVenta: 0
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private rifasService: RifasService,
    private authService: AuthService,
    private institucionesService: InstitucionesService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Inicializar formulario en constructor
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
  // INICIALIZACIÓN - MÉTODOS SEGUROS
  // =====================================================

  private inicializarFormulario(): void {
    this.rifaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      cantidad_numeros: [100, [Validators.required, Validators.min(1), Validators.max(10000)]],
      precio_numero: [100, [Validators.required, Validators.min(0.01)]],
      fecha_inicio: [this.obtenerFechaHoy(), Validators.required],
      fecha_fin: [this.obtenerFechaEnDias(30), Validators.required],
      fecha_sorteo: [''],
      max_instituciones_participantes: [5, [Validators.min(1), Validators.max(20)]],
      comision_promotora: [10, [Validators.required, Validators.min(0), Validators.max(50)]],
      requiere_aprobacion: [true],
      numeros_por_institucion: [20, [Validators.min(1)]]
    });
  }

  private cargarDatos(): void {
    this.loading = true;
    this.error = null;

    // Cargar rifas
    this.rifasService.listarRifas({
      page: this.paginaActual,
      limit: this.elementosPorPagina
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.rifas = data.rifas;
        this.aplicarFiltros();
        this.calcularEstadisticas();
        this.actualizarPaginacion(data.pagination);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las rifas';
        this.loading = false;
        console.error('Error:', error);
      }
    });

    // Cargar instituciones si es admin global
    if (this.currentUser?.rol === 'admin_global') {
      this.institucionesService.listarInstituciones().subscribe({
        next: (instituciones) => {
          this.instituciones = instituciones;
        }
      });
    }
  }

  // =====================================================
  // GESTIÓN DE RIFAS - MÉTODOS SEGUROS
  // =====================================================

  crearRifa(): void {
    // Verificar que el formulario existe y es válido
    if (!this.rifaForm) {
      this.mostrarMensaje('Error: Formulario no inicializado', 'error');
      return;
    }

    if (this.rifaForm.valid) {
      this.loading = true;
      
      const rifaData = this.rifaForm.value;
      
      this.rifasService.crearRifa(rifaData).subscribe({
        next: (response) => {
          this.mostrarFormulario = false;
          this.resetearFormulario(); // Método seguro
          this.cargarDatos();
          this.mostrarMensaje('Rifa creada exitosamente', 'success');
        },
        error: (error) => {
          this.loading = false;
          this.mostrarMensaje('Error al crear la rifa', 'error');
          console.error('Error:', error);
        }
      });
    } else {
      this.marcarCamposComoTocados();
    }
  }

  editarRifa(rifa: Rifa): void {
    if (!this.rifaForm) {
      this.inicializarFormulario();
    }

    this.modoEdicion = true;
    this.rifaSeleccionada = rifa;
    this.mostrarFormulario = true;
    
    this.rifaForm.patchValue({
      nombre: rifa.nombre,
      descripcion: rifa.descripcion,
      cantidad_numeros: rifa.cantidad_numeros,
      precio_numero: rifa.precio_numero,
      fecha_inicio: this.formatearFechaParaInput(rifa.fecha_inicio),
      fecha_fin: this.formatearFechaParaInput(rifa.fecha_fin),
      fecha_sorteo: rifa.fecha_sorteo ? this.formatearFechaParaInput(rifa.fecha_sorteo) : '',
      max_instituciones_participantes: rifa.max_instituciones_participantes,
      comision_promotora: rifa.comision_promotora,
      requiere_aprobacion: rifa.requiere_aprobacion
    });
  }

  actualizarRifa(): void {
    if (!this.rifaForm || !this.rifaSeleccionada) {
      this.mostrarMensaje('Error: Datos incompletos', 'error');
      return;
    }

    if (this.rifaForm.valid) {
      this.loading = true;
      
      this.rifasService.actualizarRifa(this.rifaSeleccionada.id, this.rifaForm.value).subscribe({
        next: () => {
          this.cancelarEdicion();
          this.cargarDatos();
          this.mostrarMensaje('Rifa actualizada exitosamente', 'success');
        },
        error: (error) => {
          this.loading = false;
          this.mostrarMensaje('Error al actualizar la rifa', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  cambiarEstadoRifa(rifa: Rifa, nuevoEstado: string): void {
    if (confirm(`¿Estás seguro de cambiar el estado de la rifa a "${nuevoEstado}"?`)) {
      this.rifasService.cambiarEstadoRifa(rifa.id, nuevoEstado).subscribe({
        next: () => {
          this.cargarDatos();
          this.mostrarMensaje(`Estado cambiado a ${nuevoEstado}`, 'success');
        },
        error: (error) => {
          this.mostrarMensaje('Error al cambiar el estado', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  // =====================================================
  // NAVEGACIÓN Y ACCIONES
  // =====================================================

  verDetalleRifa(rifa: Rifa): void {
    this.router.navigate(['/rifas', rifa.id]);
  }

  gestionarParticipaciones(rifa: Rifa): void {
    this.router.navigate(['/rifas', rifa.id, 'participaciones']);
  }

  gestionarNumeros(rifa: Rifa): void {
    this.router.navigate(['/rifas', rifa.id, 'numeros']);
  }

  verReportes(rifa: Rifa): void {
    this.router.navigate(['/rifas', rifa.id, 'reportes']);
  }

  // =====================================================
  // FILTROS Y BÚSQUEDA
  // =====================================================

  aplicarFiltros(): void {
    this.rifasFiltradas = this.rifas.filter(rifa => {
      const pasaEstado = !this.filtroEstado || rifa.estado === this.filtroEstado;
      const pasaInstitucion = !this.filtroInstitucion || 
                             rifa.institucion_promotora_id?.toString() === this.filtroInstitucion;
      const pasaTexto = !this.filtroTexto || 
                       rifa.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
                       (rifa.descripcion?.toLowerCase().includes(this.filtroTexto.toLowerCase()));
      
      return pasaEstado && pasaInstitucion && pasaTexto;
    });
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroInstitucion = '';
    this.filtroTexto = '';
    this.aplicarFiltros();
  }

  // =====================================================
  // PAGINACIÓN
  // =====================================================

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      this.cargarDatos();
    }
  }

  private actualizarPaginacion(pagination: any): void {
    this.totalElementos = pagination.total;
    this.totalPaginas = pagination.totalPages;
    this.paginaActual = pagination.page;
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
    this.estadisticas = this.rifasService.calcularEstadisticas(this.rifas);
  }

  // =====================================================
  // FORMULARIO Y VALIDACIONES - MÉTODOS SEGUROS
  // =====================================================

  private marcarCamposComoTocados(): void {
    if (!this.rifaForm) return;
    
    Object.keys(this.rifaForm.controls).forEach(key => {
      this.rifaForm.get(key)?.markAsTouched();
    });
  }

  obtenerErrorCampo(campo: string): string {
    if (!this.rifaForm) return '';
    
    const control = this.rifaForm.get(campo);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return `${this.getNombreCampo(campo)} es requerido`;
      if (control.errors['minlength']) return `${this.getNombreCampo(campo)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['min']) return `${this.getNombreCampo(campo)} debe ser mayor a ${control.errors['min'].min}`;
      if (control.errors['max']) return `${this.getNombreCampo(campo)} debe ser menor a ${control.errors['max'].max}`;
    }
    return '';
  }

  private getNombreCampo(campo: string): string {
    const nombres: { [key: string]: string } = {
      'nombre': 'El nombre',
      'cantidad_numeros': 'La cantidad de números',
      'precio_numero': 'El precio por número',
      'fecha_inicio': 'La fecha de inicio',
      'fecha_fin': 'La fecha de fin',
      'comision_promotora': 'La comisión promotora'
    };
    return nombres[campo] || campo;
  }

  // MÉTODO SEGURO PARA RESETEAR FORMULARIO
  private resetearFormulario(): void {
    if (this.rifaForm) {
      this.rifaForm.reset();
      this.inicializarFormulario(); // Reinicializar con valores por defecto
    }
  }

  cancelarEdicion(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.rifaSeleccionada = null;
    this.resetearFormulario(); // Usar método seguro
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  private obtenerFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private obtenerFechaEnDias(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
  }

  private formatearFechaParaInput(fecha: string): string {
    return new Date(fecha).toISOString().split('T')[0];
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    // Implementar sistema de notificaciones
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);
    // Aquí podrías usar un servicio de notificaciones como ngx-toastr
  }

  // =====================================================
  // MÉTODOS DE VERIFICACIÓN DE PERMISOS
  // =====================================================

  puedeCrearRifas(): boolean {
    return this.currentUser?.rol === 'admin_global' || 
           this.currentUser?.rol === 'admin_institucion';
  }

  puedeEditarRifa(rifa: Rifa): boolean {
    if (this.currentUser?.rol === 'admin_global') return true;
    if (this.currentUser?.rol === 'admin_institucion') {
      return rifa.institucion_promotora_id === this.currentUser.institucion_id;
    }
    return false;
  }

  puedeGestionarParticipaciones(rifa: Rifa): boolean {
    return this.puedeEditarRifa(rifa);
  }

  puedeVerReportes(rifa: Rifa): boolean {
    if (this.currentUser?.rol === 'admin_global') return true;
    if (this.currentUser?.rol === 'admin_institucion') {
      return rifa.institucion_promotora_id === this.currentUser.institucion_id;
    }
    return false;
  }

  // =====================================================
  // MÉTODOS PARA OBTENER CLASES CSS
  // =====================================================

  obtenerClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'borrador': 'badge-secondary',
      'activa': 'badge-success',
      'finalizada': 'badge-primary',
      'cancelada': 'badge-danger'
    };
    return `badge ${clases[estado] || 'badge-light'}`;
  }

  obtenerClasePorcentaje(porcentaje: number): string {
    if (porcentaje >= 80) return 'text-success';
    if (porcentaje >= 50) return 'text-warning';
    return 'text-danger';
  }

  // =====================================================
  // MÉTODOS PARA ACCIONES MASIVAS
  // =====================================================

  rifasSeleccionadasIds: number[] = [];

  toggleSeleccionRifa(rifaId: number): void {
    const index = this.rifasSeleccionadasIds.indexOf(rifaId);
    if (index > -1) {
      this.rifasSeleccionadasIds.splice(index, 1);
    } else {
      this.rifasSeleccionadasIds.push(rifaId);
    }
  }

  seleccionarTodasRifas(): void {
    if (this.rifasSeleccionadasIds.length === this.rifasFiltradas.length) {
      this.rifasSeleccionadasIds = [];
    } else {
      this.rifasSeleccionadasIds = this.rifasFiltradas.map(r => r.id);
    }
  }

  aplicarAccionMasiva(accion: string): void {
    if (this.rifasSeleccionadasIds.length === 0) {
      this.mostrarMensaje('Selecciona al menos una rifa', 'error');
      return;
    }

    if (confirm(`¿Aplicar "${accion}" a ${this.rifasSeleccionadasIds.length} rifas seleccionadas?`)) {
      // Implementar acciones masivas según necesidad
      console.log(`Aplicando ${accion} a rifas:`, this.rifasSeleccionadasIds);
    }
  }

  // =====================================================
  // EXPORTACIÓN
  // =====================================================

  exportarRifas(formato: 'csv' | 'excel' = 'csv'): void {
    // Implementar exportación de lista de rifas
    console.log(`Exportando rifas en formato ${formato}`);
  }

  // =====================================================
  // MÉTODO AUXILIAR PARA ACCESO SEGURO AL FORMULARIO
  // =====================================================

  // Getter seguro para acceder a controles del formulario
  get formControls() {
    return this.rifaForm?.controls || {};
  }

  // Método para verificar si el formulario está inicializado
  get formularioListo(): boolean {
    return !!this.rifaForm;
  }
}