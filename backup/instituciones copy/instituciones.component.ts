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
  
  // Estados
  loading = false;
  errorMsg = '';
  successMsg = '';
  
  // Filtros
  searchTerm = '';
  filtroEstado = '';
  
  // Paginación
  paginaActual = 1;
  institucionesPorPagina = 10;
  totalPaginas = 1;
  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }
  institucionesPaginadas: Institucion[] = [];
  
  // Formulario / Modal
  mostrarModal = false;
  modoEdicion = false;
  institucionForm: FormGroup;
  institucionEditando: Institucion | null = null;
  formularioListo = false;
  
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
    
    // Actualizar formularioListo al cambiar
    this.institucionForm.valueChanges.subscribe(() => {
      this.formularioListo = this.institucionForm.valid;
    });
  }
  
  private cargarInstituciones(): void {
    this.loading = true;
    this.errorMsg = '';
    this.http.get<ApiResponse<Institucion[]>>(`${this.authService.API_BASE_URL}/instituciones`)
      .subscribe({
        next: resp => {
          if (resp.success) {
            this.instituciones = resp.data;
            this.institucionesOriginales = [...resp.data];
            this.paginaActual = 1;
            this.actualizarPaginacion();
          } else {
            this.errorMsg = resp.message || 'Error al cargar instituciones';
          }
          this.loading = false;
        },
        error: err => {
          console.error('Error al cargar instituciones:', err);
          this.errorMsg = 'Error de conexión';
          this.loading = false;
        }
      });
  }
  
  aplicarFiltros(): void {
    let resultado = [...this.institucionesOriginales];
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      resultado = resultado.filter(inst => 
        inst.nombre.toLowerCase().includes(t) ||
        inst.descripcion.toLowerCase().includes(t)
      );
    }
    if (this.filtroEstado) {
      resultado = resultado.filter(inst => inst.estado === this.filtroEstado);
    }
    this.instituciones = resultado;
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }
  
  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filtroEstado = '';
    this.instituciones = [...this.institucionesOriginales];
    this.paginaActual = 1;
    this.actualizarPaginacion();
  }
  
  cambiarPagina(nro: number): void {
    if (nro >= 1 && nro <= this.totalPaginas) {
      this.paginaActual = nro;
      this.actualizarPaginacion();
    }
  }
  
  private actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(this.instituciones.length / this.institucionesPorPagina) || 1;
    const inicio = (this.paginaActual - 1) * this.institucionesPorPagina;
    const fin = inicio + this.institucionesPorPagina;
    this.institucionesPaginadas = this.instituciones.slice(inicio, fin);
  }
  
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.institucionEditando = null;
    this.institucionForm.reset({ estado: 'activa' });
    this.formularioListo = false;
    this.mostrarModal = true;
  }
  
  abrirModalEditar(inst: Institucion): void {
    this.modoEdicion = true;
    this.institucionEditando = inst;
    this.institucionForm.patchValue({
      nombre: inst.nombre,
      descripcion: inst.descripcion,
      direccion: inst.direccion || '',
      telefono: inst.telefono || '',
      email: inst.email || '',
      estado: inst.estado
    });
    this.formularioListo = this.institucionForm.valid;
    this.mostrarModal = true;
  }
  
  cerrarModal(): void {
    this.mostrarModal = false;
    this.institucionEditando = null;
    this.institucionForm.reset();
    this.formularioListo = false;
  }
  
  onSubmit(): void {
    if (!this.institucionForm.valid) {
      this.institucionForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    if (this.modoEdicion && this.institucionEditando) {
      this.actualizarInstitucion();
    } else {
      this.crearInstitucion();
    }
  }
  
  private crearInstitucion(): void {
    const datos = this.institucionForm.value;
    this.http.post<ApiResponse<Institucion>>(`${this.authService.API_BASE_URL}/instituciones`, datos)
      .subscribe({
        next: resp => {
          if (resp.success) {
            this.successMsg = 'Institución creada';
            this.cargarInstituciones();
            this.cerrarModal();
          } else {
            this.errorMsg = resp.message || 'Error al crear';
          }
          this.loading = false;
        },
        error: err => {
          console.error('Error al crear institución:', err);
          this.errorMsg = 'Error de conexión';
          this.loading = false;
        }
      });
  }
  
  private actualizarInstitucion(): void {
    if (!this.institucionEditando) return;
    const datos = this.institucionForm.value;
    this.http.put<ApiResponse<Institucion>>(`${this.authService.API_BASE_URL}/instituciones/${this.institucionEditando.id}`, datos)
      .subscribe({
        next: resp => {
          if (resp.success) {
            this.successMsg = 'Institución actualizada';
            this.cargarInstituciones();
            this.cerrarModal();
          } else {
            this.errorMsg = resp.message || 'Error al actualizar';
          }
          this.loading = false;
        },
        error: err => {
          console.error('Error al actualizar institución:', err);
          this.errorMsg = 'Error de conexión';
          this.loading = false;
        }
      });
  }
  
  eliminarInstitucion(inst: Institucion): void {
    if (!confirm(`¿Seguro querés eliminar "${inst.nombre}"?`)) return;
    this.loading = true;
    this.http.delete<ApiResponse<any>>(`${this.authService.API_BASE_URL}/instituciones/${inst.id}`)
      .subscribe({
        next: resp => {
          if (resp.success) {
            this.successMsg = 'Institución eliminada';
            this.cargarInstituciones();
          } else {
            this.errorMsg = resp.message || 'Error al eliminar';
          }
          this.loading = false;
        },
        error: err => {
          console.error('Error al eliminar institución:', err);
          this.errorMsg = 'Error de conexión';
          this.loading = false;
        }
      });
  }
  
  // Métodos auxiliares para validación de campos
  get nombre() { return this.institucionForm.get('nombre'); }
  get descripcion() { return this.institucionForm.get('descripcion'); }
  get email() { return this.institucionForm.get('email'); }
}
