// src/app/components/rifas/lista-rifas.component.ts - ACTUALIZADA
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RifaService, Rifa } from '../../services/rifa.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-lista-rifas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="rifas-container">
      <!-- Header principal -->
      <div class="page-header">
        <div class="header-content">
          <h1>🎲 Rifas Solidarias</h1>
          <p class="subtitle">Participa en rifas y colabora con instituciones solidarias</p>
        </div>
        
        <div class="header-actions" *ngIf="puedeCrearRifas()">
          <button 
            routerLink="/rifas/crear" 
            class="btn btn-primary btn-create">
            ➕ Crear Nueva Rifa
          </button>
        </div>
      </div>

      <!-- Filtros y controles -->
      <div class="filtros-section">
        <div class="filtros-left">
          <select [(ngModel)]="filtroEstado" (change)="aplicarFiltros()" class="form-select">
            <option value="">📋 Todos los estados</option>
            <option value="activa">✅ Activas</option>
            <option value="finalizada">🏁 Finalizadas</option>
            <option value="borrador">📝 Borradores</option>
          </select>

          <select [(ngModel)]="filtroInstitucion" (change)="aplicarFiltros()" class="form-select">
            <option value="">🏢 Todas las instituciones</option>
            <option *ngFor="let inst of instituciones" [value]="inst.id">
              {{ inst.nombre }}
            </option>
          </select>
        </div>

        <div class="filtros-right">
          <div class="resultados-info">
            <span *ngIf="rifasFiltradas.length > 0">
              Mostrando {{ rifasFiltradas.length }} de {{ rifas.length }} rifas
            </span>
            <span *ngIf="rifasFiltradas.length === 0 && !cargando">
              No se encontraron rifas
            </span>
          </div>
          
          <button (click)="cargarRifas()" class="btn btn-secondary btn-refresh" [disabled]="cargando">
            <span *ngIf="!cargando">🔄 Actualizar</span>
            <span *ngIf="cargando">⏳ Cargando...</span>
          </button>
        </div>
      </div>

      <!-- Estado de carga -->
      <div *ngIf="cargando" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando rifas... ⏳</p>
      </div>

      <!-- Mensaje de error -->
      <div *ngIf="error && !cargando" class="error-state">
        <div class="error-icon">❌</div>
        <h3>Oops! Algo salió mal</h3>
        <p>{{ error }}</p>
        <button (click)="cargarRifas()" class="btn btn-primary">Reintentar</button>
      </div>

      <!-- Estado vacío -->
      <div *ngIf="!cargando && !error && rifas.length === 0" class="empty-state">
        <div class="empty-icon">🎲</div>
        <h3>No hay rifas disponibles</h3>
        <p>Aún no se han creado rifas en el sistema.</p>
        <button 
          *ngIf="puedeCrearRifas()"
          routerLink="/rifas/crear" 
          class="btn btn-primary">
          ➕ Crear la Primera Rifa
        </button>
      </div>

      <!-- Lista de rifas -->
      <div *ngIf="!cargando && !error && rifasFiltradas.length > 0" class="rifas-grid">
        <div *ngFor="let rifa of rifasFiltradas" class="rifa-card" [class]="'estado-' + rifa.estado">
          
          <!-- Badge de estado -->
          <div class="rifa-badge" [class]="'badge-' + rifa.estado">
            {{ getEstadoTexto(rifa.estado) }}
          </div>

          <!-- Imagen de la rifa -->
          <div class="rifa-imagen" *ngIf="rifa.imagen_url">
            <img [src]="rifa.imagen_url" [alt]="rifa.titulo || rifa.nombre" />
          </div>
          
          <!-- Placeholder si no hay imagen -->
          <div class="rifa-imagen-placeholder" *ngIf="!rifa.imagen_url">
            <div class="placeholder-icon">🎁</div>
          </div>

          <!-- Contenido de la rifa -->
          <div class="rifa-content">
            
            <!-- Header con título e institución -->
            <div class="rifa-header">
              <h3 class="rifa-titulo">{{ rifa.titulo || rifa.nombre }}</h3>
              <div class="rifa-institucion">
                <span class="institucion-icon">🏢</span>
                <span class="institucion-nombre">{{ rifa.institucion_nombre || 'Institución' }}</span>
              </div>
            </div>

            <!-- Descripción -->
            <div class="rifa-descripcion" *ngIf="rifa.descripcion">
              <p>{{ truncarTexto(rifa.descripcion, 100) }}</p>
            </div>

            <!-- Información clave -->
            <div class="rifa-info">
              <div class="info-item">
                <span class="info-label">💰 Precio:</span>
                <span class="info-valor precio">{{ formatearPrecio(rifa.precio_numero) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">🎯 Números:</span>
                <span class="info-valor">{{ rifa.total_numeros || rifa.cantidad_numeros }}</span>
              </div>
              
              <div class="info-item" *ngIf="rifa.numeros_vendidos !== undefined">
                <span class="info-label">📊 Vendidos:</span>
                <span class="info-valor vendidos">{{ rifa.numeros_vendidos || 0 }}</span>
              </div>
            </div>

            <!-- Barra de progreso -->
            <div class="progreso-section" *ngIf="rifa.estado === 'activa'">
              <div class="progreso-bar">
                <div 
                  class="progreso-fill" 
                  [style.width.%]="getPorcentajeVendido(rifa)">
                </div>
              </div>
              <div class="progreso-info">
                <span class="progreso-texto">{{ getPorcentajeVendido(rifa) }}% vendido</span>
                <span class="progreso-disponibles">
                  {{ getNumerosdisponibles(rifa) }} disponibles
                </span>
              </div>
            </div>

            <!-- Fechas importantes -->
            <div class="rifa-fechas">
              <div class="fecha-item">
                <span class="fecha-label">📅 Fin:</span>
                <span class="fecha-valor" [class.fecha-urgente]="esFechaUrgente(rifa.fecha_fin)">
                  {{ formatearFecha(rifa.fecha_fin) }}
                </span>
              </div>
              
              <div class="fecha-item" *ngIf="rifa.fecha_sorteo && rifa.estado !== 'borrador'">
                <span class="fecha-label">🎰 Sorteo:</span>
                <span class="fecha-valor">{{ formatearFecha(rifa.fecha_sorteo) }}</span>
              </div>
            </div>

            <!-- Resultado del sorteo -->
            <div class="resultado-sorteo" *ngIf="rifa.estado === 'finalizada' && rifa.numero_ganador">
              <div class="numero-ganador">
                <span class="numero">{{ rifa.numero_ganador }}</span>
                <span class="texto">🏆 Número Ganador</span>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="rifa-acciones">
            
            <!-- Botón principal según el estado -->
            <button 
              *ngIf="rifa.estado === 'activa'"
              [routerLink]="['/rifas/detalle', rifa.id]" 
              class="btn btn-primary btn-accion-principal">
              🛒 Ver y Comprar
            </button>
            
            <button 
              *ngIf="rifa.estado === 'finalizada'"
              [routerLink]="['/rifas/detalle', rifa.id]" 
              class="btn btn-secondary btn-accion-principal">
              🏁 Ver Resultado
            </button>
            
            <button 
              *ngIf="rifa.estado === 'cerrada'"
              [routerLink]="['/rifas/detalle', rifa.id]" 
              class="btn btn-outline btn-accion-principal">
              🔒 Ver Rifa Cerrada
            </button>

            <button 
              *ngIf="rifa.estado === 'cancelada'"
              [routerLink]="['/rifas/detalle', rifa.id]" 
              class="btn btn-outline btn-accion-principal">
              ❌ Ver Rifa Cancelada
            </button>

            <!-- Acciones secundarias -->
            <div class="acciones-secundarias">
              <button 
                [routerLink]="['/rifas/detalle', rifa.id]" 
                class="btn btn-sm btn-outline">
                👁️ Detalle
              </button>
              
              <button 
                *ngIf="puedeEditarRifa(rifa)"
                [routerLink]="['/rifas/editar', rifa.id]" 
                class="btn btn-sm btn-outline">
                ✏️ Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de filtros sin resultados -->
      <div *ngIf="!cargando && !error && rifas.length > 0 && rifasFiltradas.length === 0" class="no-results-state">
        <div class="no-results-icon">🔍</div>
        <h3>No se encontraron rifas</h3>
        <p>Intenta ajustar los filtros o crear una nueva rifa.</p>
        <button (click)="limpiarFiltros()" class="btn btn-secondary">
          🔄 Limpiar Filtros
        </button>
      </div>
    </div>
  `,
  styles: [`
    .rifas-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #e9ecef;
    }

    .header-content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 8px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .subtitle {
      font-size: 1.1rem;
      color: #666;
      margin: 0;
    }

    .btn-create {
      background: linear-gradient(135deg, #28a745, #20c997);
      border: none;
      color: white;
      padding: 12px 24px;
      font-weight: 600;
      font-size: 1rem;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    }

    .btn-create:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
    }

    .filtros-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      gap: 20px;
      flex-wrap: wrap;
    }

    .filtros-left,
    .filtros-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .form-select {
      padding: 10px 15px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      background: white;
      font-size: 14px;
      min-width: 180px;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }

    .form-select:focus {
      outline: none;
      border-color: #007bff;
    }

    .resultados-info {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .btn-refresh {
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 16px;
      font-size: 14px;
    }

    /* Estados de carga, error y vacío */
    .loading-state,
    .error-state,
    .empty-state,
    .no-results-state {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-icon,
    .empty-icon,
    .no-results-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .error-state h3,
    .empty-state h3,
    .no-results-state h3 {
      color: #495057;
      margin-bottom: 10px;
    }

    .error-state p,
    .empty-state p,
    .no-results-state p {
      color: #666;
      margin-bottom: 20px;
    }

    /* Grid de rifas */
    .rifas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
    }

    .rifa-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: all 0.3s ease;
      position: relative;
      border: 2px solid transparent;
    }

    .rifa-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .rifa-card.estado-activa {
      border-color: rgba(40, 167, 69, 0.2);
    }

    .rifa-card.estado-finalizada {
      border-color: rgba(0, 123, 255, 0.2);
    }

    .rifa-card.estado-borrador {
      border-color: rgba(255, 193, 7, 0.2);
    }

    .rifa-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      z-index: 2;
      text-transform: uppercase;
    }

    .badge-activa {
      background: #d4edda;
      color: #155724;
    }

    .badge-finalizada {
      background: #d1ecf1;
      color: #0c5460;
    }

    .badge-borrador {
      background: #fff3cd;
      color: #856404;
    }

    .rifa-imagen,
    .rifa-imagen-placeholder {
      height: 200px;
      overflow: hidden;
      position: relative;
    }

    .rifa-imagen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .rifa-card:hover .rifa-imagen img {
      transform: scale(1.05);
    }

    .rifa-imagen-placeholder {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .placeholder-icon {
      font-size: 4rem;
      opacity: 0.5;
    }

    .rifa-content {
      padding: 20px;
    }

    .rifa-header {
      margin-bottom: 15px;
    }

    .rifa-titulo {
      font-size: 1.3rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }

    .rifa-institucion {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
      font-size: 14px;
    }

    .rifa-descripcion {
      margin-bottom: 15px;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }

    .rifa-info {
      margin-bottom: 15px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .info-label {
      color: #666;
      font-weight: 500;
    }

    .info-valor {
      font-weight: 600;
      color: #2c3e50;
    }

    .info-valor.precio {
      color: #28a745;
      font-size: 16px;
    }

    .info-valor.vendidos {
      color: #007bff;
    }

    .progreso-section {
      margin: 15px 0;
    }

    .progreso-bar {
      width: 100%;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progreso-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #28a745);
      transition: width 0.3s ease;
    }

    .progreso-info {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
    }

    .rifa-fechas {
      margin: 15px 0;
      font-size: 13px;
    }

    .fecha-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .fecha-label {
      color: #666;
    }

    .fecha-valor {
      font-weight: 500;
      color: #2c3e50;
    }

    .fecha-urgente {
      color: #dc3545;
      font-weight: 600;
    }

    .resultado-sorteo {
      background: linear-gradient(135deg, #ffd700, #ffed4a);
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      text-align: center;
    }

    .numero-ganador {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .numero-ganador .numero {
      font-size: 2rem;
      font-weight: 900;
      color: #2c3e50;
      background: white;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .rifa-acciones {
      padding: 20px;
      border-top: 1px solid #f8f9fa;
      background: #fafbfc;
    }

    .btn-accion-principal {
      width: 100%;
      margin-bottom: 10px;
      padding: 12px;
      font-weight: 600;
      font-size: 15px;
    }

    .acciones-secundarias {
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      text-align: center;
      font-weight: 500;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-outline {
      background: transparent;
      color: #007bff;
      border: 2px solid #007bff;
    }

    .btn-outline:hover {
      background: #007bff;
      color: white;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .rifas-container {
        padding: 15px;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .header-content h1 {
        font-size: 2rem;
      }

      .filtros-section {
        flex-direction: column;
        align-items: stretch;
      }

      .filtros-left,
      .filtros-right {
        justify-content: center;
        flex-wrap: wrap;
      }

      .form-select {
        min-width: 150px;
      }

      .rifas-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .acciones-secundarias {
        flex-direction: column;
      }
    }
  `]
})
export class ListaRifasComponent implements OnInit {
  rifas: Rifa[] = [];
  rifasFiltradas: Rifa[] = [];
  instituciones: any[] = [];
  
  // Filtros
  filtroEstado: string = '';
  filtroInstitucion: string = '';
  
  // Estados
  cargando: boolean = false;
  error: string = '';

  constructor(
    private rifaService: RifaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarRifas();
    this.cargarInstituciones();
  }

  cargarRifas() {
    this.cargando = true;
    this.error = '';

    this.rifaService.obtenerRifas().subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.rifas = response.data;
          this.aplicarFiltros();
        } else {
          this.error = response.message || 'Error al cargar rifas';
        }
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al cargar rifas:', error);
        this.error = 'Error de conexión. Verifica que el servidor esté funcionando.';
      }
    });
  }

  cargarInstituciones() {
    // Implementar carga de instituciones para filtros
    // this.institucionService.obtenerInstituciones().subscribe(...)
  }

  aplicarFiltros() {
    this.rifasFiltradas = this.rifas.filter(rifa => {
      const cumpleEstado = !this.filtroEstado || rifa.estado === this.filtroEstado;
      const cumpleInstitucion = !this.filtroInstitucion || rifa.institucion_id?.toString() === this.filtroInstitucion;
      
      return cumpleEstado && cumpleInstitucion;
    });
  }

  limpiarFiltros() {
    this.filtroEstado = '';
    this.filtroInstitucion = '';
    this.aplicarFiltros();
  }

  // Métodos de utilidad
  truncarTexto(texto: string, limite: number): string {
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
  }

  formatearPrecio(valor: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  getPorcentajeVendido(rifa: Rifa): number {
    const total = rifa.total_numeros || rifa.cantidad_numeros || 0;
    const vendidos = rifa.numeros_vendidos || 0;
    return total > 0 ? Math.round((vendidos / total) * 100) : 0;
  }

  getNumerosdisponibles(rifa: Rifa): number {
    const total = rifa.total_numeros || rifa.cantidad_numeros || 0;
    const vendidos = rifa.numeros_vendidos || 0;
    return total - vendidos;
  }

  esFechaUrgente(fecha: string): boolean {
    const fechaFin = new Date(fecha);
    const hoy = new Date();
    const diferenciaDias = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
    return diferenciaDias <= 7 && diferenciaDias >= 0;
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

  // Métodos de permisos
  puedeCrearRifas(): boolean {
    const usuario = this.authService.getCurrentUser();
    if (!usuario) return false;
    
    return ['admin_global', 'admin_institucion', 'vendedor'].includes(usuario.rol);
  }

  puedeEditarRifa(rifa: Rifa): boolean {
    const usuario = this.authService.getCurrentUser();
    if (!usuario) return false;

    return usuario.rol === 'admin_global' || 
           (usuario.rol === 'admin_institucion' && usuario.institucion_id === rifa.institucion_id) ||
           usuario.id === rifa.creado_por;
  }
}