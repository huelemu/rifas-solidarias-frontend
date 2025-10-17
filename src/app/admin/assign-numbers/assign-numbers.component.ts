// src/app/admin/assign-numbers/assign-numbers.component.ts

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsignacionService } from '../../rifas/services/asignacion.service';
import { RifasService } from '../../rifas/services/rifas.service';
import { AuthService } from '../../auth/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

interface Numero {
  numero: number;
  estado: string;
}

@Component({
  selector: 'app-assign-numbers',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './assign-numbers.component.html',
  styleUrl: './assign-numbers.component.css'
})
export class AssignNumbersComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly asignacionService = inject(AsignacionService);
  private readonly rifasService = inject(RifasService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  // Señales
  readonly rifa = signal<any>(null);
  readonly instituciones = signal<any[]>([]);
  readonly vendedores = signal<any[]>([]);
  readonly numeros = signal<number[]>([]);
  readonly numerosSeleccionados = signal<number[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly asignando = signal(false);
  readonly showSuccessModal = signal(false);
  readonly asignacionResult = signal<any>(null);

  // Filtros y controles
  institucionSeleccionada: number | null = null;
  vendedorSeleccionado: number | null = null;
  tipoAsignacion: 'individual' | 'rango' | 'aleatorio' = 'individual';
  
  // Para aleatorio
  cantidadAleatoria = 1;
  
  // Para rango
  rangoDesde: number | null = null;
  rangoHasta: number | null = null;

  private rifaId: number = 0;
  private rifaInstitucionId: number = 0;

  // Computed
  readonly getAvailableCount = computed(() => this.numeros().length);
  readonly getNumerosSeleccionadosCount = computed(() => this.numerosSeleccionados().length);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.rifaId = +params['id'];
      if (this.rifaId) {
        this.loadRifa();
        this.loadInstituciones();
        this.loadVendedores();
      }
    });
  }

  /**
   * Cargar datos de la rifa
   */
  loadRifa(): void {
  this.rifasService.getRifa(this.rifaId).subscribe({
    next: (response: any) => {
      this.rifa.set(response.data);
      console.log('✅ Rifa cargada:', response.data);
    },
    error: (err: any) => {
      console.error('❌ Error cargando rifa:', err);
      this.error.set('Error al cargar la rifa');
    }
  });
}

  /**
   * Cargar instituciones de la rifa
   */
  loadInstituciones(): void {
    this.asignacionService.obtenerInstitucionesDeRifa(this.rifaId).subscribe({
      next: (response: any) => {
        this.instituciones.set(response.data || []);
        console.log('✅ Instituciones cargadas:', response.data);
      },
      error: (err) => {
        console.error('❌ Error cargando instituciones:', err);
      }
    });
  }

  /**
   * Cargar vendedores
   */
 loadVendedores(): void {
  // Llamar directamente al endpoint
  this.http.get('http://localhost:3000/api/usuarios/vendedores').subscribe({ // ⚠️ AJUSTAR URL
    next: (response: any) => {
      this.vendedores.set(response.data || []);
      console.log('✅ Vendedores cargados:', response.data);
    },
    error: (err: any) => {
      console.error('❌ Error cargando vendedores:', err);
    }
  });
}

  /**
   * Cargar números disponibles cuando se selecciona institución
   */
  onInstitucionChange(): void {
    if (!this.institucionSeleccionada) {
      this.numeros.set([]);
      this.numerosSeleccionados.set([]);
      return;
    }

    const institucion = this.instituciones().find(i => i.id === this.institucionSeleccionada);
    if (institucion) {
      this.rifaInstitucionId = institucion.id;
      this.loadNumerosDisponibles();
    }
  }

  /**
   * Cargar números disponibles
   */
  loadNumerosDisponibles(): void {
    if (!this.rifaInstitucionId) return;

    this.loading.set(true);
    this.error.set(null);

    this.asignacionService.obtenerNumerosDisponibles(this.rifaInstitucionId).subscribe({
      next: (response: any) => {
        this.numeros.set(response.data.disponibles.numeros || []);
        this.loading.set(false);
        console.log('✅ Números disponibles:', response.data.disponibles.numeros.length);
      },
      error: (err) => {
        console.error('❌ Error cargando números:', err);
        this.error.set('Error al cargar números disponibles');
        this.loading.set(false);
      }
    });
  }

  /**
   * Toggle selección de número individual
   */
  toggleNumberSelection(numero: number): void {
    if (this.tipoAsignacion !== 'individual') return;

    const currentSelection = this.numerosSeleccionados();
    
    if (currentSelection.includes(numero)) {
      this.numerosSeleccionados.set(currentSelection.filter(n => n !== numero));
      console.log('🔴 Número deseleccionado:', numero);
    } else {
      this.numerosSeleccionados.set([...currentSelection, numero]);
      console.log('🟢 Número seleccionado:', numero);
    }
  }

  /**
   * Verificar si un número está seleccionado
   */
  isNumberSelected(numero: number): boolean {
    return this.numerosSeleccionados().includes(numero);
  }

  /**
   * Limpiar selección
   */
  clearSelection(): void {
    this.numerosSeleccionados.set([]);
    this.cantidadAleatoria = 1;
    this.rangoDesde = null;
    this.rangoHasta = null;
    console.log('🧹 Selección limpiada');
  }

  /**
   * Seleccionar números aleatorios
   */
  selectRandomNumbers(): void {
    if (!this.cantidadAleatoria || this.cantidadAleatoria < 1) {
      alert('⚠️ Ingrese una cantidad válida');
      return;
    }

    const numerosDisponibles = this.numeros();

    if (numerosDisponibles.length === 0) {
      alert('❌ No hay números disponibles para seleccionar');
      return;
    }

    const cantidad = Math.min(this.cantidadAleatoria, numerosDisponibles.length);
    const shuffled = [...numerosDisponibles].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, cantidad);

    this.numerosSeleccionados.set(selected);
    console.log('🎲 Números aleatorios seleccionados:', selected);
  }

  /**
   * Seleccionar rango de números
   */
  selectRangeNumbers(): void {
    if (!this.rangoDesde || !this.rangoHasta) {
      alert('⚠️ Debe especificar el rango de números');
      return;
    }

    if (this.rangoDesde > this.rangoHasta) {
      alert('⚠️ El número inicial debe ser menor al final');
      return;
    }

    const numerosEnRango = this.numeros()
      .filter(n => n >= this.rangoDesde! && n <= this.rangoHasta!);

    if (numerosEnRango.length === 0) {
      alert('❌ No hay números disponibles en ese rango');
      return;
    }

    this.numerosSeleccionados.set(numerosEnRango);
    console.log('📊 Rango seleccionado:', numerosEnRango);
  }

  /**
   * Proceder con la asignación
   */
  proceedToAssign(): void {
    // Validaciones
    if (!this.institucionSeleccionada) {
      alert('⚠️ Debe seleccionar una institución');
      return;
    }

    if (!this.vendedorSeleccionado) {
      alert('⚠️ Debe seleccionar un vendedor');
      return;
    }

    // Validar según tipo de asignación
    if (this.tipoAsignacion === 'individual' && this.numerosSeleccionados().length === 0) {
      alert('⚠️ Debe seleccionar al menos un número');
      return;
    }

    if (this.tipoAsignacion === 'rango' && (!this.rangoDesde || !this.rangoHasta)) {
      alert('⚠️ Debe especificar el rango completo');
      return;
    }

    if (this.tipoAsignacion === 'aleatorio' && (!this.cantidadAleatoria || this.cantidadAleatoria < 1)) {
      alert('⚠️ Debe especificar una cantidad válida');
      return;
    }

    // Construir request según tipo
    const request: any = {
      vendedor_id: this.vendedorSeleccionado,
      tipo_asignacion: this.tipoAsignacion
    };

    switch (this.tipoAsignacion) {
      case 'individual':
        request.numeros = this.numerosSeleccionados();
        break;
      case 'rango':
        request.rango = {
          desde: this.rangoDesde,
          hasta: this.rangoHasta
        };
        break;
      case 'aleatorio':
        request.cantidad = this.cantidadAleatoria;
        break;
    }

    // Confirmar
    const vendedor = this.vendedores().find(v => v.id === this.vendedorSeleccionado);
    const cantidadTexto = this.tipoAsignacion === 'individual' 
      ? this.numerosSeleccionados().length 
      : (this.tipoAsignacion === 'rango' 
        ? (this.rangoHasta! - this.rangoDesde! + 1)
        : this.cantidadAleatoria);

    if (!confirm(`¿Confirmar asignación de ${cantidadTexto} número(s) a ${vendedor?.nombre}?`)) {
      return;
    }

    // Realizar asignación
    this.asignando.set(true);
    this.asignacionService.asignarNumerosAVendedor(this.rifaInstitucionId, request).subscribe({
      next: (response: any) => {
        console.log('✅ Asignación exitosa:', response);
        this.asignacionResult.set(response.data);
        this.showSuccessModal.set(true);
        this.asignando.set(false);
        
        // Recargar números disponibles
        this.loadNumerosDisponibles();
        this.clearSelection();
      },
      error: (err) => {
        console.error('❌ Error en asignación:', err);
        alert(err.error?.message || 'Error al asignar números');
        this.asignando.set(false);
      }
    });
  }

  /**
   * Cerrar modal de éxito
   */
  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.asignacionResult.set(null);
  }

  /**
   * Obtener lista de números seleccionados como string
   */
  getSelectedNumbersList(): string {
    const numeros = [...this.numerosSeleccionados()].sort((a, b) => a - b);
    
    if (numeros.length <= 5) {
      return numeros.join(', ');
    } else {
      return `${numeros.slice(0, 3).join(', ')}, ... y ${numeros.length - 3} más`;
    }
  }


  getVendedorNombre(): string {
  const vendedor = this.vendedores().find(v => v.id === this.vendedorSeleccionado);
  return vendedor?.nombre || '';
}

  /**
   * Volver atrás
   */
  goBack(): void {
    this.location.back();
  }
}