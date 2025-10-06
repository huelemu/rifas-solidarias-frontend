// src/app/users/components/user-form.component.ts - VERSIÓN MEJORADA

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserExtended, CreateUserRequest, UpdateUserRequest } from '../models/user.models';
import { UserRole } from '../../auth/models/auth.models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  template: `
  <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-content">
        
        <!-- Loading state -->
        @if (isLoading()) {
          <div class="loading-container">
            <div class="spinner"></div>
            <p>{{ isEditMode() ? 'Cargando usuario...' : 'Preparando formulario...' }}</p>
          </div>
        }

        <!-- Error state -->
        @if (errorMessage()) {
          <div class="error-card">
            <div class="error-icon">❌</div>
            <h3>Error al cargar</h3>
            <p>{{ errorMessage() }}</p>
            <button (click)="retry()" class="btn btn-primary">
              🔄 Reintentar
            </button>
          </div>
        }

        <!-- Formulario -->
        @if (!isLoading() && !errorMessage()) {
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="form-card">
            
            <!-- Grid de 2 columnas -->
            <div class="form-grid">
              
              <!-- Columna Izquierda -->
              <div class="form-column">
                
                <div class="form-section">
                  <h3 class="section-title">👤 Información Personal</h3>
                  
                  <div class="form-group">
                    <label for="nombre">Nombre <span class="required">*</span></label>
                    <input
                      type="text"
                      id="nombre"
                      formControlName="nombre"
                      placeholder="Ej: Juan"
                      [class.error]="isFieldInvalid('nombre')"
                    />
                    @if (isFieldInvalid('nombre')) {
                      <span class="error-message">
                        @if (userForm.get('nombre')?.hasError('required')) {
                          El nombre es requerido
                        }
                        @if (userForm.get('nombre')?.hasError('minlength')) {
                          Mínimo 2 caracteres
                        }
                      </span>
                    }
                  </div>

                  <div class="form-group">
                    <label for="apellido">Apellido <span class="required">*</span></label>
                    <input
                      type="text"
                      id="apellido"
                      formControlName="apellido"
                      placeholder="Ej: Pérez"
                      [class.error]="isFieldInvalid('apellido')"
                    />
                    @if (isFieldInvalid('apellido')) {
                      <span class="error-message">
                        @if (userForm.get('apellido')?.hasError('required')) {
                          El apellido es requerido
                        }
                        @if (userForm.get('apellido')?.hasError('minlength')) {
                          Mínimo 2 caracteres
                        }
                      </span>
                    }
                  </div>

                  <div class="form-group">
                    <label for="email">Email <span class="required">*</span></label>
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
                          Email inválido
                        }
                      </span>
                    }
                  </div>
                </div>

                <!-- Contraseñas solo en modo creación -->
                @if (!isEditMode()) {
                  <div class="form-section">
                    <h3 class="section-title">🔒 Contraseña</h3>
                    
                    <div class="form-group">
                      <label for="password">Contraseña <span class="required">*</span></label>
                      <input
                        type="password"
                        id="password"
                        formControlName="password"
                        placeholder="Mínimo 6 caracteres"
                        [class.error]="isFieldInvalid('password')"
                      />
                      @if (isFieldInvalid('password')) {
                        <span class="error-message">
                          @if (userForm.get('password')?.hasError('required')) {
                            La contraseña es requerida
                          }
                          @if (userForm.get('password')?.hasError('minlength')) {
                            Mínimo 6 caracteres
                          }
                        </span>
                      }
                    </div>

                    <div class="form-group">
                      <label for="confirmPassword">Confirmar Contraseña <span class="required">*</span></label>
                      <input
                        type="password"
                        id="confirmPassword"
                        formControlName="confirmPassword"
                        placeholder="Repite la contraseña"
                        [class.error]="isFieldInvalid('confirmPassword') || userForm.hasError('passwordMismatch')"
                      />
                      @if (isFieldInvalid('confirmPassword')) {
                        <span class="error-message">Confirma la contraseña</span>
                      }
                      @if (userForm.hasError('passwordMismatch') && userForm.get('confirmPassword')?.touched) {
                        <span class="error-message">Las contraseñas no coinciden</span>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Columna Derecha -->
              <div class="form-column">
                
                <div class="form-section">
                  <h3 class="section-title">🎭 Rol y Permisos</h3>
                  
                  <div class="form-group">
                    <label for="rol">Rol <span class="required">*</span></label>
                    <select
                      id="rol"
                      formControlName="rol"
                      (change)="onRoleChange()"
                      [class.error]="isFieldInvalid('rol')"
                    >
                      <option value="">Seleccionar rol...</option>
                      @if (canAssignRole('admin_global')) {
                        <option value="admin_global">👑 Administrador Global</option>
                      }
                      @if (canAssignRole('admin_institucion')) {
                        <option value="admin_institucion">🏢 Admin de Institución</option>
                      }
                      @if (canAssignRole('vendedor')) {
                        <option value="vendedor">💼 Vendedor</option>
                      }
                      @if (canAssignRole('comprador')) {
                        <option value="comprador">🛒 Comprador</option>
                      }
                    </select>
                    @if (isFieldInvalid('rol')) {
                      <span class="error-message">Selecciona un rol</span>
                    }
                  </div>

                  @if (shouldShowInstitution()) {
                    <div class="form-group">
                      <label for="institucion_id">Institución <span class="required">*</span></label>
                      <select
                        id="institucion_id"
                        formControlName="institucion_id"
                        [class.error]="isFieldInvalid('institucion_id')"
                      >
                        <option value="">Seleccionar institución...</option>
                        <option value="1">Institución 1</option>
                        <option value="2">Institución 2</option>
                      </select>
                      @if (isFieldInvalid('institucion_id')) {
                        <span class="error-message">Selecciona una institución</span>
                      }
                    </div>
                  }

                  <div class="form-group">
                    <label for="estado">Estado</label>
                    <select id="estado" formControlName="estado">
                      <option value="activo">✅ Activo</option>
                      <option value="inactivo">⏸️ Inactivo</option>
                      <option value="suspendido">🚫 Suspendido</option>
                    </select>
                  </div>
                </div>

                @if (isEditMode()) {
                  <div class="info-box">
                    <div class="info-icon">ℹ️</div>
                    <div class="info-content">
                      <strong>Cambio de contraseña</strong>
                      <p>Para cambiar la contraseña, el usuario debe usar la opción "Olvidé mi contraseña".</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
              <button type="button" (click)="goBack()" class="btn btn-secondary">
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="userForm.invalid || isSaving()"
              >
                @if (isSaving()) {
                  <span class="spinner-sm"></span>
                  <span>{{ isEditMode() ? 'Actualizando...' : 'Creando...' }}</span>
                } @else {
                  <span>{{ isEditMode() ? '💾 Actualizar Usuario' : '➕ Crear Usuario' }}</span>
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
      padding: 2rem 1rem;
    }

    .page-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ===== HEADER ===== */
    .page-header {
      background: white;
      border-radius: 12px;
      padding: 1.5rem 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .header-title h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      color: #2d3748;
    }

    .header-title p {
      margin: 0;
      color: #718096;
      font-size: 0.95rem;
    }

    /* ===== ESTADOS ===== */
    .loading-container {
      background: white;
      border-radius: 12px;
      padding: 4rem 2rem;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e2e8f0;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
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

    .error-card {
      background: white;
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-card h3 {
      margin: 0 0 0.5rem 0;
      color: #e53e3e;
    }

    .error-card p {
      margin: 0 0 1.5rem 0;
      color: #718096;
    }

    /* ===== FORMULARIO ===== */
    .form-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .form-column {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .section-title {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      color: #4a5568;
      font-weight: 600;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .required {
      color: #e53e3e;
    }

    input, select {
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.95rem;
      transition: all 0.2s;
      background: white;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    input.error, select.error {
      border-color: #fc8181;
    }

    input.error:focus, select.error:focus {
      box-shadow: 0 0 0 3px rgba(252, 129, 129, 0.1);
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .error-message::before {
      content: '⚠️';
    }

    /* ===== INFO BOX ===== */
    .info-box {
      background: linear-gradient(135deg, #ebf4ff 0%, #e6f7ff 100%);
      border: 1px solid #bee3f8;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      gap: 0.75rem;
    }

    .info-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .info-content strong {
      display: block;
      color: #2c5282;
      margin-bottom: 0.25rem;
    }

    .info-content p {
      margin: 0;
      color: #4a5568;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    /* ===== BOTONES ===== */
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-family: inherit;
      font-weight: 500;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #4a5568;
      border: 2px solid #e2e8f0;
    }

    .btn-secondary:hover {
      background: #f7fafc;
      border-color: #cbd5e0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 2px solid #e2e8f0;
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 968px) {
      .form-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .page-header {
        padding: 1.25rem 1.5rem;
      }
    }

    @media (max-width: 640px) {
      .page-container {
        padding: 1rem 0.5rem;
      }

      .form-card {
        padding: 1.5rem;
      }

      .header-title h1 {
        font-size: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
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

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly currentUser = signal<UserExtended | null>(null);

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
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId && userId !== 'nuevo') {
      this.isEditMode.set(true);
      this.loadUser(parseInt(userId));
    } else {
      this.addPasswordValidators();
    }
  }

  private addPasswordValidators(): void {
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.userForm.setValidators(this.passwordMatchValidator);
    
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
  }

  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private loadUser(userId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.currentUser.set(user);
        
        this.userForm.patchValue({
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          email: user.email || '',
          rol: user.rol || '',
          estado: user.estado || 'activo',
          institucion_id: user.institucion_id || ''
        });
        
        this.userForm.markAsPristine();
        this.userForm.markAsUntouched();
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMsg = error?.message || 'Error desconocido';
        this.errorMessage.set('Error al cargar usuario: ' + errorMsg);
      }
    });
  }

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
        this.router.navigate(['/usuarios']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set('Error al crear usuario: ' + error.message);
      }
    });
  }

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
        this.router.navigate(['/usuarios']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set('Error al actualizar usuario: ' + error.message);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.markAsTouched();
    });
  }

  canAssignRole(role: UserRole): boolean {
    const currentUserRole = this.authService.userRole();
    
    if (currentUserRole === 'admin_global') return true;
    
    if (currentUserRole === 'admin_institucion') {
      return role === 'vendedor' || role === 'comprador';
    }
    
    return false;
  }

  shouldShowInstitution(): boolean {
    const rol = this.userForm.get('rol')?.value;
    return rol === 'admin_institucion' || rol === 'vendedor';
  }

  onRoleChange(): void {
    const rol = this.userForm.get('rol')?.value;
    
    if (!this.shouldShowInstitution()) {
      this.userForm.get('institucion_id')?.setValue('');
    }
  }

  goBack(): void {
    this.router.navigate(['/usuarios']);
  }

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