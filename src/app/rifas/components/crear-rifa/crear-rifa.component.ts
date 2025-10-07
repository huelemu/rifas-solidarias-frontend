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

@Component({
  selector: 'app-crear-rifa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './crear-rifa.component.html',
  styleUrls: ['./crear-rifa.component.scss']
})
export class CrearRifaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly rifasService = inject(RifasService);
  private readonly institutionService = inject(InstitutionService);
  private readonly router = inject(Router);

  // Signals
  readonly submitting = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly loadingInstituciones = signal<boolean>(false);
  readonly instituciones = signal<Institution[]>([]);
  readonly imagePreview = signal<string | null>(null);
  readonly institucionesSeleccionadas = signal<number[]>([]);
  
  // Formulario
  rifaForm: FormGroup;

  // Instituciones disponibles para participar (excluye la promotora)
  readonly institucionesDisponibles = computed(() => {
    const promotoraId = this.rifaForm.get('institucion_promotora_id')?.value;
    return this.instituciones().filter(inst => inst.id !== parseInt(promotoraId));
  });

  constructor() {
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
      
      imagen_url: [''],
      bases_condiciones: ['']
    });
  }

  /**
   * Configurar validaciones dinámicas
   */
  private setupFormValidation(): void {
    this.rifaForm.get('es_compartida')?.valueChanges.subscribe(esCompartida => {
      const comisionControl = this.rifaForm.get('comision_promotora');
      
      if (esCompartida) {
        comisionControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else {
        comisionControl?.clearValidators();
      }
      
      comisionControl?.updateValueAndValidity();
    });
  }

  /**
 * Cargar instituciones
 */
private loadInstituciones(): void {
  console.log('🔄 Iniciando carga de instituciones...');
  this.loadingInstituciones.set(true);
  
  this.institutionService.getInstitutions().subscribe({
    next: (result: any) => {
      console.log('📦 Respuesta de instituciones:', result);
      
      // Intentar diferentes estructuras
      let instituciones: Institution[] = [];
      
      // ✅ SOLUCIÓN: El backend devuelve "institutions" (inglés)
      if (result?.institutions) {
        console.log('✅ Encontrado en result.institutions');
        instituciones = result.institutions;
      } else if (Array.isArray(result)) {
        console.log('✅ Es un array directo');
        instituciones = result;
      } else if (result?.data?.instituciones) {
        console.log('✅ Encontrado en result.data.instituciones');
        instituciones = result.data.instituciones;
      } else if (result?.instituciones) {
        console.log('✅ Encontrado en result.instituciones');
        instituciones = result.instituciones;
      } else if (result?.data?.institutions) {
        console.log('✅ Encontrado en result.data.institutions');
        instituciones = result.data.institutions;
      } else if (result?.data) {
        console.log('✅ Intentando result.data');
        instituciones = Array.isArray(result.data) ? result.data : [];
      } else {
        console.warn('⚠️ No se encontró estructura conocida');
      }
      
      console.log('✅ Instituciones cargadas:', instituciones);
      console.log('📊 Total:', instituciones.length);
      
      this.instituciones.set(instituciones);
      this.loadingInstituciones.set(false);
      
      // Pre-seleccionar institución del usuario
      this.preselectInstitution();
    },
    error: (error) => {
      console.error('❌ Error cargando instituciones:', error);
      this.error.set('Error al cargar instituciones');
      this.loadingInstituciones.set(false);
    }
  });
}

  /**
   * Pre-seleccionar institución del usuario
   */
  private preselectInstitution(): void {
    const currentUser = this.authService.currentUser();
    console.log('👤 Usuario actual:', currentUser);
    
    if (currentUser?.institucion_id) {
      this.rifaForm.patchValue({
        institucion_promotora_id: currentUser.institucion_id
      });
      console.log('✅ Institución pre-seleccionada:', currentUser.institucion_id);
    }
  }

  /**
   * Manejo de cambio en "es_compartida"
   */
  onCompartidaChange(): void {
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
    
    // Reset select
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
   * Manejo de imagen
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('La imagen no puede superar los 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imagePreview.set(e.target?.result as string);
      this.rifaForm.patchValue({ imagen_url: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.rifaForm.patchValue({ imagen_url: '' });
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
   * Submit del formulario
   */
  onSubmit(): void {
    if (this.rifaForm.invalid) {
      Object.keys(this.rifaForm.controls).forEach(key => {
        this.rifaForm.get(key)?.markAsTouched();
      });
      this.error.set('Por favor completá todos los campos obligatorios');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formData = this.prepareFormData();
    console.log('📤 Enviando rifa:', formData);

    this.rifasService.createRifa(formData).subscribe({
      next: (response: any) => {
        console.log('✅ Rifa creada:', response);
        
        const rifaId = response?.data?.id || response?.id;
        
        if (this.institucionesSeleccionadas().length > 0 && rifaId) {
          this.enviarInvitaciones(rifaId);
        } else {
          this.success.set('Rifa creada exitosamente');
          this.submitting.set(false);
          setTimeout(() => {
            this.router.navigate(['/rifas', rifaId]);
          }, 1500);
        }
      },
      error: (error) => {
        console.error('❌ Error creando rifa:', error);
        this.error.set(error?.error?.message || 'Error al crear la rifa');
        this.submitting.set(false);
      }
    });
  }

  /**
   * Preparar datos del formulario
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
      imagen_url: formValue.imagen_url || null,
      bases_condiciones: formValue.bases_condiciones || null
    };
  }

  /**
   * Enviar invitaciones a instituciones
   */
  private enviarInvitaciones(rifaId: number): void {
    const institucionesIds = this.institucionesSeleccionadas();
    
    if (institucionesIds.length === 0) {
      this.success.set('Rifa creada exitosamente');
      this.submitting.set(false);
      setTimeout(() => {
        this.router.navigate(['/rifas', rifaId]);
      }, 1500);
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
        this.success.set('Rifa creada, pero hubo un error al enviar algunas invitaciones');
        this.submitting.set(false);
        
        setTimeout(() => {
          this.router.navigate(['/rifas', rifaId]);
        }, 2000);
      }
    });
  }

  /**
   * Volver atrás
   */
  goBack(): void {
    this.router.navigate(['/rifas']);
  }
}