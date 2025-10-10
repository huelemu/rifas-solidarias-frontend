// src/app/core/interceptors/notification.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';

export const notificationInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error) => {
      // Solo mostrar para errores 500 (errores de servidor)
      if (error.status >= 500) {
        notificationService.error(
          'Ocurrió un error en el servidor. Por favor intenta de nuevo.',
          'Error del servidor'
        );
      }

      // Solo mostrar para errores 401 (no autenticado) si no es la ruta de login
      if (error.status === 401 && !req.url.includes('/login')) {
        notificationService.warning(
          'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          'Sesión expirada'
        );
      }

      // Pasar el error al siguiente handler
      return throwError(() => error);
    })
  );
};