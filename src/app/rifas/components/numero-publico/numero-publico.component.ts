// src/app/rifas/components/numero-publico/numero-publico.component.ts

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { RifasPublicService } from '../../../services/rifas-public.service'; // ✅ NUEVO
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';


@Component({
  selector: 'app-numero-publico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './numero-publico.component.html',
  styleUrls: ['./numero-publico.component.scss']
})
export class NumeroPublicoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly rifasPublicService = inject(RifasPublicService); // ✅ NUEVO

  readonly rifa = signal<any>(null);
  readonly numero = signal<any>(null);
  readonly numeroSeleccionado = signal<number>(0);
  readonly loading = signal(true);
  readonly vendedor = signal<any>(null); // ✅ NUEVO

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const rifaId = +params['rifaId'];
      const numero = +params['numero'];
      
      this.numeroSeleccionado.set(numero);
      this.cargarDatos(rifaId, numero);
    });
  }

  cargarDatos(rifaId: number, numeroId: number): void {
    // Cargar rifa
    this.rifasService.getRifaById(rifaId).subscribe({
      next: (response) => {
        this.rifa.set(response.data || response);
      }
    });

    // ✅ NUEVO: Usar el endpoint público para obtener TODO (número + vendedor)
    this.rifasPublicService.getNumeroDetalle(rifaId, numeroId).subscribe({
      next: (response) => {
        const data = response.data;
        this.numero.set(data);
        this.vendedor.set(data.vendedor); // Guardar info del vendedor
        this.loading.set(false);
        
        console.log('✅ Datos cargados:', data);
      },
      error: (err) => {
        console.error('❌ Error al cargar número:', err);
        // Fallback al método anterior si falla
        this.cargarNumeroFallback(rifaId, numeroId);
      }
    });
  }

  // Método fallback por si el endpoint público falla
  cargarNumeroFallback(rifaId: number, numeroId: number): void {
    this.rifasService.getNumeros(rifaId, { 
      desde: numeroId, 
      hasta: numeroId 
    }).subscribe({
      next: (response) => {
        const numeros = response.data || [];
        this.numero.set(numeros[0]);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getRifaImageUrl(): string | null {
    return ImageUrlHelper.getRifaImageUrl(this.rifa()?.imagen_url);
  }

  // ✅ NUEVA FUNCIÓN: Generar link de WhatsApp
  generarLinkWhatsApp(): string {
    const vendedorData = this.vendedor();
    
    if (!vendedorData || !vendedorData.telefono) {
      console.warn('⚠️ No hay vendedor asignado');
      return '#';
    }

    const telefono = vendedorData.telefono.replace(/\D/g, '');
    const urlNumero = window.location.href;
    const rifaNombre = this.rifa()?.nombre || 'esta rifa';
    const numero = this.numeroSeleccionado();
    
    const mensaje = `¡Hola! Me interesa el número *${numero}* de la rifa "${rifaNombre}".

Ver número: ${urlNumero}

¿Está disponible?`;

    const link = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    
    console.log('📱 Link de WhatsApp generado:', link);
    
    return link;
  }

  // ✅ MODIFICADA: Ahora abre WhatsApp en lugar de navegar
  contactarVendedor(): void {
    const link = this.generarLinkWhatsApp();
    
    if (link === '#') {
      alert('Este número no tiene un vendedor asignado todavía. Por favor, intenta más tarde.');
      return;
    }
    
    console.log('📱 Abriendo WhatsApp...');
    window.open(link, '_blank');
  }

  // Mantener la función original para "Ver otros números"
  verOtrosNumeros(): void {
    const rifaId = this.rifa()?.id;
    this.router.navigate(['/rifas', rifaId, 'comprar']);
  }
}