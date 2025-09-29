// src/app/auth/interceptors/auth.interceptor.ts - SIN DEPENDENCIA CIRCULAR

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Interceptor de autenticación sin dependencia circular
 * ✅ NO importa AuthService directamente para evitar circular dependency
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('📤 AuthInterceptor: Interceptando request:', req.url);

  // Solo agregar token a requests de nuestra API
  if (isApiRequest(req.url) && !isAuthEndpoint(req.url)) {
    // ✅ OBTENER TOKEN DIRECTAMENTE DEL LOCALSTORAGE
    // En lugar de usar AuthService (que causaría dependencia circular)
    const authState = getAuthStateFromStorage();
    const accessToken = authState?.accessToken;

    if (accessToken && isTokenValid(accessToken)) {
      console.log('🔑 AuthInterceptor: Agregando token a request');
      
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => handleAuthError(error, req.url))
      );
    } else {
      console.log('⚠️ AuthInterceptor: No hay token válido disponible para request a API', req.url);
    }
  } else {
    console.log('📤 AuthInterceptor: Request sin token (auth endpoint o externa)', req.url);
  }
  
  // Para requests que no requieren token, continuar sin modificar
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => handleAuthError(error, req.url))
  );
};

/**
 * ✅ OBTENER ESTADO DE AUTH DIRECTAMENTE DEL LOCALSTORAGE
 * Sin usar AuthService para evitar dependencia circular
 */
function getAuthStateFromStorage(): any {
  try {
    const authState = localStorage.getItem('authState');
    return authState ? JSON.parse(authState) : null;
  } catch (error) {
    console.error('Error leyendo authState del localStorage:', error);
    return null;
  }
}

/**
 * ✅ VALIDAR TOKEN SIN USAR AUTHSERVICE
 */
function isTokenValid(token: string): boolean {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch {
    return false;
  }
}

/**
 * Verifica si la request es hacia nuestra API
 */
function isApiRequest(url: string): boolean {
  const apiPatterns = [
    'localhost:3100',
    'apirifas.huelemu.com.ar'
  ];
  
  return apiPatterns.some(pattern => url.includes(pattern));
}

/**
 * Verifica si es un endpoint de autenticación que NO requiere token
 */
function isAuthEndpoint(url: string): boolean {
  const authEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/google'
  ];
  
  return authEndpoints.some(endpoint => url.includes(endpoint));
}

/**
 * ✅ MANEJA ERRORES SIN USAR AUTHSERVICE
 * Para evitar dependencia circular
 */
function handleAuthError(error: HttpErrorResponse, requestUrl: string) {
  const router = inject(Router);
  
  console.error('🚨 AuthInterceptor: Error en request', {
    status: error.status,
    url: requestUrl,
    message: error.message,
    error: error.error
  });

  // Solo manejar errores de autenticación para requests que NO son de login
  if (!isAuthEndpoint(requestUrl)) {
    switch (error.status) {
      case 401:
        // Token inválido o expirado - SOLO si no es login
        console.log('🔒 Token inválido o expirado, limpiando localStorage y redirigiendo');
        // ✅ LIMPIAR DIRECTAMENTE EL LOCALSTORAGE
        localStorage.removeItem('authState');
        router.navigate(['/login']);
        break;
        
      case 403:
        // Sin permisos
        console.log('⛔ Sin permisos para esta acción');
        router.navigate(['/unauthorized']);
        break;
        
      case 429:
        // Rate limiting
        console.log('⏰ Demasiadas requests, esperando...');
        break;
        
      case 0:
        // Error de red/CORS
        console.log('🌐 Error de conexión con el servidor');
        break;
        
      default:
        // Otros errores
        console.log('❌ Error no manejado:', error.status);
    }
  } else {
    // Para endpoints de auth, solo loggear el error sin cerrar sesión
    console.log('🔐 Error en endpoint de autenticación (no cerrando sesión):', error.status);
  }
  
  return throwError(() => error);
}