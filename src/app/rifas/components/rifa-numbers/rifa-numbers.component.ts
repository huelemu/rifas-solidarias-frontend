// src/app/rifas/components/rifa-numbers/rifa-numbers.component.ts

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-rifa-numbers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rifa-numbers-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <button 
              class="btn btn-outline back-btn"
              (click)="goBack()">
              ← Volver
            </button>
            <div class="header-title">
              <h1>🔢 Gestión de Tickets</h1>
              @if (rifa()) {
                <p>{{ rifa().nombre }}</p>
              }
            </div>
          </div>
          <div class="header-actions">
            @if (rifa() && !numerosGenerados()) {
              <button 
                class="btn btn-success"
                (click)="generarNumeros()"
                [disabled]="generando()">
                @if (generando()) {
                  ⏳ Generando...
                } @else {
                  🎯 Generar Tickets
                }
              </button>
            }
            <button 
              class="btn btn-secondary"
              (click)="recargarNumeros()">
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      @if (rifa()) {
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ rifa().cantidad_numeros | number }}</div>
              <div class="stat-label">Total</div>
            </div>
            <div class="stat-card success">
              <div class="stat-number">{{ vendidosCount() | number }}</div>
              <div class="stat-label">Vendidos</div>
            </div>
            <div class="stat-card warning">
              <div class="stat-number">{{ reservadosCount() | number }}</div>
              <div class="stat-label">Reservados</div>
            </div>
            <div class="stat-card info">
              <div class="stat-number">{{ disponiblesCount() | number }}</div>
              <div class="stat-label">Disponibles</div>
            </div>
          </div>
        </div>
      }

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Estado:</label>
            <select 
              [(ngModel)]="currentFilters.estado"
              (ngModelChange)="onFilterChange()"
              class="form-control">
              <option value="">Todos</option>
              <option value="disponible">📗 Disponible</option>
              <option value="reservado">📙 Reservado</option>
              <option value="vendido">📕 Vendido</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Desde número:</label>
            <input 
              type="number"
              [(ngModel)]="currentFilters.desde"
              (ngModelChange)="onFilterChange()"
              class="form-control"
              placeholder="1"
              min="1">
          </div>

          <div class="filter-group">
            <label>Hasta número:</label>
            <input 
              type="number"
              [(ngModel)]="currentFilters.hasta"
              (ngModelChange)="onFilterChange()"
              class="form-control"
              placeholder="1000"
              min="1">
          </div>

          <div class="filter-group">
            <label>Números por página:</label>
            <select 
              [(ngModel)]="currentFilters.limit"
              (ngModelChange)="onFilterChange()"
              class="form-control">
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>
        
        <button 
          class="btn btn-outline"
          (click)="clearFilters()">
          🧹 Limpiar Filtros
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando tickets...</p>
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
              (click)="loadNumeros()">
              🔄 Reintentar
            </button>
          </div>
        </div>
      }

      <!-- Grid de números -->
      @if (!loading() && !error()) {
        @if (numeros().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🎫</div>
            <h3>No hay números generados</h3>
            <p>Este evento aún no tiene Tickets generados. Haz clic en "Generar Tickets" para crear los tickets del evento.</p>
            @if (rifa()) {
              <button 
                class="btn btn-primary"
                (click)="generarNumeros()"
                [disabled]="generando()">
                @if (generando()) {
                  ⏳ Generando...
                } @else {
                  🎯 Generar Tickets Ahora
                }
              </button>
            }
          </div>
        } @else {
          <div class="numbers-section">
            <div class="numbers-header">
              <h2>📋 Tickets del Evento</h2>
              <div class="numbers-info">
                Mostrando {{ numeros().length }} tickets
              </div>
            </div>

            <div class="numbers-grid">
              @for (numero of numeros(); track numero.id) {
                <div 
                  class="number-card"
                  [class]="getNumberCardClass(numero)"
                  (click)="selectNumber(numero)">
                  
                  <div class="number-header">
                    <span class="number-value">{{ numero.numero }}</span>
                    <span class="number-status" [class]="getStatusClass(numero.estado)">
                      {{ getStatusIcon(numero.estado) }}
                    </span>
                  </div>

                  @if (numero.estado !== 'disponible') {
                    <div class="number-details">
                      @if (numero.comprador_nombre) {
                        <div class="detail-item">
                          <strong>Comprador:</strong>
                          {{ numero.comprador_nombre }} {{ numero.comprador_apellido }}
                        </div>
                      }
                      
                      @if (numero.vendedor_nombre) {
                        <div class="detail-item">
                          <strong>Vendedor:</strong>
                          {{ numero.vendedor_nombre }} {{ numero.vendedor_apellido }}
                        </div>
                      }
                      
                      @if (numero.fecha_venta) {
                        <div class="detail-item">
                          <strong>Fecha:</strong>
                          {{ formatDate(numero.fecha_venta) }}
                        </div>
                      }
                      
                      @if (numero.monto_pagado) {
                        <div class="detail-item">
                          <strong>Monto:</strong>
                          {{ formatPrice(numero.monto_pagado) }}
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Paginación -->
            @if (pagination() && pagination().totalPages > 1) {
              <div class="pagination-container">
                <div class="pagination-info">
                  Página {{ pagination().page }} de {{ pagination().totalPages }}
                  (Total: {{ pagination().total | number }} números)
                </div>
                
                <div class="pagination-controls">
                  <button 
                    class="btn btn-outline"
                    [disabled]="pagination().page <= 1"
                    (click)="cambiarPagina(pagination().page - 1)">
                    ← Anterior
                  </button>
                  
                  @for (pageNum of getPaginationPages(); track pageNum) {
                    <button 
                      class="btn"
                      [class]="pageNum === pagination().page ? 'btn-primary' : 'btn-outline'"
                      (click)="cambiarPagina(pageNum)">
                      {{ pageNum }}
                    </button>
                  }
                  
                  <button 
                    class="btn btn-outline"
                    [disabled]="pagination().page >= pagination().totalPages"
                    (click)="cambiarPagina(pagination().page + 1)">
                    Siguiente →
                  </button>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>

    <!-- Modal de número seleccionado (placeholder) -->
    @if (selectedNumber()) {
      <div class="modal-overlay" (click)="closeNumberModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Número {{ selectedNumber().numero }}</h3>
            <button class="close-btn" (click)="closeNumberModal()">✕</button>
          </div>
          <div class="modal-body">
            <p><strong>Estado:</strong> {{ getStatusLabel(selectedNumber().estado) }}</p>
            <!-- Aquí irían más detalles y acciones específicas -->
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .rifa-numbers-container {
      max-width: 1400px;
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
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .header-title h1 {
        margin: 0;
        color: #1f2937;
      }
      
      .header-title p {
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
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
      }
      
      .stat-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #e5e7eb;
        
        &.success { border-left-color: #10b981; }
        &.warning { border-left-color: #f59e0b; }
        &.info { border-left-color: #3b82f6; }
        
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
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

    .numbers-section {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      .numbers-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        h2 {
          margin: 0;
          color: #1f2937;
        }
        
        .numbers-info {
          color: #6b7280;
          font-size: 14px;
        }
      }
    }

    .numbers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .number-card {
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      &.disponible {
        border-color: #10b981;
        background: #f0fdf4;
      }
      
      &.reservado {
        border-color: #f59e0b;
        background: #fffbeb;
      }
      
      &.vendido {
        border-color: #ef4444;
        background: #fef2f2;
      }
      
      .number-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .number-value {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .number-status {
          font-size: 18px;
          
          &.status-disponible { color: #10b981; }
          &.status-reservado { color: #f59e0b; }
          &.status-vendido { color: #ef4444; }
        }
      }
      
      .number-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .detail-item {
          font-size: 12px;
          color: #6b7280;
          
          strong {
            color: #374151;
          }
        }
      }
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
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      }
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      
      .pagination-info {
        color: #6b7280;
        font-size: 14px;
      }
      
      .pagination-controls {
        display: flex;
        gap: 8px;
      }
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      padding: 24px;
      min-width: 400px;
      max-width: 90vw;
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        h3 {
          margin: 0;
          color: #1f2937;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6b7280;
          
          &:hover {
            color: #374151;
          }
        }
      }
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
      background: #3b82f6; 
      color: white;
      &:hover:not(:disabled) { background: #2563eb; }
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
      border-top: 4px solid #3b82f6;
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
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }
      
      .header-left {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .filters-grid {
        grid-template-columns: 1fr;
      }
      
      .numbers-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
      
      .pagination-container {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }
  `]
})
export class RifaNumbersComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly authService = inject(AuthService);

  // Signals
  readonly rifa = signal<any>(null);
  readonly numeros = signal<any[]>([]);
  readonly loading = signal<boolean>(true);
  readonly generando = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly pagination = signal<any>(null);
  readonly selectedNumber = signal<any>(null);

  private rifaId: number = 0;

  // Filtros
  currentFilters = {
    estado: '',
    desde: null as number | null,
    hasta: null as number | null,
    page: 1,
    limit: 100
  };

  // Computed properties
  readonly numerosGenerados = computed(() => this.numeros().length > 0);
  readonly vendidosCount = computed(() => this.numeros().filter(n => n.estado === 'vendido').length);
  readonly reservadosCount = computed(() => this.numeros().filter(n => n.estado === 'reservado').length);
  readonly disponiblesCount = computed(() => this.numeros().filter(n => n.estado === 'disponible').length);

  ngOnInit() {
    // Obtener ID de la rifa de la ruta
    this.route.params.subscribe(params => {
      this.rifaId = +params['id'];
      if (this.rifaId) {
        this.loadRifa();
        this.loadNumeros();
      } else {
        this.error.set('ID de rifa inválido');
        this.loading.set(false);
      }
    });
  }

  /**
   * Cargar datos de la rifa
   */
  private loadRifa(): void {
    this.rifasService.getRifa(this.rifaId).subscribe({
      next: (response) => {
        this.rifa.set(response.data || response);
      },
      error: (error) => {
        console.error('❌ Error cargando rifa:', error);
      }
    });
  }

  /**
   * Cargar números de la rifa
   */
  loadNumeros(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = {
      ...this.currentFilters,
      ...(this.currentFilters.estado && { estado: this.currentFilters.estado }),
      ...(this.currentFilters.desde && { desde: this.currentFilters.desde }),
      ...(this.currentFilters.hasta && { hasta: this.currentFilters.hasta })
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
   * Generar números de la rifa
   */
  generarNumeros(): void {
    if (!confirm('¿Estás seguro de que deseas generar los números de esta rifa?')) return;

    this.generando.set(true);

    this.rifasService.generateNumbers(this.rifaId).subscribe({
      next: (response) => {
        console.log('✅ Números generados exitosamente:', response);
        this.generando.set(false);
        alert('✅ Números generados exitosamente');
        this.loadNumeros(); // Recargar números
      },
      error: (error) => {
        console.error('❌ Error generando números:', error);
        this.generando.set(false);
        alert('❌ Error al generar números: ' + (error?.error?.message || error.message));
      }
    });
  }

  /**
   * Recargar números
   */
  recargarNumeros(): void {
    this.loadNumeros();
  }

  /**
   * Cambio en filtros
   */
  onFilterChange(): void {
    this.currentFilters.page = 1; // Resetear página
    this.loadNumeros();
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.currentFilters = {
      estado: '',
      desde: null,
      hasta: null,
      page: 1,
      limit: 100
    };
    this.loadNumeros();
  }

  /**
   * Cambiar página
   */
  cambiarPagina(page: number): void {
    this.currentFilters.page = page;
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
   * Seleccionar número (abrir modal)
   */
  selectNumber(numero: any): void {
    this.selectedNumber.set(numero);
  }

  /**
   * Cerrar modal de número
   */
  closeNumberModal(): void {
    this.selectedNumber.set(null);
  }

  /**
   * Obtener clase CSS de la card según estado
   */
  getNumberCardClass(numero: any): string {
    return numero.estado;
  }

  /**
   * Obtener clase CSS del estado
   */
  getStatusClass(estado: string): string {
    return 'status-' + estado;
  }

  /**
   * Obtener icono del estado
   */
getStatusIcon(estado: string): string {
  const icons: { [key: string]: string } = {
      'disponible': '📗',
      'reservado': '📙',
      'vendido': '📕'
    };
    return icons[estado] || '📄';
  }

  /**
   * Obtener label del estado
   */
 getStatusLabel(estado: string): string {
  const labels: { [key: string]: string } = {
      'disponible': 'Disponible',
      'reservado': 'Reservado',
      'vendido': 'Vendido'
    };
    return labels[estado] || 'Desconocido';
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