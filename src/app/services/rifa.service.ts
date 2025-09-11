// ====================================
// src/app/services/rifa.service.ts - ACTUALIZADO
// ====================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

// Importar interfaces desde el barrel export
import { 
  Rifa, 
  NumeroRifa, 
  CompraNumeros, 
  CompraResponse, 
  FiltrosRifa,
  CrearRifaRequest,
  ActualizarRifaRequest,
  ApiResponse 
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class RifaService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {
    this.baseUrl = this.apiService.getApiUrl();
  }

  // Obtener todas las rifas con filtros opcionales
  obtenerRifas(filtros?: FiltrosRifa): Observable<ApiResponse<Rifa[]>> {
    let params = new HttpParams();
    
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        const value = filtros[key as keyof FiltrosRifa];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<Rifa[]>>(`${this.baseUrl}/rifas`, { params });
  }

  // Obtener rifa por ID
  obtenerRifaPorId(id: number): Observable<ApiResponse<Rifa>> {
    return this.http.get<ApiResponse<Rifa>>(`${this.baseUrl}/rifas/${id}`);
  }

  // Crear nueva rifa
  crearRifa(rifa: CrearRifaRequest): Observable<ApiResponse<Rifa>> {
    return this.http.post<ApiResponse<Rifa>>(`${this.baseUrl}/rifas`, rifa);
  }

  // Actualizar rifa
  actualizarRifa(id: number, rifa: ActualizarRifaRequest): Observable<ApiResponse<Rifa>> {
    return this.http.put<ApiResponse<Rifa>>(`${this.baseUrl}/rifas/${id}`, rifa);
  }

  // Eliminar rifa
  eliminarRifa(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/rifas/${id}`);
  }

  // Obtener números de una rifa
  obtenerNumerosRifa(
    id: number, 
    estado?: 'disponible' | 'reservado' | 'vendido'
  ): Observable<ApiResponse<NumeroRifa[]>> {
    let params = new HttpParams();
    
    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<ApiResponse<NumeroRifa[]>>(
      `${this.baseUrl}/rifas/${id}/numeros`,
      { params }
    );
  }

  // Comprar números de una rifa
  comprarNumeros(id: number, numeros: number[]): Observable<CompraResponse> {
    const compra: CompraNumeros = { numeros };
    return this.http.post<CompraResponse>(
      `${this.baseUrl}/rifas/${id}/comprar`,
      compra
    );
  }

  // Obtener mis rifas (como usuario autenticado)
  obtenerMisRifas(): Observable<ApiResponse<Rifa[]>> {
    return this.http.get<ApiResponse<Rifa[]>>(`${this.baseUrl}/rifas/user/mis-rifas`);
  }

  // Obtener rifas por institución
  obtenerRifasPorInstitucion(institucionId: number): Observable<ApiResponse<Rifa[]>> {
    return this.obtenerRifas({ institucion_id: institucionId });
  }

  // Obtener números disponibles de una rifa
  obtenerNumerosDisponibles(id: number): Observable<ApiResponse<NumeroRifa[]>> {
    return this.obtenerNumerosRifa(id, 'disponible');
  }

  // Verificar si un número específico está disponible
  verificarNumeroDisponible(rifaId: number, numero: number): Observable<{ success: boolean; disponible: boolean; message: string }> {
    return this.obtenerNumerosRifa(rifaId).pipe(
      map(response => {
        if (response.success && response.data) {
          const numeroEncontrado = response.data.find(n => n.numero === numero);
          return {
            success: true,
            disponible: numeroEncontrado ? numeroEncontrado.estado === 'disponible' : false,
            message: numeroEncontrado ? 
              `Número ${numero} está ${numeroEncontrado.estado}` : 
              `Número ${numero} no encontrado`
          };
        }
        return {
          success: false,
          disponible: false,
          message: 'Error al verificar número'
        };
      })
    );
  }

  // Obtener estadísticas de una rifa
  obtenerEstadisticasRifa(id: number): Observable<any> {
    return this.obtenerRifaPorId(id).pipe(
      map(response => {
        if (response.success && response.data) {
          const rifa = response.data;
          return {
            success: true,
            data: {
              total_numeros: rifa.total_numeros,
              vendidos: rifa.estadisticas?.vendidos || 0,
              disponibles: rifa.estadisticas?.disponibles || rifa.total_numeros,
              porcentaje_vendido: rifa.porcentaje_vendido,
              recaudado: rifa.recaudado,
              total_potencial: rifa.total_potencial
            }
          };
        }
        return response;
      })
    );
  }
}