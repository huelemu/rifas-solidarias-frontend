// src/app/rifas/components/crear-rifa/crear-rifa.component.ts
// VERSIÓN MEJORADA - Con fecha sorteo automática

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { RifasService } from '../../services/rifas.service';
import { InstitutionService } from '../../../institutions/services/institution.service';
import { Institution } from '../../../institutions/models/institution.models';
import { RIFA_CONFIG } from '../../models/rifa.models';

@Component({
  selector: 'app-crear-rifa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './crear-rifa.component.html',
  styleUrls: ['./crear-rifa.component.scss', '../../styles/rifas-global.scss']
})
export class CrearRifaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly rifasService = inject(RifasService);
  private readonly institutionService = inject(InstitutionService);
  private readonly router = inject(Router);

  readonly submitting = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loadingInstituciones = signal<boolean>(false);
  readonly instituciones = signal<Institution[]>([]);
  
  rifaForm: FormGroup;
  readonly RIFA_CONFIG = RIFA_CONFIG;

  constructor() {
    this.rifaForm = this.createForm();
  }

  ngOnInit() {
    if (!this.canCreateRifa()) {
      this.router.navigate(['/rifas']);
      return;
    }
    this.loadInstituciones();
    this.setupFechaFinListener();
  }

  private createForm(): FormGroup {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    
    const finDefault = new Date(hoy);
    finDefault.setDate(hoy.getDate() + 30);

    // Fecha sorteo: 1 día después del fin
    const sorteoDefault = new Date(finDefault);
    sorteoDefault.setDate(finDefault.getDate() + 1);

    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: [''],
      cantidad_numeros: [1000, [Validators.required, Validators.min(RIFA_CONFIG.MIN_NUMEROS), Validators.max(RIFA_CONFIG.MAX_NUMEROS)]],
      precio_numero: [100, [Validators.required, Validators.min(RIFA_CONFIG.MIN_PRECIO), Validators.max(RIFA_CONFIG.MAX_PRECIO)]],
      fecha_inicio: [this.formatDateForInput(manana), Validators.required],
      fecha_fin: [this.formatDateForInput(finDefault), Validators.required],
      fecha_sorteo: [this.formatDateForInput(sorteoDefault)], // Default: 1 día después del fin
      institucion_promotora_id: [null, Validators.required],
      imagen_url: [''],
      reglas_adicionales: ['']
    }, {
      validators: [this.dateRangeValidator, this.sorteoDateValidator]
    });
  }

  // Actualizar fecha sorteo automáticamente cuando cambia fecha_fin
  private setupFechaFinListener(): void {
    this.rifaForm.get('fecha_fin')?.valueChanges.subscribe(fechaFin => {
      if (fechaFin) {
        const finDate = new Date(fechaFin);
        const sorteoDate = new Date(finDate);
        sorteoDate.setDate(finDate.getDate() + 1);
        
        this.rifaForm.patchValue({
          fecha_sorteo: this.formatDateForInput(sorteoDate)
        }, { emitEvent: false });
      }
    });
  }

  private loadInstituciones(): void {
    this.loadingInstituciones.set(true);
    
    this.institutionService.getInstitutions().subscribe({
      next: (response) => {
        console.log('Instituciones cargadas:', response.institutions?.length);
        this.instituciones.set(response.institutions || []);
        this.loadingInstituciones.set(false);
        
        const user = this.authService.currentUser();
        if (user?.role === 'admin_institucion' && user.institucion_id) {
          this.rifaForm.patchValue({
            institucion_promotora_id: user.institucion_id
          });
        }
      },
      error: (error) => {
        console.error('Error cargando instituciones:', error);
        this.error.set('Error al cargar instituciones');
        this.loadingInstituciones.set(false);
      }
    });
  }

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
      if (sorteo <= fin) {
        return { sorteoDate: true };
      }
    }
    return null;
  }

  onSubmit(): void {
    if (!this.rifaForm.valid) {
      this.markAllFieldsAsTouched();
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.crearRifa();
  }

  private crearRifa(): void {
    this.submitting.set(true);
    this.error.set(null);

    const formData = this.rifaForm.value;

    const rifaData = {
      nombre: String(formData.nombre || '').trim(),
      descripcion: formData.descripcion ? String(formData.descripcion).trim() : '',
      cantidad_numeros: parseInt(formData.cantidad_numeros) || 100,
      precio_numero: parseFloat(formData.precio_numero) || 50,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      fecha_sorteo: formData.fecha_sorteo || '',
      institucion_promotora_id: parseInt(formData.institucion_promotora_id) || 0,
      imagen_url: formData.imagen_url || '',
      reglas_adicionales: formData.reglas_adicionales || ''
    };

    console.log('Enviando rifa:', rifaData);

    this.rifasService.createRifa(rifaData).subscribe({
      next: (response) => {
        this.success.set('Rifa creada exitosamente');
        this.submitting.set(false);
        setTimeout(() => this.router.navigate(['/rifas']), 1500);
      },
      error: (error) => {
        console.error('Error:', error);
        this.error.set(error.error?.message || 'Error al crear la rifa');
        this.submitting.set(false);
      }
    });
  }

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

  volver(): void {
    this.router.navigate(['/rifas']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rifaForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Métodos para el template
  successMessage() { return this.success(); }
  errorMessage() { return this.error(); }
  isSubmitting() { return this.submitting(); }
  goBack() { this.volver(); }
  getFieldValue(fieldName: string): any {
    return this.rifaForm.get(fieldName)?.value;
  }
}