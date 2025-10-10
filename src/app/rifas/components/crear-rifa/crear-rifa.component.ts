// src/app/rifas/components/crear-rifa/crear-rifa.component.ts
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { RifasService } from '../../services/rifas.service';
import { InstitutionService } from '../../../institutions/services/institution.service';
import { Institution } from '../../../institutions/models/institution.models';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-crear-rifa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './crear-rifa.component.html',
  styleUrls: ['./crear-rifa.component.scss']
})
export class CrearRifaComponent implements OnInit {
onCompartidaChange() {
throw new Error('Method not implemented.');
}
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly rifasService = inject(RifasService);
  private readonly institutionService = inject(InstitutionService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // Signals
  readonly submitting = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loadingInstituciones = signal<boolean>(false);
  readonly instituciones = signal<Institution[]>([]);
  readonly institucionesSeleccionadas = signal<number[]>([]);
  
  // ✅ LOGO - IGUAL QUE EN EDIT-RIFA
  selectedFile: File | null = null;
  logoPreview: string | null = null;
  private readonly baseUrl: string;
  
  // Formulario
  rifaForm: FormGroup;

  // Instituciones disponibles para participar (excluye la promotora)
  readonly institucionesDisponibles = computed(() => {
    const promotoraId = this.rifaForm.get('institucion_promotora_id')?.value;
    return this.instituciones().filter(inst => inst.id !== parseInt(promotoraId));
  });

  constructor() {
    // Configurar baseUrl igual que en edit-rifa
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      this.baseUrl = 'http://localhost:3100';
    } else {
      this.baseUrl = 'https://apirifas.huelemu.com.ar';
    }

    this.rifaForm = this.createForm();
  }

  ngOnInit() {
    this.loadInstituciones();
    this.setupFormValidation();
  }

  /**
   * Crear formulario
   */
  private createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      institucion_promotora_id: ['', Validators.required],
      cantidad_numeros: [100, [Validators.required, Validators.min(1), Validators.max(10000)]],
      precio_numero: [100, [Validators.required, Validators.min(1)]],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      fecha_sorteo: [''],
      fecha_limite_participacion: [''],
      
      // Campos para rifa compartida
      es_compartida: [false],
      max_instituciones_participantes: [null],
      comision_promotora: [10],
      requiere_aprobacion: [false],
      
      bases_condiciones: ['']
    });
  }

  /**
   * Configurar validaciones dinámicas
   */
  private setupFormValidation(): void {
    this.rifaForm.get('es_compartida')?.valueChanges.subscribe(esCompartida => {
      const comisionControl = this.rifaForm.get('comision_promotora');
      const maxInstControl = this.rifaForm.get('max_instituciones_participantes');
      
      if (esCompartida) {
        comisionControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        maxInstControl?.setValidators([Validators.required, Validators.min(2)]);
      } else {
        comisionControl?.clearValidators();
        maxInstControl?.clearValidators();
      }
      
      comisionControl?.updateValueAndValidity();
      maxInstControl?.updateValueAndValidity();
    });
  }

  /**
 * Cargar instituciones
 */
private loadInstituciones(): void {
  this.loadingInstituciones.set(true);
  
  this.institutionService.getInstitutions({ estado: 'activa' }).subscribe({
    next: (response) => {
      const instituciones = response.institutions || response.institutions || [];
      this.instituciones.set(instituciones);
      this.loadingInstituciones.set(false);
      
      const currentUser = this.authService.currentUser();
      if (currentUser?.institucion_id) {
        this.rifaForm.patchValue({
          institucion_promotora_id: currentUser.institucion_id
        });
      }
    },
    error: (error) => {
      console.error('Error cargando instituciones:', error);
      this.error.set('Error al cargar las instituciones');
      this.loadingInstituciones.set(false);
    }
  });
}

  /**
   * Submit del formulario - ✅ UNIFICADO CON EDIT-RIFA
   */
  onSubmit(): void {
    if (this.rifaForm.invalid) {
      Object.keys(this.rifaForm.controls).forEach(key => {
        this.rifaForm.get(key)?.markAsTouched();
      });
      this.error.set('Por favor completá todos los campos obligatorios');
      this.notificationService.warning(
        'Por favor completa todos los campos requeridos',
        'Formulario incompleto'
      );
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formData = this.prepareFormData();
    console.log('📤 Enviando rifa:', formData);

    this.rifasService.createRifa(formData).subscribe({
      next: (response: any) => {
        console.log('✅ Rifa creada:', response);

         // ✅ Toast de éxito
        this.notificationService.success(
          `La rifa "${formData.nombre}" ha sido creada exitosamente`,
          '¡Rifa creada!'
        );

        // ✅ Notificación persistente
        this.notificationService.addNotification(
          'success',
          'Nueva rifa creada',
          `${formData.nombre} - ${formData.cantidad_numeros} números disponibles`,
          `/rifas/${response.id}`,
          'Ver rifa'
        );
        
        const rifaId = response?.data?.id || response?.id;
        
        // ✅ Si hay logo seleccionado, subirlo (IGUAL QUE EDIT-RIFA)
        if (this.selectedFile && rifaId) {
          console.log('📤 Subiendo logo de la rifa...');
          this.uploadLogo(rifaId);
        } 
        // Si hay instituciones seleccionadas pero no logo
        else if (this.institucionesSeleccionadas().length > 0 && rifaId) {
          this.enviarInvitaciones(rifaId);
        } 
        // Si no hay ni logo ni invitaciones
        else {
          this.finalizarCreacion(rifaId);
        }
      },
      error: (error) => {
        console.error('❌ Error creando rifa:', error);
        this.error.set(error?.error?.message || 'Error al crear la rifa');
        this.submitting.set(false);
       
        // ✅ Toast de error
        this.notificationService.error(
          error?.error?.message || 'No se pudo crear la rifa',
          'Error al crear rifa'
        );
      }
    });
  }

  /**
   * Preparar datos del formulario - SIN imagen_url
   */
  private prepareFormData(): any {
    const formValue = this.rifaForm.value;
    
    return {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion || null,
      institucion_promotora_id: parseInt(formValue.institucion_promotora_id),
      cantidad_numeros: formValue.cantidad_numeros,
      precio_numero: formValue.precio_numero,
      fecha_inicio: formValue.fecha_inicio,
      fecha_fin: formValue.fecha_fin,
      fecha_sorteo: formValue.fecha_sorteo || null,
      fecha_limite_participacion: formValue.fecha_limite_participacion || null,
      max_instituciones_participantes: formValue.es_compartida ? formValue.max_instituciones_participantes : null,
      comision_promotora: formValue.es_compartida ? formValue.comision_promotora : 0,
      requiere_aprobacion: formValue.es_compartida ? formValue.requiere_aprobacion : false,
      imagen_url: null, // ✅ SIEMPRE NULL, se sube después con uploadLogo()
      bases_condiciones: formValue.bases_condiciones || null
    };
  }

  // ========================================
  // ✅ MÉTODOS DE LOGO - IGUALES A EDIT-RIFA
  // ========================================

  /**
   * Obtener URL del logo para preview
   */
  getLogoUrl(): string | null {
    if (this.logoPreview) {
      return this.logoPreview;
    }
    return null;
  }

  /**
   * Cuando se selecciona un archivo
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.error.set('Solo se permiten archivos de imagen');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('El archivo no debe superar 5MB');
        return;
      }
      
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      console.log('📎 Logo seleccionado:', file.name);
    }
  }

  /**
   * Cancelar selección de archivo
   */
  cancelFileSelection(): void {
    this.selectedFile = null;
    this.logoPreview = null;
    console.log('❌ Logo cancelado');
  }

  /**
   * Subir logo al backend (llamado después de crear la rifa)
   */
  private uploadLogo(rifaId: number): void {
    if (!this.selectedFile) {
      this.finalizarCreacion(rifaId);
      return;
    }
    
    console.log('📤 Subiendo logo para rifa ID:', rifaId);
    
    this.rifasService.uploadLogo(rifaId, this.selectedFile).subscribe({
      next: (result) => {
        console.log('✅ Logo subido exitosamente:', result);
        
        // Continuar con invitaciones o finalizar
        if (this.institucionesSeleccionadas().length > 0) {
          this.enviarInvitaciones(rifaId);
        } else {
          this.finalizarCreacion(rifaId);
        }
      },
      error: (error) => {
        console.error('❌ Error al subir logo:', error);
        this.error.set('Rifa creada pero error al subir logo: ' + (error.error?.message || error.message));
        
        // Continuar igual
        if (this.institucionesSeleccionadas().length > 0) {
          this.enviarInvitaciones(rifaId);
        } else {
          this.finalizarCreacion(rifaId);
        }
      }
    });
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  /**
   * Enviar invitaciones a instituciones
   */
  private enviarInvitaciones(rifaId: number): void {
    const institucionesIds = this.institucionesSeleccionadas();
    
    if (institucionesIds.length === 0) {
      this.finalizarCreacion(rifaId);
      return;
    }

    console.log('📨 Enviando invitaciones:', institucionesIds);

    this.rifasService.invitarInstituciones(rifaId, institucionesIds).subscribe({
      next: (response) => {
        console.log('✅ Invitaciones enviadas:', response);
        
        const exitosas = response?.data?.invitaciones_exitosas?.length || 0;
        const errores = response?.data?.errores?.length || 0;
        
        let mensaje = `Rifa creada. ${exitosas} invitaciones enviadas`;
        if (errores > 0) {
          mensaje += ` (${errores} con error)`;
        }
        
        this.success.set(mensaje);
        this.submitting.set(false);
        
        setTimeout(() => {
          this.router.navigate(['/rifas', rifaId]);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error enviando invitaciones:', error);
        this.finalizarCreacion(rifaId);
      }
    });
  }

  /**
   * Finalizar proceso de creación
   */
  private finalizarCreacion(rifaId: number): void {
    this.success.set('Rifa creada exitosamente con sus números');
    this.submitting.set(false);
    
    setTimeout(() => {
      this.router.navigate(['/rifas', rifaId]);
    }, 1500);
  }

  /**
   * Toggle rifa compartida
   */
  onToggleCompartida(): void {
    const esCompartida = this.rifaForm.get('es_compartida')?.value;
    
    if (!esCompartida) {
      this.institucionesSeleccionadas.set([]);
      this.rifaForm.patchValue({
        max_instituciones_participantes: null,
        comision_promotora: 10,
        requiere_aprobacion: false
      });
    }
  }

  /**
   * Agregar institución desde el select
   */
  onSelectInstitucion(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const institucionId = parseInt(select.value);
    
    if (institucionId && !this.institucionesSeleccionadas().includes(institucionId)) {
      this.institucionesSeleccionadas.set([...this.institucionesSeleccionadas(), institucionId]);
    }
    
    select.value = '';
  }

  /**
   * Remover institución de seleccionadas
   */
  removeInstitucion(institucionId: number): void {
    this.institucionesSeleccionadas.set(
      this.institucionesSeleccionadas().filter(id => id !== institucionId)
    );
  }

  /**
   * Obtener nombre de institución por ID
   */
  getInstitucionNombre(institucionId: number): string {
    return this.instituciones().find(i => i.id === institucionId)?.nombre || 'Desconocida';
  }

  /**
   * Calcular total
   */
  calculateTotal(): number {
    const cantidad = this.rifaForm.get('cantidad_numeros')?.value || 0;
    const precio = this.rifaForm.get('precio_numero')?.value || 0;
    return cantidad * precio;
  }

  /**
   * Validación de campo
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.rifaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Volver atrás
   */
  goBack(): void {
    this.router.navigate(['/rifas']);
  }
}