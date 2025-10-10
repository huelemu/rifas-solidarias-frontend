// src/app/rifas/components/edit-rifa/edit-rifa.component.ts
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-edit-rifa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './edit-rifa.component.html',
  styleUrls: ['./edit-rifa.component.scss']
})
export class EditRifaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rifasService = inject(RifasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly currentRifa = signal<any>(null);

  private rifaId: number = 0;
  editForm: FormGroup;

  // Logo
  selectedFile: File | null = null;
  logoPreview: string | null = null;
  logoChanged: boolean = false; // ✅ Flag para saber si cambió el logo
  private readonly baseUrl: string;

  constructor() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      this.baseUrl = 'http://localhost:3100';
    } else {
      this.baseUrl = 'https://apirifas.huelemu.com.ar';
    }

    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      fecha_fin: ['', Validators.required],
      fecha_sorteo: [''],
      estado: ['borrador'],
      reglas_adicionales: ['']
    });
  }

  ngOnInit() {
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

  loadRifa(): void {
    this.loading.set(true);
    this.error.set(null);

    this.rifasService.getRifa(this.rifaId).subscribe({
      next: (response) => {
        console.log('📦 Rifa cargada:', response);
        const rifa = response.data || response;
        this.currentRifa.set(rifa);
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

  private populateForm(rifa: any): void {
    this.editForm.patchValue({
      nombre: rifa.nombre || '',
      descripcion: rifa.descripcion || '',
      fecha_fin: this.formatDateForInput(rifa.fecha_fin),
      fecha_sorteo: this.formatDateForInput(rifa.fecha_sorteo),
      estado: rifa.estado || 'borrador',
      reglas_adicionales: rifa.reglas_adicionales || ''
    });
  }

  // ✅ SUBMIT MEJORADO: Guarda datos y logo en un solo paso
  onSubmit(): void {
    if (!this.editForm.valid) {
      this.markAllFieldsAsTouched();
      this.error.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const updateData = this.editForm.value;

    console.log('💾 Guardando cambios de rifa...');

    // Primero actualizar los datos
    this.rifasService.updateRifa(this.rifaId, updateData).subscribe({
      next: (response) => {
        console.log('✅ Datos actualizados:', response);
        
        // Si hay un logo nuevo seleccionado, subirlo
        if (this.logoChanged && this.selectedFile) {
          console.log('📤 Subiendo nuevo logo...');
          this.uploadLogo();
        } 
        // Si se quitó el logo (había uno y ahora no)
        else if (this.logoChanged && !this.selectedFile && this.currentRifa()?.logo_url) {
          console.log('🗑️ Eliminando logo...');
          this.deleteLogo();
        }
        // Si no cambió el logo, solo mostrar éxito
        else {
          this.success.set('Rifa actualizada exitosamente');
          this.saving.set(false);
          this.loadRifa(); // Recargar datos
        }
      },
      error: (error) => {
        console.error('❌ Error actualizando rifa:', error);
        this.error.set(error.error?.message || 'Error al actualizar la rifa');
        this.saving.set(false);
      }
    });
  }

  // ========================================
  // MÉTODOS PARA LOGO
  // ========================================

  getLogoUrl(): string | null {
    // Si hay preview, mostrar el preview (logo nuevo seleccionado)
    if (this.logoPreview) {
      return this.logoPreview;
    }
    
    // Si no, mostrar el logo actual de la rifa
    const rifa = this.currentRifa();
    if (rifa?.logo_url) {
      if (rifa.logo_url.startsWith('http')) {
        return rifa.logo_url;
      }
      return `${this.baseUrl}${rifa.logo_url}`;
    }
    
    return null;
  }

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
      this.logoChanged = true; // ✅ Marcar que cambió
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      console.log('📎 Nuevo logo seleccionado:', file.name);
    }
  }

  cancelFileSelection(): void {
    this.selectedFile = null;
    this.logoPreview = null;
    this.logoChanged = true; // ✅ Marcar que cambió (se quitó)
    console.log('❌ Logo cancelado');
  }

  // Subir logo (llamado desde onSubmit)
  private uploadLogo(): void {
    if (!this.selectedFile) {
      this.saving.set(false);
      return;
    }
    
    this.rifasService.uploadLogo(this.rifaId, this.selectedFile).subscribe({
      next: (result) => {
        console.log('✅ Logo subido exitosamente');
        
        // Actualizar logo en el signal
        this.currentRifa.update(rifa => {
          if (rifa) {
            return { ...rifa, logo_url: result.logo_url || result.data?.logo_url };
          }
          return rifa;
        });
        
        this.selectedFile = null;
        this.logoPreview = null;
        this.logoChanged = false;
        this.success.set('Rifa y logo actualizados exitosamente');
        this.saving.set(false);
        this.loadRifa(); // Recargar
      },
      error: (error) => {
        console.error('❌ Error al subir logo:', error);
        this.error.set('Rifa actualizada pero error al subir logo: ' + (error.error?.message || error.message));
        this.saving.set(false);
      }
    });
  }

  // Eliminar logo (llamado desde onSubmit)
  private deleteLogo(): void {
    this.rifasService.deleteLogo(this.rifaId).subscribe({
      next: () => {
        console.log('✅ Logo eliminado exitosamente');
        
        this.currentRifa.update(rifa => {
          if (rifa) {
            return { ...rifa, logo_url: null };
          }
          return rifa;
        });
        
        this.logoChanged = false;
        this.success.set('Rifa actualizada y logo eliminado');
        this.saving.set(false);
        this.loadRifa(); // Recargar
      },
      error: (error) => {
        console.error('❌ Error al eliminar logo:', error);
        this.error.set('Rifa actualizada pero error al eliminar logo');
        this.saving.set(false);
      }
    });
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================


  /**
 * Obtener porcentaje vendido
 */
getPorcentajeVendido(): number {
  const rifa = this.currentRifa();
  if (!rifa) return 0;
  
  const vendidos = rifa.numeros_vendidos || 0;
  const total = rifa.cantidad_numeros || 1;
  return Math.round((vendidos / total) * 100);
}

/**
 * Obtener total recaudado
 */
getTotalRecaudado(): number {
  const rifa = this.currentRifa();
  if (!rifa) return 0;
  
  return rifa.total_recaudado || rifa.recaudado || 0;
}

/**
 * Obtener nombre de institución promotora
 */
getInstitucionPromotoraNombre(): string {
  const rifa = this.currentRifa();
  return rifa?.institucion_promotora_nombre || 
         rifa?.institucion_nombre || 
         'No especificada';
}

/**
 * Obtener instituciones participantes
 */
getInstitucionesParticipantes(): any[] {
  const rifa = this.currentRifa();
  return rifa?.instituciones_participantes || [];
}

/**
 * Obtener label de estado de participación
 */
getEstadoParticipacionLabel(estado: string): string {
  const labels: any = {
    'solicitada': '⏳ Pendiente',
    'aprobada': '✅ Aprobada',
    'rechazada': '❌ Rechazada',
    'retirada': '🚫 Retirada'
  };
  return labels[estado] || estado;
}

/**
 * Remover imagen
 */
removeImage(): void {
  if (confirm('¿Estás seguro de quitar la imagen de la rifa?')) {
    this.selectedFile = null;
    this.logoPreview = null;
    this.logoChanged = true;
  }
}



  private formatDateForInput(date: string | Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      this.editForm.get(key)?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  goBack(): void {
    this.router.navigate(['/rifas']);
  }
}