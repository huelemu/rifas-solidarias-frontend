// src/app/shared/services/chart.service.ts - Servicio para Chart.js

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

// Tipos para Chart.js (se instalará via CDN en index.html)
declare const Chart: any;

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface VentasPorMes {
  mes: string;
  ventas: number;
  recaudacion: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3100';
  
  // Colores del tema
  private colors = {
    primary: '#667eea',
    success: '#48bb78',
    info: '#4299e1',
    warning: '#ed8936',
    danger: '#f56565',
    accent: '#9f7aea'
  };

  /**
   * Crea un gráfico de líneas
   */
  createLineChart(canvasId: string, data: ChartData, title: string): any {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) {
      console.error(`Canvas con id ${canvasId} no encontrado`);
      return null;
    }

    return new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '$' + value.toLocaleString('es-AR');
              }
            }
          }
        }
      }
    });
  }

  /**
   * Crea un gráfico de barras
   */
  createBarChart(canvasId: string, data: ChartData, title: string): any {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) {
      console.error(`Canvas con id ${canvasId} no encontrado`);
      return null;
    }

    return new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  /**
   * Crea un gráfico circular (pie/donut)
   */
  createPieChart(canvasId: string, data: ChartData, title: string, type: 'pie' | 'doughnut' = 'doughnut'): any {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) {
      console.error(`Canvas con id ${canvasId} no encontrado`);
      return null;
    }

    return new Chart(ctx, {
      type: type,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'right'
          }
        }
      }
    });
  }

  /**
   * Obtiene datos de ventas por mes desde el backend
   */
  async getVentasPorMes(): Promise<VentasPorMes[]> {
    try {
      const response: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/estadisticas/ventas-por-mes`)
      );
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo ventas por mes:', error);
      // Retornar datos mock si falla
      return this.getMockVentasPorMes();
    }
  }

  /**
   * Datos mock de ventas por mes
   */
  private getMockVentasPorMes(): VentasPorMes[] {
    return [
      { mes: 'Enero', ventas: 45, recaudacion: 67500 },
      { mes: 'Febrero', ventas: 38, recaudacion: 57000 },
      { mes: 'Marzo', ventas: 52, recaudacion: 78000 },
      { mes: 'Abril', ventas: 61, recaudacion: 91500 },
      { mes: 'Mayo', ventas: 48, recaudacion: 72000 },
      { mes: 'Junio', ventas: 70, recaudacion: 105000 }
    ];
  }

  /**
   * Convierte datos de ventas a formato Chart.js
   */
  ventasToChartData(ventas: VentasPorMes[]): ChartData {
    return {
      labels: ventas.map(v => v.mes),
      datasets: [
        {
          label: 'Ventas',
          data: ventas.map(v => v.ventas),
          backgroundColor: this.colors.primary,
          borderColor: this.colors.primary,
          borderWidth: 2
        },
        {
          label: 'Recaudación ($)',
          data: ventas.map(v => v.recaudacion),
          backgroundColor: this.colors.success,
          borderColor: this.colors.success,
          borderWidth: 2
        }
      ]
    };
  }

  /**
   * Obtiene colores para gráficos
   */
  getColors(): typeof this.colors {
    return this.colors;
  }

  /**
   * Genera paleta de colores para múltiples elementos
   */
  generateColorPalette(count: number): string[] {
    const baseColors = [
      this.colors.primary,
      this.colors.success,
      this.colors.info,
      this.colors.warning,
      this.colors.danger,
      this.colors.accent
    ];

    const palette: string[] = [];
    for (let i = 0; i < count; i++) {
      palette.push(baseColors[i % baseColors.length]);
    }
    return palette;
  }

  /**
   * Destruye un gráfico existente
   */
  destroyChart(chart: any): void {
    if (chart) {
      chart.destroy();
    }
  }
}