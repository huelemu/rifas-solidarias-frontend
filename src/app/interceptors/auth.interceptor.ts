// ====================================
// src/app/interceptors/auth.interceptor.ts
// ====================================
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, take } from 'rxjs/operators';
import { throwError, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No agregar token a ciertas rutas
  const skipAuth = ['/auth/login', '/auth/register', '/test-db'].some(url => 
    req.url.includes(url)
  );

  if (skipAuth) {
    return next(req);
  }

  // Agregar token si existe
  const token = authService.getAuthToken();
  let authReq = req;

  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Error 401: Token expirado o inválido
      if (error.status === 401) {
        console.warn('🔐 Token inválido o expirado');
        
        // Intentar refresh token si está disponible
        if (authService.getAuthToken() && !req.url.includes('/auth/refresh')) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Reintentar la petición original con el nuevo token
              const newToken = authService.getAuthToken();
              const retryReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${newToken}`)
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              console.error('❌ Error al renovar token:', refreshError);
              authService.logout();
              return throwError(() => error);
            })
          );
        } else {
          // No hay refresh token o ya estamos en refresh, hacer logout
          authService.logout();
          return throwError(() => error);
        }
      }

      // Error 403: Sin permisos
      if (error.status === 403) {
        console.warn('⛔ Sin permisos para esta acción');
        router.navigate(['/unauthorized']);
        return throwError(() => error);
      }

      // Error 423: Usuario bloqueado
      if (error.status === 423) {
        console.warn('🚫 Usuario bloqueado temporalmente');
        authService.logout();
        return throwError(() => error);
      }

      // Otros errores
      return throwError(() => error);
    })
  );
};