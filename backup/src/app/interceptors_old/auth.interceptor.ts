// src/app/interceptors/auth.interceptor.ts - CORREGIDO
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Solo agregar token a requests de la API
  if (req.url.includes('localhost:3100') || req.url.includes('apirifas.huelemu.com.ar')) {
    const token = authService.getAccessToken();
    
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      
      return next(authReq).pipe(
        catchError(error => {
          // Si el token expiró, intentar renovarlo
          if (error.status === 401 && !req.url.includes('/auth/')) {
            return authService.refreshToken().pipe(
              switchMap(refreshResponse => {
                if (refreshResponse.success && refreshResponse.data) {
                  // Reintentar request con nuevo token
                  const newAuthReq = req.clone({
                    headers: req.headers.set('Authorization', `Bearer ${refreshResponse.data.access_token}`)
                  });
                  return next(newAuthReq);
                } else {
                  // Si no se pudo renovar, hacer logout
                  authService.logout();
                  return throwError(() => error);
                }
              })
            );
          }
          return throwError(() => error);
        })
      );
    }
  }
  
  return next(req);
};