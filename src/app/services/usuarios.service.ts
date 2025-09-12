// =====================================================
// SERVICIO DE USUARIOS - ANGULAR
// src/app/services/usuarios.service.ts
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// =====================================================
// INTERFACES PARA USUARIOS
// =====================================================

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  dni?: string;
  rol: 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';
  institucion_id?: number;
  institucion_nombre?: string;
  estado: 'activo' | 'inactivo' | 'bloqueado';
  ultimo_login?: string;
  intentos_fallidos?: number;
  bloqueado_hasta?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CrearUsuario {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  dni?: string;
  rol: 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';
  institucion_id?: number;
}

export interface ActualizarUsuario {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  dni?: string;
  rol?: 'admin_global' | 'admin_institucion' | 'vendedor' | 'comprador';
  institucion_id?: number;
  estado?: 'activo' | 'inactivo' | 'bloqueado';
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl: string;

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
  // MÉTODOS PRINCIPALES CRUD
  // =====================================================

  // Listar usuarios con filtros
  listarUsuarios(filtros?: {
    rol?: string;
    institucion_id?: number;
    estado?: string;
    page?: number;
    limit?: number;
  }): Observable<{usuarios: Usuario[], pagination: any}> {
    let params: any = {};
    
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] !== undefined) {
          params[key] = filtros[key as keyof typeof filtros]!.toString();
        }
      });
    }

    return this.http.get<ApiResponse<{usuarios: Usuario[], pagination: any}>>(`${this.apiUrl}/usuarios`, { params }).pipe(
      map(response => response.data)
    );
  }

  // Obtener usuario específico
  obtenerUsuario(id: number): Observable<Usuario> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/usuarios/${id}`).pipe(
      map(response => response.data)
    );
  }

  // Crear nuevo usuario
  crearUsuario(usuario: CrearUsuario): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/usuarios`, usuario);
  }

  // Actualizar usuario
  actualizarUsuario(id: number, usuario: ActualizarUsuario): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/usuarios/${id}`, usuario);
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/usuarios/${id}`);
  }

  // Cambiar estado de usuario
  cambiarEstado(id: number, estado: 'activo' | 'inactivo' | 'bloqueado'): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/usuarios/${id}/estado`, { estado });
  }

  // =====================================================
  // MÉTODOS ESPECÍFICOS POR ROL
  // =====================================================

  // Obtener administradores
  obtenerAdministradores(): Observable<Usuario[]> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/usuarios/administradores`).pipe(
      map(response => response.data)
    );
  }

  // Obtener vendedores de una institución
  obtenerVendedores(institucionId?: number): Observable<Usuario[]> {
    const params = institucionId ? { institucion_id: institucionId.toString() } : {};
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/usuarios/vendedores`, { params }).pipe(
      map(response => response.data)
    );
  }

  // Obtener compradores
  obtenerCompradores(): Observable<Usuario[]> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/usuarios/compradores`).pipe(
      map(response => response.data)
    );
  }

  // =====================================================
  // MÉTODOS DE GESTIÓN DE CONTRASEÑAS
  // =====================================================

  // Cambiar contraseña
  cambiarPassword(id: number, passwordActual: string, passwordNuevo: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/usuarios/${id}/cambiar-password`, {
      password_actual: passwordActual,
      password_nuevo: passwordNuevo
    });
  }

  // Restablecer contraseña (admin)
  restablecerPassword(id: number, passwordNuevo: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/usuarios/${id}/restablecer-password`, {
      password_nuevo: passwordNuevo
    });
  }

  // Forzar cambio de contraseña
  forzarCambioPassword(id: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/usuarios/${id}/forzar-cambio-password`, {});
  }

  // =====================================================
  // MÉTODOS DE VALIDACIÓN
  // =====================================================

  // Validar email disponible
  validarEmail(email: string, excludeId?: number): Observable<boolean> {
    const params: any = { email };
    if (excludeId) {
      params.exclude = excludeId.toString();
    }
    
    return this.http.get<ApiResponse<{ disponible: boolean }>>(`${this.apiUrl}/usuarios/validar-email`, {
      params
    }).pipe(
      map(response => response.data.disponible)
    );
  }

  // Validar DNI disponible
  validarDni(dni: string, excludeId?: number): Observable<boolean> {
    const params: any = { dni };
    if (excludeId) {
      params.exclude = excludeId.toString();
    }
    
    return this.http.get<ApiResponse<{ disponible: boolean }>>(`${this.apiUrl}/usuarios/validar-dni`, {
      params
    }).pipe(
      map(response => response.data.disponible)
    );
  }

  // =====================================================
  // MÉTODOS DE BÚSQUEDA Y FILTRADO
  // =====================================================

  // Buscar usuarios por término
  buscarUsuarios(termino: string): Observable<Usuario[]> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/usuarios/buscar`, {
      params: { q: termino }
    }).pipe(
      map(response => response.data)
    );
  }

  // Filtrar usuarios por institución
  obtenerUsuariosPorInstitucion(institucionId: number): Observable<Usuario[]> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/usuarios/por-institucion/${institucionId}`).pipe(
      map(response => response.data)
    );
  }

  // =====================================================
  // MÉTODOS DE ESTADÍSTICAS
  // =====================================================

  // Estadísticas de usuarios
  obtenerEstadisticas(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/usuarios/estadisticas`).pipe(
      map(response => response.data)
    );
  }

  // Actividad de usuario
  obtenerActividad(id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/usuarios/${id}/actividad`).pipe(
      map(response => response.data)
    );
  }

  // =====================================================
  // MÉTODOS PARA DROPDOWN/SELECT
  // =====================================================

  // Obtener usuarios activos para select
  obtenerUsuariosActivos(): Observable<Usuario[]> {
    return this.listarUsuarios({ estado: 'activo' }).pipe(
      map(data => data.usuarios)
    );
  }

  // Obtener vendedores activos para select
  obtenerVendedoresActivos(institucionId?: number): Observable<{value: number, label: string}[]> {
    return this.obtenerVendedores(institucionId).pipe(
      map(vendedores => 
        vendedores
          .filter(v => v.estado === 'activo')
          .map(v => ({
            value: v.id,
            label: `${v.nombre} ${v.apellido}`
          }))
      )
    );
  }

  // =====================================================
  // MÉTODOS DE IMPORTACIÓN/EXPORTACIÓN
  // =====================================================

  // Exportar usuarios
  exportarUsuarios(formato: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/usuarios/exportar`, {
      params: { formato },
      responseType: 'blob'
    });
  }

  // Importar usuarios desde archivo
  importarUsuarios(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/usuarios/importar`, formData);
  }
}