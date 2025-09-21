import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

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
    return rolValue === 'vendedor' || rolValue === 'admin_institucion';
  }

  private setupRolValidation(): void {
    this.rol?.valueChanges.subscribe(value => {
      if (value === 'vendedor' || value === 'admin_institucion') {
        this.institucion_id?.setValidators([Validators.required]);
      } else {
        this.institucion_id?.clearValidators();
        this.institucion_id?.setValue('');
      }
      this.institucion_id?.updateValueAndValidity();
    });
  }

  private loadInstituciones(): void {
    // Obtener la URL base desde el AuthService
    const apiUrl = (this.authService as any).API_BASE_URL;
    
    this.http.get<any>(`${apiUrl}/instituciones`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.instituciones = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading instituciones:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const userData = { ...this.registerForm.value };
      
      // Convertir institucion_id a número si existe
      if (userData.institucion_id) {
        userData.institucion_id = parseInt(userData.institucion_id);
      } else {
        delete userData.institucion_id;
      }

      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.router.navigate(['/login'], { 
            queryParams: { message: 'Registro exitoso. Inicia sesión con tu cuenta.' }
          });
        },
        error: (error) => {
          console.error('Error en registro:', error);
          this.errorMessage = error || 'Error al registrar usuario';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}