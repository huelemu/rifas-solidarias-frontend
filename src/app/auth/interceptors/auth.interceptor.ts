// src/app/auth/interceptors/auth.interceptor.ts

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor funcional que maneja automáticamente:
 * - Agregado de tokens JWT a requests
 * - Manejo de errores de autenticación 401/403
 * - Redirección automática cuando el token expira
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Solo agregar token si es una request a nuestra API (EXCEPTO login y register)
  if (isApiRequest(req.url) && !isAuthEndpoint(req.url)) {
    const accessToken = authService.getAccessToken();
    
    if (accessToken) {
      // Clonar request y agregar Authorization header
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
      });
      
      console.log('🔑 AuthInterceptor: Token agregado a request', {
        url: req.url,
        method: req.method,
        hasToken: !!accessToken
      });
      
      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => handleAuthError(error, authService, router, req.url))
      );
    } else {
      console.log('⚠️ AuthInterceptor: No hay token disponible para request a API', req.url);
    }
  } else {
    console.log('📤 AuthInterceptor: Request sin token (auth endpoint o externa)', req.url);
  }
  
  // Para requests que no requieren token, continuar sin modificar
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => handleAuthError(error, authService, router, req.url))
  );
};

/**
 * Verifica si la request es hacia nuestra API
 */
function isApiRequest(url: string): boolean {
  // URLs que requieren autenticación
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
  // Endpoints que NO requieren token
  const authEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh'
  ];
  
  return authEndpoints.some(endpoint => url.includes(endpoint));
}

/**
 * Maneja errores de autenticación de forma centralizada
 */
function handleAuthError(
  error: HttpErrorResponse, 
  authService: AuthService, 
  router: Router,
  requestUrl: string
) {
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
        console.log('🔒 Token inválido o expirado, cerrando sesión');
        authService.logout();
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