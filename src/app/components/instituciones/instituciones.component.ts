import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface Institucion {
  id: number;
  nombre: string;
  descripcion: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado: 'activa' | 'inactiva';
  fecha_creacion: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Component({
  selector: 'app-instituciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './instituciones.component.html',
  styleUrls: ['./instituciones.component.scss']
})
export class InstitucionesComponent implements OnInit {
  instituciones: Institucion[] = [];
  institucionesOriginales: Institucion[] = [];
  isLoading = false;
  error = '';
  success = '';
  
  // Búsqueda y filtros
  searchTerm = '';
  filtroEstado = '';
  
  // Paginación
  paginaActual = 1;
  institucionesPorPagina = 10;
  totalPaginas = 1;
  institucionesPaginadas: Institucion[] = [];
  
  // Modal
  mostrarModal = false;
  mostrarFormulario = false;
  modoEdicion = false;
  institucionForm: FormGroup;
  institucionEditando: Institucion | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.institucionForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      direccion: [''],
      telefono: [''],
      email: ['', [Validators.email]],
      estado: ['activa', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarInstituciones();
  }

  cargarInstituciones(): void {
    this.isLoading = true;
    this.error = '';

    this.http.get<ApiResponse<Institucion[]>>(`${this.authService.API_BASE_URL}/instituciones`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.instituciones = response.data;
            this.institucionesOriginales = [...response.data];
            this.paginaActual = 1;
            this.actualizarPaginacion();
          } else {
            this.error = response.message || 'Error al cargar instituciones';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.error = 'Error de conexión al cargar instituciones';
          this.isLoading = false;
        }
      });
  }

  // Búsqueda y filtros
  onSearchChange(): void {
    this.filtrarInstituciones();
  }

  filtrarInstituciones(): void {
    let resultado = [...this.institucionesOriginales];

    // Filtrar por búsqueda
    if (this.searchTerm) {
      const termino = this.searchTerm.toLowerCase();
      resultado = resultado.filter(inst => 
        inst.nombre.toLowerCase().includes(termino) ||
        inst.descripcion.toLowerCase().includes(termino)
      );
    }

    // Filtrar por estado
    if (this.filtroEstado) {
      resultado = resultado.filter(inst => inst.estado === this.filtroEstado);
    }

    this.instituciones = resultado;
    this.paginaActual = 1; // Resetear a la primera página
    this.actualizarPaginacion();
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.instituciones = [...this.institucionesOriginales];
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }

  limpiarMensajes(): void {
    this.error = '';
    this.success = '';
  }

  // Modal y formulario
  abrirModal(modo: 'crear' | 'editar' = 'crear', institucion?: Institucion): void {
    this.modoEdicion = modo === 'editar';
    this.mostrarModal = true;
    this.mostrarFormulario = true;
    this.error = '';
    this.success = '';

    if (this.modoEdicion && institucion) {
      this.institucionEditando = institucion;
      this.institucionForm.patchValue({
        nombre: institucion.nombre,
        descripcion: institucion.descripcion,
        direccion: institucion.direccion || '',
        telefono: institucion.telefono || '',
        email: institucion.email || '',
        estado: institucion.estado
      });
    } else {
      this.institucionEditando = null;
      this.institucionForm.reset();
      this.institucionForm.patchValue({ estado: 'activa' });
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.institucionEditando = null;
    this.institucionForm.reset();
  }

  cerrarModalConConfirmacion(): void {
    if (this.institucionForm.dirty) {
      if (confirm('¿Estás seguro de cerrar? Se perderán los cambios no guardados.')) {
        this.cerrarModal();
      }
    } else {
      this.cerrarModal();
    }
  }

  // CRUD Operations
  onSubmit(): void {
    if (this.institucionForm.valid) {
      if (this.modoEdicion) {
        this.actualizarInstitucion();
      } else {
        this.crearInstitucion();
      }
    } else {
      this.marcarCamposComoTocados();
    }
  }

  crearInstitucion(): void {
    this.isLoading = true;
    const datosInstitucion = this.institucionForm.value;

    this.http.post<ApiResponse<Institucion>>(`${this.authService.API_BASE_URL}/instituciones`, datosInstitucion)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Institución creada exitosamente';
            this.cargarInstituciones();
            this.cerrarModal();
          } else {
            this.error = response.message || 'Error al crear institución';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.error = 'Error de conexión al crear institución';
          this.isLoading = false;
        }
      });
  }

  actualizarInstitucion(): void {
    if (!this.institucionEditando) return;

    this.isLoading = true;
    const datosInstitucion = this.institucionForm.value;

    this.http.put<ApiResponse<Institucion>>(`${this.authService.API_BASE_URL}/instituciones/${this.institucionEditando.id}`, datosInstitucion)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Institución actualizada exitosamente';
            this.cargarInstituciones();
            this.cerrarModal();
          } else {
            this.error = response.message || 'Error al actualizar institución';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.error = 'Error de conexión al actualizar institución';
          this.isLoading = false;
        }
      });
  }

  eliminarInstitucion(institucion: Institucion): void {
    if (confirm(`¿Estás seguro de eliminar la institución "${institucion.nombre}"?`)) {
      this.isLoading = true;

      this.http.delete<ApiResponse<any>>(`${this.authService.API_BASE_URL}/instituciones/${institucion.id}`)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.success = 'Institución eliminada exitosamente';
              this.cargarInstituciones();
            } else {
              this.error = response.message || 'Error al eliminar institución';
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error:', error);
            this.error = 'Error de conexión al eliminar institución';
            this.isLoading = false;
          }
        });
    }
  }

  // Utilidades
  marcarCamposComoTocados(): void {
    Object.keys(this.institucionForm.controls).forEach(key => {
      const control = this.institucionForm.get(key);
      control?.markAsTouched();
    });
  }

  puedeCrearInstituciones(): boolean {
    return this.authService.hasAnyRole(['admin_global']);
  }

  puedeEditarInstitucion(institucion: Institucion): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    return user.rol === 'admin_global' || 
           (user.rol === 'admin_institucion' && user.institucion_id === institucion.id);
  }

  getTituloModal(): string {
    return this.modoEdicion ? 'Editar Institución' : 'Nueva Institución';
  }

  getBotonTexto(): string {
    return this.modoEdicion ? 'Actualizar' : 'Crear';
  }

  // Getters para validación de formulario
  get nombre() { return this.institucionForm.get('nombre'); }
  get descripcion() { return this.institucionForm.get('descripcion'); }
  get email() { return this.institucionForm.get('email'); }

  // Método para obtener errores de validación
  obtenerErrorCampo(campo: string): string {
    const control = this.institucionForm.get(campo);
    
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getNombreCampo(campo)} es requerido`;
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `${this.getNombreCampo(campo)} debe tener al menos ${requiredLength} caracteres`;
      }
      if (control.errors['email']) {
        return 'Debe ser un email válido';
      }
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
      'estado': 'El estado'
    };
    return nombres[campo] || 'Este campo';
  }

  // Métodos de paginación
  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.instituciones.length / this.institucionesPorPagina);
    this.paginaActual = Math.min(this.paginaActual, this.totalPaginas || 1);
    this.cargarPaginaActual();
  }

  cargarPaginaActual(): void {
    const inicio = (this.paginaActual - 1) * this.institucionesPorPagina;
    const fin = inicio + this.institucionesPorPagina;
    this.institucionesPaginadas = this.instituciones.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarPaginaActual();
    }
  }

  paginaAnterior(): void {
    this.cambiarPagina(this.paginaActual - 1);
  }

  paginaSiguiente(): void {
    this.cambiarPagina(this.paginaActual + 1);
  }

  getPaginasArray(): number[] {
    const paginas: number[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }
}