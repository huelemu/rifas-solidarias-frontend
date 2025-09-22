import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Rifa {
  id: number;
  titulo: string;
  descripcion: string;
  precio_boleto: number;
  numeros_totales: number;
  numeros_vendidos: number;
  fecha_sorteo: string;
  estado: 'activa' | 'finalizada' | 'cancelada';
  institucion_id: number;
  institucion_nombre?: string;
  imagen_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RifasService {
  private apiUrl = `${environment.apiUrl}/rifas`;

  constructor(private http: HttpClient) {}

  // Por ahora devolvemos datos de ejemplo
  // Después conectaremos con el backend
  getRifasActivas(): Observable<Rifa[]> {
    // Datos de ejemplo para empezar
    const rifasEjemplo: Rifa[] = [
      {
        id: 1,
        titulo: 'Rifa Solidaria - Hogar de Ancianos',
        descripcion: 'Ayuda a mejorar las instalaciones del hogar de ancianos San José',
        precio_boleto: 500,
        numeros_totales: 1000,
        numeros_vendidos: 450,
        fecha_sorteo: '2025-10-15',
        estado: 'activa',
        institucion_id: 1,
        institucion_nombre: 'Hogar San José'
      },
      {
        id: 2,
        titulo: 'Rifa Benéfica - Hospital Infantil',
        descripcion: 'Equipamiento médico para la sala de pediatría',
        precio_boleto: 300,
        numeros_totales: 500,
        numeros_vendidos: 180,
        fecha_sorteo: '2025-10-20',
        estado: 'activa',
        institucion_id: 2,
        institucion_nombre: 'Hospital Infantil'
      }
    ];

    return of(rifasEjemplo);
    
    // Cuando esté el backend, usar esto:
    // return this.http.get<Rifa[]>(`${this.apiUrl}/activas`);
  }

  getRifa(id: number): Observable<Rifa | undefined> {
    // Por ahora simulamos
    return of(undefined);
    
    // Cuando esté el backend:
    // return this.http.get<Rifa>(`${this.apiUrl}/${id}`);
  }
}