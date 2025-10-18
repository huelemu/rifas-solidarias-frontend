import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RifasPublicService } from '../../services/rifas-public.service';

@Component({
  selector: 'app-numero-detalle',
  standalone: true,
  // ✅ IMPORTAR TODOS LOS MÓDULOS NECESARIOS
  imports: [
    CommonModule,    // Para *ngIf, *ngFor, ngClass, pipes
    RouterModule     // Para [routerLink]
  ],
  templateUrl: './numero-detalle.component.html',
  styleUrls: ['./numero-detalle.component.scss']
})
export class NumeroDetalleComponent implements OnInit {
  rifaId: number = 0;
  numeroId: number = 0;
  numero: any = null;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private rifasPublicService: RifasPublicService
  ) {}

  ngOnInit(): void {
    // Obtener parámetros de la ruta
    this.rifaId = Number(this.route.snapshot.paramMap.get('rifaId'));
    this.numeroId = Number(this.route.snapshot.paramMap.get('numero'));
    
    console.log('📍 Cargando número:', this.numeroId, 'de rifa:', this.rifaId);
    
    this.cargarNumero();
  }

  /**
   * Carga los datos del número desde el backend
   */
  cargarNumero(): void {
    this.loading = true;
    this.rifasPublicService.getNumeroDetalle(this.rifaId, this.numeroId)
      .subscribe({
        next: (response) => {
          console.log('✅ Datos del número recibidos:', response);
          this.numero = response.data;
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error al cargar número:', err);
          this.error = 'No se pudo cargar la información del número';
          this.loading = false;
        }
      });
  }

  /**
   * Genera el link de WhatsApp con el mensaje personalizado
   * Incluye: saludo, número deseado y link al modal de venta
   */
  generarLinkWhatsApp(): string {
    if (!this.numero || !this.numero.vendedor) {
      console.warn('⚠️ No hay vendedor asignado a este número');
      return '#';
    }

    // Número de teléfono del vendedor (sin espacios ni caracteres especiales)
    const telefono = this.numero.vendedor.telefono.replace(/\D/g, '');
    
    // URL actual del número (para que el comprador pueda volver)
    const urlNumero = window.location.href;
    
    // Mensaje personalizado
    const mensaje = `¡Hola! Me interesa el número *${this.numero.numero}* de la rifa "${this.numero.rifa.nombre}". 

Ver número: ${urlNumero}

¿Está disponible?`;

    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Generar link de WhatsApp
    const link = `https://wa.me/${telefono}?text=${mensajeCodificado}`;
    
    console.log('📱 Link de WhatsApp generado:', link);
    
    return link;
  }

  /**
   * Abre WhatsApp en una nueva pestaña
   */
  contactarVendedor(): void {
    const link = this.generarLinkWhatsApp();
    
    if (link === '#') {
      alert('Este número no tiene un vendedor asignado todavía.');
      return;
    }
    
    console.log('📱 Abriendo WhatsApp...');
    window.open(link, '_blank');
  }

  /**
   * Determina el estado visual del número
   */
  getEstadoClass(): string {
    if (!this.numero) return '';
    
    switch(this.numero.estado) {
      case 'disponible': return 'estado-disponible';
      case 'reservado': return 'estado-reservado';
      case 'vendido': return 'estado-vendido';
      default: return '';
    }
  }

  /**
   * Retorna el texto del estado
   */
  getEstadoTexto(): string {
    if (!this.numero) return '';
    
    switch(this.numero.estado) {
      case 'disponible': return 'Disponible';
      case 'reservado': return 'Reservado';
      case 'vendido': return 'Vendido';
      default: return this.numero.estado;
    }
  }

  /**
   * Formatea la fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}