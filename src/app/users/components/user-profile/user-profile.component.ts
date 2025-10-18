// src/app/users/components/user-profile/user-profile.component.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';  // ✅ AGREGAR
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    NavbarComponent  // ✅ AGREGAR
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  
  private readonly apiUrl = environment.apiUrl;

  // Signals
  readonly user = this.authService.currentUser;
  readonly guardando = signal(false);
  readonly cambiandoPassword = signal(false);
  readonly mensaje = signal('');
  readonly error = signal(false);

  // Forms
  profileForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    telefono: [''],
    alias_mp: ['']
  });

  passwordForm: FormGroup = this.fb.group({
    passwordActual: ['', Validators.required],
    passwordNueva: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirmar: ['', Validators.required]
  }, { validators: this.passwordsMatch });

  ngOnInit(): void {
    const currentUser = this.user();
    if (currentUser) {
      this.profileForm.patchValue({
        nombre: currentUser.name?.split(' ')[0] || currentUser.nombre || '',
        apellido: currentUser.name?.split(' ').slice(1).join(' ') || currentUser.apellido || '',
        email: currentUser.email,
        telefono: currentUser.telefono || '',
        alias_mp: currentUser.alias_mp || ''
      });
    }
  }

  passwordsMatch(formGroup: FormGroup) {
    const nueva = formGroup.get('passwordNueva')?.value;
    const confirmar = formGroup.get('passwordConfirmar')?.value;
    return nueva === confirmar ? null : { passwordsMismatch: true };
  }

  getRoleName(): string {
    const roleMap: Record<string, string> = {
      'admin_global': 'Administrador Global',
      'admin_institucion': 'Administrador de Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Comprador'
    };
    
    // ✅ CORREGIDO: Usar operador de coalescencia nula
    const rol = this.user()?.role || this.user()?.rol || '';
    return roleMap[rol] || rol;
  }

  guardarCambios(): void {
  if (this.profileForm.invalid) return;

  this.guardando.set(true);
  this.mensaje.set('');
  this.error.set(false);
  
  const datos = {
    nombre: this.profileForm.get('nombre')?.value,
    apellido: this.profileForm.get('apellido')?.value,
    telefono: this.profileForm.get('telefono')?.value,
    alias_mp: this.profileForm.get('alias_mp')?.value
  };

  console.log('💾 Guardando cambios:', datos);

  this.http.put<any>(`${this.apiUrl}/auth/me`, datos).subscribe({
    next: (response) => {
      console.log('✅ Respuesta del servidor:', response);
      this.guardando.set(false);
      
      if (response.status === 'success') {
        this.mensaje.set('✅ Perfil actualizado correctamente');
        this.error.set(false);
        
        // ✅ MEJORADO: Actualizar el usuario y recargar el formulario
        this.authService.refreshUser().subscribe({
          next: () => {
            console.log('✅ Usuario actualizado en el servicio');
            
            // ✅ NUEVO: Recargar el formulario con los datos actualizados
            const updatedUser = this.user();
            if (updatedUser) {
              this.profileForm.patchValue({
                nombre: updatedUser.nombre || '',
                apellido: updatedUser.apellido || '',
                telefono: updatedUser.telefono || '',
                alias_mp: updatedUser.alias_mp || ''
              });
              console.log('✅ Formulario actualizado con los nuevos datos');
            }
          },
          error: (err) => {
            console.warn('⚠️ Error al refrescar usuario:', err);
          }
        });
      } else {
        this.mensaje.set('❌ Error al actualizar el perfil');
        this.error.set(true);
      }
      
      setTimeout(() => this.mensaje.set(''), 5000);
    },
    error: (err) => {
      console.error('❌ Error al guardar:', err);
      this.guardando.set(false);
      this.mensaje.set(err.error?.message || '❌ Error al actualizar el perfil');
      this.error.set(true);
      
      setTimeout(() => this.mensaje.set(''), 5000);
    }
  });
}

  cambiarPassword(): void {
    if (this.passwordForm.invalid) return;

    this.cambiandoPassword.set(true);
    
    const datos = {
      passwordActual: this.passwordForm.get('passwordActual')?.value,
      passwordNueva: this.passwordForm.get('passwordNueva')?.value
    };

    this.http.put<any>(`${this.apiUrl}/auth/change-password`, datos).subscribe({
      next: (response) => {
        console.log('✅ Contraseña cambiada:', response);
        this.mensaje.set('✅ Contraseña actualizada correctamente');
        this.error.set(false);
        this.passwordForm.reset();
        this.cambiandoPassword.set(false);
        
        setTimeout(() => this.mensaje.set(''), 5000);
      },
      error: (err) => {
        console.error('❌ Error al cambiar contraseña:', err);
        this.mensaje.set(err.error?.message || '❌ Error al cambiar la contraseña');
        this.error.set(true);
        this.cambiandoPassword.set(false);
        
        setTimeout(() => this.mensaje.set(''), 5000);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}