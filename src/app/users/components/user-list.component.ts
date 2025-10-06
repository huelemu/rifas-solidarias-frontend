// src/app/users/components/user-list.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserExtended, UserFilters } from '../models/user.models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ViewToggleComponent } from '../../shared/components/view-toggle/view-toggle.component';
import { ViewPreferenceService, ViewMode } from '../../shared/services/view-preference.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, ViewToggleComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly viewPreferenceService = inject(ViewPreferenceService);

  // Signals
  readonly users = signal<UserExtended[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly pagination = signal<any>(null);

  // View mode
  readonly viewMode$: Observable<ViewMode> = this.viewPreferenceService.getViewMode$();

  // Filtros
  filters: UserFilters = {
    search: '',
    rol: 'todos',
    estado: 'todos',
    page: 1,
    limit: 12
  };

  private searchTimeout: any;

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carga la lista de usuarios
   */
  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getUsers(this.filters).subscribe({
      next: (result) => {
        this.isLoading.set(false);
        const usersList = result?.users || [];
        this.users.set(usersList);
        this.pagination.set(result?.pagination || null);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.users.set([]);
        this.pagination.set(null);
        
        const errorMsg = error?.message || 'Error desconocido al cargar usuarios';
        this.errorMessage.set('Error al cargar usuarios: ' + errorMsg);
      }
    });
  }

  /**
   * Maneja cambios en los filtros con debounce
   */
  onFilterChange(): void {
    this.filters.page = 1;
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.loadUsers();
    }, 300);
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.filters = {
      search: '',
      rol: 'todos',
      estado: 'todos',
      page: 1,
      limit: 12
    };
    this.loadUsers();
  }

  /**
   * Cambia de página
   */
  changePage(page: number): void {
    this.filters.page = page;
    this.loadUsers();
  }

  // ===================================================
  // NAVEGACIÓN
  // ===================================================

  createUser(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  viewUser(user: UserExtended): void {
    this.router.navigate(['/usuarios', user.id, 'editar']);
  }

  editUser(user: UserExtended): void {
    this.router.navigate(['/usuarios', user.id, 'editar']);
  }

  /**
   * Alternar estado del usuario
   */
  toggleUserStatus(user: UserExtended): void {
    const newStatus = user.estado === 'activo' ? 'inactivo' : 'activo';
    const action = newStatus === 'activo' ? 'activar' : 'desactivar';
    
    if (confirm(`¿Estás seguro de que deseas ${action} este usuario?`)) {
      this.userService.updateUser(user.id, { estado: newStatus }).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          alert('Error al cambiar el estado del usuario');
        }
      });
    }
  }

  /**
   * Eliminar usuario
   */
  deleteUser(user: UserExtended): void {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${user.nombre} ${user.apellido}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          alert('Error al eliminar el usuario');
        }
      });
    }
  }

  // ===================================================
  // PERMISOS
  // ===================================================

  canCreateUser(): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.role === 'admin_global' || currentUser?.role === 'admin_institucion';
  }

  canEditUser(user: UserExtended): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // Superadmin puede editar a todos
    if (currentUser.role === 'admin_global') return true;

    // Admin de institución puede editar usuarios de su institución
    if (currentUser.role === 'admin_institucion') {
      return currentUser.institucion_id === user.institucion_id;
    }

    // El usuario puede editarse a sí mismo
    return currentUser.id === user.id;
  }

  canDeleteUser(user: UserExtended): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // No puede eliminarse a sí mismo
    if (currentUser.id === user.id) return false;

    // Solo superadmin puede eliminar usuarios
    return currentUser.role === 'admin_global';
  }

  // ===================================================
  // HELPERS
  // ===================================================

  getTotalUsers(): number {
    return this.users().length;
  }

  getActiveUsers(): number {
    return this.users().filter(u => u.estado === 'activo').length;
  }

  getAdminUsers(): number {
    return this.users().filter(u => 
      u.rol === 'admin_global' || u.rol === 'admin_institucion'
    ).length;
  }

  getVendedorUsers(): number {
    return this.users().filter(u => u.rol === 'vendedor').length;
  }

  getUserCardClass(user: UserExtended): string {
    switch (user.estado) {
      case 'inactivo': return 'inactive';
      case 'suspendido': return 'suspended';
      default: return '';
    }
  }

  getInitials(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  getStatusLabel(estado: string): string {
    const labels: any = {
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'suspendido': 'Suspendido'
    };
    return labels[estado] || estado;
  }

  getRoleLabel(rol: string): string {
    const labels: any = {
      'superadmin': 'Superadmin',
      'admin_institucion': 'Admin Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Comprador'
    };
    return labels[rol] || rol;
  }

  getRoleClass(rol: string): string {
    return `role-${rol}`;
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }
}