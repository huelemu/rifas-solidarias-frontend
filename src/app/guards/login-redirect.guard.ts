// ====================================
// src/app/guards/login-redirect.guard.ts
// ====================================
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const loginRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        // Usuario ya autenticado, redirigir al dashboard
        authService.redirectAfterLogin();
        return false;
      } else {
        // Usuario no autenticado, permitir acceso a login/register
        return true;
      }
    })
  );
};
