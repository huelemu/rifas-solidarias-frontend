// src/app/rifas/components/my-numbers/my-numbers.component.ts - MEJORADO

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';

interface MisNumerosRifa {
  rifa_id: number;
  rifa_nombre: string;
  rifa_descripcion: string;
  rifa_estado: string;
  fecha_sorteo: string | null;
  numero_ganador: number | null;
  precio_numero: number;
  numeros: NumeroComprado[];
  total_invertido: number;
  tiene_ganador: boolean;
}

interface NumeroComprado {
  id: number;
  numero: number;
  fecha_compra: string;
  metodo_pago: string;
  es_ganador: boolean;
}

interface FiltrosNumeros {
  estado: 'todas' | 'activas' | 'finalizadas' | 'ganadas';
  ordenar: 'fecha' | 'numero' | 'monto';
}

@Component({
  selector: 'app-my-numbers',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <div class="my-numbers-container">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="title-section">
            <h1>🎁 Mis Números</h1>
            <p class="subtitle">Números que has comprado en rifas</p>
          </div>
          
          <button class="btn-back" (click)="volverDashboard()">
            ← Volver al Dashboard
          </button>
        </div>
      </header>

      <main class="page-main">
        
        <!-- Resumen general -->
        <section class="summary-section">
          <div class="summary-grid">
            <div class="summary-card primary">
              <div class="summary-icon">🎫</div>
              <div class="summary-content">
                <div class="summary-value">{{ getTotalNumeros() }}</div>
                <div class="summary-label">Números Comprados</div>
              </div>
            </div>

            <div class="summary-card success">
              <div class="summary-icon">🎰</div>
              <div class="summary-content">
                <div class="summary-value">{{ getRifasParticipando() }}</div>
                <div class="summary-label">Rifas Participando</div>
              </div>
            </div>

            <div class="summary-card info">
              <div class="summary-icon">💰</div>
              <div class="summary-content">
                <div class="summary-value">{{ formatCurrency(getTotalInvertido()) }}</div>
                <div class="summary-label">Total Invertido</div>
              </div>
            </div>

            <div class="summary-card warning">
              <div class="summary-icon">🏆</div>
              <div class="summary-content">
                <div class="summary-value">{{ getPremiosGanados() }}</div>
                <div class="summary-label">Premios Ganados</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Filtros -->
        <section class="filters-section">
          <div class="filters-container">
            <div class="filter-group">
              <label>Estado:</label>
              <select 
                [(ngModel)]="filtros.estado"
                (change)="aplicarFiltros()"
                class="filter-select">
                <option value="todas">Todas las rifas</option>
                <option value="activas">Rifas activas</option>
                <option value="finalizadas">Rifas finalizadas</option>
                <option value="ganadas">Rifas ganadas 🏆</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Ordenar por:</label>
              <select 
                [(ngModel)]="filtros.ordenar"
                (change)="aplicarFiltros()"
                class="filter-select">
                <option value="fecha">Fecha de compra</option>
                <option value="numero">Número</option>
                <option value="monto">Monto invertido</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Lista de rifas con mis números -->
        @if (cargando()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando tus números...</p>
          </div>
        } @else if (rifasFiltradas().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🎫</div>
            <h3>No tienes números comprados</h3>
            <p>Explora las rifas activas y compra tus números de la suerte</p>
            <button class="btn-primary" (click)="irARifas()">
              Ver Rifas Disponibles
            </button>
          </div>
        } @else {
          <div class="rifas-list">
            @for (rifa of rifasFiltradas(); track rifa.rifa_id) {
              <div class="rifa-card" [class.ganadora]="rifa.tiene_ganador">
                
                <!-- Header de la rifa -->
                <div class="rifa-header">
                  <div class="rifa-title-section">
                    <h3>{{ rifa.rifa_nombre }}</h3>
                    <span class="estado-badge" [class]="getEstadoClass(rifa.rifa_estado)">
                      {{ getEstadoLabel(rifa.rifa_estado) }}
                    </span>
                    @if (rifa.tiene_ganador) {
                      <span class="ganador-badge">🏆 ¡GANASTE!</span>
                    }
                  </div>
                  
                  <div class="rifa-stats-mini">
                    <span class="stat">{{ rifa.numeros.length }} números</span>
                    <span class="stat">{{ formatCurrency(rifa.total_invertido) }}</span>
                  </div>
                </div>

                <!-- Info de sorteo -->
                @if (rifa.fecha_sorteo) {
                  <div class="sorteo-info">
                    <span class="sorteo-label">📅 Sorteo:</span>
                    <span class="sorteo-fecha">{{ formatDate(rifa.fecha_sorteo) }}</span>
                    @if (rifa.numero_ganador) {
                      <span class="numero-ganador-badge">
                        Número ganador: {{ rifa.numero_ganador }}
                      </span>
                    }
                  </div>
                }

                <!-- Grid de números comprados -->
                <div class="numeros-grid">
                  @for (numero of rifa.numeros; track numero.id) {
                    <div 
                      class="numero-badge"
                      [class.ganador]="numero.es_ganador"
                      [title]="getNumeroTooltip(numero, rifa)">
                      <div class="numero-value">{{ numero.numero }}</div>
                      @if (numero.es_ganador) {
                        <div class="numero-icon">🏆</div>
                      }
                    </div>
                  }
                </div>

                <!-- Acciones -->
                <div class="rifa-actions">
                  <button 
                    class="btn-outline"
                    (click)="verDetalleRifa(rifa.rifa_id)">
                    👁️ Ver Rifa
                  </button>
                  
                  @if (rifa.rifa_estado === 'activa') {
                    <button 
                      class="btn-primary"
                      (click)="comprarMasNumeros(rifa.rifa_id)">
                      ➕ Comprar Más Números
                    </button>
                  }

                  @if (rifa.tiene_ganador) {
                    <button 
                      class="btn-success"
                      (click)="contactarOrganizador(rifa.rifa_id)">
                      📞 Contactar Organizador
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .my-numbers-container {
      min-height: calc(100vh - 64px);
      background: var(--bg-page);
    }

    /* Header */
    .page-header {
      background: white;
      border-bottom: 1px solid var(--border-color);
      padding: 2rem;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title-section h1 {
      margin: 0;
      font-size: 2rem;
      color: var(--text-primary);
    }

    .subtitle {
      margin: 0.5rem 0 0 0;
      color: var(--text-secondary);
    }

    .btn-back {
      padding: 0.75rem 1.5rem;
      background: var(--gray-100);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: var(--transition);
    }

    .btn-back:hover {
      background: var(--gray-200);
    }

    /* Main */
    .page-main {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Summary */
    .summary-section {
      margin-bottom: 2rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
      border-left: 4px solid;
    }

    .summary-card.primary { border-color: var(--primary); }
    .summary-card.success { border-color: var(--success); }
    .summary-card.info { border-color: var(--info); }
    .summary-card.warning { border-color: var(--warning); }

    .summary-icon {
      font-size: 2.5rem;
    }

    .summary-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .summary-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    /* Filtros */
    .filters-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
    }

    .filters-container {
      display: flex;
      gap: 2rem;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .filter-group label {
      font-weight: 500;
      color: var(--text-secondary);
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: white;
      cursor: pointer;
    }

    /* Lista de rifas */
    .rifas-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .rifa-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border: 2px solid transparent;
      transition: var(--transition);
    }

    .rifa-card:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow-lg);
    }

    .rifa-card.ganadora {
      border-color: #ffd700;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    }

    .rifa-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .rifa-title-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .rifa-title-section h3 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--text-primary);
    }

    .estado-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .estado-badge.activa {
      background: #c6f6d5;
      color: #22543d;
    }

    .estado-badge.finalizada {
      background: #e2e8f0;
      color: #4a5568;
    }

    .ganador-badge {
      padding: 0.25rem 0.75rem;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #744210;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      animation: pulseGold 2s infinite;
    }

    @keyframes pulseGold {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .rifa-stats-mini {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .stat {
      font-weight: 500;
    }

    /* Info de sorteo */
    .sorteo-info {
      background: var(--gray-50);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .sorteo-label {
      font-weight: 600;
      color: var(--text-secondary);
    }

    .sorteo-fecha {
      color: var(--text-primary);
      font-weight: 500;
    }

    .numero-ganador-badge {
      margin-left: auto;
      padding: 0.5rem 1rem;
      background: var(--success);
      color: white;
      border-radius: 6px;
      font-weight: 600;
    }

    /* Grid de números */
    .numeros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .numero-badge {
      background: var(--gray-100);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      transition: var(--transition);
      cursor: pointer;
      position: relative;
    }

    .numero-badge:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .numero-badge.ganador {
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      border-color: #ffd700;
      animation: winnerPulse 2s infinite;
    }

    @keyframes winnerPulse {
      0%, 100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
      50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
    }

    .numero-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .numero-badge.ganador .numero-value {
      color: #744210;
    }

    .numero-icon {
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 1.5rem;
      filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
    }

    /* Acciones */
    .rifa-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-outline,
    .btn-primary,
    .btn-success {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-outline {
      background: transparent;
      border: 2px solid var(--primary);
      color: var(--primary);
    }

    .btn-outline:hover {
      background: var(--primary);
      color: white;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
    }

    .btn-success {
      background: var(--success);
      color: white;
    }

    .btn-success:hover {
      opacity: 0.9;
    }

    /* Estados */
    .loading-state,
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--gray-200);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      font-size: 5rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
    }

    .empty-state p {
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .numeros-grid {
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .filters-container {
        flex-direction: column;
      }

      .rifa-header {
        flex-direction: column;
        gap: 1rem;
      }

      .numeros-grid {
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      }

      .rifa-actions {
        flex-direction: column;
      }

      .rifa-actions button {
        width: 100%;
      }
    }
  `]
})
export class MyNumbersComponent implements OnInit {
  private rifasService = inject(RifasService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Signals
  cargando = signal(true);
  misRifas = signal<MisNumerosRifa[]>([]);
  rifasFiltradas = signal<MisNumerosRifa[]>([]);
  
  // Filtros
  filtros: FiltrosNumeros = {
    estado: 'todas',
    ordenar: 'fecha'
  };

  ngOnInit(): void {
    this.cargarMisNumeros();
  }

  /**
   * Carga los números del usuario
   */
  private async cargarMisNumeros(): Promise<void> {
    try {
      this.cargando.set(true);
      
      // TODO: Implementar llamada real al backend
      // Por ahora, datos mock
      const mockData: MisNumerosRifa[] = [
        {
          rifa_id: 1,
          rifa_nombre: 'Rifa Solidaria Cruz Roja 2024',
          rifa_descripcion: 'Gran sorteo benéfico',
          rifa_estado: 'activa',
          fecha_sorteo: '2025-12-31T20:00:00',
          numero_ganador: null,
          precio_numero: 1500,
          numeros: [
            { id: 1, numero: 15, fecha_compra: '2025-01-15', metodo_pago: 'transferencia', es_ganador: false },
            { id: 2, numero: 28, fecha_compra: '2025-01-16', metodo_pago: 'efectivo', es_ganador: false },
            { id: 3, numero: 42, fecha_compra: '2025-01-17', metodo_pago: 'mercadopago', es_ganador: false }
          ],
          total_invertido: 4500,
          tiene_ganador: false
        },
        {
          rifa_id: 2,
          rifa_nombre: 'Rifa Solidaria Cruz Roja 2024 - DEMO FINALIZADA',
          rifa_descripcion: 'Rifa finalizada con ganador',
          rifa_estado: 'finalizada',
          fecha_sorteo: '2024-03-01T20:00:00',
          numero_ganador: 42,
          precio_numero: 1500,
          numeros: [
            { id: 4, numero: 42, fecha_compra: '2024-01-20', metodo_pago: 'transferencia', es_ganador: true },
            { id: 5, numero: 77, fecha_compra: '2024-01-21', metodo_pago: 'efectivo', es_ganador: false }
          ],
          total_invertido: 3000,
          tiene_ganador: true
        }
      ];

      this.misRifas.set(mockData);
      this.rifasFiltradas.set(mockData);
      
          } catch (error) {
      console.error('Error cargando mis números:', error);
      this.notificationService.showError('No se pudieron cargar tus números');
    } finally {
      this.cargando.set(false);
    }
  }

  /**
   * Aplica filtros a las rifas
   */
  aplicarFiltros(): void {
    let rifas = [...this.misRifas()];

    // Filtrar por estado
    if (this.filtros.estado !== 'todas') {
      if (this.filtros.estado === 'ganadas') {
        rifas = rifas.filter(r => r.tiene_ganador);
      } else {
        rifas = rifas.filter(r => r.rifa_estado === this.filtros.estado);
      }
    }

    // Ordenar
    switch (this.filtros.ordenar) {
      case 'numero':
        rifas.sort((a, b) => a.numeros[0].numero - b.numeros[0].numero);
        break;
      case 'monto':
        rifas.sort((a, b) => b.total_invertido - a.total_invertido);
        break;
      case 'fecha':
      default:
        rifas.sort((a, b) => 
          new Date(b.numeros[0].fecha_compra).getTime() - 
          new Date(a.numeros[0].fecha_compra).getTime()
        );
    }

    this.rifasFiltradas.set(rifas);
  }

  /**
   * Helpers para el resumen
   */
  getTotalNumeros(): number {
    return this.misRifas().reduce((sum, rifa) => sum + rifa.numeros.length, 0);
  }

  getRifasParticipando(): number {
    return this.misRifas().length;
  }

  getTotalInvertido(): number {
    return this.misRifas().reduce((sum, rifa) => sum + rifa.total_invertido, 0);
  }

  getPremiosGanados(): number {
    return this.misRifas().filter(r => r.tiene_ganador).length;
  }

  /**
   * Helpers de estado
   */
  getEstadoClass(estado: string): string {
    return estado;
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'activa': 'Activa',
      'finalizada': 'Finalizada',
      'pausada': 'Pausada',
      'borrador': 'Borrador'
    };
    return labels[estado] || estado;
  }

  /**
   * Tooltip para números
   */
  getNumeroTooltip(numero: NumeroComprado, rifa: MisNumerosRifa): string {
    if (numero.es_ganador) {
      return `🏆 ¡GANADOR! Número ${numero.numero} - Compraste el ${this.formatDate(numero.fecha_compra)}`;
    }
    return `Número ${numero.numero} - Comprado: ${this.formatDate(numero.fecha_compra)} - ${numero.metodo_pago}`;
  }

  /**
   * Navegación
   */
  volverDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  irARifas(): void {
    this.router.navigate(['/rifas']);
  }

  verDetalleRifa(rifaId: number): void {
    this.router.navigate(['/rifas', rifaId]);
  }

  comprarMasNumeros(rifaId: number): void {
    this.router.navigate(['/rifas', rifaId, 'comprar']);
  }

  contactarOrganizador(rifaId: number): void {
    this.notificationService.showInfo(
      '¡Felicitaciones!',
      'Contacta con el organizador para reclamar tu premio'
    );
  }

  /**
   * Formateo
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}