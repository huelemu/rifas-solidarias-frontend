// src/app/components/rifas-activas/rifas-activas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RifaService } from '../../services/rifa.service';
import { InstitucionService } from '../../services/institucion.service';
import { Rifa } from '../../interfaces/rifa.interface';
import { Institucion } from '../../interfaces/institucion.interface';

@Component({
  selector: 'app-rifas-activas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: ,
    <div class="rifas-activas-container">
      <!-- Header -->
      <div class="header-section">
        <h1>Rifas Activas</h1>
        <p class="subtitle">Descubre las rifas solidarias disponibles y participa por grandes premios</p>
      </div>

      <!-- Filtros -->
      <div class="filtros-section">
        <div class="filtros-container">
          <div class="filtro-grupo">
            <label>Filtrar por institución:</label>
            <select [(ngModel)]="filtroInstitucion" (change)="aplicarFiltros()" class="filtro-select">
              <option value="">Todas las instituciones</option>
              <option *ngFor="let institucion of instituciones" [value]="institucion.id">
                {{ institucion.nombre }}
              </option>
            </select>
          </div>
          
          <div class="filtro-grupo">
            <label>Ordenar por:</label>
            <select [(ngModel)]="ordenamiento" (change)="aplicarFiltros()" class="filtro-select">
              <option value="fecha_sorteo_asc">Fecha de sorteo (próximos primero)</option>
              <option value="fecha_sorteo_desc">Fecha de sorteo (lejanos primero)</option>
              <option value="precio_asc">Precio (menor a mayor)</option>
              <option value="precio_desc">Precio (mayor a menor)</option>
              <option value="disponibilidad_desc">Más números disponibles</option>
            </select>
          </div>

          <div class="filtro-grupo">
            <label>Buscar:</label>
            <input 
              type="text" 
              [(ngModel)]="textoBusqueda" 
              (input)="aplicarFiltros()"
              placeholder="Buscar por título o descripción..."
              class="filtro-input">
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-section">
        <div class="spinner"></div>
        <p>Cargando rifas disponibles...</p>
      </div>

      <!-- Rifas -->
      <div *ngIf="!cargando" class="rifas-grid">
        <div *ngIf="rifasFiltradas.length === 0" class="no-rifas">
          <i class="fas fa-search"></i>
          <h3>No se encontraron rifas</h3>
          <p>No hay rifas activas que coincidan con tus criterios de búsqueda.</p>
        </div>

        <div *ngFor="let rifa of rifasFiltradas" class="rifa-card">
          <!-- Imagen de la rifa -->
          <div class="rifa-imagen">
            <img 
              [src]="rifa.imagen_url || '/assets/images/rifa-default.jpg'" 
              [alt]="rifa.titulo"
              (error)="onImageError($event)">
            <div class="overlay-info">
              <span class="institucion-badge">{{ rifa.institucion_nombre }}</span>
            </div>
          </div>

          <!-- Contenido de la rifa -->
          <div class="rifa-content">
            <h3 class="rifa-titulo">{{ rifa.titulo }}</h3>
            <p class="rifa-descripcion">{{ rifa.descripcion | slice:0:120 }}{{ rifa.descripcion?.length > 120 ? '...' : '' }}</p>
            
            <!-- Estadísticas -->
            <div class="estadisticas">
              <div class="stat-item">
                <i class="fas fa-ticket-alt"></i>
                <div class="stat-info">
                  <span class="stat-value">{{ getNumeroDisponibles(rifa) }}</span>
                  <span class="stat-label">Disponibles</span>
                </div>
              </div>
              
              <div class="stat-item">
                <i class="fas fa-dollar-sign"></i>
                <div class="stat-info">
                  <span class="stat-value">${{ rifa.precio_numero }}</span>
                  <span class="stat-label">Por número</span>
                </div>
              </div>
              
              <div class="stat-item">
                <i class="fas fa-calendar-alt"></i>
                <div class="stat-info">
                  <span class="stat-value">{{ getDiasRestantes(rifa.fecha_sorteo) }}</span>
                  <span class="stat-label">{{ getDiasRestantes(rifa.fecha_sorteo) === 1 ? 'día' : 'días' }}</span>
                </div>
              </div>
            </div>

            <!-- Barra de progreso -->
            <div class="progreso-container">
              <div class="progreso-info">
                <span>Vendidos: {{ getPorcentajeVendido(rifa) }}%</span>
                <span>{{ getRecaudado(rifa) }} / ${{ getTotalPotencial(rifa) }}</span>
              </div>
              <div class="barra-progreso">
                <div 
                  class="progreso-fill" 
                  [style.width.%]="getPorcentajeVendido(rifa)">
                </div>
              </div>
            </div>

            <!-- Información adicional -->
            <div class="info-adicional">
              <div class="fecha-sorteo">
                <i class="fas fa-trophy"></i>
                <span>Sorteo: {{ rifa.fecha_sorteo | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              
              <div class="tiempo-restante" [class.urgente]="getDiasRestantes(rifa.fecha_sorteo) <= 3">
                <i class="fas fa-clock"></i>
                <span>{{ getTiempoRestante(rifa.fecha_sorteo) }}</span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="acciones">
              <button 
                (click)="verDetalles(rifa)" 
                class="btn-secundario">
                <i class="fas fa-info-circle"></i>
                Ver detalles
              </button>
              
              <button 
                (click)="comprarNumeros(rifa)" 
                [disabled]="!hayNumerosDisponibles(rifa)"
                class="btn-primario">
                <i class="fas fa-shopping-cart"></i>
                <span *ngIf="hayNumerosDisponibles(rifa)">Comprar números</span>
                <span *ngIf="!hayNumerosDisponibles(rifa)">Agotado</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div *ngIf="mensaje" [class]="'mensaje ' + tipoMensaje">
        {{ mensaje }}
      </div>
    </div>
  `,
  styles: [`
    .rifas-activas-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .header-section {
      text-align: center;
      margin-bottom: 40px;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px;
    }

    .header-section h1 {
      font-size: 3em;
      margin: 0 0 10px 0;
      font-weight: 300;
    }

    .subtitle {
      font-size: 1.2em;
      opacity: 0.9;
      margin: 0;
    }

    .filtros-section {
      background: white;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .filtros-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      align-items: end;
    }

    .filtro-grupo {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filtro-grupo label {
      font-weight: 600;
      color: #333;
      font-size: 0.9em;
    }

    .filtro-select, .filtro-input {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1em;
      transition: border-color 0.3s ease;
    }

    .filtro-select:focus, .filtro-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .loading-section {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .rifas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 25px;
    }

    .no-rifas {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-rifas i {
      font-size: 4em;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .rifa-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      border: 1px solid #f0f0f0;
    }

    .rifa-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 35px rgba(0,0,0,0.15);
    }

    .rifa-imagen {
      position: relative;
      height: 200px;
      overflow: hidden;
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

    .overlay-info {
      position: absolute;
      top: 15px;
      left: 15px;
    }

    .institucion-badge {
      background: rgba(102, 126, 234, 0.9);
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      backdrop-filter: blur(10px);
    }

    .rifa-content {
      padding: 25px;
    }

    .rifa-titulo {
      font-size: 1.4em;
      font-weight: 600;
      margin: 0 0 10px 0;
      color: #333;
      line-height: 1.3;
    }

    .rifa-descripcion {
      color: #666;
      line-height: 1.5;
      margin-bottom: 20px;
      font-size: 0.95em;
    }

    .estadisticas {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: #f8f9ff;
      border-radius: 10px;
      border-left: 4px solid #667eea;
    }

    .stat-item i {
      color: #667eea;
      font-size: 1.2em;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-weight: 700;
      font-size: 1.1em;
      color: #333;
    }

    .stat-label {
      font-size: 0.8em;
      color: #666;
    }

    .progreso-container {
      margin-bottom: 20px;
    }

    .progreso-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9em;
      color: #666;
    }

    .barra-progreso {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progreso-fill {
      height: 100%;
      background: linear-gradient(90deg, #4caf50, #45a049);
      transition: width 0.3s ease;
    }

    .info-adicional {
      margin-bottom: 20px;
    }

    .fecha-sorteo, .tiempo-restante {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 0.9em;
      color: #666;
    }

    .tiempo-restante.urgente {
      color: #f44336;
      font-weight: 600;
    }

    .tiempo-restante.urgente i {
      color: #f44336;
    }

    .acciones {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 12px;
    }

    .btn-primario, .btn-secundario {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
      font-size: 0.95em;
    }

    .btn-primario {
      background: #4caf50;
      color: white;
    }

    .btn-primario:hover:not(:disabled) {
      background: #45a049;
      transform: translateY(-2px);
    }

    .btn-primario:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }

    .btn-secundario {
      background: #f5f5f5;
      color: #666;
      border: 2px solid #e0e0e0;
    }

    .btn-secundario:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .mensaje {
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: 600;
    }

    .mensaje.success {
      background: #e8f5e8;
      color: #2e7d32;
      border: 1px solid #4caf50;
    }

    .mensaje.error {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #f44336;
    }

    .mensaje.info {
      background: #e3f2fd;
      color: #1565c0;
      border: 1px solid #2196f3;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .rifas-activas-container {
        padding: 10px;
      }

      .header-section h1 {
        font-size: 2.2em;
      }

      .filtros-container {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .rifas-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .estadisticas {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .stat-item {
        padding: 10px;
      }

      .acciones {
        grid-template-columns: 1fr;
      }

      .rifa-content {
        padding: 20px;
      }
    }

    @media (max-width: 480px) {
      .rifa-imagen {
        height: 150px;
      }

      .rifa-content {
        padding: 15px;
      }

      .btn-primario, .btn-secundario {
        padding: 10px 15px;
        font-size: 0.9em;
      }
    }
  `]
})
export class RifasActivasComponent implements OnInit {
  rifas: Rifa[] = [];
  rifasFiltradas: Rifa[] = [];
  instituciones: Institucion[] = [];
  
  // Filtros
  filtroInstitucion: string = '';
  ordenamiento: string = 'fecha_sorteo_asc';
  textoBusqueda: string = '';
  
  // Estados
  cargando: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | 'info' = 'info';

  constructor(
    private rifaService: RifaService,
    private institucionService: InstitucionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.mensaje = '';

    // Cargar instituciones para el filtro
    this.institucionService.obtenerInstituciones().subscribe({
      next: (response) => {
        if (response.success) {
          this.instituciones = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar instituciones:', error);
      }
    });

    // Cargar rifas activas
    this.rifaService.obtenerRifas({ estado: 'activa' }).subscribe({
      next: (response) => {
        if (response.success) {
          this.rifas = response.data;
          this.aplicarFiltros();
          this.cargando = false;
        } else {
          this.mostrarMensaje('Error al cargar rifas: ' + response.message, 'error');
          this.cargando = false;
        }
      },
      error: (error) => {
        this.mostrarMensaje('Error al cargar las rifas disponibles', 'error');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros() {
    let rifasFiltradas = [...this.rifas];

    // Filtro por institución
    if (this.filtroInstitucion) {
      rifasFiltradas = rifasFiltradas.filter(rifa => 
        rifa.institucion_id?.toString() === this.filtroInstitucion
      );
    }

    // Filtro por texto de búsqueda
    if (this.textoBusqueda.trim()) {
      const busqueda = this.textoBusqueda.toLowerCase();
      rifasFiltradas = rifasFiltradas.filter(rifa =>
        rifa.titulo?.toLowerCase().includes(busqueda) ||
        rifa.descripcion?.toLowerCase().includes(busqueda) ||
        rifa.institucion_nombre?.toLowerCase().includes(busqueda)
      );
    }

    // Ordenamiento
    rifasFiltradas.sort((a, b) => {
      switch (this.ordenamiento) {
        case 'fecha_sorteo_asc':
          return new Date(a.fecha_sorteo).getTime() - new Date(b.fecha_sorteo).getTime();
        case 'fecha_sorteo_desc':
          return new Date(b.fecha_sorteo).getTime() - new Date(a.fecha_sorteo).getTime();
        case 'precio_asc':
          return a.precio_numero - b.precio_numero;
        case 'precio_desc':
          return b.precio_numero - a.precio_numero;
        case 'disponibilidad_desc':
          return this.getNumeroDisponibles(b) - this.getNumeroDisponibles(a);
        default:
          return 0;
      }
    });

    this.rifasFiltradas = rifasFiltradas;
  }

  getNumeroDisponibles(rifa: Rifa): number {
    return rifa.total_numeros - (rifa.estadisticas?.vendidos || 0);
  }

  getPorcentajeVendido(rifa: Rifa): number {
    const vendidos = rifa.estadisticas?.vendidos || 0;
    return Math.round((vendidos / rifa.total_numeros) * 100);
  }

  getRecaudado(rifa: Rifa): string {
    const vendidos = rifa.estadisticas?.vendidos || 0;
    const recaudado = vendidos * rifa.precio_numero;
    return `${recaudado.toLocaleString()}`;
  }

  getTotalPotencial(rifa: Rifa): string {
    const total = rifa.total_numeros * rifa.precio_numero;
    return total.toLocaleString();
  }

  getDiasRestantes(fechaSorteo: string): number {
    const hoy = new Date();
    const sorteo = new Date(fechaSorteo);
    const diffTime = sorteo.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  getTiempoRestante(fechaSorteo: string): string {
    const dias = this.getDiasRestantes(fechaSorteo);
    
    if (dias === 0) {
      return 'Hoy';
    } else if (dias === 1) {
      return 'Mañana';
    } else if (dias <= 7) {
      return `${dias} días`;
    } else if (dias <= 30) {
      const semanas = Math.floor(dias / 7);
      return `${semanas} semana${semanas > 1 ? 's' : ''}`;
    } else {
      const meses = Math.floor(dias / 30);
      return `${meses} mes${meses > 1 ? 'es' : ''}`;
    }
  }

  hayNumerosDisponibles(rifa: Rifa): boolean {
    return this.getNumeroDisponibles(rifa) > 0;
  }

  verDetalles(rifa: Rifa) {
    this.router.navigate(['/rifas', rifa.id]);
  }

  comprarNumeros(rifa: Rifa) {
    if (!this.hayNumerosDisponibles(rifa)) {
      this.mostrarMensaje('Esta rifa no tiene números disponibles', 'error');
      return;
    }
    
    this.router.navigate(['/rifas', rifa.id, 'comprar']);
  }

  onImageError(event: any) {
    event.target.src = '/assets/images/rifa-default.jpg';
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error' | 'info') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }
}