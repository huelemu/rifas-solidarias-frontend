// src/app/components/usuarios/usuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService, Usuario, UsuarioInput } from '../../services/usuario.service';
import { InstitucionService, Institucion } from '../../services/institucion.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  instituciones: Institucion[] = [];
  loading = false;
  error = '';
  success = '';
  
  // Modal controls
  showModal = false;
  modalMode: 'create' | 'edit' | 'view' = 'create';
  selectedUsuario: Usuario | null = null;
  
  // Form
  usuarioForm: FormGroup;
  
  // Filtros
  filtroRol = '';
  filtroEstado = '';
  searchTerm = '';

  roles = [
    { value: 'admin_global', label: 'Administrador Global' },
    { value: 'admin_institucion', label: 'Administrador de Institución' },
    { value: 'vendedor', label: 'Vendedor' },
    { value: 'comprador', label: 'Comprador' }
  ];

  estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' }
  ];

  constructor(
    private usuarioService: UsuarioService,
    private institucionService: InstitucionService,
    private fb: FormBuilder
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: [''],
      dni: [''],
      rol: ['comprador', Validators.required],
      institucion_id: [''],
      estado: ['activo']
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarInstituciones();
  }

  cargarUsuarios() {
    console.log('👥 Cargando usuarios...');
    this.loading = true;
    this.error = '';
    
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (response) => {
        console.log('✅ Respuesta usuarios:', response);
        if (response.status === 'success' && response.data) {
          this.usuarios = response.data;
          console.log('📊 Usuarios cargados:', this.usuarios.length);
        } else {
          console.log('⚠️ Respuesta sin datos:', response);
          this.error = 'No se encontraron usuarios';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios:', error);
        this.error = 'Error al cargar los usuarios: ' + (error.message || 'Error desconocido');
        this.loading = false;
      }
    });
  }

  cargarInstituciones() {
    this.institucionService.obtenerInstituciones().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.instituciones = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar instituciones:', error);
      }
    });
  }

  get usuariosFiltrados(): Usuario[] {
    return this.usuarios.filter(usuario => {
      const matchesSearch = !this.searchTerm || 
        usuario.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||'';
      
      const matchesRol = !this.filtroRol || usuario.rol === this.filtroRol;
      const matchesEstado = !this.filtroEstado || usuario.estado === this.filtroEstado;
      
      return matchesSearch && matchesRol && matchesEstado;
    });
  }

  abrirModal(mode: 'create' | 'edit' | 'view', usuario?: Usuario) {
    this.modalMode = mode;
    this.selectedUsuario = usuario || null;
    this.showModal = true;
    this.error = '';
    this.success = '';

    if (mode === 'create') {
      this.usuarioForm.reset({
        rol: 'comprador',
        estado: 'activo'
      });
      this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    } else if (mode === 'edit' && usuario) {
      this.usuarioForm.patchValue({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono || '',
        dni: usuario.dni || '',
        rol: usuario.rol,
        institucion_id: usuario.institucion_id || '',
        estado: usuario.estado || 'activo'
      });
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
  }

  cerrarModal() {
    this.showModal = false;
    this.selectedUsuario = null;
    this.usuarioForm.reset();
    this.error = '';
    this.success = '';
  }

  onSubmit() {
    if (this.usuarioForm.valid) {
      const formData = this.usuarioForm.value;
      
      // Limpiar campos vacíos
      Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === null) {
          delete formData[key];
        }
      });

      if (this.modalMode === 'create') {
        this.crearUsuario(formData);
      } else if (this.modalMode === 'edit' && this.selectedUsuario) {
        // Si no se ingresó password, no lo enviamos
        if (!formData.password) {
          delete formData.password;
        }
        this.actualizarUsuario(this.selectedUsuario.id!, formData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  crearUsuario(usuarioData: UsuarioInput) {
    this.loading = true;
    
    this.usuarioService.crearUsuario(usuarioData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.success = 'Usuario creado exitosamente';
          this.cargarUsuarios();
          setTimeout(() => this.cerrarModal(), 1500);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.error = error.error?.message || 'Error al crear el usuario';
        this.loading = false;
      }
    });
  }

  actualizarUsuario(id: number, usuarioData: Partial<Usuario>) {
    this.loading = true;
    
    this.usuarioService.actualizarUsuario(id, usuarioData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.success = 'Usuario actualizado exitosamente';
          this.cargarUsuarios();
          setTimeout(() => this.cerrarModal(), 1500);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.error = error.error?.message || 'Error al actualizar el usuario';
        this.loading = false;
      }
    });
  }

  eliminarUsuario(usuario: Usuario) {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
      this.usuarioService.eliminarUsuario(usuario.id!).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.success = 'Usuario eliminado exitosamente';
            this.cargarUsuarios();
            setTimeout(() => this.success = '', 3000);
          }
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          this.error = error.error?.message || 'Error al eliminar el usuario';
          setTimeout(() => this.error = '', 5000);
        }
      });
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });
  }

  getRolLabel(rol: string): string {
    const roleObj = this.roles.find(r => r.value === rol);
    return roleObj ? roleObj.label : rol;
  }

  getEstadoLabel(estado: string): string {
    const estadoObj = this.estados.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  }
}