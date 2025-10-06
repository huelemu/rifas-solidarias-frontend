import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-rifa-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rifa-card.component.html',
  styleUrls: ['./rifa-card.component.scss', '../../styles/rifas-global.scss']  // ✅ Debe ser styleUrls (con 's')
})
export class RifaCardComponent {
  @Input() rifa: any;
  @Input() viewMode: 'card' | 'list' = 'card';
  @Output() delete = new EventEmitter<number>();

  constructor(private router: Router) {}

  verDetalles(): void {
    this.router.navigate(['/rifas', this.rifa.id]);
  }

  editarRifa(): void {
    this.router.navigate(['/rifas', this.rifa.id, 'editar']);
  }

  eliminarRifa(): void {
    if (confirm(`¿Eliminar la rifa "${this.rifa.nombre}"?`)) {
      this.delete.emit(this.rifa.id);
    }
  }

  getPorcentajeVendido(): number {
    if (!this.rifa.cantidad_boletos) return 0;
    return Math.round((this.rifa.boletos_vendidos || 0) / this.rifa.cantidad_boletos * 100);
  }

  getEstadoClass(): string {
    return `estado-${this.rifa.estado?.toLowerCase() || 'activa'}`;
  }

  /**
   * Obtiene la URL del logo a mostrar (rifa o institución)
   */
  getLogoUrl(): string | null {
    // Prioridad: logo de la rifa > logo de la institución > null
    if (this.rifa.logo_rifa) {
      return this.rifa.logo_rifa;
    }
    if (this.rifa.institucion?.logo) {
      return this.rifa.institucion.logo;
    }
    return null;
  }

  /**
   * Obtiene las iniciales para el placeholder del logo
   */
  getLogoPlaceholder(): string {
    const nombre = this.rifa.nombre || '';
    const palabras = nombre.split(' ').filter((p: string) => p.length > 0); // ✅ CORRECCIÓN AQUÍ
    
    if (palabras.length >= 2) {
      return palabras[0][0].toUpperCase() + palabras[1][0].toUpperCase();
    } else if (palabras.length === 1) {
      return palabras[0].substring(0, 2).toUpperCase();
    }
    return 'RF';
  }

  /**
   * Calcula días restantes hasta una fecha
   */
  getDiasRestantes(fecha: string): number {
    if (!fecha) return 0;
    const hoy = new Date();
    const fechaObjetivo = new Date(fecha);
    const diferencia = fechaObjetivo.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  /**
   * Verifica si una fecha ya pasó
   */
  esFechaPasada(fecha: string): boolean {
    if (!fecha) return false;
    return new Date(fecha) < new Date();
  }
}