// src/app/services/asignacion.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface AsignacionRequest {
  vendedor_id: number;
  tipo_asignacion: 'individual' | 'rango' | 'aleatorio';
  numeros?: number[];
  rango?: { desde: number; hasta: number };
  cantidad?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {
  private readonly http = inject(HttpClient);
   private readonly baseUrl: string;

  constructor() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      this.baseUrl = 'http://localhost:3100';
    } else {
      this.baseUrl = 'https://apirifas.huelemu.com.ar';
    }
  }

  /**
   * Obtener instituciones de una rifa
   */
  obtenerInstitucionesDeRifa(rifaId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/rifas/${rifaId}/instituciones`);
  }

  /**
   * Obtener números disponibles de una institución
   */
  obtenerNumerosDisponibles(rifaInstitucionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/rifa-instituciones/${rifaInstitucionId}/numeros-disponibles`);
  }

  /**
   * Asignar números a un vendedor
   */
  asignarNumerosAVendedor(rifaInstitucionId: number, data: AsignacionRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/rifa-instituciones/${rifaInstitucionId}/vendedores`, data);
  }

  /**
   * Obtener vendedores de una institución
   */
  obtenerVendedoresDeInstitucion(rifaInstitucionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/rifa-instituciones/${rifaInstitucionId}/vendedores`);
  }

  /**
   * Obtener números asignados a un vendedor
   */
  obtenerNumerosAsignadosAVendedor(vendedorId: number, rifaInstitucionId?: number): Observable<any> {
    let params = new HttpParams();
    if (rifaInstitucionId) {
      params = params.set('rifaInstitucionId', rifaInstitucionId.toString());
    }
    return this.http.get(`${this.baseUrl}/vendedores/${vendedorId}/numeros`, { params });
  }

  /**
   * Liberar números asignados
   */
  liberarNumeros(numeroIds: number[]): Observable<any> {
    return this.http.request('DELETE', `${this.baseUrl}/vendedores/numeros/liberar`, {
      body: { numero_ids: numeroIds }
    });
  }
}