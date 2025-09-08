// src/app/components/instituciones/instituciones.component.ts
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
    this.loading = true;
    this.error = '';
    
    this.institucionService.obtenerInstituciones().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.instituciones = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar instituciones:', error);
        this.error = 'Error al cargar las instituciones';
        this.loading = false;
      }
    });
  }

  get institucionesFiltradas(): Institucion[] {
    return this.instituciones.filter(institucion => {
      const matchesSearch = !this.searchTerm || 
        institucion.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        institucion.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (institucion.descripcion && institucion.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesEstado = !this.filtroEstado || institucion.estado === this.filtroEstado;
      
      return matchesSearch && matchesEstado;
    });
  }

  abrirModal(mode: 'create' | 'edit' | 'view', institucion?: Institucion) {
    this.modalMode = mode;
    this.selectedInstitucion = institucion || null;
    this.showModal = true;
    this.error = '';
    this.success = '';

    if (mode === 'create') {
      this.institucionForm.reset({
        estado: 'activa'
      });
    } else if (mode === 'edit' && institucion) {
      this.institucionForm.patchValue({
        nombre: institucion.nombre,
        descripcion: institucion.descripcion || '',
        direccion: institucion.direccion || '',
        telefono: institucion.telefono || '',
        email: institucion.email,
        logo_url: institucion.logo_url || '',
        estado: institucion.estado || 'activa'
      });
    }
  }

  cerrarModal() {
    this.showModal = false;
    this.selectedInstitucion = null;
    this.institucionForm.reset();
    this.error = '';
    this.success = '';
  }

  onSubmit() {
    if (this.institucionForm.valid) {
      const formData = this.institucionForm.value;
      
      // Limpiar campos vacíos
      Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === null) {
          delete formData[key];
        }
      });

      if (this.modalMode === 'create') {
        this.crearInstitucion(formData);
      } else if (this.modalMode === 'edit' && this.selectedInstitucion) {
        this.actualizarInstitucion(this.selectedInstitucion.id!, formData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  crearInstitucion(institucionData: InstitucionInput) {
    this.loading = true;
    
    this.institucionService.crearInstitucion(institucionData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.success = 'Institución creada exitosamente';
          this.cargarInstituciones();
          setTimeout(() => this.cerrarModal(), 1500);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al crear institución:', error);
        this.error = error.error?.message || 'Error al crear la institución';
        this.loading = false;
      }
    });
  }

  actualizarInstitucion(id: number, institucionData: Partial<Institucion>) {
    this.loading = true;
    
    this.institucionService.actualizarInstitucion(id, institucionData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.success = 'Institución actualizada exitosamente';
          this.cargarInstituciones();
          setTimeout(() => this.cerrarModal(), 1500);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al actualizar institución:', error);
        this.error = error.error?.message || 'Error al actualizar la institución';
        this.loading = false;
      }
    });
  }

  eliminarInstitucion(institucion: Institucion) {
    if (confirm(`¿Estás seguro de que deseas eliminar la institución ${institucion.nombre}?`)) {
      this.institucionService.eliminarInstitucion(institucion.id!).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.success = 'Institución eliminada exitosamente';
            this.cargarInstituciones();
            setTimeout(() => this.success = '', 3000);
          }
        },
        error: (error) => {
          console.error('Error al eliminar institución:', error);
          this.error = error.error?.message || 'Error al eliminar la institución';
          setTimeout(() => this.error = '', 5000);
        }
      });
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.institucionForm.controls).forEach(key => {
      const control = this.institucionForm.get(key);
      control?.markAsTouched();
    });
  }

  getEstadoLabel(estado: string): string {
    const estadoObj = this.estados.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  }
}