
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstitucionService, Institucion, InstitucionInput } from '../../services/institucion.service';

@Component({
  selector: 'app-instituciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './instituciones.component.html',
  styleUrls: ['./instituciones.component.css']
})
export class InstitucionesComponent implements OnInit {
  instituciones: Institucion[] = [];
  loading = false;
  error = '';
  success = '';
  
  // Modal controls
  showModal = false;
  modalMode: 'create' | 'edit' | 'view' = 'create';
  selectedInstitucion: Institucion | null = null;
  
  // Form
  institucionForm: FormGroup;
  
  // Filtros
  filtroEstado = '';
  searchTerm = '';

  estados = [
    { value: 'activa', label: 'Activa' },
    { value: 'inactiva', label: 'Inactiva' }
  ];

  constructor(
    private institucionService: InstitucionService,
    private fb: FormBuilder
  ) {
    this.institucionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      direccion: [''],
      telefono: [''],
      email: ['', [Validators.required, Validators.email]],
      logo_url: [''],
      estado: ['activa']
    });
  }

  ngOnInit() {
    this.cargarInstituciones();
  }

  cargarInstituciones() {
    console.log('🏢 Cargando instituciones...');
    this.loading = true;
    this.error = '';
    
    this.institucionService.obtenerInstituciones().subscribe({
      next: (response) => {
        console.log('✅ Respuesta instituciones:', response);
        if (response.status === 'success' && response.data) {
          this.instituciones = response.data;
          console.log('📊 Instituciones cargadas:', this.instituciones.length);
        } else {
          console.log('⚠️ Respuesta sin datos:', response);
          this.error = 'No se encontraron instituciones';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando instituciones:', error);
        this.error = `Error al cargar instituciones: ${error.message || 'Error desconocido'}`;
        this.loading = false;
      }
    });
  }

  // ✅ FUNCIÓN CORREGIDA - MANEJA PROPIEDADES OPCIONALES
  get institucionesFiltradas() {
    return this.instituciones.filter(institucion => {
      // Filtro por estado
      const pasaFiltroEstado = !this.filtroEstado || institucion.estado === this.filtroEstado;
      
      // Filtro por búsqueda - ✅ USANDO OPTIONAL CHAINING
      const searchLower = this.searchTerm.toLowerCase();
      const pasaBusqueda = !this.searchTerm || 
        institucion.nombre?.toLowerCase().includes(searchLower) ||
        institucion.email?.toLowerCase().includes(searchLower) ||
        institucion.descripcion?.toLowerCase().includes(searchLower) ||
        institucion.direccion?.toLowerCase().includes(searchLower);
      
      return pasaFiltroEstado && pasaBusqueda;
    });
  }

  // Modal functions
  abrirModal(mode: 'create' | 'edit' | 'view', institucion?: Institucion) {
    this.modalMode = mode;
    this.selectedInstitucion = institucion || null;
    this.showModal = true;
    
    if (mode === 'edit' && institucion) {
      this.institucionForm.patchValue({
        nombre: institucion.nombre,
        descripcion: institucion.descripcion || '',
        direccion: institucion.direccion || '',
        telefono: institucion.telefono || '',
        email: institucion.email || '',
        logo_url: institucion.logo_url || '',
        estado: institucion.estado
      });
    } else if (mode === 'create') {
      this.institucionForm.reset();
      this.institucionForm.patchValue({ estado: 'activa' });
    }
  }

  cerrarModal() {
    this.showModal = false;
    this.selectedInstitucion = null;
    this.institucionForm.reset();
    this.error = '';
    this.success = '';
  }

  guardarInstitucion() {
    if (!this.institucionForm.valid) {
      this.error = 'Por favor, corrige los errores en el formulario';
      return;
    }

    const formData = this.institucionForm.value;
    this.loading = true;
    this.error = '';

    if (this.modalMode === 'create') {
      this.institucionService.crearInstitucion(formData).subscribe({
        next: (response) => {
          console.log('✅ Institución creada:', response);
          if (response.status === 'success') {
            this.success = 'Institución creada exitosamente';
            this.cargarInstituciones();
            this.cerrarModal();
          } else {
            this.error = response.message || 'Error al crear institución';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error creando institución:', error);
          this.error = `Error al crear institución: ${error.message || 'Error desconocido'}`;
          this.loading = false;
        }
      });
    } else if (this.modalMode === 'edit' && this.selectedInstitucion) {
      this.institucionService.actualizarInstitucion(this.selectedInstitucion.id, formData).subscribe({
        next: (response) => {
          console.log('✅ Institución actualizada:', response);
          if (response.status === 'success') {
            this.success = 'Institución actualizada exitosamente';
            this.cargarInstituciones();
            this.cerrarModal();
          } else {
            this.error = response.message || 'Error al actualizar institución';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error actualizando institución:', error);
          this.error = `Error al actualizar institución: ${error.message || 'Error desconocido'}`;
          this.loading = false;
        }
      });
    }
  }

  // ✅ FUNCIÓN CORREGIDA PARA ELIMINAR
  eliminarInstitucion(institucion: Institucion) {
    const nombreInstitucion = institucion.nombre || 'esta institución';
    if (!confirm(`¿Estás seguro de que deseas eliminar "${nombreInstitucion}"?`)) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.institucionService.eliminarInstitucion(institucion.id).subscribe({
      next: (response) => {
        console.log('✅ Institución eliminada:', response);
        if (response.status === 'success') {
          this.success = 'Institución eliminada exitosamente';
          this.cargarInstituciones();
        } else {
          this.error = response.message || 'Error al eliminar institución';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error eliminando institución:', error);
        this.error = `Error al eliminar institución: ${error.message || 'Error desconocido'}`;
        this.loading = false;
      }
    });
  }



  // Utility functions
  limpiarMensajes() {
    this.error = '';
    this.success = '';
  }

  // ✅ HELPERS SEGUROS PARA EL TEMPLATE
  getInstitucionEmail(institucion: Institucion): string {
    return institucion.email || 'Sin email';
  }

  getInstitucionDescripcion(institucion: Institucion): string {
    return institucion.descripcion || 'Sin descripción';
  }

  getInstitucionTelefono(institucion: Institucion): string {
    return institucion.telefono || 'Sin teléfono';
  }

  getInstitucionDireccion(institucion: Institucion): string {
    return institucion.direccion || 'Sin dirección';
  }
   getEstadoLabel(estado: string): string {
    const estadoObj = this.estados.find(e => e.value === estado);
    return estadoObj?.label || estado;
  }
  
}