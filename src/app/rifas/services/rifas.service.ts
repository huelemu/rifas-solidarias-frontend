// src/app/rifas/services/rifas.service.patch.ts
// PARCHE PARA HACER EL SERVICIO 100% COMPATIBLE CON TUS COMPONENTES

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError } from 'rxjs';


// INTERFACES COMPATIBLES CON TUS COMPONENTES EXISTENTES
export interface Rifa {
  id: number;
  nombre: string;
  descripcion?: string;
  institucion_promotora_id: number;
  cantidad_numeros: number;
  precio_numero: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_sorteo?: string;
  fecha_limite_participacion?: string;
  max_instituciones_participantes?: number;
  comision_promotora: number;
  requiere_aprobacion: boolean;
  numeros_por_institucion?: number;
  estado: 'borrador' | 'activa' | 'cerrada' | 'finalizada' | 'cancelada';
  creado_por: number; // ✅ CAMPO REQUERIDO POR TUS COMPONENTES
  numero_ganador?: number;
  fecha_sorteo_realizado?: string;
  imagen_url?: string;
  bases_condiciones?: string;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // Campos calculados del backend
  numeros_vendidos?: number;
  numeros_disponibles?: number;
  numeros_reservados?: number;
  total_recaudado?: number;
  porcentaje_vendido?: number;
  institucion_promotora?: {
    id: number;
    nombre: string;
  };
  // Campos adicionales del backend
  institucion_promotora_nombre?: string;
  institucion_promotora_email?: string;
  creador_nombre?: string;
  creador_apellido?: string;
  total_participantes?: number;
}

// RESPUESTA PARA CREAR RIFA (TUS COMPONENTES ESPERAN ID DIRECTO)
export interface CreateRifaResponse {
  status: 'success' | 'error';
  message?: string;
  data?: Rifa;
  // Propiedades directas para compatibilidad
  id: number;
  nombre?: string;
  estado?: string;
  creado_por?: number; // ✅ AÑADIR PARA COMPATIBILIDAD
}

// RESPUESTA PAGINADA (TUS COMPONENTES ESPERAN 'rifas' NO 'data')
export interface PaginatedRifasResponse {
  status: 'success' | 'error';
  rifas: Rifa[]; // TUS COMPONENTES USAN ESTE CAMPO
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// RESPUESTA ESTÁNDAR
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RifasService { // NOMBRE CORRECTO: RifasService
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

  // ===================================================
  // MÉTODOS ESPECÍFICAMENTE COMPATIBLES CON TUS COMPONENTES
  // ===================================================

  /**
   * Obtener rifas - MAPEA A FORMATO ESPERADO POR TUS COMPONENTES
   */
  getRifas(params?: any): Observable<PaginatedRifasResponse> {
    let httpParams = new HttpParams();
    
    if (params?.estado) httpParams = httpParams.set('estado', params.estado);
    if (params?.institucion_id) httpParams = httpParams.set('institucion_id', params.institucion_id.toString());
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<any>(`${this.baseUrl}/rifas`, { params: httpParams }).pipe(
      map(response => ({
        status: response.status,
        rifas: response.data || response.rifas || [], // MAPEAR A 'rifas' COMO ESPERAN TUS COMPONENTES
        pagination: response.pagination
      }))
    );
  }

  /**
   * Crear rifa - RETORNA ID DIRECTO Y FORMATEA DATOS CORRECTAMENTE + MEJOR DEBUG
   */
  createRifa(rifaData: any): Observable<CreateRifaResponse> {
  console.log('🔵 RifasService.createRifa - Datos recibidos:', rifaData);

  // ✅ ENVIAR DIRECTO - SIN TRANSFORMAR
  return this.http.post<any>(`${this.baseUrl}/rifas`, rifaData).pipe(
    map(response => {
      console.log('📥 Respuesta exitosa:', response);
      return {
        status: response.status,
        message: response.message,
        data: response.data,
        id: response.data?.id || response.id,
        nombre: response.data?.nombre || response.nombre,
        estado: response.data?.estado || response.estado,
        creado_por: response.data?.creado_por || response.creado_por
      };
    }),
    catchError(error => {
      console.error('❌ Error:', error);
      throw error;
    })
  );
}
 
  /**
   * Cambiar estado de rifa - MÉTODO REQUERIDO POR TUS COMPONENTES
   */
  cambiarEstadoRifa(id: number, estado: string): Observable<ApiResponse<Rifa>> {
    return this.http.patch<ApiResponse<Rifa>>(`${this.baseUrl}/rifas/${id}/estado`, { estado });
  }

  /**
   * Eliminar rifa - COMPATIBLE CON 1 O 2 PARÁMETROS
   */
  deleteRifa(id: number, motivo?: string): Observable<ApiResponse<any>> {
    const body = motivo ? { motivo } : undefined;
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/rifas/${id}`, { body });
  }

  /**
   * Obtener rifa específica
   */
  getRifa(id: number): Observable<ApiResponse<Rifa>> {
    return this.http.get<ApiResponse<Rifa>>(`${this.baseUrl}/rifas/${id}`);
  }

  /**
   * Actualizar rifa
   */
  updateRifa(id: number, rifaData: any): Observable<ApiResponse<Rifa>> {
    return this.http.put<ApiResponse<Rifa>>(`${this.baseUrl}/rifas/${id}`, rifaData);
  }

/**
 * Obtener mis números comprados
 */
getMisNumeros(rifaId?: number): Observable<any> {
  const url = rifaId 
    ? `${this.baseUrl}/rifas/${rifaId}/mis-numeros`
    : `${this.baseUrl}/mis-numeros`;
  
  return this.http.get<any>(url);
}

/**
 * Reservar números temporalmente
 */
reservarNumeros(rifaId: number, numeros: number[]): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/rifas/${rifaId}/reservar`, { numeros });
}

/**
 * Cancelar reserva de números
 */
cancelarReserva(rifaId: number, numeros: number[]): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/rifas/${rifaId}/cancelar-reserva`, { numeros });
}

/**
 * Verificar disponibilidad de números específicos
 */
verificarDisponibilidad(rifaId: number, numeros: number[]): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/rifas/${rifaId}/verificar-disponibilidad`, { numeros });
}

/**
 * Obtener historial de compras del usuario
 */
getHistorialCompras(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/usuario/historial-compras`);
}
  
  // ===================================================
  // MÉTODOS PARA VISUALIZADOR DE BOLETOS
  // ===================================================

  /**
   * Obtener números de una rifa (alias mejorado para el visualizador)
   * Compatible con el componente boletos-viewer
   */
  getNumeros(rifaId: number, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    console.log(`📡 getNumeros() - Rifa ${rifaId} con params:`, params);

    return this.http.get<any>(`${this.baseUrl}/rifas/${rifaId}/numeros`, { params: httpParams }).pipe(
      tap(response => console.log('✅ Números obtenidos:', response)),
      map(response => {
        // Normalizar respuesta para compatibilidad
        if (response?.data?.numeros) {
          return {
            ...response,
            data: response.data.numeros,
            pagination: response.pagination || response.data.pagination
          };
        }
        return response;
      }),
      catchError(error => {
        console.error('❌ Error obteniendo números:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener detalle de una rifa por ID (alias claro)
   * Compatible con boletos-viewer y otros componentes
   */
  getRifaById(rifaId: number): Observable<any> {
    console.log(`📡 getRifaById() - Rifa ${rifaId}`);

    return this.http.get<any>(`${this.baseUrl}/rifas/${rifaId}`).pipe(
      tap(response => console.log('✅ Rifa obtenida:', response)),
      map(response => {
        // Si la respuesta tiene formato { status, data }, extraer data
        if (response?.data) {
          return { ...response, data: response.data };
        }
        // Si viene directo el objeto, envolverlo
        return { status: 'success', data: response };
      }),
      catchError(error => {
        console.error('❌ Error obteniendo rifa:', error);
        return throwError(() => error);
      })
    );
  }

  // ===================================================
  // MÉTODOS DE IMPRESIÓN (OPCIONAL - para futuras funcionalidades)
  // ===================================================

  /**
   * Generar boleto individual en PDF
   */
  generarBoletoIndividual(rifaId: number, numero: number): Observable<Blob> {
    console.log(`📄 Generando boleto individual - Rifa ${rifaId}, Número ${numero}`);

    return this.http.get(
      `${this.baseUrl}/impresion/rifas/${rifaId}/numeros/${numero}/boleto`,
      { 
        responseType: 'blob',
        observe: 'response'
      }
    ).pipe(
      map(response => response.body as Blob),
      tap(() => console.log('✅ Boleto PDF generado')),
      catchError(error => {
        console.error('❌ Error generando boleto:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generar boletos de institución en PDF
   */
  generarBoletosInstitucion(rifaId: number, institucionId: number, limite?: number): Observable<Blob> {
    let url = `${this.baseUrl}/impresion/rifas/${rifaId}/instituciones/${institucionId}/boletos`;
    if (limite) {
      url += `?limite=${limite}`;
    }

    console.log(`📄 Generando boletos institución - Rifa ${rifaId}, Institución ${institucionId}`);

    return this.http.get(url, { 
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => response.body as Blob),
      tap(() => console.log('✅ Boletos PDF generados')),
      catchError(error => {
        console.error('❌ Error generando boletos:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generar boletos de vendedor en PDF
   */
  generarBoletosVendedor(rifaId: number, vendedorId: number): Observable<Blob> {
    console.log(`📄 Generando boletos vendedor - Rifa ${rifaId}, Vendedor ${vendedorId}`);

    return this.http.get(
      `${this.baseUrl}/impresion/rifas/${rifaId}/vendedores/${vendedorId}/boletos`,
      { 
        responseType: 'blob',
        observe: 'response'
      }
    ).pipe(
      map(response => response.body as Blob),
      tap(() => console.log('✅ Boletos PDF generados')),
      catchError(error => {
        console.error('❌ Error generando boletos:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Descargar archivo PDF (helper)
   */
  descargarPDF(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
    console.log(`💾 PDF descargado: ${nombreArchivo}`);
  }


// ===================================================
// MÉTODOS PÚBLICOS (SIN AUTENTICACIÓN)
// ===================================================

//-----

 /**
   * ✅ NUEVO: Obtener rifa pública (sin autenticación)
   */
  getPublicRifa(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/rifas/publicas/${id}`);
  }

  /**
   * ✅ NUEVO: Obtener números públicos de una rifa
   */
  getPublicNumbers(rifaId: number, params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<any>(`${this.baseUrl}/rifas/publicas/${rifaId}/numeros`, { 
      params: httpParams 
    });
  }

  /**
   * ✅ MEJORADO: Obtener números de rifa (con autenticación)
   */
  getRifaNumbers(rifaId: number, params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.desde) httpParams = httpParams.set('desde', params.desde.toString());
    if (params.hasta) httpParams = httpParams.set('hasta', params.hasta.toString());

    return this.http.get<any>(`${this.baseUrl}/rifas/${rifaId}/numeros`, { 
      params: httpParams 
    });
  }

  /**
   * ✅ Comprar números de una rifa
   */
  comprarNumeros(rifaId: number, compraData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/rifas/${rifaId}/comprar`, compraData);
  }

  /**
   * ✅ NUEVO: Obtener boletos de una rifa
   */
  getRifaBoletos(rifaId: number, params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params.estado) httpParams = httpParams.set('estado', params.estado);
    if (params.numero) httpParams = httpParams.set('numero', params.numero.toString());

    return this.http.get<any>(`${this.baseUrl}/rifas/${rifaId}/boletos`, { 
      params: httpParams 
    });
  }



//-----


/**
 * Obtener números públicos (sin token)
 */
getPublicNumeros(rifaId: number, params?: any): Observable<any> {
  let httpParams = new HttpParams();
  
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
  }

  console.log(`📡 getPublicNumeros() - Rifa ${rifaId} con params:`, params);

  return this.http.get<any>(`${this.baseUrl}/rifas/publicas/${rifaId}/numeros`, { 
    params: httpParams 
  }).pipe(
    tap(response => console.log('✅ Números públicos obtenidos:', response)),
    catchError(error => {
      console.error('❌ Error obteniendo números públicos:', error);
      return throwError(() => error);
    })
  );
}

  getPublicRifas(params?: any): Observable<PaginatedRifasResponse> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<any>(`${this.baseUrl}/rifas/publicas`, { params: httpParams }).pipe(
      map(response => ({
        status: response.status,
        rifas: response.data || response.rifas || [],
        pagination: response.pagination
      }))
    );
  }




  /**
   * Subir logo de rifa
   */
  uploadLogo(rifaId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('logo', file);

    return this.http.post(`${this.baseUrl}/rifas/${rifaId}/logo`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).pipe(
      tap(() => console.log('✅ Logo de rifa subido exitosamente')),
      catchError(error => {
        console.error('❌ Error subiendo logo de rifa:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Eliminar logo de rifa
   */
  deleteLogo(rifaId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/rifas/${rifaId}/logo`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).pipe(
      tap(() => console.log('✅ Logo de rifa eliminado exitosamente')),
      catchError(error => {
        console.error('❌ Error eliminando logo de rifa:', error);
        return throwError(() => error);
      })
    );
  }

/**
 * Invitar instituciones a participar en una rifa
 */
invitarInstituciones(rifaId: number, institucionesIds: number[]): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/rifas/${rifaId}/invitar`,
    { instituciones_ids: institucionesIds }
  ).pipe(
    catchError(error => this.handleError(error))
  );
}

/**
 * Obtener participaciones de una rifa
 */
getParticipaciones(rifaId: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/rifas/${rifaId}/participaciones`).pipe(
    catchError(error => this.handleError(error))
  );
}

/**
 * Aprobar participación de institución
 */
aprobarParticipacion(rifaId: number, participacionId: number): Observable<any> {
  return this.http.put(
    `${this.baseUrl}/rifas/${rifaId}/participaciones/${participacionId}/aprobar`,
    {}
  ).pipe(
    catchError(error => this.handleError(error))
  );
}

/**
 * Rechazar participación de institución
 */
rechazarParticipacion(rifaId: number, participacionId: number, motivo?: string): Observable<any> {
  return this.http.put(
    `${this.baseUrl}/rifas/${rifaId}/participaciones/${participacionId}/rechazar`,
    { motivo }
  ).pipe(
    catchError(error => this.handleError(error))
  );
}
  handleError(error: any): any {
    throw new Error('Method not implemented.');
  }

/**
 * Retirar participación
 */
retirarParticipacion(rifaId: number, participacionId: number): Observable<any> {
  return this.http.delete(
    `${this.baseUrl}/rifas/${rifaId}/participaciones/${participacionId}`
  ).pipe(
    catchError(error => this.handleError(error))
  );
}
  // ===================================================
  // GESTIÓN DE NÚMEROS
  // ===================================================


  generateNumbers(rifaId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/rifas/${rifaId}/numeros/generar`, {});
  }

  // ===================================================
  // ESTADÍSTICAS
  // ===================================================

  getRifaStats(rifaId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/rifas/${rifaId}/estadisticas`);
  }


  // ===================================================
// DASHBOARD PÚBLICO
// ===================================================

/**
 * Obtener datos del dashboard público
 * @returns Observable con estadísticas públicas y personales (si está autenticado)
 */
getPublicDashboard(): Observable<any> {
  return this.http.get(`${this.baseUrl}/dashboard/public`).pipe(
    tap((response: any) => {
      console.log('📊 Dashboard público cargado:', response);
    }),
    catchError((error) => {
      console.error('❌ Error cargando dashboard público:', error);
      return throwError(() => error);
    })
  );
}

  // ===================================================
  // UTILIDADES
  // ===================================================

  getBackendUrl(): string {
    return this.baseUrl;
  }
}