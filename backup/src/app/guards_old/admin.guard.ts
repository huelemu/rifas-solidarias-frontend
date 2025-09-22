// src/app/guards/admin.guard.ts - CORREGIDO
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    switchMap(isAuthenticated => {
      if (!isAuthenticated) {
        console.log('🔒 Usuario no autenticado, redirigiendo a login');
        router.navigate(['/login']);
        return of(false);
      }

      // Verificar si tiene rol de admin
      return authService.currentUser$.pipe(
        map(user => {
          const isAdmin = user && (user.rol === 'admin_global' || user.rol === 'admin_institucion');
          
          if (!isAdmin) {
            console.log('❌ Acceso denegado - Se requiere rol de administrador');
            router.navigate(['/dashboard']);
            return false;
          }

          console.log('✅ Acceso permitido - Usuario es administrador');
          return true;
        })
      );
    })
  );
};