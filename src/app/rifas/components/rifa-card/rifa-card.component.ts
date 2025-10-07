// src/app/rifas/components/rifa-card/rifa-card.component.ts

import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-rifa-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rifa-card.component.html',
  styleUrls: ['./rifa-card.component.scss']
})
export class RifaCardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Datos de la rifa a mostrar
   */
  @Input({ required: true }) rifa!: any;

  /**
   * Modo de visualización: 'card' o 'list'
   */
  @Input() viewMode: 'card' | 'list' = 'card';

  /**
   * Evento para eliminar rifa
   */
  @Output() delete = new EventEmitter<number>();
  baseUrl: any;

  /**
   * Obtiene la URL del logo de la institución o rifa
   * Prioridad: logo_rifa > logo institución > imagen_url rifa > null
   */
 getLogoUrl(): string | null {
    // Prioridad 1: Logo de la rifa
    if (this.rifa.imagen_url_url) {
      // Si ya es URL completa, retornarla
      if (this.rifa.imagen_url.startsWith('http')) {
        return this.rifa.logo_url;
      }
      // Si es ruta relativa, agregar baseUrl
      return `${this.baseUrl}${this.rifa.imagen_url}`;
    }
    
    // 2. Logo de la institución (el backend puede devolverlo de varias formas)
    if (this.rifa?.institucion_logo) {
      return this.rifa.institucion_logo;
    }
    
    if (this.rifa?.institucion_logo_url) {
      return this.rifa.institucion_logo_url;
    }
    
    if (this.rifa?.institucion_promotora?.logo_url) {
      return this.rifa.institucion_promotora.logo_url;
    }
    
    if (this.rifa?.institucion_promotora?.logo) {
      return this.rifa.institucion_promotora.logo;
    }
    
    if (this.rifa?.institucion?.logo_url) {
      return this.rifa.institucion.logo_url;
    }
    
    if (this.rifa?.institucion?.logo) {
      return this.rifa.institucion.logo;
    }
    
    return '';
  }

  /**
   * Genera placeholder con iniciales
   */
  getLogoPlaceholder(): string {
    const nombre = this.rifa?.nombre || 'R';
    return nombre.substring(0, 2).toUpperCase();
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  getEstadoClass(): string {
    const estado = this.rifa?.estado?.toLowerCase() || 'borrador';
    return `estado-${estado}`;
  }

  /**
   * Calcula el porcentaje de boletos vendidos
   */
  getPorcentajeVendido(): number {
    const vendidos = this.rifa?.numeros_vendidos || this.rifa?.boletos_vendidos || 0;
    const total = this.rifa?.cantidad_numeros || this.rifa?.cantidad_boletos || 1;
    return Math.round((vendidos / total) * 100);
  }

  /**
   * Obtiene información de números vendidos
   */
  getNumerosVendidos(): number {
    return this.rifa?.numeros_vendidos || this.rifa?.boletos_vendidos || 0;
  }

  /**
   * Obtiene total de números disponibles
   */
  getTotalNumeros(): number {
    return this.rifa?.cantidad_numeros || this.rifa?.cantidad_boletos || 0;
  }

  /**
   * Obtiene el nombre de la institución promotora
   * Busca en múltiples posibles ubicaciones del objeto
   */
  getInstitucionNombre(): string {
    // El backend devuelve 'institucion_nombre' (campo plano)
    const nombre = this.rifa?.institucion_nombre ||
                   this.rifa?.institucion_promotora?.nombre ||
                   this.rifa?.institucion_promotora_nombre ||
                   this.rifa?.institucion?.nombre ||
                   this.rifa?.institucionPromotora?.nombre ||
                   'Sin institución';
    
    return nombre;
  }

  /**
   * Formatea el precio del boleto
   */
  getPrecioBoleto(): number {
    return this.rifa?.precio_numero || this.rifa?.precio_boleto || 0;
  }

  /**
   * Obtiene el total recaudado
   */
  getTotalRecaudado(): number {
    const vendidos = this.getNumerosVendidos();
    const precio = this.getPrecioBoleto();
    return vendidos * precio;
  }

  /**
   * Verifica si el usuario puede editar esta rifa
   */
  canEdit(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;

    // Admin puede editar todo
    if (user.role === 'admin_global') return true;

    // Vendedor solo puede editar sus propias rifas
    if (user.role === 'admin_institucion') {
      return this.rifa?.creado_por === user.id;
    }

    return false;
  }

  /**
   * Verifica si el usuario puede eliminar esta rifa
   */
  canDelete(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    
    // Solo admin puede eliminar
    return user.role === 'admin_global';
  }

  /**
   * Navega a los detalles de la rifa
   */
  verDetalles(): void {
    this.router.navigate(['/rifas', this.rifa.id]);
  }

  /**
   * Navega a editar la rifa
   */
  editarRifa(): void {
    if (!this.canEdit()) return;
    
    this.router.navigate(['/rifas', this.rifa.id, 'editar']);
  }

  /**
   * Emite evento para eliminar rifa
   */
  eliminarRifa(): void {
    if (!this.canDelete()) return;
    
    if (confirm(`¿Estás seguro de eliminar la rifa "${this.rifa.nombre}"?`)) {
      this.delete.emit(this.rifa.id);
    }
  }

  /**
   * Previene propagación del click
   */
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}