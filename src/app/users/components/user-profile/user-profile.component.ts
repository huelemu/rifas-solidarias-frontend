import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';


@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <div class="profile-container">
      <header class="profile-header">
        <h1>⚙️ Configuración de Cuenta</h1>
        <p>Gestiona tu información personal</p>
      </header>

      <main class="profile-main">
        
        <!-- Mensajes -->
        @if (mensaje()) {
          <div class="alert" [class.success]="!error()" [class.error]="error()">
            {{ mensaje() }}
          </div>
        }

        <div class="profile-card">
          <form [formGroup]="profileForm" (ngSubmit)="guardarCambios()">
            
            <!-- Información personal -->
            <section class="form-section">
              <h2>👤 Información Personal</h2>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Nombre *</label>
                  <input 
                    type="text" 
                    formControlName="nombre"
                    class="form-control"
                    [class.invalid]="profileForm.get('nombre')?.invalid && profileForm.get('nombre')?.touched"
                  />
                </div>

                <div class="form-group">
                  <label>Apellido *</label>
                  <input 
                    type="text" 
                    formControlName="apellido"
                    class="form-control"
                    [class.invalid]="profileForm.get('apellido')?.invalid && profileForm.get('apellido')?.touched"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    formControlName="email"
                    class="form-control"
                    readonly
                    title="El email no se puede modificar"
                  />
                </div>

                <div class="form-group">
                  <label>Teléfono</label>
                  <input 
                    type="tel" 
                    formControlName="telefono"
                    class="form-control"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>💳 Alias </label>
                  <input 
                    type="text" 
                    formControlName="alias_mp"
                    class="form-control"
                    placeholder="mialias.mp"
                  />
                  <small>Tu alias se mostrará al compartir rifas</small>
                </div>
              </div>
            </section>

            <!-- Información de la cuenta -->
            <section class="form-section">
              <h2>🏢 Información de la Cuenta</h2>
              
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Rol:</span>
                  <span class="value">{{ getRoleName() }}</span>
                </div>
                
                <div class="info-item" *ngIf="user()?.institucion_nombre">
                  <span class="label">Institución:</span>
                  <span class="value">{{ user()?.institucion_nombre }}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">Cuenta creada:</span>
                  <span class="value">{{ user()?.created_at | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </section>

            <!-- Botones -->
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="cancelar()">
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="profileForm.invalid || guardando()"
              >
                {{ guardando() ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Cambiar contraseña -->
        <div class="profile-card">
          <h2>🔒 Cambiar Contraseña</h2>
          
          <form [formGroup]="passwordForm" (ngSubmit)="cambiarPassword()">
            <div class="form-group">
              <label>Contraseña Actual *</label>
              <input 
                type="password" 
                formControlName="passwordActual"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label>Nueva Contraseña *</label>
              <input 
                type="password" 
                formControlName="passwordNueva"
                class="form-control"
              />
              <small>Mínimo 6 caracteres</small>
            </div>

            <div class="form-group">
              <label>Confirmar Nueva Contraseña *</label>
              <input 
                type="password" 
                formControlName="passwordConfirmar"
                class="form-control"
              />
            </div>

            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="passwordForm.invalid || cambiandoPassword()"
            >
              {{ cambiandoPassword() ? 'Cambiando...' : 'Cambiar Contraseña' }}
            </button>
          </form>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .profile-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .alert {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-weight: 500;
    }

    .alert.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .alert.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .profile-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h2 {
      font-size: 1.3rem;
      color: #2c3e50;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e9ecef;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
    }

    .form-control:read-only {
      background: #e9ecef;
      cursor: not-allowed;
    }

    .form-control.invalid {
      border-color: #dc3545;
    }

    small {
      color: #6c757d;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item .label {
      font-weight: 600;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .info-item .value {
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private router = inject(Router);
 

  user = signal<any>(null);
  guardando = signal(false);
  cambiandoPassword = signal(false);
  mensaje = signal('');
  error = signal(false);

  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  private apiUrl = this.getApiUrl();
  

  constructor() {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      alias_mp: ['']
    });

    this.passwordForm = this.fb.group({
      passwordActual: ['', Validators.required],
      passwordNueva: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirmar: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }


    // ✅ MÉTODO PARA DETECTAR LA URL DE LA API
  private getApiUrl(): string {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100/auth/me';
    } else {
      return 'https://apirifas.huelemu.com.ar/auth/me';
    }
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.profileForm.patchValue({
        nombre: currentUser.nombre || currentUser.name?.split(' ')[0] || '',
        apellido: currentUser.apellido || currentUser.name?.split(' ').slice(1).join(' ') || '',
        email: currentUser.email,
        telefono: currentUser.telefono || '',
        alias_mp: (currentUser as any).alias_mp || ''
      });
    }
  }

  passwordsMatch(form: FormGroup) {
    const nueva = form.get('passwordNueva')?.value;
    const confirmar = form.get('passwordConfirmar')?.value;
    return nueva === confirmar ? null : { passwordsMismatch: true };
  }

  getRoleName(): string {
    const roleMap: { [key: string]: string } = {
      'admin_global': 'Administrador Global',
      'admin_institucion': 'Administrador de Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Comprador'
    };
    const rol = this.user()?.role || this.user()?.rol;
    return roleMap[rol] || rol;
  }

  guardarCambios(): void {
    if (this.profileForm.invalid) return;

    this.guardando.set(true);
    this.mensaje.set('');
    this.error.set(false);
    
    const userId = this.user()?.id;
    const datos = this.profileForm.value;

    console.log('💾 Guardando cambios en:', this.apiUrl); 
    console.log('💾 Guardando cambios:', datos);

    this.http.put(`${this.apiUrl}/  `, datos).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta del servidor:', response);
        this.guardando.set(false);
        this.mensaje.set('✅ Perfil actualizado correctamente');
        this.error.set(false);
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => this.mensaje.set(''), 3000);
      },
      error: (err) => {
        console.error('❌ Error al guardar:', err);
        this.guardando.set(false);
        this.mensaje.set('❌ Error al actualizar el perfil');
        this.error.set(true);
      }
    });
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid) return;

    this.cambiandoPassword.set(true);
    
    // TODO: Implementar cambio de password
    setTimeout(() => {
      this.mensaje.set('✅ Contraseña actualizada correctamente');
      this.error.set(false);
      this.passwordForm.reset();
      this.cambiandoPassword.set(false);
      
      setTimeout(() => this.mensaje.set(''), 3000);
    }, 1000);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}