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

  // ✅ BaseUrl configurado correctamente
  private get baseUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    }
    return 'https://apirifas.huelemu.com.ar';
  }

  /**
   * ✅ Obtiene la URL del logo con prioridad correcta
   * Prioridad: 1) imagen_url de rifa, 2) logo de institución promotora
   */
  getLogoUrl(): string | null {
    // PRIORIDAD 1: Imagen de la rifa
    if (this.rifa?.imagen_url) {
      // Si ya es URL completa, retornarla
      if (this.rifa.imagen_url.startsWith('http')) {
        return this.rifa.imagen_url;
      }
      // Si es ruta relativa, agregar baseUrl
      return `${this.baseUrl}${this.rifa.imagen_url}`;
    }
    
    // PRIORIDAD 2: Logo de la institución promotora (varias formas posibles)
    
    // Caso 1: institucion_promotora_logo (campo plano del backend)
    if (this.rifa?.institucion_promotora_logo) {
      if (this.rifa.institucion_promotora_logo.startsWith('http')) {
        return this.rifa.institucion_promotora_logo;
      }
      return `${this.baseUrl}${this.rifa.institucion_promotora_logo}`;
    }
    
    // Caso 2: objeto institucion_promotora con logo_url
    if (this.rifa?.institucion_promotora?.logo_url) {
      if (this.rifa.institucion_promotora.logo_url.startsWith('http')) {
        return this.rifa.institucion_promotora.logo_url;
      }
      return `${this.baseUrl}${this.rifa.institucion_promotora.logo_url}`;
    }
    
    // Caso 3: objeto institucion con logo_url
    if (this.rifa?.institucion?.logo_url) {
      if (this.rifa.institucion.logo_url.startsWith('http')) {
        return this.rifa.institucion.logo_url;
      }
      return `${this.baseUrl}${this.rifa.institucion.logo_url}`;
    }
    
    // Sin logo
    return null;
  }

  /**
   * Genera placeholder con iniciales
   */
  getLogoPlaceholder(): string {
    const nombre = this.rifa?.nombre || 'R';
    return nombre.substring(0, 2).toUpperCase();
  }

  /**
   * Obtiene nombre de la institución
   */
  getInstitucionNombre(): string {
    return this.rifa?.institucion_promotora_nombre || 
           this.rifa?.institucion_nombre || 
           this.rifa?.institucion_promotora?.nombre ||
           this.rifa?.institucion?.nombre ||
           'Sin institución';
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  getEstadoClass(): string {
    const estado = this.rifa?.estado?.toLowerCase() || 'borrador';
    return `estado-${estado}`;
  }

  /**
   * Calcula el porcentaje de números vendidos
   */
  getPorcentajeVendido(): number {
    const vendidos = this.rifa?.numeros_vendidos || 0;
    const total = this.rifa?.cantidad_numeros || this.rifa?.total_numeros || 1;
    return Math.round((vendidos / total) * 100);
  }

  /**
   * Obtiene precio del número
   */
  getPrecioBoleto(): number {
    return this.rifa?.precio_numero || 0;
  }

  /**
   * Obtiene números vendidos
   */
  getNumerosVendidos(): number {
    return this.rifa?.numeros_vendidos || 0;
  }

  /**
   * Obtiene total de números
   */
  getTotalNumeros(): number {
    return this.rifa?.cantidad_numeros || this.rifa?.total_numeros || 0;
  }

  /**
   * Obtiene total recaudado
   */
  getTotalRecaudado(): number {
    return this.rifa?.total_recaudado || this.rifa?.recaudado || 0;
  }

  /**
   * Formatea fecha
   */
  formatFecha(fecha: string): string {
    if (!fecha) return 'No definida';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-AR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  // ==========================================
  // ACCIONES
  // ==========================================

  /**
   * Ver detalles de la rifa
   */
  verDetalles(): void {
    this.router.navigate(['/rifas', this.rifa.id]);
  }

  /**
   * Editar rifa
   */
  editarRifa(): void {
    this.router.navigate(['/rifas', this.rifa.id, 'editar']);
  }

  /**
   * Eliminar rifa
   */
  eliminarRifa(): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la rifa "${this.rifa.nombre}"?`)) {
      this.delete.emit(this.rifa.id);
    }
  }

  /**
   * Verificar si puede editar
   */
  canEdit(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    
    return user.role === 'admin_global' || 
           (user.role === 'admin_institucion' && 
            user.institucion_id === this.rifa.institucion_promotora_id);
  }

  /**
   * Verificar si puede eliminar
   */
  canDelete(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    
    return user.role === 'admin_global';
  }
}