// src/app/rifas/components/crear-rifa/crear-rifa.component.ts - CORREGIDO

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { RifasService } from '../../services/rifas.service';
import {
  CreateRifaRequest,
  RifaValidator,
  RIFA_CONFIG,
  RifaUtils
} from '../../models/rifa.models';

@Component({
  selector: 'app-crear-rifa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-rifa.component.html',
  styleUrls: ['./crear-rifa.component.scss']
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

  // Constantes
  readonly RIFA_CONFIG = RIFA_CONFIG;

  // Formulario reactivo
  rifaForm: FormGroup;

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
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      descripcion: [''],
      
      // Configuración de números
      cantidad_numeros: [1000, [
        Validators.required,
        Validators.min(RIFA_CONFIG.MIN_NUMEROS),
        Validators.max(RIFA_CONFIG.MAX_NUMEROS)
      ]],
      precio_numero: [100, [
        Validators.required,
        Validators.min(RIFA_CONFIG.MIN_PRECIO),
        Validators.max(RIFA_CONFIG.MAX_PRECIO)
      ]],
      
      // Fechas
      fecha_inicio: [this.formatDateForInput(manana), Validators.required],
      fecha_fin: [this.formatDateForInput(finDefault), Validators.required],
      fecha_sorteo: [''],
      
      // Configuración adicional
      imagen_url: [''],
      reglas_adicionales: ['']
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
      this.crearRifa(false); // false = no es borrador
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  guardarBorrador(): void {
    if (this.rifaForm.valid && !this.submitting()) {
      this.crearRifa(true); // true = guardar como borrador
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private crearRifa(esBorrador: boolean): void {
    this.submitting.set(true);
    this.error.set(null);

    const formData = this.rifaForm.value;
    
    // Construir request
    const rifaData: CreateRifaRequest = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion?.trim() || undefined,
      cantidad_numeros: Number(formData.cantidad_numeros),
      precio_numero: Number(formData.precio_numero),
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      fecha_sorteo: formData.fecha_sorteo || undefined,
      imagen_url: formData.imagen_url?.trim() || undefined,
      reglas_adicionales: formData.reglas_adicionales?.trim() || undefined
    };

    console.log('🎫 Creando rifa:', rifaData);

    this.rifasService.createRifa(rifaData).subscribe({
      next: (rifa) => {
        if (rifa) {
          console.log('✅ Rifa creada exitosamente:', rifa);
          this.router.navigate(['/rifas', rifa.id]);
        } else {
          this.error.set('Error al crear la rifa');
          this.submitting.set(false);
        }
      },
      error: (error) => {
        console.error('❌ Error al crear rifa:', error);
        this.error.set(error.error?.message || 'Error al crear la rifa');
        this.submitting.set(false);
      }
    });
  }

  // =====================================================
  // MÉTODOS DE VALIDACIÓN Y UTILIDAD
  // =====================================================

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rifaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrors(fieldName: string): string[] {
    const field = this.rifaForm.get(fieldName);
    const errors: string[] = [];
    
    if (field && field.errors) {
      // Errores de validación estándar
      if (field.errors['required']) errors.push('Este campo es requerido');
      if (field.errors['minlength']) errors.push(`Mínimo ${field.errors['minlength'].requiredLength} caracteres`);
      if (field.errors['maxlength']) errors.push(`Máximo ${field.errors['maxlength'].requiredLength} caracteres`);
      if (field.errors['min']) errors.push(`Valor mínimo: ${field.errors['min'].min}`);
      if (field.errors['max']) errors.push(`Valor máximo: ${field.errors['max'].max}`);
      if (field.errors['email']) errors.push('Email inválido');
      if (field.errors['url']) errors.push('URL inválida');
    }
    
    // Errores de formulario completo
    if (this.rifaForm.errors) {
      if (this.rifaForm.errors['dateRange'] && (fieldName === 'fecha_fin' || fieldName === 'fecha_inicio')) {
        errors.push(this.rifaForm.errors['dateRange']);
      }
      if (this.rifaForm.errors['sorteoDate'] && fieldName === 'fecha_sorteo') {
        errors.push(this.rifaForm.errors['sorteoDate']);
      }
    }
    
    return errors;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.rifaForm.controls).forEach(key => {
      this.rifaForm.get(key)?.markAsTouched();
    });
  }

  getFieldValue(fieldName: string): any {
    return this.rifaForm.get(fieldName)?.value;
  }

  getFieldLength(fieldName: string): number {
    return this.rifaForm.get(fieldName)?.value?.length || 0;
  }

  getFechaMinima(): string {
    const hoy = new Date();
    return this.formatDateForInput(hoy);
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  calcularRecaudacionMaxima(): number {
    const cantidad = this.getFieldValue('cantidad_numeros') || 0;
    const precio = this.getFieldValue('precio_numero') || 0;
    return cantidad * precio;
  }

  calcularDuracion(): number {
    const inicio = this.getFieldValue('fecha_inicio');
    const fin = this.getFieldValue('fecha_fin');
    
    if (inicio && fin) {
      const fechaInicio = new Date(inicio);
      const fechaFin = new Date(fin);
      const diffTime = fechaFin.getTime() - fechaInicio.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return 0;
  }

  formatPrice(precio: number): string {
    return RifaUtils.formatPrice(precio || 0);
  }

  formatDateTime(fecha: string): string {
    return RifaUtils.formatDateTime(fecha);
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