// src/app/institutions/components/institution-form.component.ts - COMPLETO

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InstitutionService } from '../services/institution.service';
import { AuthService } from '../../auth/services/auth.service';
import { Institution, CreateInstitutionRequest, UpdateInstitutionRequest } from '../models/institution.models';

@Component({
  selector: 'app-institution-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './institution-form.component.html',
  styleUrls: ['./institution-form.component.scss']
})
export class InstitutionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly institutionService = inject(InstitutionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals para estado
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly currentInstitution = signal<Institution | null>(null);

  // Propiedades para subida de logo
  selectedFile: File | null = null;
  logoPreview: string | null = null;
  readonly isUploadingLogo = signal(false);

  // Formulario
  institutionForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
    tipo: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    direccion: [''],
    cuit: ['', [Validators.pattern(/^\d{2}-?\d{8}-?\d{1}$/)]],
    logo_url: [''],
    estado: ['activa']
  });

  ngOnInit(): void {
    const institutionId = this.route.snapshot.paramMap.get('id');
    if (institutionId && institutionId !== 'nueva') {
      this.isEditMode.set(true);
      this.loadInstitution(parseInt(institutionId));
    }
  }

  private loadInstitution(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.institutionService.getInstitutionById(id).subscribe({
      next: (institution) => {
        this.isLoading.set(false);
        this.currentInstitution.set(institution);
        
        this.institutionForm.patchValue({
          nombre: institution.nombre || '',
          descripcion: institution.descripcion || '',
          tipo: institution.tipo || '',
          email: institution.email || '',
          telefono: institution.telefono || '',
          direccion: institution.direccion || '',
          cuit: institution.cuit || '',
          logo_url: institution.logo_url || '',
          estado: institution.estado || 'activa'
        });
        
        this.institutionForm.markAsPristine();
        this.institutionForm.markAsUntouched();
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMsg = error?.message || 'Error desconocido';
        this.errorMessage.set('Error al cargar institución: ' + errorMsg);
      }
    });
  }

  onSubmit(): void {
    if (this.institutionForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode()) {
      this.updateInstitution();
    } else {
      this.createInstitution();
    }
  }


  //------

  private createInstitution(): void {
  const formValue = this.institutionForm.value;
  const institutionData: CreateInstitutionRequest = {
    nombre: formValue.nombre,
    descripcion: formValue.descripcion,
    tipo: formValue.tipo,
    email: formValue.email,
    telefono: formValue.telefono,
    direccion: formValue.direccion,
    cuit: formValue.cuit,
    estado: formValue.estado
    // ✅ NO incluimos logo_url aquí - se sube por separado
  };

  console.log('📝 Creando institución:', institutionData);
  console.log('📎 Archivo seleccionado?:', this.selectedFile ? 'SÍ' : 'NO');
  
  this.institutionService.createInstitution(institutionData).subscribe({
    next: (institution) => {
      console.log('✅ Institución creada:', institution);
      
      // Si hay un archivo seleccionado, subirlo ahora
      if (this.selectedFile) {
        console.log('📤 Subiendo logo para ID:', institution.id);
        this.uploadLogoAfterCreation(institution.id);
      } else {
        this.isSaving.set(false);
        alert('✅ Institución creada exitosamente');
        this.router.navigate(['/instituciones']);
      }
    },
    error: (error) => {
      console.error('❌ Error al crear institución:', error);
      this.isSaving.set(false);
      this.errorMessage.set('Error al crear institución: ' + error.message);
    }
  });
}

private updateInstitution(): void {
  const formValue = this.institutionForm.value;
  const currentInstitution = this.currentInstitution();
  
  if (!currentInstitution) return;

  const institutionData: UpdateInstitutionRequest = {
    nombre: formValue.nombre,
    descripcion: formValue.descripcion,
    tipo: formValue.tipo,
    email: formValue.email,
    telefono: formValue.telefono,
    direccion: formValue.direccion,
    cuit: formValue.cuit,
    estado: formValue.estado
    // ✅ NO incluimos logo_url - se gestiona por separado con uploadLogo/deleteLogo
  };

  console.log('💾 Actualizando institución ID:', currentInstitution.id);
  console.log('📝 Datos a actualizar:', institutionData);

  this.institutionService.updateInstitution(currentInstitution.id, institutionData).subscribe({
    next: (institution) => {
      console.log('✅ Institución actualizada:', institution);
      this.isSaving.set(false);
      alert('✅ Institución actualizada exitosamente');
      this.router.navigate(['/instituciones']);
    },
    error: (error) => {
      console.error('❌ Error al actualizar institución:', error);
      this.isSaving.set(false);
      this.errorMessage.set('Error al actualizar institución: ' + error.message);
    }
  });
}

/**
 * Sube el logo después de crear una institución nueva
 */
private uploadLogoAfterCreation(institutionId: number): void {
  if (!this.selectedFile) {
    this.isSaving.set(false);
    this.router.navigate(['/instituciones']);
    return;
  }

  console.log('📤 Subiendo logo para institución ID:', institutionId);
  
  this.institutionService.uploadLogo(institutionId, this.selectedFile).subscribe({
    next: (result) => {
      console.log('✅ Logo subido exitosamente:', result);
      this.isSaving.set(false);
      this.selectedFile = null;
      this.logoPreview = null;
      alert('✅ Institución creada con logo exitosamente');
      this.router.navigate(['/instituciones']);
    },
    error: (error) => {
      console.error('❌ Error al subir logo:', error);
      this.isSaving.set(false);
      
      const mensaje = `Institución creada exitosamente, pero hubo un error al subir el logo.\n\n` +
                     `Puedes editarla para volver a intentar subir el logo.`;
      alert(mensaje);
      
      this.router.navigate(['/instituciones']);
    }
  });
}

// ========================================
// MÉTODO uploadLogo MEJORADO (para edición)
// ========================================

uploadLogo(): void {
  const currentInstitution = this.currentInstitution();
  
  if (!currentInstitution || !this.selectedFile) {
    return;
  }
  
  this.isUploadingLogo.set(true);
  console.log('📤 Subiendo logo para institución ID:', currentInstitution.id);
  
  this.institutionService.uploadLogo(currentInstitution.id, this.selectedFile).subscribe({
    next: (result) => {
      console.log('✅ Logo subido exitosamente:', result);
      this.isUploadingLogo.set(false);
      
      // Actualizar el signal Y el formulario con la nueva URL
      const newLogoUrl = result.logo_url;
      
      this.currentInstitution.update(inst => {
        if (inst) {
          return { ...inst, logo_url: newLogoUrl };
        }
        return inst;
      });
      
      // También actualizar el formulario (importante para que no se borre)
      this.institutionForm.patchValue({
        logo_url: newLogoUrl
      });
      
      this.selectedFile = null;
      this.logoPreview = null;
      
      console.log('✅ Estado actualizado, logo_url ahora es:', this.currentInstitution()?.logo_url);
      alert('✅ Logo subido exitosamente');
    },
    error: (error) => {
      console.error('❌ Error al subir logo:', error);
      this.isUploadingLogo.set(false);
      alert('Error al subir logo: ' + (error.error?.message || error.message || 'Error desconocido'));
    }
  });
}

// ========================================
// MÉTODO removeLogo MEJORADO
// ========================================

removeLogo(): void {
  const currentInstitution = this.currentInstitution();
  
  if (!currentInstitution || !currentInstitution.logo_url) {
    return;
  }
  
  if (!confirm('¿Estás seguro de eliminar el logo?')) {
    return;
  }
  
  console.log('🗑️ Eliminando logo de institución ID:', currentInstitution.id);
  
  this.institutionService.deleteLogo(currentInstitution.id).subscribe({
    next: () => {
      console.log('✅ Logo eliminado exitosamente');
      
      // Actualizar signal
      this.currentInstitution.update(inst => {
        if (inst) {
          return { ...inst, logo_url: undefined };
        }
        return inst;
      });
      
      // Actualizar formulario
      this.institutionForm.patchValue({
        logo_url: ''
      });
      
      this.logoPreview = null;
      alert('✅ Logo eliminado exitosamente');
    },
    error: (error) => {
      console.error('❌ Error al eliminar logo:', error);
      alert('Error al eliminar logo: ' + (error.error?.message || error.message || 'Error desconocido'));
    }
  });
}

 
  // ========================================
  // MÉTODOS PARA SUBIDA DE LOGO
  // ========================================

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar 5MB');
        return;
      }
      
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  cancelFileSelection(): void {
    this.selectedFile = null;
    this.logoPreview = null;
  }

  getLogoUrl(): string | null {
    const institution = this.currentInstitution();
    if (institution?.logo_url) {
      if (institution.logo_url.startsWith('http')) {
        return institution.logo_url;
      }
      return `http://localhost:3100${institution.logo_url}`;
    }
    return null;
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  isFieldInvalid(fieldName: string): boolean {
    const field = this.institutionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.institutionForm.controls).forEach(key => {
      this.institutionForm.get(key)?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/instituciones']);
  }

  retry(): void {
    this.errorMessage.set(null);
    
    if (this.isEditMode()) {
      const institutionId = this.route.snapshot.paramMap.get('id');
      if (institutionId) {
        this.loadInstitution(parseInt(institutionId));
      }
    }
  }
}