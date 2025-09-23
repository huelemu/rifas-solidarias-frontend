// src/app/users/components/user-list.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserExtended, UserFilters } from '../models/user.models';
import { UserRole } from '../../auth/models/auth.models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-container">
      <header class="users-header">
        <div class="header-content">
          <div class="header-left">
            <h1>👥 Gestión de Usuarios</h1>
            <p>Administrar usuarios del sistema</p>
          </div>
          <div class="header-actions">
            <button (click)="goBack()" class="btn-secondary">
              ← Volver al Dashboard
            </button>
            <button (click)="createUser()" class="btn-primary">
              ➕ Nuevo Usuario
            </button>
          </div>
        </div>
      </header>

      <main class="users-main">
          <!-- Estadísticas rápidas -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-number">{{ getTotalUsers() }}</div>
                <div class="stat-label">Total Usuarios</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-number">{{ getActiveUsers() }}</div>
                <div class="stat-label">Activos</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">👑</div>
              <div class="stat-content">
                <div class="stat-number">{{ getAdminUsers() }}</div>
                <div class="stat-label">Administradores</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🛒</div>
              <div class="stat-content">
                <div class="stat-number">{{ getVendedorUsers() }}</div>
                <div class="stat-label">Vendedores</div>
              </div>
            </div>
          </div>

          <!-- Debug info (temporal) -->
          @if (users()) {
            <div class="debug-info">
              <small>
                🔍 Debug: {{ users().length }} usuarios en memoria | 
                Filtros: {{ filters.search || 'sin búsqueda' }}, {{ filters.rol }}, {{ filters.estado }}
              </small>
            </div>
          }

        <!-- Filtros de búsqueda -->
        <div class="filters-card">
          <h3>🔍 Filtros de Búsqueda</h3>
          <div class="filters-grid">
            <div class="filter-group">
              <label for="search">Buscar:</label>
              <input
                type="text"
                id="search"
                [(ngModel)]="filters.search"
                (ngModelChange)="onFilterChange()"
                placeholder="Nombre, email..."
                class="filter-input"
              />
            </div>

            <div class="filter-group">
              <label for="role">Rol:</label>
              <select
                id="role"
                [(ngModel)]="filters.rol"
                (ngModelChange)="onFilterChange()"
                class="filter-select"
              >
                <option value="todos">Todos los roles</option>
                <option value="admin_global">Administrador Global</option>
                <option value="admin_institucion">Admin. Institución</option>
                <option value="vendedor">Vendedor</option>
                <option value="comprador">Comprador</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="status">Estado:</label>
              <select
                id="status"
                [(ngModel)]="filters.estado"
                (ngModelChange)="onFilterChange()"
                class="filter-select"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>

            <div class="filter-group">
              <button (click)="clearFilters()" class="btn-clear">
                🗑️ Limpiar
              </button>
            </div>
          </div>
        </div>

        <!-- Mensaje de éxito -->
        @if (successMessage()) {
          <div class="success-card">
            <h3>✅ Éxito</h3>
            <p>{{ successMessage() }}</p>
            <button (click)="clearSuccessMessage()" class="btn-close">
              ✕
            </button>
          </div>
        }

        <!-- Estado de carga -->
        @if (isLoading()) {
          <div class="loading-card">
            <div class="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        }

        <!-- Error -->
        @if (errorMessage()) {
          <div class="error-card">
            <h3>❌ Error</h3>
            <p>{{ errorMessage() }}</p>
            <button (click)="loadUsers()" class="btn-primary">
              🔄 Reintentar
            </button>
          </div>
        }

        <!-- Lista de usuarios -->
        @if (!isLoading() && !errorMessage() && users() && users().length > 0) {
          <div class="users-grid">
            @for (user of users(); track user.id) {
              <div class="user-card" [class]="getUserCardClass(user)">
                <div class="user-header">
                  <div class="user-info">
                    <h4>{{ user.nombre }} {{ user.apellido }}</h4>
                    <p class="user-email">{{ user.email }}</p>
                  </div>
                  <div class="user-status">
                    <span class="status-badge" [class]="getStatusClass(user.estado)">
                      {{ getStatusLabel(user.estado) }}
                    </span>
                  </div>
                </div>

                <div class="user-details">
                  <div class="detail-item">
                    <label>ID:</label>
                    <span>{{ user.id }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Rol:</label>
                    <span class="role-badge" [class]="getRoleClass(user.rol)">
                      {{ getRoleLabel(user.rol) }}
                    </span>
                  </div>
                  @if (user.institucion_nombre) {
                    <div class="detail-item">
                      <label>Institución:</label>
                      <span>{{ user.institucion_nombre }}</span>
                    </div>
                  }
                  <div class="detail-item">
                    <label>Creado:</label>
                    <span>{{ formatDate(user.created_at) }}</span>
                  </div>
                  @if (user.ultimo_acceso) {
                    <div class="detail-item">
                      <label>Último acceso:</label>
                      <span>{{ formatDate(user.ultimo_acceso) }}</span>
                    </div>
                  }
                </div>

                <div class="user-actions">
                  <button 
                    (click)="viewUser(user)" 
                    class="btn-action btn-view"
                    title="Ver detalles"
                  >
                    👁️
                  </button>
                  <button 
                    (click)="editUser(user)" 
                    class="btn-action btn-edit"
                    title="Editar usuario"
                    [disabled]="!canEditUser(user)"
                  >
                    ✏️
                  </button>
                  <button 
                    (click)="toggleUserStatus(user)" 
                    class="btn-action"
                    [class]="user.estado === 'activo' ? 'btn-deactivate' : 'btn-activate'"
                    [title]="user.estado === 'activo' ? 'Desactivar usuario' : 'Activar usuario'"
                    [disabled]="!canEditUser(user)"
                  >
                    {{ user.estado === 'activo' ? '🔒' : '🔓' }}
                  </button>
                  <button 
                    (click)="deleteUser(user)" 
                    class="btn-action btn-delete"
                    title="Eliminar usuario"
                    [disabled]="!canDeleteUser(user)"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- Sin resultados -->
        @if (!isLoading() && !errorMessage() && users() && users().length === 0) {
          <div class="empty-state">
            <h3>📭 Sin resultados</h3>
            <p>No se encontraron usuarios que coincidan con los filtros.</p>
            <button (click)="clearFilters()" class="btn-primary">
              🗑️ Limpiar filtros
            </button>
          </div>
        }

        <!-- Paginación (si hay) -->
        @if (pagination() && pagination()!.totalPages > 1) {
          <div class="pagination">
            <button 
              (click)="changePage(pagination()!.page - 1)"
              [disabled]="pagination()!.page <= 1"
              class="btn-page"
            >
              ← Anterior
            </button>
            
            <span class="page-info">
              Página {{ pagination()!.page }} de {{ pagination()!.totalPages }}
              ({{ pagination()!.total }} usuarios)
            </span>
            
            <button 
              (click)="changePage(pagination()!.page + 1)"
              [disabled]="pagination()!.page >= pagination()!.totalPages"
              class="btn-page"
            >
              Siguiente →
            </button>
          </div>
        }
      </main>
    </div>
  `,
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals para estado del componente
  readonly users = signal<UserExtended[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly pagination = signal<any>(null);

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
    console.log('📋 UserListComponent: Iniciando carga de usuarios con filtros:', this.filters);
    
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null); // Limpiar mensaje de éxito

    this.userService.getUsers(this.filters).subscribe({
      next: (result) => {
        console.log('📥 UserListComponent: Resultado completo recibido:', result);
        
        this.isLoading.set(false);
        
        // Asegurarse de que siempre tengamos un array
        const usersList = result?.users || [];
        console.log('👥 UserListComponent: Lista de usuarios a mostrar:', usersList);
        console.log('📊 UserListComponent: Cantidad de usuarios:', usersList.length);
        
        // Forzar actualización del signal
        this.users.set([]);  // Limpiar primero
        setTimeout(() => {   // Luego actualizar
          this.users.set(usersList);
          console.log('✅ UserListComponent: Signal actualizado con', usersList.length, 'usuarios');
        }, 0);
        
        this.pagination.set(result?.pagination || null);
      },
      error: (error) => {
        this.isLoading.set(false);
        
        // Asegurarse de que users sea siempre un array, incluso en error
        this.users.set([]);
        this.pagination.set(null);
        
        const errorMsg = error?.message || 'Error desconocido al cargar usuarios';
        this.errorMessage.set('Error al cargar usuarios: ' + errorMsg);
        console.error('❌ UserListComponent: Error cargando usuarios:', error);
      }
    });
  }

  /**
   * Maneja cambios en los filtros con debounce
   */
  onFilterChange(): void {
    console.log('🔄 UserListComponent: Filtro cambiado, nuevos filtros:', this.filters);
    
    this.filters.page = 1; // Resetear a primera página
    
    // Debounce para el campo de búsqueda
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      console.log('⏰ UserListComponent: Ejecutando búsqueda con filtros:', this.filters);
      this.loadUsers();
    }, 300); // Esperar 300ms antes de hacer la búsqueda
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

  /**
   * Navega para crear usuario
   */
  createUser(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  /**
   * Ver detalles de usuario (por ahora redirige a editar)
   */
  viewUser(user: UserExtended): void {
    this.router.navigate(['/usuarios', user.id, 'editar']);
  }

  /**
   * Editar usuario
   */
  editUser(user: UserExtended): void {
    this.router.navigate(['/usuarios', user.id, 'editar']);
  }

  /**
   * Alternar estado del usuario
   */
  toggleUserStatus(user: UserExtended): void {
    const newStatus = user.estado === 'activo' ? 'inactivo' : 'activo';
    const action = newStatus === 'activo' ? 'activar' : 'desactivar';
    
    if (confirm(`¿Estás seguro de que quieres ${action} a ${user.nombre} ${user.apellido}?`)) {
      this.userService.changeUserStatus(user.id, newStatus).subscribe({
        next: (updatedUser) => {
          console.log('📝 Usuario actualizado recibido:', updatedUser);
          
          // Verificar que el usuario actualizado sea válido
          if (!updatedUser || !updatedUser.id) {
            console.error('❌ Usuario actualizado inválido:', updatedUser);
            this.errorMessage.set('Error: respuesta inválida del servidor');
            return;
          }
          
          // Actualizar usuario en la lista de manera segura
          const currentUsers = this.users();
          const index = currentUsers.findIndex(u => u && u.id === user.id);
          
          if (index !== -1) {
            // Crear nueva lista con el usuario actualizado
            const newUsers = [...currentUsers];
            newUsers[index] = updatedUser;
            
            // Filtrar cualquier elemento undefined que pueda haber
            const cleanUsers = newUsers.filter(u => u && typeof u === 'object' && u.id);
            
            this.users.set(cleanUsers);
            console.log('✅ Lista de usuarios actualizada correctamente');
          } else {
            console.warn('⚠️ No se encontró el usuario en la lista para actualizar');
          }
          
          // Mostrar mensaje de éxito
          this.successMessage.set(`Usuario ${updatedUser.nombre} ${updatedUser.apellido} ${action}do correctamente`);
          this.clearSuccessMessageAfterDelay();
          
          console.log(`✅ Usuario ${action}do:`, updatedUser);
        },
        error: (error) => {
          console.error(`❌ Error al ${action} usuario:`, error);
          this.errorMessage.set(`Error al ${action} usuario: ${error.message}`);
          this.clearErrorMessageAfterDelay();
        }
      });
    }
  }

  /**
   * Eliminar usuario
   */
  deleteUser(user: UserExtended): void {
    const confirmText = `¿Estás COMPLETAMENTE SEGURO de que quieres ELIMINAR a ${user.nombre} ${user.apellido}?\n\nEsta acción NO SE PUEDE DESHACER.`;
    
    if (confirm(confirmText)) {
      this.userService.deleteUser(user.id).subscribe({
        next: (success) => {
          if (success) {
            // Remover usuario de la lista de manera segura
            const currentUsers = this.users();
            const filteredUsers = currentUsers.filter(u => u && u.id !== user.id);
            
            // Asegurar que no haya elementos undefined
            const cleanUsers = filteredUsers.filter(u => u && typeof u === 'object' && u.id);
            
            this.users.set(cleanUsers);
            
            // Mostrar mensaje de éxito
            this.successMessage.set(`Usuario ${user.nombre} ${user.apellido} eliminado correctamente`);
            this.clearSuccessMessageAfterDelay();
            
            console.log('✅ Usuario eliminado:', user);
          }
        },
        error: (error) => {
          console.error('❌ Error al eliminar usuario:', error);
          this.errorMessage.set('Error al eliminar usuario: ' + error.message);
          this.clearErrorMessageAfterDelay();
        }
      });
    }
  }

  /**
   * Volver al dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Verifica si puede editar un usuario
   */
  canEditUser(user: UserExtended): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // Admin global puede editar cualquier usuario
    if (currentUser.role === 'admin_global') return true;

    // Admin de institución puede editar usuarios de su institución
    if (currentUser.role === 'admin_institucion') {
      return currentUser.institucion_id === user.institucion_id;
    }

    // El usuario puede editarse a sí mismo (pero no cambiar rol)
    return currentUser.id === user.id;
  }

  /**
   * Verifica si puede eliminar un usuario
   */
  canDeleteUser(user: UserExtended): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // No puede eliminarse a sí mismo
    if (currentUser.id === user.id) return false;

    // Solo admin global puede eliminar usuarios
    return currentUser.role === 'admin_global';
  }

  /**
   * Obtiene el total de usuarios
   */
  getTotalUsers(): number {
    const users = this.users() || [];
    return users.filter(user => user && typeof user === 'object').length;
  }

  /**
   * Obtiene el número de usuarios activos
   */
  getActiveUsers(): number {
    const users = this.users() || [];
    return users.filter(user => user && user.estado === 'activo').length;
  }

  /**
   * Obtiene el número de administradores
   */
  getAdminUsers(): number {
    const users = this.users() || [];
    return users.filter(user => 
      user && (user.rol === 'admin_global' || user.rol === 'admin_institucion')
    ).length;
  }

  /**
   * Obtiene el número de vendedores
   */
  getVendedorUsers(): number {
    const users = this.users() || [];
    return users.filter(user => user && user.rol === 'vendedor').length;
  }

  /**
   * Obtiene la clase CSS para la tarjeta de usuario
   */
  getUserCardClass(user: UserExtended): string {
    switch (user.estado) {
      case 'inactivo': return 'inactive';
      case 'suspendido': return 'suspended';
      default: return '';
    }
  }

  /**
   * Obtiene la clase CSS para el estado
   */
  getStatusClass(estado: string): string {
    switch (estado) {
      case 'activo': return 'status-active';
      case 'inactivo': return 'status-inactive';
      case 'suspendido': return 'status-suspended';
      default: return '';
    }
  }

  /**
   * Obtiene la etiqueta del estado
   */
  getStatusLabel(estado: string): string {
    switch (estado) {
      case 'activo': return 'Activo';
      case 'inactivo': return 'Inactivo';
      case 'suspendido': return 'Suspendido';
      default: return estado;
    }
  }

  /**
   * Obtiene la clase CSS para el rol
   */
  getRoleClass(rol: UserRole): string {
    switch (rol) {
      case 'admin_global':
      case 'admin_institucion':
        return 'role-admin';
      case 'vendedor':
        return 'role-vendedor';
      case 'comprador':
        return 'role-comprador';
      default:
        return '';
    }
  }

  /**
   * Obtiene la etiqueta del rol
   */
  getRoleLabel(rol: UserRole): string {
    switch (rol) {
      case 'admin_global': return 'Admin Global';
      case 'admin_institucion': return 'Admin Institución';
      case 'vendedor': return 'Vendedor';
      case 'comprador': return 'Comprador';
      default: return rol;
    }
  }

  /**
   * Limpia el mensaje de éxito
   */
  clearSuccessMessage(): void {
    this.successMessage.set(null);
  }

  /**
   * Limpia el mensaje de éxito después de un retraso
   */
  private clearSuccessMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage.set(null);
    }, 5000); // 5 segundos
  }

  /**
   * Limpia el mensaje de error después de un retraso
   */
  private clearErrorMessageAfterDelay(): void {
    setTimeout(() => {
      this.errorMessage.set(null);
    }, 8000); // 8 segundos
  }

  /**
   * Formatea una fecha
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}