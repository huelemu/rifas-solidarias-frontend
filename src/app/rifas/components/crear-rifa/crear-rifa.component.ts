// src/app/rifas/components/crear-rifa/crear-rifa.component.ts

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { RifasService } from '../../services/rifas.service';
import {
  CreateRifaRequest,
  RIFA_CONFIG,
  RifaUtils
} from '../../models/rifa.models';

@Component({
  selector: 'app-crear-rifa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './crear-rifa.component.html',
  styleUrls: ['./crear-rifa.component.scss', '../../styles/rifas-global.scss']
})
export class CrearRifaComponent implements OnInit {
  // Servicios
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly rifasService = inject(RifasService);
  private readonly router = inject(Router);

  // Signals para estado del componente
  readonly submitting = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  // Constantes
  readonly RIFA_CONFIG = RIFA_CONFIG;

  // Formulario reactivo
  rifaForm: FormGroup;

  // =====================================================
  // Gestión de instituciones
  // =====================================================

  instituciones = signal<any[]>([
    { id: 1, nombre: 'Escuela N°1', tipo: 'educación' },
    { id: 2, nombre: 'Hospital Central', tipo: 'salud' },
    { id: 3, nombre: 'Club Social', tipo: 'deporte' }
  ]);

  private readonly _institucionesParticipantes = signal<any[]>([]);
  selectedInstitucionId: number | null = null;

  institucionesParticipantes() {
    return this._institucionesParticipantes();
  }

  getAvailableInstituciones() {
    const seleccionadas = this._institucionesParticipantes().map(i => i.id);
    return this.instituciones().filter(i => !seleccionadas.includes(i.id));
  }

  addInstitucion() {
    if (this.selectedInstitucionId) {
      const inst = this.instituciones().find(i => i.id === Number(this.selectedInstitucionId));
      if (inst) {
        this._institucionesParticipantes.update(arr => [...arr, inst]);
        this.selectedInstitucionId = null;
      }
    }
  }

  removeInstitucion(id: number) {
    this._institucionesParticipantes.update(arr => arr.filter(i => i.id !== id));
  }

  constructor() {
    this.rifaForm = this.createForm();
  }

  ngOnInit() {
    // Verificar permisos
    if (!this.canCreateRifa()) {
      this.router.navigate(['/rifas']);
      return;
    }
  }

  // =====================================================
  // CREACIÓN Y CONFIGURACIÓN DEL FORMULARIO
  // =====================================================

  private createForm(): FormGroup {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);

    const finDefault = new Date(hoy);
    finDefault.setDate(hoy.getDate() + 30);

    return this.fb.group({
      // Información básica
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: [''],

      // Configuración de números
      cantidad_numeros: [1000, [Validators.required, Validators.min(RIFA_CONFIG.MIN_NUMEROS), Validators.max(RIFA_CONFIG.MAX_NUMEROS)]],
      precio_numero: [100, [Validators.required, Validators.min(RIFA_CONFIG.MIN_PRECIO), Validators.max(RIFA_CONFIG.MAX_PRECIO)]],

      // Fechas
      fecha_inicio: [this.formatDateForInput(manana), Validators.required],
      fecha_fin: [this.formatDateForInput(finDefault), Validators.required],
      fecha_sorteo: [''],
      fecha_limite_participacion: [''],

      // Instituciones
      institucion_promotora_id: [null, Validators.required],
      comision_promotora: [0],
      max_instituciones_participantes: [null],
      numeros_por_institucion: [null],

      // Configuración avanzada
      requiere_aprobacion: [false],
      imagen_url: [''],
      bases_condiciones: [''],
      observaciones: ['']
    }, {
      validators: [this.dateRangeValidator, this.sorteoDateValidator]
    });
  }

  // =====================================================
  // VALIDADORES PERSONALIZADOS
  // =====================================================

  private dateRangeValidator = (form: AbstractControl) => {
    const fechaInicio = form.get('fecha_inicio')?.value;
    const fechaFin = form.get('fecha_fin')?.value;
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (fin <= inicio) {
        return { dateRange: 'La fecha de fin debe ser posterior al inicio' };
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
        return { sorteoDate: 'La fecha de sorteo debe ser posterior al fin de la rifa' };
      }
    }
    return null;
  }

  // =====================================================
  // MÉTODOS DE ENVÍO
  // =====================================================

  onSubmit(): void {
    if (this.rifaForm.valid && !this.submitting()) {
      this.crearRifa(false);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  guardarBorrador(): void {
    if (this.rifaForm.valid && !this.submitting()) {
      this.crearRifa(true);
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private crearRifa(esBorrador: boolean): void {
    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    const formData = this.rifaForm.value;

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
          console.log('✅ Rifa creada exitosamente:', rifa);
          this.success.set('Rifa creada exitosamente');
          this.router.navigate(['/rifas', rifa.id]);
        } else {
          this.error.set('Error al crear la rifa');
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
  // MÉTODOS AUXILIARES PARA EL HTML
  // =====================================================

  successMessage() { return this.success(); }
  errorMessage() { return this.error(); }
  isSubmitting() { return this.submitting(); }
  saveDraft() { this.guardarBorrador(); }
  goBack() { this.volver(); }

  getTotalPotencial(): number {
    return this.calcularRecaudacionMaxima();
  }

  getComisionPromotora(): number {
    const total = this.calcularRecaudacionMaxima();
    const porcentaje = this.getFieldValue('comision_promotora') || 0;
    return total * (porcentaje / 100);
  }

  // =====================================================
  // MÉTODOS DE VALIDACIÓN Y UTILIDAD
  // =====================================================

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rifaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.rifaForm.controls).forEach(key => {
      this.rifaForm.get(key)?.markAsTouched();
    });
  }

  getFieldValue(fieldName: string): any {
    return this.rifaForm.get(fieldName)?.value;
  }

  private formatDateForInput(date: Date): string {
    // datetime-local → YYYY-MM-DDTHH:mm
    return date.toISOString().slice(0, 16);
  }

  calcularRecaudacionMaxima(): number {
    const cantidad = this.getFieldValue('cantidad_numeros') || 0;
    const precio = this.getFieldValue('precio_numero') || 0;
    return cantidad * precio;
  }

  canCreateRifa(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'admin_global' || user?.role === 'admin_institucion';
  }

  volver(): void {
    this.router.navigate(['/rifas']);
  }

  clearError(): void {
    this.error.set(null);
  }
}
