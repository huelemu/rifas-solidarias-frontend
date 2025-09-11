// src/app/components/rifas/detalle-rifa.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RifaService, Rifa, NumeroRifa } from '../../services/rifa.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-detalle-rifa',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="detalle-rifa-container">
      <!-- Loading -->
      <div *ngIf="cargando" class="loading">
        <div class="spinner"></div>
        <p>Cargando rifa... ⏳</p>
      </div>

      <!-- Error -->
      <div *ngIf="error && !cargando" class="error">
        <h2>❌ Error</h2>
        <p>{{ error }}</p>
        <button (click)="cargarRifa()" class="btn btn-primary">Reintentar</button>
        <button (click)="volver()" class="btn btn-secondary">Volver</button>
      </div>

      <!-- Contenido principal -->
      <div *ngIf="rifa && !cargando && !error" class="rifa-content">
        
        <!-- Header -->
        <div class="rifa-header">
          <div class="header-actions">
            <button (click)="volver()" class="btn btn-secondary">
              ← Volver
            </button>
            <div class="actions-right" *ngIf="puedeEditarRifa()">
              <button 
                [routerLink]="['/rifas/editar', rifa.id]" 
                class="btn btn-outline-primary">
                ✏️ Editar
              </button>
            </div>
          </div>

          <div class="rifa-title-section">
            <h1>{{ rifa.titulo || rifa.nombre }}</h1>
            <div class="rifa-meta">
              <span class="institucion">🏢 {{ rifa.institucion_nombre }}</span>
              <span class="estado" [class]="'estado-' + rifa.estado">
                {{ getEstadoTexto(rifa.estado) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Imagen principal -->
        <div class="rifa-imagen" *ngIf="rifa.imagen_url">
          <img [src]="rifa.imagen_url" [alt]="rifa.titulo" />
        </div>

        <!-- Información principal -->
        <div class="main-content">
          
          <!-- Columna izquierda: Info y descripción -->
          <div class="info-column">
            
            <!-- Descripción -->
            <div class="rifa-descripcion" *ngIf="rifa.descripcion">
              <h3>📝 Descripción</h3>
              <p>{{ rifa.descripcion }}</p>
            </div>

            <!-- Fechas importantes -->
            <div class="fechas-info">
              <h3>📅 Fechas Importantes</h3>
              <div class="fecha-item">
                <span class="fecha-label">Inicio de ventas:</span>
                <span class="fecha-valor">{{ formatearFecha(rifa.fecha_inicio) }}</span>
              </div>
              <div class="fecha-item">
                <span class="fecha-label">Fin de ventas:</span>
                <span class="fecha-valor">{{ formatearFecha(rifa.fecha_fin) }}</span>
              </div>
              <div class="fecha-item" *ngIf="rifa.fecha_sorteo">
                <span class="fecha-label">Sorteo:</span>
                <span class="fecha-valor">{{ formatearFechaCompleta(rifa.fecha_sorteo) }}</span>
              </div>
            </div>

            <!-- Resultado del sorteo -->
            <div class="resultado-sorteo" *ngIf="rifa.estado === 'finalizada' && rifa.numero_ganador">
              <h3>🏆 Resultado del Sorteo</h3>
              <div class="numero-ganador">
                <span class="numero">{{ rifa.numero_ganador }}</span>
                <span class="texto">Número Ganador</span>
              </div>
            </div>
          </div>

          <!-- Columna derecha: Estadísticas y compra -->
          <div class="stats-column">
            
            <!-- Estadísticas -->
            <div class="rifa-stats">
              <h3>📊 Estadísticas</h3>
              
              <div class="stat-item">
                <span class="stat-label">Precio por número:</span>
                <span class="stat-valor precio">{{ formatearPrecio(rifa.precio_numero) }}</span>
              </div>

              <div class="stat-item">
                <span class="stat-label">Total de números:</span>
                <span class="stat-valor">{{ rifa.total_numeros || rifa.cantidad_numeros }}</span>
              </div>

              <div class="stat-item">
                <span class="stat-label">Vendidos:</span>
                <span class="stat-valor">{{ rifa.numeros_vendidos || 0 }}</span>
              </div>

              <div class="stat-item">
                <span class="stat-label">Disponibles:</span>
                <span class="stat-valor disponibles">{{ rifa.numeros_disponibles || (rifa.total_numeros - (rifa.numeros_vendidos || 0)) }}</span>
              </div>

              <!-- Barra de progreso -->
              <div class="progress-container">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    [style.width.%]="getPorcentajeVendido()">
                  </div>
                </div>
                <span class="progress-text">{{ getPorcentajeVendido() }}% vendido</span>
              </div>

              <div class="stat-item total">
                <span class="stat-label">Recaudado:</span>
                <span class="stat-valor">{{ formatearPrecio(getRecaudado()) }}</span>
              </div>

              <div class="stat-item total">
                <span class="stat-label">Potencial total:</span>
                <span class="stat-valor">{{ formatearPrecio(getPotencialTotal()) }}</span>
              </div>
            </div>

            <!-- Acciones de compra -->
            <div class="compra-section" *ngIf="rifa.estado === 'activa' && puedeComprar()">
              <h3>🛒 Comprar Números</h3>
              
              <div class="compra-form">
                <div class="cantidad-selector">
                  <label for="cantidad">Cantidad de números:</label>
                  <input 
                    type="number" 
                    id="cantidad"
                    [(ngModel)]="cantidadAComprar" 
                    min="1" 
                    [max]="getMaximosNumerosDisponibles()"
                    class="form-control">
                </div>

                <div class="total-compra" *ngIf="cantidadAComprar > 0">
                  <strong>Total: {{ formatearPrecio(cantidadAComprar * rifa.precio_numero) }}</strong>
                </div>

                <div class="compra-actions">
                  <button 
                    (click)="comprarAleatorio()" 
                    [disabled]="cantidadAComprar <= 0 || comprando"
                    class="btn btn-primary">
                    🎲 Compra Aleatoria
                  </button>

                  <button 
                    (click)="toggleSelectorNumeros()" 
                    class="btn btn-outline-primary">
                    🎯 Elegir Números
                  </button>
                </div>

                <div *ngIf="comprando" class="loading-compra">
                  ⏳ Procesando compra...
                </div>
              </div>
            </div>

            <!-- Estado no disponible para compra -->
            <div class="no-compra" *ngIf="rifa.estado !== 'activa' || !puedeComprar()">
              <div class="alert alert-info">
                <span *ngIf="rifa.estado !== 'activa'">
                  📊 Esta rifa no está disponible para compras
                </span>
                <span *ngIf="rifa.estado === 'activa' && !estaLogueado()">
                  🔐 Inicia sesión para comprar números
                </span>
              </div>
              
              <button 
                *ngIf="!estaLogueado()" 
                routerLink="/login" 
                class="btn btn-primary">
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensajes -->
      <div *ngIf="mensaje" class="alert" [class]="'alert-' + tipoMensaje">
        {{ mensaje }}
      </div>
    </div>
  `,
  styles: [`
    .detalle-rifa-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .loading {
      text-align: center;
      padding: 50px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      text-align: center;
      padding: 50px;
      color: #dc3545;
    }

    .rifa-header {
      margin-bottom: 30px;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .rifa-title-section h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .rifa-meta {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    }

    .institucion {
      color: #666;
      font-size: 16px;
    }

    .estado {
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }

    .estado-activa { background: #d4edda; color: #155724; }
    .estado-finalizada { background: #d1ecf1; color: #0c5460; }
    .estado-cancelada { background: #f8d7da; color: #721c24; }
    .estado-borrador { background: #fff3cd; color: #856404; }

    .rifa-imagen {
      text-align: center;
      margin-bottom: 30px;
    }

    .rifa-imagen img {
      max-width: 100%;
      max-height: 400px;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .main-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 40px;
      margin-bottom: 40px;
    }

    .info-column h3,
    .stats-column h3 {
      color: #495057;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #007bff;
    }

    .rifa-descripcion {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 30px;
    }

    .fechas-info {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 30px;
    }

    .fecha-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #f8f9fa;
    }

    .fecha-label {
      font-weight: 500;
      color: #666;
    }

    .fecha-valor {
      font-weight: 600;
      color: #2c3e50;
    }

    .resultado-sorteo {
      background: linear-gradient(135deg, #ffd700, #ffed4a);
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 30px;
    }

    .numero-ganador {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .numero-ganador .numero {
      font-size: 3rem;
      font-weight: 900;
      color: #2c3e50;
      background: white;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .rifa-stats {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      margin-bottom: 30px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      padding: 10px 0;
      border-bottom: 1px solid #f8f9fa;
    }

    .stat-item.total {
      border-bottom: 2px solid #007bff;
      font-weight: 600;
      font-size: 16px;
    }

    .stat-label {
      color: #666;
    }

    .stat-valor {
      font-weight: 600;
      color: #2c3e50;
    }

    .stat-valor.precio {
      color: #28a745;
      font-size: 18px;
    }

    .stat-valor.disponibles {
      color: #007bff;
    }

    .progress-container {
      margin: 20px 0;
    }

    .progress-bar {
      width: 100%;
      height: 20px;
      background: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #28a745);
      transition: width 0.3s ease;
    }

    .progress-text {
      display: block;
      text-align: center;
      margin-top: 8px;
      font-weight: 600;
      color: #495057;
    }

    .compra-section {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .compra-form .form-control {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .total-compra {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      margin: 15px 0;
      font-size: 18px;
    }

    .compra-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .no-compra {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      text-align: center;
    }

    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-outline-primary {
      background-color: transparent;
      color: #007bff;
      border: 2px solid #007bff;
    }

    .btn-outline-primary:hover:not(:disabled) {
      background-color: #007bff;
      color: white;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alert {
      padding: 15px 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .alert-success {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }

    .alert-danger {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .alert-info {
      background-color: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }

    .loading-compra {
      text-align: center;
      padding: 20px;
      color: #007bff;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .detalle-rifa-container {
        padding: 15px;
      }

      .main-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .rifa-title-section h1 {
        font-size: 2rem;
      }

      .header-actions {
        flex-direction: column;
        gap: 15px;
      }
    }
  `]
})
export class DetalleRifaComponent implements OnInit {
  rifa?: Rifa;
  cargando = false;
  error = '';
  mensaje = '';
  tipoMensaje: 'success' | 'danger' | 'info' = 'info';
  
  // Compra
  cantidadAComprar = 1;
  comprando = false;
  mostrarSelectorNumeros = false;

  constructor(
    private rifaService: RifaService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarRifa(id);
    } else {
      this.error = 'ID de rifa no válido';
    }
  }

  cargarRifa(id?: number) {
    const rifaId = id || Number(this.route.snapshot.paramMap.get('id'));
    if (!rifaId) return;

    this.cargando = true;
    this.error = '';

    this.rifaService.obtenerRifaPorId(rifaId).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.rifa = response.data;
        } else {
          this.error = response.message || 'Error al cargar la rifa';
        }
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al cargar rifa:', error);
        this.error = 'Error al cargar la rifa';
      }
    });
  }

  // Métodos de compra
comprarAleatorio() {
  if (!this.rifa?.id || this.cantidadAComprar <= 0) return;
  
  this.comprando = true;
  const numeros = Array.from({length: this.cantidadAComprar}, (_, i) => i + 1);
  this.realizarCompra(numeros);
}

  realizarCompra(numeros: number[]) {
  if (!this.rifa?.id) return;

  this.rifaService.comprarNumeros(this.rifa.id, numeros).subscribe({
    next: (response) => {
      this.comprando = false;
      if (response.success) {
        this.mostrarMensaje('¡Compra realizada exitosamente!', 'success');
        this.cantidadAComprar = 1;
        this.cargarRifa();
      } else {
        this.mostrarMensaje(response.message || 'Error en la compra', 'danger');
      }
    },
    error: (error) => {
      this.comprando = false;
      console.error('Error en compra:', error);
      this.mostrarMensaje('Error al procesar la compra', 'danger');
    }
  });
}



  toggleSelectorNumeros() {
    this.mostrarSelectorNumeros = !this.mostrarSelectorNumeros;
  }

  // Métodos de utilidad
  getMaximosNumerosDisponibles(): number {
    if (!this.rifa) return 1;
    const disponibles = (this.rifa.total_numeros || 0) - (this.rifa.numeros_vendidos || 0);
    return Math.min(10, disponibles);
  }

  getPorcentajeVendido(): number {
    if (!this.rifa) return 0;
    const total = this.rifa.total_numeros || this.rifa.cantidad_numeros || 0;
    const vendidos = this.rifa.numeros_vendidos || 0;
    return total > 0 ? Math.round((vendidos / total) * 100) : 0;
  }

  getRecaudado(): number {
    if (!this.rifa) return 0;
    const vendidos = this.rifa.numeros_vendidos || 0;
    return vendidos * this.rifa.precio_numero;
  }

  getPotencialTotal(): number {
    if (!this.rifa) return 0;
    const total = this.rifa.total_numeros || this.rifa.cantidad_numeros || 0;
    return total * this.rifa.precio_numero;
  }

  // Métodos de permisos
  puedeEditarRifa(): boolean {
    const usuario = this.authService.getCurrentUser();
    if (!usuario || !this.rifa) return false;

    return usuario.rol === 'admin_global' || 
           (usuario.rol === 'admin_institucion' && usuario.institucion_id === this.rifa.institucion_id) ||
           usuario.id === this.rifa.creado_por;
  }

  puedeComprar(): boolean {
    return this.estaLogueado() && this.rifa?.estado === 'activa';
  }

  estaLogueado(): boolean {
    return this.authService.isAuthenticated();
  }

  // Métodos de formato
  formatearPrecio(valor: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  formatearFechaCompleta(fecha: string): string {
    return new Date(fecha).toLocaleString('es-AR');
  }

  getEstadoTexto(estado: string): string {
    const estados: Record<string, string> = {
      'activa': '✅ Activa',
      'finalizada': '🏁 Finalizada', 
      'cancelada': '❌ Cancelada',
      'borrador': '📝 Borrador'
    };
    return estados[estado] || estado;
  }

  volver() {
    this.router.navigate(['/rifas']);
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'danger' | 'info') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }
}