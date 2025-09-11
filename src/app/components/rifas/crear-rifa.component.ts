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
  templateUrl: './crear-rifa.component.html',
  styleUrls: ['./crear-rifa.component.css']
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