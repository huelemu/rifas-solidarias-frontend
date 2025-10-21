// src/app/dashboard/public-dashboard.component.ts
// DASHBOARD PÚBLICO - PÁGINA DE INICIO

import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RifasService } from '../rifas/services/rifas.service';
import { AuthService } from '../auth/services/auth.service';
import { ImageUrlHelper } from '../shared/utils/image-url.helper'; // ✅ IMPORTAR

interface DashboardData {
  publico: {
    rifas_activas: any[];
    proximos_sorteos: any[];
    ultimos_ganadores: any[];
    estadisticas_globales: {
      total_rifas_activas: number;
      total_participantes: number;
      total_recaudado: number;
      rifas_finalizadas: number;
    };
  };
  personal: {
    mis_numeros: any[];
    mis_rifas: any[];
    estadisticas: any;
  } | null;
  meta: {
    autenticado: boolean;
    rol: string | null;
    fecha_consulta: string;
  };
}

@Component({
  selector: 'app-public-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="public-dashboard">
      
      <!-- HERO SECTION - Banner Principal -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              🎯 Eventos Huelemu
            </h1>
            <p class="hero-subtitle">
              Participa en Eventos benéficos y ayuda a instituciones que transforman vidas
            </p>
            
            <!-- Estadísticas Hero -->
            <div class="hero-stats">
            <div class="hero-stat">
                <div class="hero-stat-value">{{ data()?.publico?.estadisticas_globales?.total_rifas_activas || 0 }}</div>
                <div class="hero-stat-label">Eventos Activos</div>
            </div>
            <div class="hero-stat">
                <div class="hero-stat-value">{{ data()?.publico?.estadisticas_globales?.total_participantes || 0 }}</div>
                <div class="hero-stat-label">Participantes</div>
            </div>
            <div class="hero-stat">
                <div class="hero-stat-value">{{ formatCurrency(data()?.publico?.estadisticas_globales?.total_recaudado || 0) }}</div>
                <div class="hero-stat-label">Recaudado</div>
            </div>
            </div>
            
            <!-- CTA Buttons -->
            <div class="hero-actions">
              @if (!isAuthenticated()) {
                <button class="btn btn-primary btn-lg" (click)="goToRegister()">
                  🎫 Crear Cuenta Gratis
                </button>
                <button class="btn btn-outline btn-lg" (click)="goToLogin()">
                  Iniciar Sesión
                </button>
              } @else {
                <button class="btn btn-primary btn-lg" (click)="goToRifas()">
                  🎰 Ver Todas los Eventos
                </button>
                <button class="btn btn-outline btn-lg" (click)="goToMyNumbers()">
                  🎁 Mis Tickets
                </button>
              }
            </div>
          </div>

          <div class="hero-image">
            <div class="floating-card">
              <div class="ticket-preview">
                <div class="ticket-number">🎫 0123</div>
                <div class="ticket-label">Tu próxima suerte</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="dashboard-main">

        <!-- RIFAS ACTIVAS - Grid Principal -->
        <section class="section rifas-section">
          <div class="section-header">
            <h2 class="section-title">🎰 Eventos Activos</h2>
            <button class="btn btn-text" (click)="goToRifas()">
              Ver todas →
            </button>
          </div>

          @if (loading()) {
            <div class="loading-grid">
              @for (i of [1,2,3]; track i) {
                <div class="skeleton-card"></div>
              }
            </div>
          } @else if (rifasActivas().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">🎫</div>
              <p>No hay eventos activos en este momento</p>
            </div>
          } @else {
            <div class="rifas-grid">
              @for (rifa of rifasActivas(); track rifa.id) {
                <div class="rifa-card" (click)="goToRifaDetail(rifa.id)">
                  
                  <!-- ✅ Imagen de la rifa CORREGIDA -->
                  <div class="rifa-image">
                    @if (getRifaImageUrl(rifa.imagen_url)) {
                      <img 
                        [src]="getRifaImageUrl(rifa.imagen_url)!" 
                        [alt]="rifa.nombre"
                        (error)="handleImageError($event)" />
                    } @else {
                      <div class="rifa-image-placeholder">
                        <span class="placeholder-icon">🎁</span>
                      </div>
                    }
                    
                    <!-- Badge de progreso -->
                    <div class="rifa-progress-badge" [class.high]="rifa.porcentaje_vendido >= 80">
                      {{ rifa.porcentaje_vendido }}% vendido
                    </div>
                  </div>

                  <!-- Contenido -->
                  <div class="rifa-content">
                    <h3 class="rifa-title">{{ rifa.nombre }}</h3>
                    
                    <div class="rifa-institution">
                      <span class="institution-icon">🏢</span>
                      {{ rifa.institucion_nombre }}
                    </div>

                    @if (rifa.descripcion) {
                      <p class="rifa-description">{{ rifa.descripcion | slice:0:100 }}...</p>
                    }

                    <!-- Stats -->
                    <div class="rifa-stats">
                      <div class="rifa-stat">
                        <span class="stat-icon">💰</span>
                        <span class="stat-value">{{ formatCurrency(rifa.precio_numero) }}</span>
                      </div>
                      <div class="rifa-stat">
                        <span class="stat-icon">🎫</span>
                        <span class="stat-value">{{ rifa.numeros_vendidos }}/{{ rifa.cantidad_numeros }}</span>
                      </div>
                    </div>

                    <!-- Barra de progreso -->
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="rifa.porcentaje_vendido"></div>
                    </div>

                    <!-- Fecha sorteo -->
                    @if (rifa.fecha_sorteo) {
                      <div class="rifa-sorteo">
                        🎲 Evento: {{ formatDate(rifa.fecha_sorteo) }}
                      </div>
                    }
                  </div>

                  <!-- Footer con acción -->
                  <div class="rifa-footer">
                    <button class="btn btn-primary btn-block">
                      Comprar Tickets
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </section>

        <!-- PRÓXIMOS SORTEOS - Timeline -->
        @if (proximosSorteos().length > 0) {
          <section class="section sorteos-section">
            <div class="section-header">
              <h2 class="section-title">⏰ Próximos Sorteos</h2>
            </div>

            <div class="sorteos-timeline">
              @for (sorteo of proximosSorteos(); track sorteo.id) {
                <div class="sorteo-item" (click)="goToRifaDetail(sorteo.id)">
                  <div class="sorteo-date">
                    <div class="date-day">{{ getDay(sorteo.fecha_sorteo) }}</div>
                    <div class="date-month">{{ getMonth(sorteo.fecha_sorteo) }}</div>
                  </div>
                  <div class="sorteo-info">
                    <h4 class="sorteo-title">{{ sorteo.nombre }}</h4>
                    <p class="sorteo-institution">{{ sorteo.institucion_nombre }}</p>
                    <div class="sorteo-progress">
                      <div class="progress-mini">
                        <div class="progress-fill" [style.width.%]="(sorteo.numeros_vendidos / sorteo.cantidad_numeros) * 100"></div>
                      </div>
                      <span class="progress-text">{{ sorteo.numeros_vendidos }}/{{ sorteo.cantidad_numeros }} números</span>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-primary">
                    Participar
                  </button>
                </div>
              }
            </div>
          </section>
        }

        <!-- ÚLTIMOS GANADORES - Feed de Confianza -->
        @if (ultimosGanadores().length > 0) {
          <section class="section ganadores-section">
            <div class="section-header">
              <h2 class="section-title">🏆 Últimos Ganadores</h2>
              <p class="section-subtitle">Personas reales que ganaron premios increíbles</p>
            </div>

            <div class="ganadores-grid">
              @for (ganador of ultimosGanadores(); track ganador.rifa_id) {
                <div class="ganador-card">
                  <div class="ganador-badge">🏆 GANADOR</div>
                  
                  <div class="ganador-info">
                    <div class="ganador-avatar">
                      {{ getInitials(ganador.comprador_nombre, ganador.comprador_apellido) }}
                    </div>
                    <div class="ganador-details">
                      <h4 class="ganador-name">
                        {{ ganador.comprador_nombre }} {{ ganador.comprador_apellido?.charAt(0) }}.
                      </h4>
                      <p class="ganador-rifa">{{ ganador.rifa_nombre }}</p>
                      <p class="ganador-numero">Número ganador: <strong>{{ ganador.numero_ganador }}</strong></p>
                    </div>
                  </div>

                  <div class="ganador-footer">
                    <span class="ganador-date">{{ formatDate(ganador.fecha_sorteo_realizado) }}</span>
                  </div>
                </div>
              }
            </div>
          </section>
        }

        <!-- SECCIÓN PERSONAL (Solo si está autenticado) -->
        @if (isAuthenticated() && data()?.personal) {
          <section class="section personal-section">
            <div class="section-header">
              <h2 class="section-title">📊 Mi Actividad</h2>
            </div>

            <div class="personal-stats">
              <div class="personal-stat-card">
                <div class="stat-icon">🎫</div>
                <div class="stat-content">
                  <div class="stat-value">{{ data()?.personal?.estadisticas?.rifas_participando || 0 }}</div>
                  <div class="stat-label">Eventos Participando</div>
                </div>
              </div>

              <div class="personal-stat-card">
                <div class="stat-icon">🎁</div>
                <div class="stat-content">
                  <div class="stat-value">{{ data()?.personal?.estadisticas?.numeros_comprados || 0 }}</div>
                  <div class="stat-label">Tickets Comprados</div>
                </div>
              </div>

              <div class="personal-stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                  <div class="stat-value">{{ formatCurrency(data()?.personal?.estadisticas?.total_invertido || 0) }}</div>
                  <div class="stat-label">Total Invertido</div>
                </div>
              </div>

              <div class="personal-stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-content">
                  <div class="stat-value">{{ data()?.personal?.estadisticas?.premios_ganados || 0 }}</div>
                  <div class="stat-label">Premios Ganados</div>
                </div>
              </div>
            </div>

            <!-- Mis últimos números -->
            @if (data()?.personal?.mis_numeros && data()!.personal!.mis_numeros.length > 0) {
              <div class="mis-numeros-preview">
                <h3>Mis Últimos Tickets</h3>
                <div class="numeros-list">
                  @for (numero of data()!.personal!.mis_numeros.slice(0, 5); track numero.id) {
                    <div class="numero-item" [class]="'estado-' + numero.estado_numero">
                      <span class="numero-value">{{ numero.numero }}</span>
                      <span class="numero-rifa">{{ numero.rifa_nombre }}</span>
                      <span class="numero-badge">{{ getEstadoBadge(numero.estado_numero) }}</span>
                    </div>
                  }
                </div>
                <button class="btn btn-text" (click)="goToMyNumbers()">
                  Ver todos mis tickets →
                </button>
              </div>
            }
          </section>
        }

        <!-- CALL TO ACTION FINAL -->
        @if (!isAuthenticated()) {
          <section class="cta-section">
            <div class="cta-content">
              <h2 class="cta-title">¿Listo para participar?</h2>
              <p class="cta-subtitle">
                Únete a miles de personas que ya participan en eventos Huelemu
              </p>
              <div class="cta-actions">
                <button class="btn btn-primary btn-lg" (click)="goToRegister()">
                  Crear Cuenta Gratis
                </button>
                <button class="btn btn-outline btn-lg" (click)="goToLogin()">
                  Ya tengo cuenta
                </button>
              </div>
            </div>
          </section>
        }

      </div>
    </div>
  `,
  styleUrls: ['./public-dashboard.component.scss']
})
export class PublicDashboardComponent implements OnInit {
  private rifasService = inject(RifasService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  loading = signal(true);
  error = signal<string | null>(null);
  data = signal<DashboardData | null>(null);

  // Computed
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  rifasActivas = computed(() => this.data()?.publico.rifas_activas || []);
  proximosSorteos = computed(() => this.data()?.publico.proximos_sorteos || []);
  ultimosGanadores = computed(() => this.data()?.publico.ultimos_ganadores || []);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.error.set(null);

    this.rifasService.getPublicDashboard().subscribe({
      next: (response) => {
        console.log('✅ Dashboard cargado:', response);
        this.data.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.error.set('Error al cargar el dashboard');
        this.loading.set(false);
      }
    });
  }

  // ✅ NUEVO: Helper para obtener URL de imagen de rifa
  getRifaImageUrl(imagenUrl: string | null): string | null {
    return ImageUrlHelper.getRifaImageUrl(imagenUrl);
  }

  // ✅ NUEVO: Manejar error de carga de imagen
  handleImageError(event: any): void {
    event.target.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'rifa-image-placeholder';
    placeholder.innerHTML = '<span class="placeholder-icon">🎁</span>';
    event.target.parentElement.appendChild(placeholder);
  }

  // ===================================================
  // NAVEGACIÓN
  // ===================================================

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRifas() {
    this.router.navigate(['/rifas']);
  }

  goToRifaDetail(id: number) {
    if (this.isAuthenticated()) {
      this.router.navigate(['/rifas', id]);
    } else {
      this.router.navigate(['/public/rifas', id]);
    }
  }

  goToMyNumbers() {
    this.router.navigate(['/mis-numeros']);
  }

  // ===================================================
  // HELPERS
  // ===================================================

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  getDay(dateString: string): string {
    return new Date(dateString).getDate().toString();
  }

  getMonth(dateString: string): string {
    return new Intl.DateTimeFormat('es-AR', { month: 'short' }).format(new Date(dateString));
  }

  getInitials(nombre: string, apellido: string): string {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  }

  getEstadoBadge(estado: string): string {
    const badges: Record<string, string> = {
      'ganador': '🏆 GANADOR',
      'perdido': '❌ Perdido',
      'en_juego': '🎲 En juego'
    };
    return badges[estado] || estado;
  }
}