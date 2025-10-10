// src/app/rifas/components/boletos-viewer/boletos-viewer.component.ts
// REEMPLAZAR TODO EL ARCHIVO CON ESTE CÓDIGO ACTUALIZADO

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper'; // ✅ IMPORTAR


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
  fecha_venta?: string;
  metodo_pago?: string;
  precio?: number; // ✅ Ahora es opcional
  precio_venta?: number; // ✅ Precio de venta si fue vendido
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


  // Filtros
  filtroEstado = 'todos';
  buscarNumero: number | null = null;

  // Computed
  readonly numerosFiltrados = computed(() => {
    let resultado = this.numeros();

    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(n => n.estado === this.filtroEstado);
    }

    // Filtrar por número
    if (this.buscarNumero) {
      resultado = resultado.filter(n => n.numero === this.buscarNumero);
    }

    // Ordenar por número
    return resultado.sort((a, b) => a.numero - b.numero);
  });

  ngOnInit(): void {
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

    // Cargar todos los números de la rifa
    this.rifasService.getNumeros(rifaId, { limit: 10000 }).subscribe({
      next: (response: any) => {
        console.log('✅ Números cargados:', response);
        const numerosData = response.data || [];
        
        // ✅ Normalizar precios
        const numerosNormalizados = numerosData.map((num: any) => ({
          ...num,
          precio: this.obtenerPrecio(num)
        }));
        
        this.numeros.set(numerosNormalizados);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error cargando números:', err);
        this.error.set('Error al cargar los boletos');
        this.loading.set(false);
      }
    });
  }

  /**
   * ✅ Obtener el precio correcto de un número
   */
  obtenerPrecio(numero: any): number {
    // Prioridad: precio_venta > precio > precio_numero de la rifa
    if (numero.precio_venta) return parseFloat(numero.precio_venta);
    if (numero.precio) return parseFloat(numero.precio);
    if (this.rifa()?.precio_numero) return parseFloat(this.rifa().precio_numero);
    return 0;
  }

// ✅ AGREGAR ESTE MÉTODO
  getInstitucionLogoUrl(): string | null {
    return ImageUrlHelper.getLogoUrl(this.institucion()?.logo_url);
  }

  /**
   * ✅ Obtener el precio formateado de un número
   */
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

  /**
   * ✅ Ver el QR en grande
   */
  verQR(numero: NumeroBoleto): void {
    // Crear modal para ver QR grande
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

  /**
   * ✅ Copiar URL pública del número
   */
  copiarURLPublica(numero: NumeroBoleto): void {
    const rifaId = this.rifa()?.id;
    const url = `${window.location.origin}/public/rifas/${rifaId}/numero/${numero.numero}`;
    
    navigator.clipboard.writeText(url).then(() => {
      alert('✅ URL copiada al portapapeles');
    }).catch(() => {
      // Fallback para navegadores antiguos
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert('✅ URL copiada al portapapeles');
    });
  }

  generarPDF(): void {
    const rifaId = this.rifa()?.id;
    const usuario = this.authService.currentUser();
    
    if (!rifaId || !usuario) {
      alert('No se puede generar el PDF en este momento');
      return;
    }

    alert('Funcionalidad de generación de PDF - Por implementar en siguiente etapa');
  }

  venderNumero(numero: NumeroBoleto): void {
    console.log('Vender número:', numero);
    alert(`Funcionalidad de venta para el número ${numero.numero} - Por implementar en siguiente etapa`);
  }
}