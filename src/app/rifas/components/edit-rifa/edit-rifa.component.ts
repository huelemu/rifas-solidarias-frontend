// src/app/rifas/components/edit-rifa/edit-rifa.component.ts

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-edit-rifa',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="edit-rifa-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <button 
              class="btn btn-outline back-btn"
              (click)="goBack()">
              ← Volver
            </button>
            <div class="header-title">
              <h1>✏️ Editar Rifa</h1>
              @if (originalRifa()) {
                <p>{{ originalRifa().nombre }}</p>
              }
            </div>
          </div>
          <div class="header-actions">
            <button 
              type="button"
              class="btn btn-secondary"
              (click)="resetForm()">
              🔄 Resetear
            </button>
            <button 
              type="submit"
              form="editRifaForm"
              class="btn btn-primary"
              [disabled]="!editForm.valid || saving()">
              @if (saving()) {
                ⏳ Guardando...
              } @else {
                💾 Guardar Cambios
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando datos de la rifa...</p>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="error-container">
          <div class="error-message">
            <h3>❌ Error</h3>
            <p>{{ error() }}</p>
            <button 
              class="btn btn-primary"
              (click)="loadRifa()">
              🔄 Reintentar
            </button>
          </div>
        </div>
      }

      <!-- Formulario -->
      @if (originalRifa() && !loading()) {
        <form 
          id="editRifaForm"
          [formGroup]="editForm"
          (ngSubmit)="onSubmit()"
          class="edit-form">
          
          <!-- Información Básica -->
          <div class="form-section">
            <h2>📝 Información Básica</h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="nombre">Nombre de la Rifa *</label>
                <input
                  id="nombre"
                  type="text"
                  formControlName="nombre"
                  class="form-control"
                  [class.error]="editForm.get('nombre')?.invalid && editForm.get('nombre')?.touched">
                @if (editForm.get('nombre')?.invalid && editForm.get('nombre')?.touched) {
                  <div class="error-text">El nombre es requerido</div>
                }
              </div>

              <div class="form-group full-width">
                <label for="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  formControlName="descripcion"
                  class="form-control"
                  rows="3"
                  placeholder="Describe los detalles de la rifa..."></textarea>
              </div>
            </div>
          </div>

          <!-- Configuración de Números y Precio -->
          <div class="form-section">
            <h2>🎯 Configuración</h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="cantidad_numeros">Cantidad de Números *</label>
                <input
                  id="cantidad_numeros"
                  type="number"
                  formControlName="cantidad_numeros"
                  class="form-control"
                  [class.error]="editForm.get('cantidad_numeros')?.invalid && editForm.get('cantidad_numeros')?.touched"
                  min="1"
                  max="10000">
                @if (editForm.get('cantidad_numeros')?.invalid && editForm.get('cantidad_numeros')?.touched) {
                  <div class="error-text">Debe ser un número entre 1 y 10,000</div>
                }
              </div>

              <div class="form-group">
                <label for="precio_numero">Precio por Número *</label>
                <input
                  id="precio_numero"
                  type="number"
                  formControlName="precio_numero"
                  class="form-control"
                  [class.error]="editForm.get('precio_numero')?.invalid && editForm.get('precio_numero')?.touched"
                  min="1"
                  step="0.01">
                @if (editForm.get('precio_numero')?.invalid && editForm.get('precio_numero')?.touched) {
                  <div class="error-text">El precio debe ser mayor a 0</div>
                }
              </div>

              <div class="form-group">
                <label for="comision_promotora">Comisión Promotora (%)</label>
                <input
                  id="comision_promotora"
                  type="number"
                  formControlName="comision_promotora"
                  class="form-control"
                  min="0"
                  max="100"
                  step="0.01">
              </div>

              <div class="form-group">
                <label for="requiere_aprobacion">¿Requiere Aprobación?</label>
                <select
                  id="requiere_aprobacion"
                  formControlName="requiere_aprobacion"
                  class="form-control">
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Fechas -->
          <div class="form-section">
            <h2>📅 Fechas</h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="fecha_inicio">Fecha de Inicio *</label>
                <input
                  id="fecha_inicio"
                  type="datetime-local"
                  formControlName="fecha_inicio"
                  class="form-control"
                  [class.error]="editForm.get('fecha_inicio')?.invalid && editForm.get('fecha_inicio')?.touched">
                @if (editForm.get('fecha_inicio')?.invalid && editForm.get('fecha_inicio')?.touched) {
                  <div class="error-text">La fecha de inicio es requerida</div>
                }
              </div>

              <div class="form-group">
                <label for="fecha_fin">Fecha de Fin *</label>
                <input
                  id="fecha_fin"
                  type="datetime-local"
                  formControlName="fecha_fin"
                  class="form-control"
                  [class.error]="editForm.get('fecha_fin')?.invalid && editForm.get('fecha_fin')?.touched">
                @if (editForm.get('fecha_fin')?.invalid && editForm.get('fecha_fin')?.touched) {
                  <div class="error-text">La fecha de fin es requerida</div>
                }
              </div>

              <div class="form-group">
                <label for="fecha_sorteo">Fecha de Sorteo</label>
                <input
                  id="fecha_sorteo"
                  type="datetime-local"
                  formControlName="fecha_sorteo"
                  class="form-control">
              </div>

              <div class="form-group">
                <label for="fecha_limite_participacion">Límite de Participación</label>
                <input
                  id="fecha_limite_participacion"
                  type="datetime-local"
                  formControlName="fecha_limite_participacion"
                  class="form-control">
              </div>
            </div>
          </div>

          <!-- Estado -->
          <div class="form-section">
            <h2>📊 Estado</h2>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="estado">Estado de la Rifa</label>
                <select
                  id="estado"
                  formControlName="estado"
                  class="form-control">
                  <option value="borrador">📝 Borrador</option>
                  <option value="activa">✅ Activa</option>
                  <option value="pausada">⏸️ Pausada</option>
                  <option value="cerrada">🔒 Cerrada</option>
                  <option value="finalizada">🏁 Finalizada</option>
                  <option value="cancelada">❌ Cancelada</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Información Adicional -->
          <div class="form-section">
            <h2>📋 Información Adicional</h2>
            
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="bases_condiciones">Bases y Condiciones</label>
                <textarea
                  id="bases_condiciones"
                  formControlName="bases_condiciones"
                  class="form-control"
                  rows="4"
                  placeholder="Términos y condiciones de la rifa..."></textarea>
              </div>

              <div class="form-group full-width">
                <label for="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  formControlName="observaciones"
                  class="form-control"
                  rows="3"
                  placeholder="Notas adicionales..."></textarea>
              </div>

              <div class="form-group">
                <label for="imagen_url">URL de Imagen</label>
                <input
                  id="imagen_url"
                  type="url"
                  formControlName="imagen_url"
                  class="form-control"
                  placeholder="https://ejemplo.com/imagen.jpg">
              </div>
            </div>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .edit-rifa-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      margin-bottom: 24px;
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .back-btn {
        padding: 8px 16px;
        text-decoration: none;
      }
      
      .header-title h1 {
        margin: 0;
        color: #1f2937;
      }
      
      .header-title p {
        margin: 4px 0 0 0;
        color: #6b7280;
      }
      
      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      h2 {
        margin: 0 0 20px 0;
        color: #1f2937;
        font-size: 18px;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      
      &.full-width {
        grid-column: 1 / -1;
      }
      
      label {
        font-weight: 600;
        color: #374151;
        font-size: 14px;
      }
    }

    .form-control {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      
      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      &.error {
        border-color: #dc2626;
        
        &:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
      }
    }

    .error-text {
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
    }

    .btn {
      padding: 10px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-primary { 
      background: #3b82f6; 
      color: white;
      
      &:hover:not(:disabled) {
        background: #2563eb;
      }
    }
    
    .btn-secondary { 
      background: #6b7280; 
      color: white;
      
      &:hover:not(:disabled) {
        background: #374151;
      }
    }
    
    .btn-outline { 
      background: transparent; 
      border: 1px solid #d1d5db; 
      color: #374151;
      
      &:hover:not(:disabled) {
        background: #f9fafb;
        border-color: #9ca3af;
      }
    }

    .loading-container, .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      flex-direction: column;
      gap: 16px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      text-align: center;
      
      h3 {
        color: #dc2626;
        margin-bottom: 8px;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }
      
      .header-left {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EditRifaComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Signals
  readonly originalRifa = signal<any>(null);
  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private rifaId: number = 0;

  // Formulario
  editForm: FormGroup;

  constructor() {
    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      cantidad_numeros: [100, [Validators.required, Validators.min(1), Validators.max(10000)]],
      precio_numero: [100, [Validators.required, Validators.min(1)]],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      fecha_sorteo: [''],
      fecha_limite_participacion: [''],
      comision_promotora: [5, [Validators.min(0), Validators.max(100)]],
      requiere_aprobacion: [false],
      estado: ['borrador'],
      bases_condiciones: [''],
      observaciones: [''],
      imagen_url: ['']
    });
  }

  ngOnInit() {
    // Obtener ID de la rifa de la ruta
    this.route.params.subscribe(params => {
      this.rifaId = +params['id'];
      if (this.rifaId) {
        this.loadRifa();
      } else {
        this.error.set('ID de rifa inválido');
        this.loading.set(false);
      }
    });
  }

  /**
   * Cargar datos de la rifa
   */
  loadRifa(): void {
    this.loading.set(true);
    this.error.set(null);

    this.rifasService.getRifa(this.rifaId).subscribe({
      next: (response) => {
        console.log('📦 Rifa cargada para edición:', response);
        const rifa = response.data || response;
        this.originalRifa.set(rifa);
        this.populateForm(rifa);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando rifa:', error);
        this.error.set(error?.error?.message || 'Error al cargar la rifa');
        this.loading.set(false);
      }
    });
  }

  /**
   * Poblar formulario con datos de la rifa
   */
  private populateForm(rifa: any): void {
    this.editForm.patchValue({
      nombre: rifa.nombre || '',
      descripcion: rifa.descripcion || '',
      cantidad_numeros: rifa.cantidad_numeros || 100,
      precio_numero: rifa.precio_numero || 100,
      fecha_inicio: this.formatDateForInput(rifa.fecha_inicio),
      fecha_fin: this.formatDateForInput(rifa.fecha_fin),
      fecha_sorteo: this.formatDateForInput(rifa.fecha_sorteo),
      fecha_limite_participacion: this.formatDateForInput(rifa.fecha_limite_participacion),
      comision_promotora: rifa.comision_promotora || 5,
      requiere_aprobacion: rifa.requiere_aprobacion || false,
      estado: rifa.estado || 'borrador',
      bases_condiciones: rifa.bases_condiciones || '',
      observaciones: rifa.observaciones || '',
      imagen_url: rifa.imagen_url || ''
    });
  }

  /**
   * Formatear fecha para input datetime-local
   */
  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  }

  /**
   * Resetear formulario a valores originales
   */
  resetForm(): void {
    if (this.originalRifa()) {
      this.populateForm(this.originalRifa());
    }
  }

  /**
   * Guardar cambios
   */
  onSubmit(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.editForm.value;
    this.saving.set(true);

    // Convertir boolean strings a boolean
    formData.requiere_aprobacion = formData.requiere_aprobacion === 'true';

    console.log('💾 Guardando cambios:', formData);

    this.rifasService.updateRifa(this.rifaId, formData).subscribe({
      next: (response) => {
        console.log('✅ Rifa actualizada exitosamente:', response);
        this.saving.set(false);
        
        // Mostrar mensaje de éxito
        alert('✅ Rifa actualizada exitosamente');
        
        // Volver al detalle
        this.router.navigate(['/rifas', this.rifaId]);
      },
      error: (error) => {
        console.error('❌ Error actualizando rifa:', error);
        this.saving.set(false);
        
        const errorMessage = error?.error?.message || error.message || 'Error desconocido';
        alert('❌ Error al actualizar la rifa: ' + errorMessage);
      }
    });
  }

  /**
   * Marcar todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      this.editForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Volver atrás
   */
  goBack(): void {
    const hasChanges = this.editForm.dirty;
    
    if (hasChanges) {
      const confirmed = confirm('¿Estás seguro? Se perderán los cambios no guardados.');
      if (!confirmed) return;
    }
    
    this.router.navigate(['/rifas', this.rifaId]);
  }

  /**
   * Verificar permisos de edición
   */
  canEdit(): boolean {
    const currentUser = this.authService.currentUser();
    const rifa = this.originalRifa();
    
    if (!rifa || !currentUser) return false;
    
    return currentUser.role === 'admin_global' || rifa.creado_por === currentUser.id;
  }
}