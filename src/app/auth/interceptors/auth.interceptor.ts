// src/app/auth/interceptors/auth.interceptor.ts - CORREGIDO

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Interceptor de autenticación sin dependencia circular
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ✅ INYECTAR ROUTER AQUÍ EN EL CONTEXTO CORRECTO
  const router = inject(Router);
  
  console.log('📤 AuthInterceptor: Interceptando request:', req.url);

  // Solo agregar token a requests de nuestra API
  if (isApiRequest(req.url) && !isAuthEndpoint(req.url)) {
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
        catchError((error: HttpErrorResponse) => handleAuthError(error, req.url, router))
      );
    } else {
      console.log('⚠️ AuthInterceptor: No hay token válido disponible');
    }
  } else {
    console.log('📤 AuthInterceptor: Request sin token');
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => handleAuthError(error, req.url, router))
  );
};

/**
 * Obtener estado de auth del localStorage
 */
function getAuthStateFromStorage(): any {
  try {
    const authState = localStorage.getItem('authState');
    return authState ? JSON.parse(authState) : null;
  } catch (error) {
    console.error('Error leyendo authState:', error);
    return null;
  }
}

/**
 * Validar token
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
 * Verifica si es request a nuestra API
 */
function isApiRequest(url: string): boolean {
  const apiPatterns = [
    'localhost:3100',
    'apirifas.huelemu.com.ar'
  ];
  
  return apiPatterns.some(pattern => url.includes(pattern));
}

/**
 * Verifica si es endpoint de autenticación
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
 * Maneja errores - AHORA RECIBE ROUTER COMO PARÁMETRO
 */
function handleAuthError(error: HttpErrorResponse, requestUrl: string, router: Router) {
  console.error('🚨 AuthInterceptor: Error en request', {
    status: error.status,
    url: requestUrl,
    message: error.message
  });

  // Solo manejar errores de autenticación si NO es endpoint de login
  if (!isAuthEndpoint(requestUrl)) {
    switch (error.status) {
      case 401:
        console.log('🔒 Token inválido, limpiando y redirigiendo');
        localStorage.removeItem('authState');
        router.navigate(['/login']);
        break;
        
      case 403:
        console.log('⛔ Sin permisos');
        router.navigate(['/dashboard']);
        break;
        
      case 0:
        console.log('🌐 Error de conexión con el servidor');
        break;
    }
  }
  
  return throwError(() => error);
}