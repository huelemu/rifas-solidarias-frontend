// src/app/rifas/components/crear-rifa/crear-rifa.component.ts

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { RifasService } from '../../services/rifas.service';
import { InstitutionService } from '../../../institutions/services/institution.service';
import { Institution } from '../../../institutions/models/institution.models';
import {
  CreateRifaRequest,
  RIFA_CONFIG
} from '../../models/rifa.models';

@Component({
  selector: 'app-crear-rifa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './crear-rifa.component.html',
  styleUrls: ['./crear-rifa.component.scss', '../../../../styles.scss' ]
})
export class CrearRifaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly rifasService = inject(RifasService);
  private readonly institutionService = inject(InstitutionService);
  private readonly router = inject(Router);

  // Estado del componente
  readonly submitting = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loadingInstituciones = signal<boolean>(false);

  // Instituciones
  readonly instituciones = signal<Institution[]>([]);
  readonly institucionesParticipantes = signal<Institution[]>([]);
  
  // Imagen
  readonly uploadingImage = signal<boolean>(false);
  readonly imagePreview = signal<string | null>(null);

  // Formulario
  rifaForm: FormGroup;
  readonly RIFA_CONFIG = RIFA_CONFIG;

  // Selector temporal para agregar instituciones
  selectedInstitucionId: number | null = null;

  constructor() {
    this.rifaForm = this.createForm();
  }

  ngOnInit() {
    if (!this.canCreateRifa()) {
      this.router.navigate(['/rifas']);
      return;
    }
    this.loadInstituciones();
  }

  // =====================================================
  // CREACIÓN DEL FORMULARIO (SIMPLIFICADO)
  // =====================================================

  private createForm(): FormGroup {
    const hoy = new Date();
    const defaultInicio = new Date(hoy);
    defaultInicio.setDate(hoy.getDate() + 1);
    
    const defaultFin = new Date(hoy);
    defaultFin.setDate(hoy.getDate() + 30);

    return this.fb.group({
      // 1. INFORMACIÓN BÁSICA
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      imagen_url: [''],

      // 2. CONFIGURACIÓN DE NÚMEROS
      cantidad_numeros: [1000, [Validators.required, Validators.min(RIFA_CONFIG.MIN_NUMEROS), Validators.max(RIFA_CONFIG.MAX_NUMEROS)]],
      precio_numero: [100, [Validators.required, Validators.min(RIFA_CONFIG.MIN_PRECIO), Validators.max(RIFA_CONFIG.MAX_PRECIO)]],

      // 3. FECHAS (SOLO FECHA, SIN HORA)
      fecha_inicio: [this.formatDateForInput(defaultInicio), Validators.required],
      fecha_fin: [this.formatDateForInput(defaultFin), Validators.required],
      fecha_sorteo: [''],

      // 4. GESTIÓN DE INSTITUCIONES
      institucion_promotora_id: [null, Validators.required],
      comision_promotora: [0, [Validators.min(0), Validators.max(50)]],
      es_multiple: [false],
      max_instituciones_participantes: [{ value: null, disabled: true }],
      numeros_por_institucion: [{ value: null, disabled: true }],
      fecha_limite_participacion: [{ value: '', disabled: true }],

      // 5. CONFIGURACIÓN ADICIONAL
      requiere_aprobacion: [false],
      bases_condiciones: [''],
      observaciones: ['']
    }, {
      validators: [this.dateRangeValidator, this.sorteoDateValidator]
    });
  }

  // =====================================================
  // CARGA DE INSTITUCIONES DESDE EL SERVICIO
  // =====================================================

  private loadInstituciones(): void {
    this.loadingInstituciones.set(true);
    
    this.institutionService.getInstitutions().subscribe({
      next: (response) => {
        console.log('📥 Instituciones recibidas:', response);
        this.instituciones.set(response.institutions || []);
        this.loadingInstituciones.set(false);
        
        // Si el usuario es promotor de una institución, pre-seleccionarla
        const user = this.authService.currentUser();
        if (user?.role === 'admin_institucion' && user.institucion_id) {
          this.rifaForm.patchValue({
            institucion_promotora_id: user.institucion_id
          });
        }
      },
      error: (error) => {
        console.error('❌ Error cargando instituciones:', error);
        this.error.set('Error al cargar instituciones');
        this.loadingInstituciones.set(false);
      }
    });
  }

  // =====================================================
  // GESTIÓN DE INSTITUCIONES PARTICIPANTES
  // =====================================================

  onEsMultipleChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const esMultiple = checkbox.checked;
    
    if (esMultiple) {
      this.rifaForm.get('max_instituciones_participantes')?.enable();
      this.rifaForm.get('numeros_por_institucion')?.enable();
      this.rifaForm.get('fecha_limite_participacion')?.enable();
    } else {
      this.rifaForm.patchValue({
        max_instituciones_participantes: null,
        numeros_por_institucion: null,
        fecha_limite_participacion: ''
      });
      this.rifaForm.get('max_instituciones_participantes')?.disable();
      this.rifaForm.get('numeros_por_institucion')?.disable();
      this.rifaForm.get('fecha_limite_participacion')?.disable();
      this.institucionesParticipantes.set([]);
    }
  }

  getAvailableInstituciones(): Institution[] {
    const seleccionadas = this.institucionesParticipantes().map(i => i.id);
    const promotora = this.rifaForm.get('institucion_promotora_id')?.value;
    
    return this.instituciones().filter(i => 
      !seleccionadas.includes(i.id) && i.id !== promotora
    );
  }

  addInstitucion(): void {
    if (!this.selectedInstitucionId) return;
    
    const inst = this.instituciones().find(i => i.id === Number(this.selectedInstitucionId));
    if (inst && !this.institucionesParticipantes().find(i => i.id === inst.id)) {
      this.institucionesParticipantes.update(arr => [...arr, inst]);
      this.selectedInstitucionId = null;
    }
  }

  removeInstitucion(id: number): void {
    this.institucionesParticipantes.update(arr => arr.filter(i => i.id !== id));
  }

  // =====================================================
  // GESTIÓN DE IMAGEN
  // =====================================================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    
    if (!file.type.startsWith('image/')) {
      this.error.set('Por favor seleccione una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error.set('La imagen no puede superar los 5MB');
      return;
    }

    this.uploadImage(file);
  }

  private uploadImage(file: File): void {
    this.uploadingImage.set(true);
    this.error.set(null);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview.set(e.target.result);
    };
    reader.readAsDataURL(file);

    // Simulación - reemplazar con servicio real
    setTimeout(() => {
      const mockUrl = `https://example.com/uploads/${Date.now()}-${file.name}`;
      this.rifaForm.patchValue({ imagen_url: mockUrl });
      this.uploadingImage.set(false);
    }, 1500);
  }

  removeImage(): void {
    this.rifaForm.patchValue({ imagen_url: '' });
    this.imagePreview.set(null);
  }

  // =====================================================
  // VALIDADORES
  // =====================================================

  private dateRangeValidator = (form: AbstractControl) => {
    const fechaInicio = form.get('fecha_inicio')?.value;
    const fechaFin = form.get('fecha_fin')?.value;
    
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (fin <= inicio) {
        return { dateRange: true };
      }
    }
    return null;
  }

  private sorteoDateValidator = (form: AbstractControl) => {
    const fechaFin = form.get('fecha_fin')?.value;
    const fechaSorteo = form.get('fecha_sorteo')?.value;
    
    if (fechaFin && fechaSorteo) {
      const fin = new Date(fechaFin);
      const sorteo = new Date(fechaSorteo);
      if (sorteo < fin) {
        return { sorteoDate: true };
      }
    }
    return null;
  }

  // =====================================================
  // VALIDACIÓN Y ESTADO DEL BOTÓN CREAR
  // =====================================================

  getValidationErrors(): string[] {
    const errors: string[] = [];
    const form = this.rifaForm;

    if (!form.get('nombre')?.value) {
      errors.push('Falta el nombre de la rifa');
    }
    if (!form.get('institucion_promotora_id')?.value) {
      errors.push('Falta seleccionar la institución promotora');
    }
    if (!form.get('cantidad_numeros')?.value || form.get('cantidad_numeros')?.invalid) {
      errors.push('La cantidad de números es inválida');
    }
    if (!form.get('precio_numero')?.value || form.get('precio_numero')?.invalid) {
      errors.push('El precio por número es inválido');
    }
    if (!form.get('fecha_inicio')?.value) {
      errors.push('Falta la fecha de inicio');
    }
    if (!form.get('fecha_fin')?.value) {
      errors.push('Falta la fecha de fin');
    }
    if (form.hasError('dateRange')) {
      errors.push('La fecha de fin debe ser posterior a la de inicio');
    }
    if (form.hasError('sorteoDate')) {
      errors.push('La fecha de sorteo debe ser posterior a la de fin');
    }

    return errors;
  }

  isFormValid(): boolean {
    return this.rifaForm.valid;
  }

  // =====================================================
  // ENVÍO DEL FORMULARIO
  // =====================================================

  onSubmit(): void {
    if (!this.rifaForm.valid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.crearRifa(false);
  }

  guardarBorrador(): void {
    if (!this.rifaForm.get('nombre')?.value) {
      this.error.set('El nombre es requerido para guardar un borrador');
      return;
    }
    
    this.crearRifa(true);
  }

  private crearRifa(esBorrador: boolean): void {
    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const formData = this.rifaForm.getRawValue();

    const rifaData: CreateRifaRequest = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion?.trim() || null,
      institucion_promotora_id: formData.institucion_promotora_id,
      cantidad_numeros: Number(formData.cantidad_numeros),
      precio_numero: Number(formData.precio_numero),
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      fecha_sorteo: formData.fecha_sorteo || null,
      fecha_limite_participacion: formData.fecha_limite_participacion || null,
      comision_promotora: formData.comision_promotora || null,
      max_instituciones_participantes: formData.max_instituciones_participantes || null,
      numeros_por_institucion: formData.numeros_por_institucion || null,
      requiere_aprobacion: formData.requiere_aprobacion,
      imagen_url: formData.imagen_url?.trim() || null,
      bases_condiciones: formData.bases_condiciones?.trim() || null,
      observaciones: formData.observaciones?.trim() || null,
      borrador: esBorrador
    };

    console.log('🎫 Creando rifa:', rifaData);

    this.rifasService.createRifa(rifaData).subscribe({
      next: (rifa) => {
        if (rifa) {
          this.success.set(esBorrador ? 'Borrador guardado exitosamente' : 'Rifa creada exitosamente');
          setTimeout(() => {
            this.router.navigate(['/rifas', rifa.id]);
          }, 1500);
        }
        this.submitting.set(false);
      },
      error: (error) => {
        console.error('❌ Error al crear rifa:', error);
        this.error.set(error.error?.message || 'Error al crear la rifa');
        this.submitting.set(false);
      }
    });
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.rifaForm.controls).forEach(key => {
      this.rifaForm.get(key)?.markAsTouched();
    });
  }

  private canCreateRifa(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'admin_global' || user?.role === 'admin_institucion';
  }

  getTotalPotencial(): number {
    const cantidad = this.rifaForm.get('cantidad_numeros')?.value || 0;
    const precio = this.rifaForm.get('precio_numero')?.value || 0;
    return cantidad * precio;
  }

  getComisionPromotora(): number {
    const total = this.getTotalPotencial();
    const porcentaje = this.rifaForm.get('comision_promotora')?.value || 0;
    return total * (porcentaje / 100);
  }

  volver(): void {
    this.router.navigate(['/rifas']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rifaForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldValue(fieldName: string): any {
    return this.rifaForm.get(fieldName)?.value;
  }
}