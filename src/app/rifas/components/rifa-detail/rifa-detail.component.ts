// src/app/rifas/components/rifa-detail/rifa-detail.component.ts

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-rifa-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rifa-detail-container">
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
              <h1>📋 Detalle de Rifa</h1>
              @if (rifa()) {
                <p>{{ rifa().nombre }}</p>
              }
            </div>
          </div>
          <div class="header-actions">
            @if (rifa() && canManageRifa(rifa())) {
              <button 
                class="btn btn-primary"
                (click)="editarRifa()">
                ✏️ Editar
              </button>
              <button 
                class="btn btn-secondary"
                (click)="verNumeros()">
                🔢 Números
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando detalle de la rifa...</p>
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
              (click)="loadRifa()">
              🔄 Reintentar
            </button>
          </div>
        </div>
      }

      <!-- Contenido -->
      @if (rifa() && !loading()) {
        <div class="rifa-detail-content">
          <!-- Información Principal -->
          <div class="detail-section">
            <h2>📝 Información General</h2>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre:</label>
                <span>{{ rifa().nombre }}</span>
              </div>
              
              @if (rifa().descripcion) {
                <div class="detail-item full-width">
                  <label>Descripción:</label>
                  <span>{{ rifa().descripcion }}</span>
                </div>
              }
              
              <div class="detail-item">
                <label>Estado:</label>
                <span 
                  class="status-badge"
                  [class]="getEstadoClass(rifa().estado)">
                  {{ getEstadoConfig(rifa().estado).icon }} {{ getEstadoConfig(rifa().estado).label }}
                </span>
              </div>
              
              <div class="detail-item">
                <label>Total de Números:</label>
                <span>{{ rifa().cantidad_numeros | number }}</span>
              </div>
              
              <div class="detail-item">
                <label>Precio por Número:</label>
                <span>{{ formatPrice(rifa().precio_numero) }}</span>
              </div>
              
              <div class="detail-item">
                <label>Institución Promotora:</label>
                <span>{{ rifa().institucion_promotora_nombre || 'No especificada' }}</span>
              </div>
            </div>
          </div>

          <!-- Fechas -->
          <div class="detail-section">
            <h2>📅 Fechas Importantes</h2>
            <div class="detail-grid">
              <div class="detail-item">
                <label>Fecha de Inicio:</label>
                <span>{{ formatDate(rifa().fecha_inicio) }}</span>
              </div>
              
              <div class="detail-item">
                <label>Fecha de Fin:</label>
                <span>{{ formatDate(rifa().fecha_fin) }}</span>
              </div>
              
              @if (rifa().fecha_sorteo) {
                <div class="detail-item">
                  <label>Fecha de Sorteo:</label>
                  <span>{{ formatDate(rifa().fecha_sorteo) }}</span>
                </div>
              }
              
              <div class="detail-item">
                <label>Creada el:</label>
                <span>{{ formatDate(rifa().fecha_creacion) }}</span>
              </div>
            </div>
          </div>

          <!-- Estadísticas -->
          @if (rifa().numeros_vendidos !== undefined) {
            <div class="detail-section">
              <h2>📊 Estadísticas de Ventas</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">{{ rifa().numeros_vendidos | number }}</div>
                  <div class="stat-label">Números Vendidos</div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-number">{{ rifa().numeros_disponibles | number }}</div>
                  <div class="stat-label">Disponibles</div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-number">{{ formatPrice(rifa().total_recaudado || 0) }}</div>
                  <div class="stat-label">Total Recaudado</div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-number">{{ (rifa().porcentaje_vendido || 0) | number:'1.1-1' }}%</div>
                  <div class="stat-label">Porcentaje Vendido</div>
                </div>
              </div>
            </div>
          }

          <!-- Acciones -->
          @if (canManageRifa(rifa())) {
            <div class="detail-section">
              <h2>⚙️ Acciones</h2>
              <div class="actions-grid">
                <button 
                  class="btn btn-primary"
                  (click)="verNumeros()">
                  🔢 Gestionar Números
                </button>
                
            
            @if (rifa().estado === 'activa') {
              <button 
                class="btn btn-success"
                (click)="comprarNumeros()">
                🛒 Comprar Números
              </button>
            }

                <button 
                  class="btn btn-secondary"
                  (click)="verEstadisticas()">
                  📈 Ver Estadísticas
                </button>
                
                @if (rifa().estado === 'borrador') {
                  <button 
                    class="btn btn-success"
                    (click)="activarRifa()">
                    🟢 Activar Rifa
                  </button>
                }
                
                @if (rifa().estado === 'activa') {
                  <button 
                    class="btn btn-warning"
                    (click)="pausarRifa()">
                    ⏸️ Pausar Rifa
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .rifa-detail-container {
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
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .back-btn {
        padding: 8px 16px;
        text-decoration: none;
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

    .detail-section {
      background: white;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      h2 {
        margin: 0 0 20px 0;
        color: #1f2937;
        font-size: 18px;
      }
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      &.full-width {
        grid-column: 1 / -1;
      }
      
      label {
        font-weight: 600;
        color: #374151;
        font-size: 14px;
      }
      
      span {
        color: #6b7280;
        font-size: 14px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      
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

    .actions-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }

    // Status colors (reutilizar del list component)
    .status-activa { background: #dcfce7; color: #16a34a; }
    .status-borrador { background: #f3f4f6; color: #6b7280; }
    .status-pausada { background: #fef3c7; color: #d97706; }
    .status-cerrada { background: #e0e7ff; color: #6366f1; }
    .status-finalizada { background: #f0f9ff; color: #0284c7; }
    .status-cancelada { background: #fef2f2; color: #dc2626; }

    .btn {
      padding: 10px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: #6b7280; color: white; }
    .btn-success { background: #16a34a; color: white; }
    .btn-warning { background: #d97706; color: white; }
    .btn-outline { background: transparent; border: 1px solid #d1d5db; color: #374151; }

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
      
      .detail-grid {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class RifaDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly authService = inject(AuthService);

  // Signals
  readonly rifa = signal<any>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  private rifaId: number = 0;

  ngOnInit() {
    // Obtener ID de la rifa de la ruta
    this.route.params.subscribe(params => {
      this.rifaId = +params['id'];
      if (this.rifaId) {
        this.loadRifa();
      } else {
        this.error.set('ID de rifa inválido');
        this.loading.set(false);
      }
    });
  }

  /**
   * Cargar datos de la rifa
   */
  loadRifa(): void {
    this.loading.set(true);
    this.error.set(null);

    this.rifasService.getRifa(this.rifaId).subscribe({
      next: (response) => {
        console.log('📦 Detalle de rifa cargado:', response);
        this.rifa.set(response.data || response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando rifa:', error);
        this.error.set(error?.error?.message || 'Error al cargar la rifa');
        this.loading.set(false);
      }
    });
  }

  /**
   * Volver a la lista
   */
  goBack(): void {
    this.router.navigate(['/rifas']);
  }

  /**
   * Editar rifa
   */
  editarRifa(): void {
    this.router.navigate(['/rifas', this.rifaId, 'editar']);
  }

  /**
   * Ver números
   */
  verNumeros(): void {
    this.router.navigate(['/rifas', this.rifaId, 'numeros']);
  }

  /**
   * Ver estadísticas
   */
  verEstadisticas(): void {
    this.router.navigate(['/rifas', this.rifaId, 'estadisticas']);
  }

  /**
   * Activar rifa
   */
  activarRifa(): void {
    if (!confirm('¿Estás seguro de que deseas activar esta rifa?')) return;
    
    this.rifasService.updateRifa(this.rifaId, { estado: 'activa' }).subscribe({
      next: () => {
        console.log('✅ Rifa activada');
        this.loadRifa(); // Recargar datos
      },
      error: (error) => {
        alert('Error al activar la rifa: ' + (error?.error?.message || error.message));
      }
    });
  }

  /**
   * Pausar rifa
   */
  pausarRifa(): void {
    if (!confirm('¿Estás seguro de que deseas pausar esta rifa?')) return;
    
    this.rifasService.updateRifa(this.rifaId, { estado: 'pausada' }).subscribe({
      next: () => {
        console.log('✅ Rifa pausada');
        this.loadRifa(); // Recargar datos
      },
      error: (error) => {
        alert('Error al pausar la rifa: ' + (error?.error?.message || error.message));
      }
    });
  }

  /**
   * Verificar permisos de gestión
   */
  canManageRifa(rifa: any): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.role === 'admin_global' || rifa.creado_por === currentUser?.id;
  }

  /**
   * Obtener configuración del estado
   */
  getEstadoConfig(estado: string): any {
  const estadosConfig: { [key: string]: any } = {
    'borrador': { label: 'Borrador', icon: '📝', class: 'borrador' },
    'activa': { label: 'Activa', icon: '✅', class: 'activa' },
    'pausada': { label: 'Pausada', icon: '⏸️', class: 'pausada' },
    'cerrada': { label: 'Cerrada', icon: '🔒', class: 'cerrada' },
    'finalizada': { label: 'Finalizada', icon: '🏁', class: 'finalizada' },
    'cancelada': { label: 'Cancelada', icon: '❌', class: 'cancelada' }
  };

  return estadosConfig[estado] || { label: 'Desconocido', icon: '❓', class: 'desconocido' };
}

  /**
   * Obtener clase CSS del estado
   */
  getEstadoClass(estado: string): string {
    return 'status-' + this.getEstadoConfig(estado).class;
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

// En rifa-detail.component.ts
comprarNumeros(): void {
  this.router.navigate(['/rifas', this.rifaId, 'comprar']);
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