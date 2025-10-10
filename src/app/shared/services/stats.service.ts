// src/app/shared/services/stats.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  // Estadísticas generales
  total_rifas: number;
  rifas_activas: number;
  rifas_finalizadas: number;
  
  // Estadísticas de participación
  mis_numeros_comprados: number;
  mis_rifas_activas: number;
  total_invertido: number;
  
  // Para administradores
  total_usuarios?: number;
  total_instituciones?: number;
  total_recaudado?: number;
  numeros_vendidos_hoy?: number;
}

export interface RifaResumen {
  id: number;
  nombre: string;
  estado: string;
  porcentaje_vendido: number;
  total_recaudado: number;
  fecha_sorteo: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl: string;

  constructor() {
    const hostname = window.location.hostname;
    this.apiUrl = (hostname === 'localhost' || hostname === '127.0.0.1')
      ? 'http://localhost:3100'
      : 'https://apirifas.huelemu.com.ar';
  }

  /**
   * Obtener estadísticas del dashboard
   */
  getDashboardStats(): Observable<{ status: string; data: DashboardStats }> {
    return this.http.get<any>(`${this.apiUrl}/stats/dashboard`);
  }

  /**
   * Obtener mis rifas activas
   */
  getMisRifasActivas(): Observable<{ status: string; data: RifaResumen[] }> {
    return this.http.get<any>(`${this.apiUrl}/stats/mis-rifas-activas`);
  }

  /**
   * Obtener top rifas por ventas (solo admin)
   */
  getTopRifas(limit: number = 5): Observable<{ status: string; data: RifaResumen[] }> {
    return this.http.get<any>(`${this.apiUrl}/stats/top-rifas?limit=${limit}`);
  }
}