// src/app/rifas/components/buy-numbers/buy-numbers.component.ts

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { NotificationService } from '../../../shared/services/notification.service';


interface NumeroSeleccionado {
  numero: number;
  precio: number;
  seleccionado: boolean;
}

@Component({
  selector: 'app-buy-numbers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './buy-numbers.component.html',
  styleUrls: ['./buy-numbers.component.scss']
})
export class BuyNumbersComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);

  // Signals
  readonly rifa = signal<any>(null);
  readonly numeros = signal<any[]>([]);
  readonly pagination = signal<any>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showPurchaseModal = signal(false);
  readonly purchasing = signal(false);
  readonly showSuccessModal = signal(false); // ✅ NUEVO: Modal de éxito
  readonly purchaseResult = signal<any>(null); // ✅ NUEVO: Resultado de compra

  // Selección de números (ahora contiene objetos completos)
  readonly numerosSeleccionados = signal<number[]>([]);

  private rifaId: number = 0;

  // Filtros
  filtroEstado = 'disponible';
  filtroDesde: number | null = null;
  filtroHasta: number | null = null;
  currentPage = 1;

  // Métodos de selección
  randomCount = 1;
  rangeStart: number | null = null;
  rangeEnd: number | null = null;

  // Formulario de compra
  purchaseForm: FormGroup;

  // Computed properties
  readonly getAvailableCount = computed(() => 
    this.numeros().filter(n => n.estado === 'disponible').length
  );

  constructor() {
     this.purchaseForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],
    telefono: ['', [Validators.minLength(8)]],
    email: ['', [Validators.required, Validators.email]], // ✅ AHORA REQUIRED
    metodo_pago: ['efectivo', Validators.required],
    observaciones: ['']
  });
  }

  ngOnInit() {
    // ✅ VERIFICAR AUTENTICACIÓN
    if (!this.authService.isAuthenticated()) {
      const returnUrl = this.router.url;
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl } 
      });
      return;
    }

    // Obtener ID de la rifa de la ruta
    this.route.params.subscribe(params => {
      this.rifaId = +params['id'];
      if (this.rifaId) {
        this.loadRifa();
        this.loadNumeros();
        this.initializeUserData();
        this.checkPreselectedNumbers(); // ✅ NUEVO: Verificar números pre-seleccionados
      } else {
        this.error.set('ID de rifa inválido');
        this.loading.set(false);
      }
    });
  }

  /**
   * ✅ NUEVO: Verificar números pre-seleccionados desde query params
   */
  private checkPreselectedNumbers(): void {
    this.route.queryParams.subscribe(params => {
      if (params['numero']) {
        const numeroPreseleccionado = +params['numero'];
        
        // Esperar a que se carguen los números
        const checkInterval = setInterval(() => {
          const numeros = this.numeros();
          if (numeros.length > 0) {
            clearInterval(checkInterval);
            
            // Verificar si el número existe y está disponible
            const numeroEncontrado = numeros.find(n => 
              n.numero === numeroPreseleccionado && n.estado === 'disponible'
            );
            
            if (numeroEncontrado) {
              this.numerosSeleccionados.set([numeroPreseleccionado]);
              console.log('✅ Número pre-seleccionado:', numeroPreseleccionado);
              
              // Scroll al número seleccionado
              setTimeout(() => {
                const elemento = document.querySelector(`[data-numero="${numeroPreseleccionado}"]`);
                if (elemento) {
                  elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 300);
            } else {
              console.warn('⚠️ Número no disponible:', numeroPreseleccionado);
              alert(`El número ${numeroPreseleccionado} no está disponible para compra.`);
            }
          }
        }, 100);
        
        // Timeout de seguridad
        setTimeout(() => clearInterval(checkInterval), 5000);
      }
    });
  }

  /**
   * Cargar datos de la rifa
   */
  private loadRifa(): void {
    this.rifasService.getRifa(this.rifaId).subscribe({
      next: (response) => {
        const rifaData = response.data || response;
        this.rifa.set(rifaData);
        console.log('📦 Rifa cargada para compra:', rifaData);
      },
      error: (error) => {
        console.error('❌ Error cargando rifa:', error);
        this.error.set('Error al cargar la información de la rifa');
      }
    });
  }

  /**
   * Cargar números disponibles
   */
  loadNumeros(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = {
      estado: this.filtroEstado,
      page: this.currentPage,
      limit: 100,
      ...(this.filtroDesde && { desde: this.filtroDesde }),
      ...(this.filtroHasta && { hasta: this.filtroHasta })
    };

    console.log('📡 Cargando números con filtros:', params);

    this.rifasService.getRifaNumbers(this.rifaId, params).subscribe({
      next: (response) => {
        console.log('📦 Números cargados:', response);
        
        const numerosData = response?.data?.numeros || response?.numeros || response?.data || [];
        this.numeros.set(Array.isArray(numerosData) ? numerosData : []);
        this.pagination.set(response?.pagination || null);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando números:', error);
        this.error.set(error?.error?.message || 'Error al cargar los números');
        this.numeros.set([]);
        this.loading.set(false);
      }
    });
  }

  /**
   * Inicializar datos del usuario en el formulario
   */
  private initializeUserData(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.purchaseForm.patchValue({
        nombre: currentUser.name?.split(' ')[0] || '',
        apellido: currentUser.name?.split(' ').slice(1).join(' ') || '',
        email: currentUser.email || ''
      });
    }
  }

  /**
   * ✅ MEJORADO: Alternar selección de número con validación en tiempo real
   */
  toggleNumberSelection(numero: any): void {
    if (numero.estado !== 'disponible') {
      alert('⚠️ Este número no está disponible para compra');
      return;
    }

    const numeroValue = numero.numero;
    const currentSelection = this.numerosSeleccionados();
    
    if (currentSelection.includes(numeroValue)) {
      // Deseleccionar
      this.numerosSeleccionados.set(
        currentSelection.filter(n => n !== numeroValue)
      );
      console.log('🔴 Número deseleccionado:', numeroValue);
    } else {
      // Seleccionar
      this.numerosSeleccionados.set([...currentSelection, numeroValue]);
      console.log('🟢 Número seleccionado:', numeroValue);
    }
    
    console.log('📋 Total seleccionados:', this.numerosSeleccionados().length);
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
    console.log('🧹 Selección limpiada');
  }

  /**
   * Seleccionar números al azar
   */
  selectRandomNumbers(): void {
    if (!this.randomCount || this.randomCount < 1) {
      alert('⚠️ Ingrese una cantidad válida');
      return;
    }

    const numerosDisponibles = this.numeros()
      .filter(n => n.estado === 'disponible')
      .map(n => n.numero);

    if (numerosDisponibles.length === 0) {
      alert('❌ No hay números disponibles para seleccionar');
      return;
    }

    const cantidad = Math.min(this.randomCount, numerosDisponibles.length);
    const shuffled = [...numerosDisponibles].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, cantidad);

    this.numerosSeleccionados.set([...this.numerosSeleccionados(), ...selected]);
    console.log('🎲 Números aleatorios seleccionados:', selected);
  }

  /**
   * Seleccionar rango de números
   */
  selectRangeNumbers(): void {
    if (!this.rangeStart || !this.rangeEnd) {
      alert('⚠️ Debe especificar el rango de números');
      return;
    }

    if (this.rangeStart > this.rangeEnd) {
      alert('⚠️ El número inicial debe ser menor al final');
      return;
    }

    const numerosDisponibles = this.numeros()
      .filter(n => n.estado === 'disponible' && 
                   n.numero >= this.rangeStart! && 
                   n.numero <= this.rangeEnd!)
      .map(n => n.numero);

    if (numerosDisponibles.length === 0) {
      alert('❌ No hay números disponibles en ese rango');
      return;
    }

    this.numerosSeleccionados.set([...this.numerosSeleccionados(), ...numerosDisponibles]);
    console.log('📊 Rango seleccionado:', numerosDisponibles);
  }

  /**
   * Proceder a la compra
   */
  proceedToPurchase(): void {
    if (this.numerosSeleccionados().length === 0) {
      alert('⚠️ Debe seleccionar al menos un número');
      return;
    }

    // ✅ VALIDAR DISPONIBILIDAD ANTES DE MOSTRAR MODAL
    this.validateNumbersAvailability();
  }

  /**
   * ✅ NUEVO: Validar disponibilidad en tiempo real antes de comprar
   */
  private validateNumbersAvailability(): void {
    const selectedNumbers = this.numerosSeleccionados();
    const currentNumeros = this.numeros();
    
    const unavailableNumbers = selectedNumbers.filter(num => {
      const numero = currentNumeros.find(n => n.numero === num);
      return !numero || numero.estado !== 'disponible';
    });

    if (unavailableNumbers.length > 0) {
      alert(`⚠️ Los siguientes números ya no están disponibles: ${unavailableNumbers.join(', ')}\n\nActualizando lista...`);
      
      // Remover números no disponibles
      this.numerosSeleccionados.set(
        selectedNumbers.filter(n => !unavailableNumbers.includes(n))
      );
      
      // Recargar números
      this.loadNumeros();
      return;
    }

    // Si todos están disponibles, mostrar modal
    this.showPurchaseModal.set(true);
  }

  /**
   * Cerrar modal de compra
   */
  closePurchaseModal(): void {
    this.showPurchaseModal.set(false);
  }

  /**
   * Confirmar compra - CON NOTIFICACIONES
   */
  confirmPurchase(): void {
    if (this.purchaseForm.invalid) {
      this.markFormGroupTouched();
      // ✅ Toast de validación
      this.notificationService.warning(
        'Por favor complete todos los campos obligatorios',
        'Formulario incompleto'
      );
      return;
    }

    this.purchasing.set(true);

    const formData = this.purchaseForm.value;
    const purchaseData = {
      numeros: this.numerosSeleccionados(),
      comprador_info: {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        email: formData.email
      },
      metodo_pago: formData.metodo_pago,
      observaciones: formData.observaciones
    };

    this.rifasService.comprarNumeros(this.rifaId, purchaseData).subscribe({
      next: (response) => {
        console.log('✅ Compra exitosa:', response);
        this.purchasing.set(false);
        this.showPurchaseModal.set(false);
        
        // ✅ TOAST DE ÉXITO
        this.notificationService.success(
          `Se compraron ${response.data.numeros_comprados.length} números exitosamente`,
          '¡Compra realizada!'
        );

        // ✅ NOTIFICACIÓN PERSISTENTE
        this.notificationService.addNotification(
          'success',
          'Compra de números exitosa',
          `Compraste los números: ${response.data.numeros_comprados.join(', ')} por ${this.formatPrice(response.data.total_pagado)}`,
          `/rifas/${this.rifaId}/boletos`,
          'Ver mis boletos'
        );
        
        this.purchaseResult.set(response.data);
        this.showSuccessModal.set(true);
        this.clearSelection();
        this.loadNumeros();
      },
      error: (error) => {
        console.error('❌ Error en la compra:', error);
        this.purchasing.set(false);
        
        const errorMessage = error?.error?.message || error.message || 'Error desconocido';
        
        // ✅ TOAST DE ERROR
        this.notificationService.error(
          errorMessage,
          'Error en la compra'
        );
      }
    });
  }


  /**
   * ✅ NUEVO: Cerrar modal de éxito
   */
  closeSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.purchaseResult.set(null);
  }

  /**
   * ✅ NUEVO: Ver mis boletos después de comprar
   */
  verMisBoletos(): void {
    this.router.navigate(['/rifas', this.rifaId, 'boletos']);
  }

  /**
   * ✅ NUEVO: Compartir en WhatsApp
   */
  compartirWhatsApp(): void {
    const rifa = this.rifa();
    const url = `${window.location.origin}/public/rifas/${this.rifaId}`;
    const texto = `¡Acabo de comprar ${this.purchaseResult()?.cantidad} números en la rifa "${rifa?.nombre}"! 🎟️\n\n¡Participá vos también!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(texto + '\n' + url)}`;
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Marcar todos los campos como tocados
   */
  private markFormGroupTouched(): void {
    Object.keys(this.purchaseForm.controls).forEach(key => {
      this.purchaseForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Cambiar página
   */
  cambiarPagina(page: number): void {
    this.currentPage = page;
    this.loadNumeros();
  }

  /**
   * Obtener páginas para paginación
   */
  getPaginationPages(): number[] {
    const pagination = this.pagination();
    if (!pagination) return [];
    
    const pages: number[] = [];
    const current = pagination.page;
    const total = pagination.totalPages || pagination.pages;
    
    // Mostrar máximo 5 páginas
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Obtener total de la compra
   */
  getTotalAmount(): number {
    const precio = this.rifa()?.precio_numero || 0;
    return this.numerosSeleccionados().length * precio;
  }

  /**
   * Obtener lista de números seleccionados como string
   */
  getSelectedNumbersList(): string {
    const numeros = this.numerosSeleccionados().sort((a, b) => a - b);
    
    if (numeros.length <= 5) {
      return numeros.join(', ');
    } else {
      return `${numeros.slice(0, 3).join(', ')}, ... y ${numeros.length - 3} más`;
    }
  }

  /**
   * Obtener clase CSS del número
   */
  getNumberCardClass(numero: any): string {
    let classes = [numero.estado];
    
    if (numero.estado === 'disponible' && this.isNumberSelected(numero.numero)) {
      classes.push('selected');
    }
    
    return classes.join(' ');
  }

  /**
   * Obtener tooltip del número
   */
  getNumberTooltip(numero: any): string {
    switch (numero.estado) {
      case 'disponible':
        return `Número ${numero.numero} - Disponible para compra`;
      case 'vendido':
        return `Número ${numero.numero} - Vendido${numero.fecha_venta ? ' el ' + this.formatDate(numero.fecha_venta) : ''}`;
      case 'reservado':
        return `Número ${numero.numero} - Reservado`;
      default:
        return `Número ${numero.numero}`;
    }
  }

  /**
   * Obtener icono del estado
   */
  getStatusIcon(estado: string): string {
    const icons: { [key: string]: string } = {
      'disponible': '✅',
      'reservado': '⏳',
      'vendido': '💰'
    };
    return icons[estado] || '❓';
  }

  /**
   * Volver atrás
   */
  goBack(): void {
    this.router.navigate(['/rifas', this.rifaId]);
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'No definida';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }
}