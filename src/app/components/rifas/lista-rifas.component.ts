// src/app/components/rifas/lista-rifas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RifaService, Rifa } from '../../services/rifa.service';

@Component({
  selector: 'app-lista-rifas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="rifas-container">
      <div class="header">
        <h1>🎲 Rifas Solidarias</h1>
        <p>Participa en rifas y colabora con instituciones solidarias</p>
      </div>

      <!-- Filtros -->
      <div class="filtros">
        <select [(ngModel)]="filtroEstado" (change)="aplicarFiltros()" class="form-select">
          <option value="">Todos los estados</option>
          <option value="activa">Activas</option>
          <option value="cerrada">Cerradas</option>
          <option value="finalizada">Finalizadas</option>
        </select>

        <button (click)="cargarRifas()" class="btn btn-secondary">
          🔄 Actualizar
        </button>

        <button 
          *ngIf="puedeCrearRifas()"
          routerLink="/rifas/crear" 
          class="btn btn-primary">
          ➕ Nueva Rifa
        </button>
      </div>

      <!-- Estado de carga -->
      <div *ngIf="cargando" class="loading">
        <p>Cargando rifas... ⏳</p>
      </div>

      <!-- Mensaje de error -->
      <div *ngIf="error" class="error">
        <p>❌ {{ error }}</p>
        <button (click)="cargarRifas()" class="btn btn-primary">Reintentar</button>
      </div>

      <!-- Lista de rifas -->
      <div *ngIf="!cargando && !error" class="rifas-grid">
        <div *ngFor="let rifa of rifasFiltradas" class="rifa-card">
          <!-- Header de la rifa -->
          <div class="rifa-header">
            <div class="rifa-estado" [class]="'estado-' + rifa.estado">
              {{ getEstadoTexto(rifa.estado) }}
            </div>
            <h3>{{ rifa.titulo }}</h3>
            <p class="institucion">🏢 {{ rifa.institucion_nombre }}</p>
          </div>

          <!-- Imagen (si existe) -->
          <div *ngIf="rifa.imagen_url" class="rifa-imagen">
            <img [src]="rifa.imagen_url" [alt]="rifa.titulo" />
          </div>

          <!-- Descripción -->
          <div class="rifa-descripcion">
            <p>{{ rifa.descripcion || 'Sin descripción disponible' }}</p>
          </div>

          <!-- Estadísticas -->
          <div class="rifa-stats">
            <div class="stat">
              <span class="label">Precio por número:</span>
              <span class="value precio">{{ formatearPrecio(rifa.precio_numero) }}</span>
            </div>
            
            <div class="stat">
              <span class="label">Números vendidos:</span>
              <span class="value">{{ rifa.numeros_vendidos || 0 }} / {{ rifa.total_numeros }}</span>
            </div>
            
            <div class="stat">
              <span class="label">Progreso:</span>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  [style.width.%]="rifa.porcentaje_vendido || 0">
                </div>
                <span class="progress-text">{{ rifa.porcentaje_vendido || 0 }}%</span>
              </div>
            </div>

            <div class="stat">
              <span class="label">Recaudado:</span>
              <span class="value recaudado">{{ formatearPrecioLocal(rifa.recaudado) }}</span>
            </div>
          </div>

          <!-- Fechas -->
          <div class="rifa-fechas">
            <div class="fecha">
              <span class="label">📅 Inicio:</span>
              <span>{{ rifa.fecha_inicio ? formatearFecha(rifa.fecha_inicio) : 'Sin fecha' }}</span>
            </div>
            <div class="fecha">
              <span class="label">📅 Fin:</span>
              <span>{{ rifa.fecha_fin ? formatearFecha(rifa.fecha_fin) : 'Sin fecha' }}</span>
            </div>
            <div *ngIf="rifa.fecha_sorteo" class="fecha">
              <span class="label">🎯 Sorteo:</span>
              <span>{{ formatearFecha(rifa.fecha_sorteo) }}</span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="rifa-acciones">
            <button 
              [routerLink]="['/rifas', rifa.id]"
              class="btn btn-outline">
              👁️ Ver Detalle
            </button>

            <button 
              *ngIf="rifa.estado === 'activa'"
              [routerLink]="['/rifas', rifa.id, 'comprar']"
              class="btn btn-primary">
              🎟️ Comprar Números
            </button>

            <button 
              *ngIf="puedeEditarRifa(rifa)"
              [routerLink]="['/rifas', rifa.id, 'editar']"
              class="btn btn-secondary">
              ✏️ Editar
            </button>
          </div>

          <!-- Número ganador (si existe) -->
          <div *ngIf="rifa.numero_ganador" class="numero-ganador">
            🏆 Número ganador: <strong>{{ rifa.numero_ganador }}</strong>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay rifas -->
      <div *ngIf="!cargando && !error && rifasFiltradas.length === 0" class="no-rifas">
        <h3>📭 No hay rifas disponibles</h3>
        <p>{{ filtroEstado ? 'No se encontraron rifas con el filtro aplicado.' : 'Aún no se han creado rifas.' }}</p>
        <button 
          *ngIf="puedeCrearRifas()"
          routerLink="/rifas/crear" 
          class="btn btn-primary">
          ➕ Crear Primera Rifa
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

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .header h1 {
      color: #2c3e50;
      margin-bottom: 10px;
    }

    .filtros {
      display: flex;
      gap: 15px;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .form-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3498db;
      color: white;
    }

    .btn-primary:hover {
      background: #2980b9;
    }

    .btn-secondary {
      background: #95a5a6;
      color: white;
    }

    .btn-outline {
      background: transparent;
      color: #3498db;
      border: 1px solid #3498db;
    }

    .btn-outline:hover {
      background: #3498db;
      color: white;
    }

    .loading, .error, .no-rifas {
      text-align: center;
      padding: 40px;
      margin: 20px 0;
    }

    .error {
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      color: #c00;
    }

    .rifas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .rifa-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .rifa-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .rifa-header h3 {
      margin: 10px 0;
      color: #2c3e50;
    }

    .rifa-estado {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .estado-activa {
      background: #d4edda;
      color: #155724;
    }

    .estado-cerrada {
      background: #fff3cd;
      color: #856404;
    }

    .estado-finalizada {
      background: #f8d7da;
      color: #721c24;
    }

    .institucion {
      color: #666;
      font-size: 14px;
      margin: 5px 0;
    }

    .rifa-imagen img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 4px;
      margin: 10px 0;
    }

    .rifa-descripcion {
      margin: 15px 0;
      color: #555;
      line-height: 1.4;
    }

    .rifa-stats {
      margin: 20px 0;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0;
      font-size: 14px;
    }

    .stat .label {
      color: #666;
    }

    .stat .value {
      font-weight: 600;
    }

    .precio {
      color: #27ae60;
      font-size: 16px;
    }

    .recaudado {
      color: #f39c12;
    }

    .progress-bar {
      position: relative;
      width: 100px;
      height: 20px;
      background: #ecf0f1;
      border-radius: 10px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3498db, #2ecc71);
      transition: width 0.3s ease;
    }

    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 11px;
      font-weight: bold;
      color: #2c3e50;
    }

    .rifa-fechas {
      margin: 15px 0;
      font-size: 13px;
    }

    .fecha {
      display: flex;
      justify-content: space-between;
      margin: 4px 0;
      color: #666;
    }

    .rifa-acciones {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }

    .rifa-acciones .btn {
      flex: 1;
      min-width: 120px;
      text-align: center;
      font-size: 14px;
      padding: 8px 12px;
    }

    .numero-ganador {
      margin-top: 15px;
      padding: 10px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      text-align: center;
      font-weight: bold;
      color: #856404;
    }

    @media (max-width: 768px) {
      .rifas-grid {
        grid-template-columns: 1fr;
      }
      
      .filtros {
        flex-direction: column;
        align-items: stretch;
      }
      
      .rifa-acciones {
        flex-direction: column;
      }
      
      .rifa-acciones .btn {
        flex: none;
      }
    }
  `]
})
export class ListaRifasComponent implements OnInit {
formatearPrecioLocal(arg0: string|number|undefined) {
throw new Error('Method not implemented.');
}
  rifas: Rifa[] = [];
  rifasFiltradas: Rifa[] = [];
  filtroEstado: string = '';
  cargando: boolean = false;
  error: string = '';

  constructor(
    private rifaService: RifaService
  ) {}

  ngOnInit() {
    this.cargarRifas();
  }

  cargarRifas() {
    this.cargando = true;
    this.error = '';

    this.rifaService.obtenerRifas().subscribe({
      next: (response) => {
        if (response.success) {
          this.rifas = response.data;
          this.aplicarFiltros();
        } else {
          this.error = response.message || 'Error al cargar rifas';
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar rifas:', error);
        this.error = 'Error de conexión. Verifica que el servidor esté funcionando.';
        this.cargando = false;
      }
    });
  }

  aplicarFiltros() {
    this.rifasFiltradas = this.rifas.filter(rifa => {
      if (this.filtroEstado && rifa.estado !== this.filtroEstado) {
        return false;
      }
      return true;
    });
  }

  getEstadoTexto(estado: string): string {
    const estados = {
      'activa': 'Activa',
      'cerrada': 'Cerrada',
      'finalizada': 'Finalizada',
      'borrador': 'Borrador'
    };
    return estados[estado as keyof typeof estados] || estado;
  }

  formatearPrecio(precio: number): string {
    return this.rifaService.formatearPrecio(precio);
  }

  formatearFecha(fecha: string): string {
    return this.rifaService.formatearFecha(fecha);
  }

  puedeCrearRifas(): boolean {
    // Aquí deberías verificar el rol del usuario
    // Por ahora, asumimos que puede crear rifas
    return true;
  }

  puedeEditarRifa(rifa: Rifa): boolean {
    // Aquí deberías verificar permisos específicos
    // Por ahora, asumimos que puede editar
    return true;
  }
}