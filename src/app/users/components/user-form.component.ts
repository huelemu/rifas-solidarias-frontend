// src/app/users/components/user-form.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserExtended, CreateUserRequest, UpdateUserRequest } from '../models/user.models';
import { UserRole } from '../../auth/models/auth.models';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <header class="form-header">
        <div class="header-content">
          <div class="header-left">
            <h1>{{ isEditMode() ? '✏️ Editar Usuario' : '➕ Crear Usuario' }}</h1>
            <p>{{ isEditMode() ? 'Modificar información del usuario' : 'Agregar nuevo usuario al sistema' }}</p>
          </div>
          <div class="header-actions">
            <button (click)="goBack()" class="btn-secondary">
              ← Volver a la Lista
            </button>
          </div>
        </div>
      </header>

      <main class="form-main">
        @if (isLoading()) {
          <div class="loading-card">
            <div class="spinner"></div>
            <p>{{ isEditMode() ? 'Cargando usuario...' : 'Preparando formulario...' }}</p>
          </div>
        }

        @if (errorMessage()) {
          <div class="error-card">
            <h3>❌ Error</h3>
            <p>{{ errorMessage() }}</p>
            <button (click)="retry()" class="btn-primary">
              🔄 Reintentar
            </button>
          </div>
        }

        @if (!isLoading() && !errorMessage()) {
          <div class="form-card">
            <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-form">
              
              <!-- Información Personal -->
              <div class="form-section">
                <h3>👤 Información Personal</h3>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="nombre">Nombre *</label>
                    <input
                      type="text"
                      id="nombre"
                      formControlName="nombre"
                      placeholder="Nombre del usuario"
                      [class.error]="isFieldInvalid('nombre')"
                    />
                    @if (isFieldInvalid('nombre')) {
                      <span class="error-message">
                        @if (userForm.get('nombre')?.hasError('required')) {
                          El nombre es requerido
                        }
                        @if (userForm.get('nombre')?.hasError('minlength')) {
                          El nombre debe tener al menos 2 caracteres
                        }
                      </span>
                    }
                  </div>

                  <div class="form-group">
                    <label for="apellido">Apellido *</label>
                    <input
                      type="text"
                      id="apellido"
                      formControlName="apellido"
                      placeholder="Apellido del usuario"
                      [class.error]="isFieldInvalid('apellido')"
                    />
                    @if (isFieldInvalid('apellido')) {
                      <span class="error-message">
                        @if (userForm.get('apellido')?.hasError('required')) {
                          El apellido es requerido
                        }
                        @if (userForm.get('apellido')?.hasError('minlength')) {
                          El apellido debe tener al menos 2 caracteres
                        }
                      </span>
                    }
                  </div>
                </div>

                <div class="form-group">
                  <label for="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    placeholder="usuario@ejemplo.com"
                    [class.error]="isFieldInvalid('email')"
                  />
                  @if (isFieldInvalid('email')) {
                    <span class="error-message">
                      @if (userForm.get('email')?.hasError('required')) {
                        El email es requerido
                      }
                      @if (userForm.get('email')?.hasError('email')) {
                        Ingrese un email válido
                      }
                      @if (userForm.get('email')?.hasError('emailExists')) {
                        Este email ya está registrado
                      }
                    </span>
                  }
                </div>
              </div>

              <!-- Contraseña (solo para crear) -->
              @if (!isEditMode()) {
                <div class="form-section">
                  <h3>🔑 Contraseña</h3>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="password">Contraseña *</label>
                      <input
                        type="password"
                        id="password"
                        formControlName="password"
                        placeholder="••••••••"
                        [class.error]="isFieldInvalid('password')"
                      />
                      @if (isFieldInvalid('password')) {
                        <span class="error-message">
                          @if (userForm.get('password')?.hasError('required')) {
                            La contraseña es requerida
                          }
                          @if (userForm.get('password')?.hasError('minlength')) {
                            La contraseña debe tener al menos 6 caracteres
                          }
                        </span>
                      }
                    </div>

                    <div class="form-group">
                      <label for="confirmPassword">Confirmar Contraseña *</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        formControlName="confirmPassword"
                        placeholder="••••••••"
                        [class.error]="isFieldInvalid('confirmPassword')"
                      />
                      @if (isFieldInvalid('confirmPassword')) {
                        <span class="error-message">
                          @if (userForm.get('confirmPassword')?.hasError('required')) {
                            Confirme la contraseña
                          }
                          @if (userForm.hasError('passwordMismatch')) {
                            Las contraseñas no coinciden
                          }
                        </span>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- Rol y Estado -->
              <div class="form-section">
                <h3>🔐 Roles y Permisos</h3>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="rol">Rol *</label>
                    <select
                      id="rol"
                      formControlName="rol"
                      [class.error]="isFieldInvalid('rol')"
                      (change)="onRoleChange()"
                    >
                      <option value="">Seleccionar rol</option>
                      @if (canAssignRole('admin_global')) {
                        <option value="admin_global">Administrador Global</option>
                      }
                      @if (canAssignRole('admin_institucion')) {
                        <option value="admin_institucion">Administrador de Institución</option>
                      }
                      @if (canAssignRole('vendedor')) {
                        <option value="vendedor">Vendedor</option>
                      }
                      @if (canAssignRole('comprador')) {
                        <option value="comprador">Comprador</option>
                      }
                    </select>
                    @if (isFieldInvalid('rol')) {
                      <span class="error-message">
                        Seleccione un rol
                      </span>
                    }
                  </div>

                  <div class="form-group">
                    <label for="estado">Estado</label>
                    <select
                      id="estado"
                      formControlName="estado"
                      [class.error]="isFieldInvalid('estado')"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      @if (authService.isGlobalAdmin()) {
                        <option value="suspendido">Suspendido</option>
                      }
                    </select>
                  </div>
                </div>
              </div>

              <!-- Institución (si aplica) -->
              @if (shouldShowInstitution()) {
                <div class="form-section">
                  <h3>🏢 Institución</h3>
                  
                  <div class="form-group">
                    <label for="institucion_id">Institución</label>
                    <select
                      id="institucion_id"
                      formControlName="institucion_id"
                    >
                      <option value="">Sin institución asignada</option>
                      <option value="1">Institución de Ejemplo 1</option>
                      <option value="2">Institución de Ejemplo 2</option>
                      <!-- TODO: Cargar instituciones dinámicamente -->
                    </select>
                    <small class="form-help">
                      Solo requerido para administradores de institución y vendedores
                    </small>
                  </div>
                </div>
              }

              <!-- Botones de acción -->
              <div class="form-actions">
                <button
                  type="button"
                  (click)="goBack()"
                  class="btn-cancel"
                >
                  ❌ Cancelar
                </button>
                
                <button
                  type="submit"
                  class="btn-submit"
                  [disabled]="userForm.invalid || isSaving()"
                >
                  @if (isSaving()) {
                    <span class="spinner-sm"></span>
                    {{ isEditMode() ? 'Actualizando...' : 'Creando...' }}
                  } @else {
                    {{ isEditMode() ? '💾 Actualizar Usuario' : '➕ Crear Usuario' }}
                  }
                </button>
              </div>
            </form>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .form-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .form-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .header-left p {
      margin: 0;
      opacity: 0.9;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .form-main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .loading-card, .error-card {
      background: white;
      border-radius: 8px;
      padding: 3rem;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .form-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .user-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-section {
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 1.5rem;
    }

    .form-section:last-of-type {
      border-bottom: none;
      padding-bottom: 0;
    }

    .form-section h3 {
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
    }

    .form-group input, .form-group select {
      padding: 0.75rem;
      border: 2px solid #e1e5e9;
      border-radius: 6px;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group input.error, .form-group select.error {
      border-color: #e74c3c;
    }

    .form-group input.error:focus, .form-group select.error:focus {
      box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .form-help {
      color: #6c757d;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #e9ecef;
    }

    .btn-cancel, .btn-submit, .btn-primary {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
      border: none;
    }

    .btn-cancel:hover {
      background: #5a6268;
    }

    .btn-submit {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      border: none;
    }

    .btn-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #218838 0%, #1ba085 100%);
      transform: translateY(-1px);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals para estado del componente
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly currentUser = signal<UserExtended | null>(null);

  // Formulario reactivo
  userForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    confirmPassword: [''],
    rol: ['', Validators.required],
    estado: ['activo'],
    institucion_id: ['']
  });

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId && userId !== 'nuevo') {
      this.isEditMode.set(true);
      this.loadUser(parseInt(userId));
    } else {
      // Modo creación - agregar validadores de contraseña
      this.addPasswordValidators();
    }
  }

  /**
   * Agrega validadores de contraseña para modo creación
   */
  private addPasswordValidators(): void {
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    
    // Validador personalizado para verificar que las contraseñas coincidan
    this.userForm.setValidators(this.passwordMatchValidator);
    
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  /**
   * Carga los datos del usuario en modo edición
   */
  private loadUser(userId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    console.log('🔄 UserFormComponent: Cargando usuario ID:', userId);

    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.currentUser.set(user);
        
        console.log('📝 UserFormComponent: Usuario recibido:', user);
        console.log('📝 UserFormComponent: Datos a cargar en formulario:', {
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol,
          estado: user.estado,
          institucion_id: user.institucion_id
        });
        
        // Llenar el formulario con los datos del usuario
        this.userForm.patchValue({
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          email: user.email || '',
          rol: user.rol || '',
          estado: user.estado || 'activo',
          institucion_id: user.institucion_id || ''
        });
        
        // Forzar detección de cambios
        this.userForm.markAsPristine();
        this.userForm.markAsUntouched();
        
        console.log('✅ UserFormComponent: Formulario actualizado:', this.userForm.value);
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMsg = error?.message || 'Error desconocido';
        this.errorMessage.set('Error al cargar usuario: ' + errorMsg);
        console.error('❌ UserFormComponent: Error cargando usuario:', error);
        console.error('❌ UserFormComponent: Error completo:', {
          message: error.message,
          status: error.status,
          error: error.error
        });
      }
    });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode()) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  /**
   * Crea un nuevo usuario
   */
  private createUser(): void {
    const formValue = this.userForm.value;
    const userData: CreateUserRequest = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      email: formValue.email,
      password: formValue.password,
      rol: formValue.rol,
      estado: formValue.estado,
      institucion_id: formValue.institucion_id || undefined
    };

    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.isSaving.set(false);
        console.log('✅ Usuario creado:', user);
        this.router.navigate(['/usuarios']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set('Error al crear usuario: ' + error.message);
        console.error('❌ Error creando usuario:', error);
      }
    });
  }

  /**
   * Actualiza un usuario existente
   */
  private updateUser(): void {
    const formValue = this.userForm.value;
    const currentUser = this.currentUser();
    
    if (!currentUser) return;

    const userData: UpdateUserRequest = {
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      email: formValue.email,
      rol: formValue.rol,
      estado: formValue.estado,
      institucion_id: formValue.institucion_id || undefined
    };

    this.userService.updateUser(currentUser.id, userData).subscribe({
      next: (user) => {
        this.isSaving.set(false);
        console.log('✅ Usuario actualizado:', user);
        this.router.navigate(['/usuarios']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set('Error al actualizar usuario: ' + error.message);
        console.error('❌ Error actualizando usuario:', error);
      }
    });
  }

  /**
   * Verifica si un campo específico es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Marca todos los campos como tocados
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Verifica si puede asignar un rol específico
   */
  canAssignRole(role: UserRole): boolean {
    const currentUserRole = this.authService.userRole();
    
    // Admin global puede asignar cualquier rol
    if (currentUserRole === 'admin_global') return true;
    
    // Admin de institución solo puede asignar vendedor y comprador
    if (currentUserRole === 'admin_institucion') {
      return role === 'vendedor' || role === 'comprador';
    }
    
    return false;
  }

  /**
   * Verifica si debe mostrar el campo de institución
   */
  shouldShowInstitution(): boolean {
    const rol = this.userForm.get('rol')?.value;
    return rol === 'admin_institucion' || rol === 'vendedor';
  }

  /**
   * Maneja cambios en el rol
   */
  onRoleChange(): void {
    const rol = this.userForm.get('rol')?.value;
    
    // Si no requiere institución, limpiar el campo
    if (!this.shouldShowInstitution()) {
      this.userForm.get('institucion_id')?.setValue('');
    }
  }

  /**
   * Vuelve a la lista de usuarios
   */
  goBack(): void {
    this.router.navigate(['/usuarios']);
  }

  /**
   * Reintenta la operación
   */
  retry(): void {
    this.errorMessage.set(null);
    
    if (this.isEditMode()) {
      const userId = this.route.snapshot.paramMap.get('id');
      if (userId) {
        this.loadUser(parseInt(userId));
      }
    }
  }
}