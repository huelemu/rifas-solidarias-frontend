// src/app/rifas/components/boletos-viewer/boletos-viewer.component.ts

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';
import { NotificationService } from '../../../shared/services/notification.service';
import * as QRCode from 'qrcode'; // ✅ IMPORTANTE

interface NumeroBoleto {
  id: number;
  numero: number;
  qr_code: string;
  estado: 'disponible' | 'reservado' | 'vendido';
  comprador_nombre?: string;
  comprador_apellido?: string;
  comprador_telefono?: string;
  comprador_email?: string;
  vendedor_nombre?: string;
  vendedor_apellido?: string;
  vendedor_id?: number;
  fecha_venta?: string;
  metodo_pago?: string;
  precio?: number;
  precio_venta?: number;
}

@Component({
  selector: 'app-boletos-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './boletos-viewer.component.html',
  styleUrls: ['./boletos-viewer.component.scss']
})
export class BoletosViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);

  // Signals
  readonly numeros = signal<NumeroBoleto[]>([]);
  readonly rifa = signal<any>(null);
  readonly institucion = signal<any>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly usuarioActual = signal<any>(null);
  
  // ✅ Modo vendedor como signal
  readonly modoVendedor = signal(false);
  
  // Modal de venta
  readonly showSaleModal = signal(false);
  readonly selectedNumero = signal<NumeroBoleto | null>(null);
  readonly processing = signal(false);

  // Filtros
  filtroEstado = 'todos';
  filtroVendedor: number | null = null;
  buscarNumero: number | null = null;
  
  // Formulario de venta
  saleForm: FormGroup;

  // Computed
  readonly numerosFiltrados = computed(() => {
    let resultado = this.numeros();

    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(n => n.estado === this.filtroEstado);
    }

    if (this.filtroVendedor) {
      resultado = resultado.filter(n => n.vendedor_id === this.filtroVendedor);
    }

    if (this.buscarNumero) {
      resultado = resultado.filter(n => n.numero === this.buscarNumero);
    }

    return resultado.sort((a, b) => a.numero - b.numero);
  });

  constructor() {
    this.saleForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', Validators.required],
      email: ['', [Validators.email]],
      metodo_pago: ['efectivo', Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    // ✅ Detectar si viene de ruta de vendedor
    const rutaActual = this.router.url;
    const esRutaVendedor = rutaActual.includes('/vendedor/');
    
    // Obtener usuario actual
    const user = this.authService.currentUser();
    const esRolVendedor = user?.rol === 'vendedor';
    
    // ⭐ MODO VENDEDOR si viene de ruta O tiene rol vendedor
    this.modoVendedor.set(esRutaVendedor || esRolVendedor);
    this.usuarioActual.set(user);
    
    console.log('🔍 Detección modo vendedor:');
    console.log(' - Ruta actual:', rutaActual);
    console.log(' - Es ruta vendedor:', esRutaVendedor);
    console.log(' - Usuario rol:', user?.rol);
    console.log(' - Es rol vendedor:', esRolVendedor);
    console.log(' - Modo final:', this.modoVendedor());

    this.route.params.subscribe(params => {
      const rifaId = +params['rifaId'];
      if (rifaId) {
        this.cargarBoletos(rifaId);
      }
    });
  }

  cargarBoletos(rifaId: number): void {
    this.loading.set(true);
    this.error.set(null);

    console.log('📡 Cargando boletos para rifa:', rifaId);

    // Cargar información de la rifa
    this.rifasService.getRifaById(rifaId).subscribe({
      next: (response: any) => {
        console.log('✅ Rifa cargada:', response);
        const rifaData = response.data || response;
        this.rifa.set(rifaData);
        this.institucion.set(rifaData.institucion_promotora || { nombre: 'Rifa Solidaria' });
      },
      error: (err) => {
        console.error('❌ Error cargando rifa:', err);
      }
    });

    // ⭐ CARGAR NÚMEROS SEGÚN EL MODO
    if (this.modoVendedor()) {
      console.log('🔑 Modo vendedor: cargando solo números asignados');
      // Vendedor: solo sus números
      this.rifasService.obtenerNumerosVendedor(rifaId).subscribe({
        next: async (response) => {
          console.log('📦 Números del vendedor:', response);
          const numerosData = response.data?.numeros || [];
          
          // Regenerar QR
          const numerosConQR = await this.regenerarQRs(numerosData, rifaId);
          this.numeros.set(numerosConQR);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('❌ Error cargando números del vendedor:', err);
          this.error.set('Error al cargar tus números');
          this.loading.set(false);
        }
      });
    } else {
      console.log('👑 Modo admin: cargando todos los números');
      // Admin: todos los números
      this.rifasService.getNumeros(rifaId, { limit: 10000 }).subscribe({
        next: async (response: any) => {
          const numerosData = response.data || [];
          
          // Regenerar QR
          const numerosConQR = await this.regenerarQRs(numerosData, rifaId);
          this.numeros.set(numerosConQR);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('❌ Error cargando números:', err);
          this.error.set('Error al cargar boletos');
          this.loading.set(false);
        }
      });
    }
  }

  /**
   * ✅ Regenerar QRs para los números
   */
  private async regenerarQRs(numerosData: any[], rifaId: number): Promise<any[]> {
    return Promise.all(
      numerosData.map(async (num: any) => {
        try {
          const urlCompleta = `${window.location.origin}/public/rifas/${rifaId}/numero/${num.numero}`;
          const qrCode = await QRCode.toDataURL(urlCompleta, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          return {
            ...num,
            qr_code: qrCode,
            precio: this.obtenerPrecio(num)
          };
        } catch (error) {
          console.error(`Error generando QR para número ${num.numero}:`, error);
          return {
            ...num,
            precio: this.obtenerPrecio(num)
          };
        }
      })
    );
  }

  obtenerPrecio(numero: any): number {
    if (numero.precio_venta) return parseFloat(numero.precio_venta);
    if (numero.precio) return parseFloat(numero.precio);
    if (this.rifa()?.precio_numero) return parseFloat(this.rifa().precio_numero);
    return 0;
  }

  getInstitucionLogoUrl(): string | null {
    return ImageUrlHelper.getLogoUrl(this.institucion()?.logo_url);
  }

  getPrecioNumero(numero: NumeroBoleto): number {
    return numero.precio || this.rifa()?.precio_numero || 0;
  }

  getDisponibles(): number {
    return this.numeros().filter(n => n.estado === 'disponible').length;
  }

  getReservados(): number {
    return this.numeros().filter(n => n.estado === 'reservado').length;
  }

  getVendidos(): number {
    return this.numeros().filter(n => n.estado === 'vendido').length;
  }

  aplicarFiltros(): void {
    // Los filtros se aplican automáticamente via computed
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'todos';
    this.filtroVendedor = null;
    this.buscarNumero = null;
  }

  recargarDatos(): void {
    const rifaId = this.rifa()?.id;
    if (rifaId) {
      this.cargarBoletos(rifaId);
    }
  }

  volver(): void {
    this.router.navigate(['/rifas']);
  }

  verQR(numero: NumeroBoleto): void {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      cursor: pointer;
    `;
    
    modal.innerHTML = `
      <div style="text-align: center; color: white;">
        <h2 style="margin-bottom: 1rem;">Número ${numero.numero}</h2>
        <img src="${numero.qr_code}" style="max-width: 400px; max-height: 400px; background: white; padding: 1rem; border-radius: 8px;">
        <p style="margin-top: 1rem; font-size: 0.9rem;">Click para cerrar</p>
      </div>
    `;
    
    modal.onclick = () => document.body.removeChild(modal);
    document.body.appendChild(modal);
  }

  copiarURLPublica(numero: NumeroBoleto): void {
    const rifaId = this.rifa()?.id;
    const url = `${window.location.origin}/public/rifas/${rifaId}/numero/${numero.numero}`;
    
    navigator.clipboard.writeText(url).then(() => {
      this.notificationService.success('URL copiada al portapapeles', 'Éxito');
    }).catch(() => {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      this.notificationService.success('URL copiada al portapapeles', 'Éxito');
    });
  }

  abrirURLPublica(numero: NumeroBoleto): void {
    const rifaId = this.rifa()?.id;
    const url = `${window.location.origin}/public/rifas/${rifaId}/numero/${numero.numero}`;
    window.open(url, '_blank');
  }

  compartirWhatsApp(numero: NumeroBoleto): void {
    const rifaId = this.rifa()?.id;
    const rifa = this.rifa();
    const url = `${window.location.origin}/public/rifas/${rifaId}/numero/${numero.numero}`;
    
    const mensaje = `🎫 *Número de Rifa Disponible*\n\n` +
      `*Rifa:* ${rifa?.nombre}\n` +
      `*Número:* ${numero.numero}\n` +
      `*Precio:* ${this.formatPrice(this.getPrecioNumero(numero))}\n\n` +
      `¡Reservalo ahora! 🎫\n\n` +
      `Ver detalles: ${url}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  }

  generarPDF(): void {
    const rifaId = this.rifa()?.id;
    const usuario = this.authService.currentUser();
    
    if (!rifaId || !usuario) {
      this.notificationService.warning('No se puede generar el PDF en este momento', 'Atención');
      return;
    }

    this.notificationService.info('Funcionalidad de generación de PDF - Por implementar en siguiente etapa', 'Información');
  }

  venderNumero(numero: NumeroBoleto): void {
    if (numero.estado !== 'disponible') {
      this.notificationService.warning('Este número no está disponible para venta', 'No disponible');
      return;
    }

    this.selectedNumero.set(numero);
    this.saleForm.reset({
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      metodo_pago: 'efectivo',
      observaciones: ''
    });
    this.showSaleModal.set(true);
  }

  closeSaleModal(): void {
    this.showSaleModal.set(false);
    this.selectedNumero.set(null);
    this.saleForm.reset();
  }

  confirmSale(): void {
    if (this.saleForm.invalid) {
      this.markFormGroupTouched();
      this.notificationService.warning('Complete todos los campos obligatorios', 'Formulario incompleto');
      return;
    }

    const numero = this.selectedNumero();
    if (!numero) return;

    this.processing.set(true);

    const formData = this.saleForm.value;
    const saleData = {
      numeros: [numero.numero],
      comprador_info: {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        email: formData.email
      },
      metodo_pago: formData.metodo_pago,
      observaciones: formData.observaciones
    };

    const rifaId = this.rifa()?.id;
    
    this.rifasService.comprarNumeros(rifaId, saleData).subscribe({
      next: (response) => {
        console.log('✅ Venta exitosa:', response);
        this.processing.set(false);
        this.closeSaleModal();
        
        this.notificationService.success(
          `Número ${numero.numero} vendido exitosamente`,
          '¡Venta registrada!'
        );

        this.notificationService.addNotification(
          'success',
          'Venta de número exitosa',
          `Vendiste el número ${numero.numero} a ${formData.nombre} ${formData.apellido}`,
          `/rifas/${rifaId}/boletos`,
          'Ver boletos'
        );

        this.recargarDatos();
      },
      error: (error) => {
        console.error('❌ Error en la venta:', error);
        this.processing.set(false);
        
        const errorMessage = error?.error?.message || error.message || 'Error desconocido';
        this.notificationService.error(errorMessage, 'Error en la venta');
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.saleForm.controls).forEach(key => {
      this.saleForm.get(key)?.markAsTouched();
    });
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }
}