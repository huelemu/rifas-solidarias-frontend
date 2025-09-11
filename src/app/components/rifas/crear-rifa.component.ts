// src/app/components/rifas/crear-rifa.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RifaService, Rifa } from '../../services/rifa.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-crear-rifa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="crear-rifa-container">
      <div class="header">
        <h1>{{ esEdicion ? '✏️ Editar Rifa' : '➕ Crear Nueva Rifa' }}</h1>
        <button type="button" (click)="volver()" class="btn btn-secondary">
          ← Volver
        </button>
      </div>

      <!-- Formulario -->
      <form [formGroup]="rifaForm" (ngSubmit)="onSubmit()" class="rifa-form">
        
        <!-- Información Básica -->
        <div class="form-section">
          <h3>📝 Información Básica</h3>
          
          <div class="form-group">
            <label for="titulo">Título de la Rifa *</label>
            <input 
              type="text" 
              id="titulo"
              formControlName="titulo" 
              class="form-control"
              placeholder="Ej: Rifa Solidaria - Televisor 55 pulgadas"
              [class.is-invalid]="titulo?.invalid && titulo?.touched">
            <div *ngIf="titulo?.invalid && titulo?.touched" class="invalid-feedback">
              <small *ngIf="titulo?.errors?.['required']">El título es obligatorio</small>
            </div>
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <textarea 
              id="descripcion"
              formControlName="descripcion" 
              class="form-control"
              rows="4"
              placeholder="Describe los premios, objetivo de la rifa, etc.">
            </textarea>
          </div>
        </div>

        <!-- Configuración de Números -->
        <div class="form-section">
          <h3>🎯 Configuración</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="total_numeros">Cantidad de Números *</label>
              <input 
                type="number" 
                id="total_numeros"
                formControlName="total_numeros" 
                class="form-control"
                min="1"
                placeholder="100">
            </div>

            <div class="form-group">
              <label for="precio_numero">Precio por Número *</label>
              <input 
                type="number" 
                id="precio_numero"
                formControlName="precio_numero" 
                class="form-control"
                min="0.01"
                step="0.01"
                placeholder="50.00">
            </div>
          </div>
        </div>

        <!-- Fechas -->
        <div class="form-section">
          <h3>📅 Fechas</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="fecha_inicio">Fecha de Inicio *</label>
              <input 
                type="date" 
                id="fecha_inicio"
                formControlName="fecha_inicio" 
                class="form-control">
            </div>

            <div class="form-group">
              <label for="fecha_fin">Fecha de Fin *</label>
              <input 
                type="date" 
                id="fecha_fin"
                formControlName="fecha_fin" 
                class="form-control">
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <button 
            type="button" 
            (click)="volver()" 
            class="btn btn-secondary">
            Cancelar
          </button>
          
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="rifaForm.invalid || guardando">
            <span *ngIf="guardando">⏳ Guardando...</span>
            <span *ngIf="!guardando">
              {{ esEdicion ? '💾 Actualizar' : '🚀 Crear Rifa' }}
            </span>
          </button>
        </div>
      </form>

      <!-- Mensajes de estado -->
      <div *ngIf="mensaje" class="alert" [class]="'alert-' + tipoMensaje">
        {{ mensaje }}
      </div>
    </div>
  `,
  styles: [`
    .crear-rifa-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
    }

    .header h1 {
      margin: 0;
      color: #2c3e50;
      font-weight: 600;
    }

    .rifa-form {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .form-section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e9ecef;
    }

    .form-section:last-child {
      border-bottom: none;
    }

    .form-section h3 {
      margin-bottom: 20px;
      color: #495057;
      font-size: 18px;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: flex;
      gap: 20px;
    }

    .form-row .form-group {
      flex: 1;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #495057;
    }

    .form-control {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .invalid-feedback {
      display: block;
      margin-top: 5px;
      color: #dc3545;
      font-size: 12px;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alert {
      padding: 15px 20px;
      border-radius: 8px;
      margin-top: 20px;
    }

    .alert-success {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }

    .alert-danger {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    @media (max-width: 768px) {
      .crear-rifa-container {
        padding: 15px;
      }

      .header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .form-row {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column;
        gap: 15px;
      }
    }
  `]
})
export class CrearRifaComponent implements OnInit {
  rifaForm: FormGroup;
  esEdicion = false;
  rifaId?: number;
  guardando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'danger' | 'info' = 'info';

  constructor(
    private fb: FormBuilder,
    private rifaService: RifaService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.rifaForm = this.createForm();
  }

  ngOnInit() {
    this.checkEdition();
    this.setDefaultValues();
  }

  createForm(): FormGroup {
    return this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: [''],
      total_numeros: [100, [Validators.required, Validators.min(1)]],
      precio_numero: [50, [Validators.required, Validators.min(0.01)]],
      fecha_inicio: [this.getTodayString(), Validators.required],
      fecha_fin: [this.getDateString(30), Validators.required]
    });
  }

  checkEdition() {
    this.rifaId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.rifaId) {
      this.esEdicion = true;
      this.cargarRifa();
    }
  }

  cargarRifa() {
    if (!this.rifaId) return;

    this.rifaService.obtenerRifaPorId(this.rifaId).subscribe({
      next: (response) => {
        if (response.success) {
          this.llenarFormulario(response.data);
        } else {
          this.mostrarMensaje('Error al cargar la rifa', 'danger');
        }
      },
      error: (error) => {
        console.error('Error al cargar rifa:', error);
        this.mostrarMensaje('Error al cargar la rifa', 'danger');
      }
    });
  }

  llenarFormulario(rifa: Rifa) {
    this.rifaForm.patchValue({
      titulo: rifa.titulo,
      descripcion: rifa.descripcion,
      total_numeros: rifa.total_numeros,
      precio_numero: rifa.precio_numero,
      fecha_inicio: this.formatDateForInput(rifa.fecha_inicio),
      fecha_fin: this.formatDateForInput(rifa.fecha_fin)
    });
  }

  setDefaultValues() {
    const today = this.getTodayString();
    const futureDate = this.getDateString(30);
    
    this.rifaForm.patchValue({
      fecha_inicio: today,
      fecha_fin: futureDate
    });
  }

  onSubmit() {
    if (this.rifaForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.guardando = true;
    const formData = this.rifaForm.value;
    formData.institucion_id = this.authService.getCurrentUser()?.institucion_id || 1;

    if (this.esEdicion && this.rifaId) {
      this.actualizarRifa(formData);
    } else {
      this.crearRifa(formData);
    }
  }

  crearRifa(formData: any) {
    this.rifaService.crearRifa(formData).subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.success) {
          this.mostrarMensaje('Rifa creada exitosamente', 'success');
          setTimeout(() => {
            this.router.navigate(['/rifas']);
          }, 2000);
        } else {
          this.mostrarMensaje(response.message || 'Error al crear la rifa', 'danger');
        }
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al crear rifa:', error);
        this.mostrarMensaje('Error al crear la rifa', 'danger');
      }
    });
  }

  actualizarRifa(formData: any) {
    if (!this.rifaId) return;

    this.rifaService.actualizarRifa(this.rifaId, formData).subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.success) {
          this.mostrarMensaje('Rifa actualizada exitosamente', 'success');
          setTimeout(() => {
            this.router.navigate(['/rifas']);
          }, 2000);
        } else {
          this.mostrarMensaje(response.message || 'Error al actualizar la rifa', 'danger');
        }
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al actualizar rifa:', error);
        this.mostrarMensaje('Error al actualizar la rifa', 'danger');
      }
    });
  }

  volver() {
    this.router.navigate(['/rifas']);
  }

  markFormGroupTouched() {
    Object.keys(this.rifaForm.controls).forEach(key => {
      const control = this.rifaForm.get(key);
      control?.markAsTouched();
    });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'danger' | 'info') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }

  // Utility functions para fechas
  getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getDateString(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Getters para fácil acceso a los controles del formulario
  get titulo() { return this.rifaForm.get('titulo'); }
  get descripcion() { return this.rifaForm.get('descripcion'); }
  get total_numeros() { return this.rifaForm.get('total_numeros'); }
  get precio_numero() { return this.rifaForm.get('precio_numero'); }
  get fecha_inicio() { return this.rifaForm.get('fecha_inicio'); }
  get fecha_fin() { return this.rifaForm.get('fecha_fin'); }
}