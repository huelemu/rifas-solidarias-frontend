// src/app/rifas/components/boletos-viewer/boletos-viewer.component.ts

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';
import * as QRCode from 'qrcode';

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
  fecha_asignacion?: string;
}

@Component({
  selector: 'app-boletos-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './boletos-viewer.component.html',
  styleUrls: ['./boletos-viewer.component.scss']
})
export class BoletosViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly authService = inject(AuthService);

  // Signals
  readonly numeros = signal<NumeroBoleto[]>([]);
  readonly rifa = signal<any>(null);
  readonly institucion = signal<any>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  
  // ⭐ NUEVO: Detectar si es vista de vendedor
  readonly modoVendedor = signal(false);
  readonly usuarioActual = signal<any>(null);

  // Modal de venta
  readonly mostrarModalVenta = signal(false);
  readonly numeroSeleccionado = signal<NumeroBoleto | null>(null);
  
  datosComprador = {
    nombre: '',
    apellido: '',
    telefono: '',
    email: ''
  };

  // Filtros
  filtroEstado = 'todos';
  buscarNumero: number | null = null;
  filtroVendedor = '';

  // Computed
  readonly numerosFiltrados = computed(() => {
  let resultado = this.numeros();

  if (this.filtroEstado !== 'todos') {
    resultado = resultado.filter(n => n.estado === this.filtroEstado);
  }

  if (this.buscarNumero) {
    resultado = resultado.filter(n => n.numero === this.buscarNumero);
  }

  if (this.filtroVendedor.trim()) {
    const texto = this.filtroVendedor.trim().toLowerCase();
    resultado = resultado.filter(n =>
      (n.vendedor_nombre?.toLowerCase().includes(texto) || 
       n.vendedor_apellido?.toLowerCase().includes(texto))
    );
  }

  return resultado.sort((a, b) => a.numero - b.numero);
});

  readonly disponibles = computed(() => 
    this.numeros().filter(n => n.estado === 'disponible').length
  );
  
  readonly vendidos = computed(() => 
    this.numeros().filter(n => n.estado === 'vendido').length
  );

  readonly reservados = computed(() => 
    this.numeros().filter(n => n.estado === 'reservado').length
  );

  ngOnInit(): void {
  // Detectar si viene de ruta de vendedor
  const rutaActual = this.router.url;
  const esRutaVendedor = rutaActual.includes('/vendedor/');
  
  // Obtener usuario actual
  const user = this.authService.currentUser();
  const esRolVendedor = user?.rol === 'vendedor';
  
  // ⭐ MODO VENDEDOR si viene de ruta O tiene rol vendedor
  this.modoVendedor.set(esRutaVendedor || esRolVendedor);
  
  console.log('🔍 Detección modo vendedor:');
  console.log('  - Ruta actual:', rutaActual);
  console.log('  - Es ruta vendedor:', esRutaVendedor);
  console.log('  - Usuario rol:', user?.rol);
  console.log('  - Es rol vendedor:', esRolVendedor);
  console.log('  - Modo final:', this.modoVendedor());


  
  const User = this.authService.currentUser();
  this.usuarioActual.set(user);

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

  // Cargar información de la rifa
  this.rifasService.getRifaById(rifaId).subscribe({
    next: (response: any) => {
      const rifaData = response.data || response;
      this.rifa.set(rifaData);
      this.institucion.set(rifaData.institucion_promotora || { nombre: 'Rifa Solidaria' });
    },
    error: (err) => console.error('Error cargando rifa:', err)
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

// ⭐ NUEVO MÉTODO: Regenerar QRs
private async regenerarQRs(numerosData: any[], rifaId: number): Promise<any[]> {
  return Promise.all(
    numerosData.map(async (num: any) => {
      try {
        const baseUrl = window.location.origin;
        const urlCompleta = `${baseUrl}/public/rifas/${rifaId}/numero/${num.numero}`;
        
        const qrCode = await QRCode.toDataURL(urlCompleta, {
          errorCorrectionLevel: 'H',
          margin: 1,
          width: 300,
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

 getLogoUrl(): string | null {
    return ImageUrlHelper.getLogoUrl(this.rifa()?.institucion_logo);
  }

  getRifaImageUrl(): string | null {
    return ImageUrlHelper.getRifaImageUrl(this.rifa()?.imagen_url);
  }

  getDisponibles(): number {
    return this.disponibles();
  }

  getReservados(): number {
    return this.reservados();
  }

  getVendidos(): number {
    return this.vendidos();
  }

  aplicarFiltros(): void {
    // Los filtros se aplican automáticamente via computed
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'todos';
    this.buscarNumero = null;
  }

  recargarDatos(): void {
    const rifaId = this.rifa()?.id;
    if (rifaId) {
      this.cargarBoletos(rifaId);
    }
  }

  volver(): void {
    if (this.modoVendedor()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/rifas']);
    }
  }

  // ⭐ NUEVO: Abrir modal de venta
  venderNumero(numero: NumeroBoleto): void {
    if (numero.estado !== 'disponible') {
      alert('Este número no está disponible');
      return;
    }
    this.numeroSeleccionado.set(numero);
    this.mostrarModalVenta.set(true);
  }

  cerrarModalVenta(): void {
    this.numeroSeleccionado.set(null);
    this.mostrarModalVenta.set(false);
    this.datosComprador = { nombre: '', apellido: '', telefono: '', email: '' };
  }

  confirmarVenta(): void {
    const numero = this.numeroSeleccionado();
    if (!numero) return;

    this.loading.set(true);
    const rifaId = this.rifa()!.id;

    this.rifasService.venderNumeroVendedor(rifaId, numero.numero, {
      comprador_nombre: this.datosComprador.nombre,
      comprador_apellido: this.datosComprador.apellido,
      comprador_telefono: this.datosComprador.telefono,
      comprador_email: this.datosComprador.email
    }).subscribe({
      next: () => {
        alert('✅ Entrada vendida exitosamente');
        this.cerrarModalVenta();
        this.cargarBoletos(rifaId);
      },
      error: (err) => {
        alert('❌ Error: ' + (err.error?.message || 'Error desconocido'));
        this.loading.set(false);
      }
    });
  }

 /**
 * ✅ Compartir número en WhatsApp
 */
compartirWhatsApp(numero: NumeroBoleto): void {
  const rifa = this.rifa();
  const rifaId = rifa?.id;
  
  // URL pública del número
  const url = `${window.location.origin}/public/rifas/${rifaId}/numero/${numero.numero}`;
  
  // Obtener logo/imagen de la rifa
  const logoUrl = rifa?.imagen_url || this.institucion()?.logo_url;
  const imagenCompleta = logoUrl ? 
    (logoUrl.startsWith('http') ? logoUrl : `${window.location.origin}${logoUrl}`) : '';
  
  // Construir mensaje
  let mensaje = `*Mi numero de la rifa!*\n\n`;
  mensaje += `${rifa?.nombre}\n`;
  mensaje += `Numero: ${numero.numero}\n`;
  mensaje += `Precio: $${(numero.precio_venta || rifa?.precio_numero || 0).toLocaleString('es-AR')}\n`;
  
  if (numero.estado === 'vendido' && numero.fecha_venta) {
    const fecha = new Date(numero.fecha_venta).toLocaleDateString('es-AR');
    mensaje += `Comprado: ${fecha}\n`;
  }
  
  if (rifa?.fecha_sorteo) {
    const fechaSorteo = new Date(rifa.fecha_sorteo).toLocaleDateString('es-AR');
    mensaje += `Sorteo: ${fechaSorteo}\n`;
  }
  
  mensaje += `\n`;
  
  if (imagenCompleta) {
    mensaje += `Ver imagen: ${imagenCompleta}\n\n`;
  }
  
  mensaje += `Ver mi numero: ${url}`;
  
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  window.open(whatsappUrl, '_blank');
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
        <h2 style="margin-bottom: 20px;">Entrada #${numero.numero}</h2>
        <img src="${numero.qr_code}" style="max-width: 400px; background: white; padding: 20px; border-radius: 10px;">
        <p style="margin-top: 20px;">Click para cerrar</p>
      </div>
    `;
    
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
  }

  abrirURLPublica(numero: NumeroBoleto): void {
  const rifaId = this.rifa()?.id;
  const url = `/public/rifas/${rifaId}/numero/${numero.numero}`;
  window.open(url, '_blank');
}

  generarPDF(): void {
    alert('Función de generar PDF próximamente');
  }
}