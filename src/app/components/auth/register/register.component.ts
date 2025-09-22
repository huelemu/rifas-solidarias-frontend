// src/app/components/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, UserRole, UserRoleType, RegisterRequest, ApiResponse } from '../../../services/auth.service';



interface Institucion {
  id: number;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  public UserRole = UserRole;
  errorMessage = '';
  instituciones: Institucion[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', [Validators.required]],
      institucion_id: ['']
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.redirectToDashboard();
    }

    this.loadInstituciones();
    this.setupRolValidation();
  }

  get nombre() { return this.registerForm.get('nombre'); }
  get apellido() { return this.registerForm.get('apellido'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get rol() { return this.registerForm.get('rol'); }
  get institucion_id() { return this.registerForm.get('institucion_id'); }

  get showInstitucionField(): boolean {
    const rolValue = this.rol?.value;
    return rolValue === UserRole.VENDEDOR || rolValue === UserRole.ADMIN_INSTITUCION;
  }

  private setupRolValidation(): void {
    this.rol?.valueChanges.subscribe((value: string) => {
      if (value === UserRole.VENDEDOR || value === UserRole.ADMIN_INSTITUCION) {
        this.institucion_id?.setValidators([Validators.required]);
      } else {
        this.institucion_id?.clearValidators();
        this.institucion_id?.setValue('');
      }
      this.institucion_id?.updateValueAndValidity();
    });
  }

  private loadInstituciones(): void {
    const apiUrl = (this.authService as any).API_BASE_URL;
    this.http.get<ApiResponse<Institucion[]>>(`${apiUrl}/instituciones`).subscribe({
      next: (response: ApiResponse<Institucion[]>) => {
        if (response.success && response.data) {
          this.instituciones = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading instituciones:', error);
      }
    });
  }

  onSubmit(): void {
    if (!this.registerForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userData: RegisterRequest = { ...this.registerForm.value };

    if (userData.institucion_id) {
      userData.institucion_id = parseInt(userData.institucion_id as unknown as string);
    } else {
      delete userData.institucion_id;
    }

    this.authService.register(userData).subscribe({
      next: (res: ApiResponse) => {
        if (res.success) {
          this.router.navigate(['/login'], { queryParams: { message: 'Registro exitoso. Inicia sesión.' } });
        } else {
          this.errorMessage = res.message || 'Error al registrar usuario';
        }
      },
      error: (err: any) => {
        console.error('Error registro:', err);
        this.errorMessage = err.error?.message || 'Error al registrar usuario';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
