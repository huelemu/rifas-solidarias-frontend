import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RifasPublicService {
  private apiUrl = `${environment.apiUrl}/public`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el detalle completo de un número específico
   * Incluye: número, rifa, vendedor (con teléfono), premios
   */
  getNumeroDetalle(rifaId: number, numeroId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/rifas/${rifaId}/numeros/${numeroId}`);
  }

  /**
   * Obtiene todos los números de una rifa (vista pública)
   */
  getNumerosRifa(rifaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/rifas/${rifaId}/numeros`);
  }

  /**
   * Obtiene información pública de una rifa
   */
  getRifaPublica(rifaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/rifas/${rifaId}`);
  }

/**
 * Obtiene los IDs de números que tienen vendedor asignado
 */
getNumerosConVendedor(rifaId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/rifas/${rifaId}/numeros-con-vendedor`);
}

/**
 * Obtener solo números DISPONIBLES con vendedor (rápido)
 */
getNumerosDisponibles(rifaId: number, limit: number = 100, aleatorios: boolean = false): Observable<any> {
  let params = new HttpParams()
    .set('limit', limit.toString())
    .set('aleatorios', aleatorios.toString());
  
  return this.http.get(`${this.apiUrl}/rifas/${rifaId}/numeros-disponibles`, { params });
}
  /**
   * Obtiene todas las rifas activas
   */
  getRifasPublicas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rifas`);
  }
}