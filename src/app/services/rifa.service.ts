// ====================================
// src/app/services/rifa.service.ts - ACTUALIZADO
// ====================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Importar solo las interfaces que acabamos de crear
import { Rifa, NumeroRifa, CompraNumeros, CompraResponse } from '../interfaces';

export type { Rifa, NumeroRifa, CompraNumeros, CompraResponse };

@Injectable({
  providedIn: 'root'
})
export class RifaService {
  // ✅ URL DIRECTA COMO TUS OTROS SERVICIOS
  private readonly API_BASE_URL = 'http://localhost:3100';

  constructor(private http: HttpClient) {
    console.log('🎟️ RifaService inicializado con URL:', this.API_BASE_URL);
  }

  // Obtener todas las rifas
  obtenerRifas(filtros?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros?.institucion_id) {
      params = params.set('institucion_id', filtros.institucion_id.toString());
    }

    return this.http.get<any>(`${this.API_BASE_URL}/rifas`, { params });
  }

  // Obtener rifa por ID
  obtenerRifaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/rifas/${id}`);
  }

  // Obtener números de una rifa
  obtenerNumerosRifa(id: number, estado?: string): Observable<any> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<any>(`${this.API_BASE_URL}/rifas/${id}/numeros`, { params });
  }

  // Comprar números
  comprarNumeros(id: number, numeros: number[]): Observable<CompraResponse> {
    const compra: CompraNumeros = { numeros };
    return this.http.post<CompraResponse>(`${this.API_BASE_URL}/rifas/${id}/comprar`, compra);
  }

  // Obtener mis rifas
  obtenerMisRifas(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE_URL}/rifas/user/mis-rifas`);
  }

  // Crear nueva rifa
  crearRifa(rifa: any): Observable<any> {
    return this.http.post<any>(`${this.API_BASE_URL}/rifas`, rifa);
  }

  // Actualizar rifa
  actualizarRifa(id: number, rifa: any): Observable<any> {
    return this.http.put<any>(`${this.API_BASE_URL}/rifas/${id}`, rifa);
  }

  // Eliminar rifa
  eliminarRifa(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_BASE_URL}/rifas/${id}`);
  }

  // Obtener rifas por institución
  obtenerRifasPorInstitucion(institucionId: number): Observable<any> {
    return this.obtenerRifas({ institucion_id: institucionId });
  }

  // Obtener números disponibles de una rifa
  obtenerNumerosDisponibles(id: number): Observable<any> {
    return this.obtenerNumerosRifa(id, 'disponible');
  }

  // Verificar si un número específico está disponible
  verificarNumeroDisponible(rifaId: number, numero: number): Observable<{ success: boolean; disponible: boolean; message: string }> {
    return this.obtenerNumerosRifa(rifaId).pipe(
      map(response => {
        if (response.success && response.data) {
          const numeroEncontrado = response.data.find((n: any) => n.numero === numero);
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
}