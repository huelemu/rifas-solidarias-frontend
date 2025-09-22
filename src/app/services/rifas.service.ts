// =====================================================
// SERVICIO ANGULAR - SISTEMA DE RIFAS
// src/app/services/rifas.service.ts
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// =====================================================
// INTERFACES PARA TYPESCRIPT
// =====================================================

export interface Rifa {
  total_numeros: any;
  creado_por: number;
  id: number;
  nombre: string;
  descripcion?: string;
  institucion_promotora_id: number;
  cantidad_numeros: number;
  precio_numero: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_sorteo?: string;
  estado: 'borrador' | 'activa' | 'finalizada' | 'cancelada';
  comision_promotora: number;
  max_instituciones_participantes?: number;
  requiere_aprobacion: boolean;
  
  // Campos calculados
  institucion_promotora?: string;
  institucion_promotora_logo?: string;
  total_instituciones?: number;
  instituciones_aprobadas?: number;
  numeros_vendidos?: number;
  porcentaje_vendido?: number;
  total_recaudado?: number;
}

export interface RifaDetalle extends Rifa {
  data(data: any): unknown;
  success: any;
  participaciones: Participacion[];
  estadisticas: EstadisticasRifa;
  creador_nombre?: string;
  creador_apellido?: string;
}

export interface Participacion {
  id: number;
  rifa_id: number;
  institucion_id: number;
  institucion_nombre: string;
  institucion_logo?: string;
  es_promotora: boolean;
  estado_participacion: 'solicitada' | 'aprobada' | 'rechazada' | 'retirada';
  fecha_solicitud: string;
  fecha_aprobacion?: string;
  numeros_asignados_desde?: number;
  numeros_asignados_hasta?: number;
  comision_acordada: number;
  aprobado_por_nombre?: string;
  observaciones?: string;
}

export interface EstadisticasRifa {
  total_numeros: number;
  vendidos: number;
  reservados: number;
  disponibles: number;
  total_recaudado: number;
  instituciones_participantes: number;
  vendedores_activos: number;
  porcentaje_vendido: number;
  total_potencial: number;
}

export interface NumeroRifa {
  id: number;
  numero: number;
  estado: 'disponible' | 'reservado' | 'vendido';
  comprador_nombre?: string;
  comprador_telefono?: string;
  metodo_pago?: string;
  precio_venta?: number;
  fecha_venta?: string;
  vendedor_id?: number;
  qr_code: string;
}

export interface AsignacionVendedor {
  id: number;
  rifa_id: number;
  vendedor_id: number;
  vendedor_nombre: string;
  numero_desde: number;
  numero_hasta: number;
  fecha_asignacion: string;
  estado_asignacion: 'activa' | 'liberada' | 'vendida';
  numeros_vendidos: number;
  total_vendido: number;
}

export interface ReporteInstituciones {
  institucion: string;
  es_promotora: boolean;
  total_numeros_asignados: number;
  numeros_vendidos: number;
  total_recaudado: number;
  comision_acordada: number;
  comision_monto: number;
  monto_liquido: number;
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class RifasService {
  private apiUrl: string;
  
  // Subjects para estado reactivo
  private rifasSubject = new BehaviorSubject<Rifa[]>([]);
  private rifaActualSubject = new BehaviorSubject<RifaDetalle | null>(null);
  
  public rifas$ = this.rifasSubject.asObservable();
  public rifaActual$ = this.rifaActualSubject.asObservable();

  constructor(private http: HttpClient) {
    this.apiUrl = this.getApiUrl();
  }

  private getApiUrl(): string {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    return isLocalhost 
      ? 'http://localhost:3100' 
      : 'https://apirifas.huelemu.com.ar';
  }

  // =====================================================
  // MÉTODOS DE RIFAS PRINCIPALES
  // =====================================================

  // Crear nueva rifa
  crearRifa(rifaData: Partial<Rifa>): Observable<any> {
    return this.http.post(`${this.apiUrl}/rifas`, rifaData).pipe(
      tap(() => this.actualizarListaRifas())
    );
  }

  // Listar rifas con filtros
  listarRifas(filtros?: {
    estado?: string;
    institucion_id?: number;
    page?: number;
    limit?: number;
  }): Observable<{ rifas: Rifa[], pagination: any }> {
    let params = new HttpParams();
    
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] !== undefined) {
          params = params.set(key, filtros[key as keyof typeof filtros]!.toString());
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/rifas`, { params }).pipe(
      map(response => response.data),
      tap(data => this.rifasSubject.next(data.rifas))
    );
  }

  // Obtener rifa específica
  obtenerRifa(id: number): Observable<RifaDetalle> {
    return this.http.get<any>(`${this.apiUrl}/rifas/${id}`).pipe(
      map(response => response.data),
      tap(rifa => this.rifaActualSubject.next(rifa))
    );
  }

  // Actualizar rifa
  actualizarRifa(id: number, rifaData: Partial<Rifa>): Observable<any> {
    return this.http.put(`${this.apiUrl}/rifas/${id}`, rifaData).pipe(
      tap(() => {
        this.actualizarListaRifas();
        this.obtenerRifa(id).subscribe(); // Refrescar rifa actual
      })
    );
  }

  // Cambiar estado de rifa
  cambiarEstadoRifa(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/rifas/${id}/estado`, { estado }).pipe(
      tap(() => {
        this.actualizarListaRifas();
        this.obtenerRifa(id).subscribe();
      })
    );
  }

  // =====================================================
  // GESTIÓN DE PARTICIPACIONES
  // =====================================================

  // Solicitar participación
  solicitarParticipacion(rifaId: number, observaciones?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rifas/${rifaId}/participaciones`, {
      observaciones
    });
  }

  // Gestionar participación (aprobar/rechazar)
  gestionarParticipacion(
    participacionId: number, 
    accion: 'aprobar' | 'rechazar', 
    observaciones?: string
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/rifas/participaciones/${participacionId}`, {
      accion,
      observaciones
    }).pipe(
      tap(() => {
        // Refrescar rifa actual si está cargada
        const rifaActual = this.rifaActualSubject.value;
        if (rifaActual) {
          this.obtenerRifa(rifaActual.id).subscribe();
        }
      })
    );
  }

  // Retirar participación
  retirarParticipacion(participacionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rifas/participaciones/${participacionId}`);
  }

  // =====================================================
  // GESTIÓN DE NÚMEROS
  // =====================================================

  // Generar números para rifa
  generarNumeros(rifaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/rifas/${rifaId}/generar-numeros`, {}).pipe(
      tap(() => this.obtenerRifa(rifaId).subscribe())
    );
  }

  // Asignar números a institución
  asignarNumerosInstitucion(
    rifaId: number,
    participacionId: number,
    numeroDesde: number,
    numeroHasta: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/rifas/${rifaId}/asignar-numeros-institucion`, {
      participacion_id: participacionId,
      numero_desde: numeroDesde,
      numero_hasta: numeroHasta
    });
  }

  // Asignar números a vendedor
  asignarNumerosVendedor(
    rifaId: number,
    vendedorId: number,
    numeroDesde: number,
    numeroHasta: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/rifas/${rifaId}/asignar-numeros-vendedor`, {
      vendedor_id: vendedorId,
      numero_desde: numeroDesde,
      numero_hasta: numeroHasta
    });
  }

  // Obtener números de vendedor
  obtenerNumerosVendedor(rifaId: number, vendedorId?: number): Observable<NumeroRifa[]> {
    let params = new HttpParams();
    if (vendedorId) {
      params = params.set('vendedor_id', vendedorId.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/rifas/${rifaId}/vendedor/numeros`, { params }).pipe(
      map(response => response.data)
    );
  }

  // =====================================================
  // GESTIÓN DE VENTAS
  // =====================================================

  // Vender número
  venderNumero(
    rifaId: number,
    numero: number,
    datosVenta: {
      comprador_nombre: string;
      comprador_telefono?: string;
      metodo_pago: string;
      precio_venta?: number;
      observaciones?: string;
    }
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/rifas/${rifaId}/numeros/${numero}/vender`, datosVenta).pipe(
      tap(() => {
        // Refrescar datos relacionados
        this.obtenerRifa(rifaId).subscribe();
      })
    );
  }

  // Reservar número
  reservarNumero(
    rifaId: number,
    numero: number,
    compradorNombre: string,
    tiempoReserva?: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/rifas/${rifaId}/numeros/${numero}/reservar`, {
      comprador_nombre: compradorNombre,
      tiempo_reserva: tiempoReserva
    });
  }

  // Cancelar venta
  cancelarVenta(rifaId: number, numero: number, motivo: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rifas/${rifaId}/numeros/${numero}/venta`, {
      body: { motivo }
    });
  }

  // =====================================================
  // REPORTES Y ESTADÍSTICAS
  // =====================================================

  // Obtener estadísticas de rifa
  obtenerEstadisticas(rifaId: number): Observable<EstadisticasRifa> {
    return this.http.get<any>(`${this.apiUrl}/rifas/${rifaId}/estadisticas`).pipe(
      map(response => response.data)
    );
  }

  // Reporte de instituciones
  reporteInstituciones(rifaId: number): Observable<ReporteInstituciones[]> {
    return this.http.get<any>(`${this.apiUrl}/rifas/${rifaId}/reporte-instituciones`).pipe(
      map(response => response.data)
    );
  }

  // Reporte de vendedores
  reporteVendedores(rifaId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/rifas/${rifaId}/reporte-vendedores`).pipe(
      map(response => response.data)
    );
  }

  // Exportar datos
  exportarDatos(rifaId: number, formato: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/rifas/${rifaId}/exportar`, {
      params: { formato },
      responseType: 'blob'
    });
  }

  // =====================================================
  // MÉTODOS PARA VENDEDORES
  // =====================================================

  // Dashboard del vendedor
  dashboardVendedor(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rifas/vendedor/dashboard`).pipe(
      map(response => response.data)
    );
  }

  // Rifas del vendedor
  rifasVendedor(): Observable<Rifa[]> {
    return this.http.get<any>(`${this.apiUrl}/rifas/vendedor/mis-rifas`).pipe(
      map(response => response.data)
    );
  }

  // Ventas del vendedor
  ventasVendedor(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/rifas/vendedor/mis-ventas`).pipe(
      map(response => response.data)
    );
  }

  // =====================================================
  // MÉTODOS PÚBLICOS (SIN AUTENTICACIÓN)
  // =====================================================

  // Ver rifa pública
  obtenerRifaPublica(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rifas/publico/${id}`).pipe(
      map(response => response.data)
    );
  }

  // Verificar número (QR)
  verificarNumero(rifaId: number, numero: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rifas/publico/${rifaId}/numero/${numero}/verificar`).pipe(
      map(response => response.data)
    );
  }

  // =====================================================
  // MÉTODOS AUXILIARES
  // =====================================================

  private actualizarListaRifas(): void {
    this.listarRifas().subscribe();
  }

  // Limpiar estado del servicio
  limpiarEstado(): void {
    this.rifasSubject.next([]);
    this.rifaActualSubject.next(null);
  }

  // Obtener rifa actual del subject
  obtenerRifaActual(): RifaDetalle | null {
    return this.rifaActualSubject.value;
  }

  // Filtrar rifas por estado
  filtrarPorEstado(estado: string): Observable<Rifa[]> {
    return this.rifas$.pipe(
      map(rifas => rifas.filter(rifa => rifa.estado === estado))
    );
  }

  // Calcular estadísticas rápidas
  calcularEstadisticas(rifas: Rifa[]): any {
    return {
      total: rifas.length,
      activas: rifas.filter(r => r.estado === 'activa').length,
      finalizadas: rifas.filter(r => r.estado === 'finalizada').length,
      totalRecaudado: rifas.reduce((sum, r) => sum + (r.total_recaudado || 0), 0),
      promedioVenta: rifas.length > 0 
        ? rifas.reduce((sum, r) => sum + (r.porcentaje_vendido || 0), 0) / rifas.length 
        : 0
    };
  }
}