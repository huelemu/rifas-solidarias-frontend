// src/app/rifas/components/my-numbers/my-numbers.component.ts

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

interface RifaConNumeros {
  rifa_id: number;
  rifa_nombre: string;
  fecha_sorteo?: string;
  rifa_estado: string;
  numero_ganador?: number;
  numeros: any[];
}

@Component({
  selector: 'app-my-numbers',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
  <app-navbar></app-navbar>

    <div class="my-numbers-container">

      <!-- Estadísticas -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎫</div>
            <div class="stat-content">
              <div class="stat-number">{{ getTotalNumeros() }}</div>
              <div class="stat-label">Números Comprados</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-number">{{ getRifasParticipando() }}</div>
              <div class="stat-label">Rifas Participando</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <div class="stat-number">{{ formatPrice(getTotalInvertido()) }}</div>
              <div class="stat-label">Total Invertido</div>
            </div>
          </div>
          
          <div class="stat-card success">
            <div class="stat-icon">🏆</div>
            <div class="stat-content">
              <div class="stat-number">{{ getPremiosGanados() }}</div>
              <div class="stat-label">Premios Ganados</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Estado de la rifa:</label>
            <select 
              [(ngModel)]="filtroEstado"
              (ngModelChange)="aplicarFiltros()"
              class="form-control">
              <option value="">Todas las rifas</option>
              <option value="activa">🟢 Activas</option>
              <option value="finalizada">🏁 Finalizadas</option>
              <option value="cerrada">🔒 Cerradas</option>
              <option value="cancelada">❌ Canceladas</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Buscar rifa:</label>
            <input 
              type="text"
              [(ngModel)]="filtroBusqueda"
              (ngModelChange)="aplicarFiltros()"
              class="form-control"
              placeholder="Nombre de la rifa...">
          </div>

          <div class="filter-group">
            <label>Ordenar por:</label>
            <select 
              [(ngModel)]="ordenamiento"
              (ngModelChange)="aplicarFiltros()"
              class="form-control">
              <option value="fecha_compra_desc">Fecha de compra (más reciente)</option>
              <option value="fecha_compra_asc">Fecha de compra (más antigua)</option>
              <option value="nombre_rifa_asc">Nombre de rifa (A-Z)</option>
              <option value="nombre_rifa_desc">Nombre de rifa (Z-A)</option>
              <option value="cantidad_desc">Más números primero</option>
            </select>
          </div>
        </div>
        
        @if (hasActiveFilters()) {
          <button 
            class="btn btn-outline"
            (click)="limpiarFiltros()">
            🧹 Limpiar Filtros
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando tus números...</p>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="error-container">
          <div class="error-message">
            <h3>❌ Error</h3>
            <p>{{ error() }}</p>
            <button 
              class="btn btn-primary"
              (click)="recargarNumeros()">
              🔄 Reintentar
            </button>
          </div>
        </div>
      }

      <!-- Contenido -->
      @if (!loading() && !error()) {
        @if (rifasFiltradas().length === 0 && !hasActiveFilters()) {
          <div class="empty-state">
            <div class="empty-icon">🎫</div>
            <h3>No tienes números comprados</h3>
            <p>Aún no has comprado números en ninguna rifa. ¡Es hora de participar!</p>
            <button 
              class="btn btn-primary"
              (click)="verRifasDisponibles()">
              🛒 Ver Rifas Disponibles
            </button>
          </div>
        } @else if (rifasFiltradas().length === 0 && hasActiveFilters()) {
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No se encontraron resultados</h3>
            <p>No hay rifas que coincidan con los filtros aplicados.</p>
            <button 
              class="btn btn-outline"
              (click)="limpiarFiltros()">
              🧹 Limpiar Filtros
            </button>
          </div>
        } @else {
          <div class="rifas-section">
            @for (rifaData of rifasFiltradas(); track rifaData.rifa_id) {
              <div class="rifa-card" [class]="getRifaCardClass(rifaData.rifa_estado)">
                <!-- Header de la rifa -->
                <div class="rifa-header">
                  <div class="rifa-info">
                    <h3>{{ rifaData.rifa_nombre }}</h3>
                    <div class="rifa-meta">
                      <span class="rifa-id">#{{ rifaData.rifa_id }}</span>
                      <span 
                        class="rifa-status"
                        [class]="getEstadoClass(rifaData.rifa_estado)">
                        {{ getEstadoIcon(rifaData.rifa_estado) }} {{ getEstadoLabel(rifaData.rifa_estado) }}
                      </span>
                    </div>
                  </div>
                  
                  @if (rifaData.fecha_sorteo) {
                    <div class="sorteo-info">
                      <span class="sorteo-label">🎲 Sorteo:</span>
                      <span class="sorteo-fecha">{{ formatDate(rifaData.fecha_sorteo) }}</span>
                    </div>
                  }
                </div>

                <!-- Números ganadores -->
                @if (rifaData.numero_ganador && rifaData.rifa_estado === 'finalizada') {
                  <div class="winner-section">
                    <div class="winner-announcement">
                      🏆 <strong>Número ganador: {{ rifaData.numero_ganador }}</strong>
                      @if (esGanador(rifaData)) {
                        <span class="you-won">¡FELICITACIONES! ¡GANASTE!</span>
                      }
                    </div>
                  </div>
                }

                <!-- Resumen de números -->
                <div class="numeros-summary">
                  <div class="summary-stats">
                    <div class="summary-item">
                      <span class="summary-label">Números comprados:</span>
                      <span class="summary-value">{{ rifaData.numeros.length }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">Total invertido:</span>
                      <span class="summary-value">{{ formatPrice(getTotalInvertidoRifa(rifaData)) }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">Números:</span>
                      <span class="summary-value numbers-list">{{ getNumerosList(rifaData.numeros) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Grid de números -->
                <div class="numeros-grid">
                  @for (numero of rifaData.numeros; track numero.id) {
                    <div 
                      class="numero-card"
                      [class]="getNumeroCardClass(numero, rifaData)">
                      <div class="numero-value">{{ numero.numero }}</div>
                      <div class="numero-status">
                        @if (numero.numero === rifaData.numero_ganador) {
                          🏆
                        } @else {
                          {{ getNumeroStatusIcon(numero, rifaData) }}
                        }
                      </div>
                      @if (numero.fecha_venta) {
                        <div class="numero-date">{{ formatShortDate(numero.fecha_venta) }}</div>
                      }
                    </div>
                  }
                </div>

                <!-- Acciones -->
                <div class="rifa-actions">
                  <button 
                    class="btn btn-outline"
                    (click)="verDetalleRifa(rifaData.rifa_id)">
                    👁️ Ver Rifa
                  </button>
                  
                  @if (rifaData.rifa_estado === 'activa') {
                    <button 
                      class="btn btn-primary"
                      (click)="comprarMasNumeros(rifaData.rifa_id)">
                      🛒 Comprar Más
                    </button>
                  }
                  
                  @if (esGanador(rifaData)) {
                    <button 
                      class="btn btn-success"
                      (click)="reclamarPremio(rifaData.rifa_id)">
                      🎁 Reclamar Premio
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .my-numbers-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      margin-bottom: 24px;
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .header-left h1 {
        margin: 0;
        color: #1f2937;
      }
      
      .header-left p {
        margin: 4px 0 0 0;
        color: #6b7280;
      }
      
      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .stats-section {
      margin-bottom: 24px;
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
      
      .stat-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #e5e7eb;
        
        &.success {
          border-left-color: #10b981;
        }
        
        .stat-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #6b7280;
        }
      }
    }

    .filters-section {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }
      
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        
        label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
      }
    }

    .rifas-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .rifa-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #e5e7eb;
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      &.activa { border-left-color: #10b981; }
      &.finalizada { border-left-color: #3b82f6; }
      &.cerrada { border-left-color: #6b7280; }
      &.cancelada { border-left-color: #ef4444; }
    }

    .rifa-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
      
      .rifa-info h3 {
        margin: 0 0 8px 0;
        color: #1f2937;
        font-size: 20px;
      }
      
      .rifa-meta {
        display: flex;
        gap: 12px;
        align-items: center;
        
        .rifa-id {
          font-size: 14px;
          color: #6b7280;
          font-family: monospace;
        }
        
        .rifa-status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          
          &.status-activa { background: #dcfce7; color: #16a34a; }
          &.status-finalizada { background: #dbeafe; color: #2563eb; }
          &.status-cerrada { background: #f3f4f6; color: #6b7280; }
          &.status-cancelada { background: #fef2f2; color: #dc2626; }
        }
      }
      
      .sorteo-info {
        text-align: right;
        
        .sorteo-label {
          display: block;
          font-size: 12px;
          color: #6b7280;
        }
        
        .sorteo-fecha {
          font-weight: 600;
          color: #1f2937;
        }
      }
    }

    .winner-section {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      
      .winner-announcement {
        text-align: center;
        color: white;
        font-size: 16px;
        
        .you-won {
          display: block;
          font-size: 18px;
          font-weight: 700;
          margin-top: 8px;
          animation: pulse 2s infinite;
        }
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .numeros-summary {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      
      .summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }
      
      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .summary-label {
          font-size: 14px;
          color: #6b7280;
        }
        
        .summary-value {
          font-weight: 600;
          color: #1f2937;
          
          &.numbers-list {
            font-family: monospace;
            font-size: 13px;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }

    .numeros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
      margin-bottom: 16px;
    }

    .numero-card {
      background: #f3f4f6;
      border-radius: 6px;
      padding: 8px;
      text-align: center;
      border: 2px solid transparent;
      transition: all 0.2s ease;
      
      &.winner {
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        color: white;
        border-color: #d97706;
        animation: glow 2s infinite alternate;
      }
      
      &.normal {
        background: #e0f2fe;
        border-color: #0284c7;
      }
      
      .numero-value {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 2px;
      }
      
      .numero-status {
        font-size: 12px;
      }
      
      .numero-date {
        font-size: 10px;
        color: #6b7280;
        margin-top: 2px;
      }
    }

    @keyframes glow {
      0% { box-shadow: 0 0 5px rgba(251, 191, 36, 0.5); }
      100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.8); }
    }

    .rifa-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      
      .empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }
      
      h3 {
        color: #1f2937;
        margin-bottom: 8px;
      }
      
      p {
        color: #6b7280;
        margin-bottom: 24px;
      }
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-primary { 
      background: #10b981; 
      color: white;
      &:hover:not(:disabled) { background: #059669; }
    }
    
    .btn-secondary { 
      background: #6b7280; 
      color: white;
      &:hover:not(:disabled) { background: #374151; }
    }
    
    .btn-success { 
      background: #10b981; 
      color: white;
      &:hover:not(:disabled) { background: #059669; }
    }
    
    .btn-outline { 
      background: transparent; 
      border: 1px solid #d1d5db; 
      color: #374151;
      &:hover:not(:disabled) { background: #f9fafb; }
    }

    .loading-container, .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      flex-direction: column;
      gap: 16px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #10b981;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      text-align: center;
      
      h3 {
        color: #dc2626;
        margin-bottom: 8px;
      }
    }

    @media (max-width: 768px) {
      .my-numbers-container {
        padding: 12px;
      }
      
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .filters-grid {
        grid-template-columns: 1fr;
      }
      
      .rifa-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .numeros-grid {
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      }
      
      .numero-card .numero-value {
        font-size: 14px;
      }
      
      .summary-stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MyNumbersComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly authService = inject(AuthService);

  // Signals
  readonly misRifas = signal<RifaConNumeros[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  // Filtros
  filtroEstado = '';
  filtroBusqueda = '';
  ordenamiento = 'fecha_compra_desc';

  // Computed properties
  readonly rifasFiltradas = computed(() => {
    let rifas = this.misRifas();

    // Filtrar por estado
    if (this.filtroEstado) {
      rifas = rifas.filter(r => r.rifa_estado === this.filtroEstado);
    }

    // Filtrar por búsqueda
    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      rifas = rifas.filter(r => 
        r.rifa_nombre.toLowerCase().includes(busqueda)
      );
    }

    // Ordenar
    switch (this.ordenamiento) {
      case 'fecha_compra_desc':
        rifas.sort((a, b) => {
          const fechaA = Math.max(...a.numeros.map(n => new Date(n.fecha_venta || 0).getTime()));
          const fechaB = Math.max(...b.numeros.map(n => new Date(n.fecha_venta || 0).getTime()));
          return fechaB - fechaA;
        });
        break;
      case 'fecha_compra_asc':
        rifas.sort((a, b) => {
          const fechaA = Math.max(...a.numeros.map(n => new Date(n.fecha_venta || 0).getTime()));
          const fechaB = Math.max(...b.numeros.map(n => new Date(n.fecha_venta || 0).getTime()));
          return fechaA - fechaB;
        });
        break;
      case 'nombre_rifa_asc':
        rifas.sort((a, b) => a.rifa_nombre.localeCompare(b.rifa_nombre));
        break;
      case 'nombre_rifa_desc':
        rifas.sort((a, b) => b.rifa_nombre.localeCompare(a.rifa_nombre));
        break;
      case 'cantidad_desc':
        rifas.sort((a, b) => b.numeros.length - a.numeros.length);
        break;
    }

    return rifas;
  });

  ngOnInit() {
    this.recargarNumeros();
  }

  /**
   * Cargar números del usuario
   */
  recargarNumeros(): void {
    this.loading.set(true);
    this.error.set(null);

    console.log('📡 Cargando mis números...');

    this.rifasService.getMisNumeros().subscribe({
      next: (response) => {
        console.log('📦 Mis números cargados:', response);
        
        const rifasData = response?.data || [];
        this.misRifas.set(Array.isArray(rifasData) ? rifasData : []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando mis números:', error);
        this.error.set(error?.error?.message || 'Error al cargar tus números');
        this.misRifas.set([]);
        this.loading.set(false);
      }
    });
  }

  /**
   * Aplicar filtros
   */
  aplicarFiltros(): void {
    // Los filtros se aplican automáticamente gracias a computed()
    console.log('🔍 Aplicando filtros:', {
      estado: this.filtroEstado,
      busqueda: this.filtroBusqueda,
      ordenamiento: this.ordenamiento
    });
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroBusqueda = '';
    this.ordenamiento = 'fecha_compra_desc';
  }

  /**
   * Verificar si hay filtros activos
   */
  hasActiveFilters(): boolean {
    return !!(this.filtroEstado || this.filtroBusqueda || this.ordenamiento !== 'fecha_compra_desc');
  }

  /**
   * Ver rifas disponibles
   */
  verRifasDisponibles(): void {
    this.router.navigate(['/rifas']);
  }

  /**
   * Ver detalle de una rifa
   */
  verDetalleRifa(rifaId: number): void {
    this.router.navigate(['/rifas', rifaId]);
  }

  /**
   * Comprar más números en una rifa
   */
  comprarMasNumeros(rifaId: number): void {
    this.router.navigate(['/rifas', rifaId, 'comprar']);
  }

  /**
   * Reclamar premio
   */
  reclamarPremio(rifaId: number): void {
    alert('🎁 ¡Felicitaciones por ganar! Por favor contacta con la organización para reclamar tu premio.');
    // TODO: Implementar lógica de reclamo de premio
  }

  /**
   * Verificar si el usuario es ganador de una rifa
   */
  esGanador(rifaData: RifaConNumeros): boolean {
    if (!rifaData.numero_ganador || rifaData.rifa_estado !== 'finalizada') {
      return false;
    }

    return rifaData.numeros.some(numero => numero.numero === rifaData.numero_ganador);
  }

  /**
   * Obtener total de números comprados
   */
  getTotalNumeros(): number {
    return this.misRifas().reduce((total, rifa) => total + rifa.numeros.length, 0);
  }

  /**
   * Obtener cantidad de rifas en las que participa
   */
  getRifasParticipando(): number {
    return this.misRifas().length;
  }

  /**
   * Obtener total invertido
   */
  getTotalInvertido(): number {
    return this.misRifas().reduce((total, rifa) => {
      return total + rifa.numeros.reduce((subtotal, numero) => {
        return subtotal + (numero.monto_pagado || 0);
      }, 0);
    }, 0);
  }

  /**
   * Obtener premios ganados
   */
  getPremiosGanados(): number {
    return this.misRifas().filter(rifa => this.esGanador(rifa)).length;
  }

  /**
   * Obtener total invertido en una rifa específica
   */
  getTotalInvertidoRifa(rifaData: RifaConNumeros): number {
    return rifaData.numeros.reduce((total, numero) => {
      return total + (numero.monto_pagado || 0);
    }, 0);
  }

  /**
   * Obtener lista de números como string
   */
  getNumerosList(numeros: any[]): string {
    const numerosOrdenados = numeros
      .map(n => n.numero)
      .sort((a, b) => a - b);

    if (numerosOrdenados.length <= 5) {
      return numerosOrdenados.join(', ');
    } else {
      return `${numerosOrdenados.slice(0, 3).join(', ')}, ... +${numerosOrdenados.length - 3}`;
    }
  }

  /**
   * Obtener clase CSS de la rifa
   */
  getRifaCardClass(estado: string): string {
    return estado;
  }

  /**
   * Obtener clase CSS del estado
   */
  getEstadoClass(estado: string): string {
    return 'status-' + estado;
  }

  /**
   * Obtener icono del estado
   */
  getEstadoIcon(estado: string): string {
    const iconos: { [key: string]: string } = {
      'activa': '🟢',
      'finalizada': '🏁',
      'cerrada': '🔒',
      'cancelada': '❌',
      'borrador': '📝'
    };
    return iconos[estado] || '❓';
  }

  /**
   * Obtener label del estado
   */
  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'activa': 'Activa',
      'finalizada': 'Finalizada',
      'cerrada': 'Cerrada',
      'cancelada': 'Cancelada',
      'borrador': 'Borrador'
    };
    return labels[estado] || 'Desconocido';
  }

  /**
   * Obtener clase CSS del número
   */
  getNumeroCardClass(numero: any, rifaData: RifaConNumeros): string {
    if (numero.numero === rifaData.numero_ganador && rifaData.rifa_estado === 'finalizada') {
      return 'winner';
    }
    return 'normal';
  }

  /**
   * Obtener icono del estado del número
   */
  getNumeroStatusIcon(numero: any, rifaData: RifaConNumeros): string {
    if (rifaData.rifa_estado === 'finalizada') {
      return numero.numero === rifaData.numero_ganador ? '🏆' : '📋';
    } else if (rifaData.rifa_estado === 'activa') {
      return '⏳';
    } else {
      return '📋';
    }
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
   * Formatear fecha completa
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

  /**
   * Formatear fecha corta
   */
  formatShortDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return '';
    }
  }
}