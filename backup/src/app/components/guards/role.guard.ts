// src/app/guards/role.guard.ts - COMPLETAMENTE CORREGIDO
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, UserRoleType } from '../../services/auth.service';
import { map, switchMap } from 'rxjs/operators';
import { of, from } from 'rxjs';

export interface RoleGuardData {
  roles?: UserRoleType[];
  role?: UserRoleType;
  redirectTo?: string;
}

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Obtener configuración de roles desde route data
  const guardData = route.data as RoleGuardData;
  const requiredRoles = guardData.roles;
  const requiredRole = guardData.role;
  const redirectTo = guardData.redirectTo || '/dashboard';

  console.log('🔐 RoleGuard - Verificando acceso...', { requiredRoles, requiredRole });

  return authService.isAuthenticated$.pipe(
    switchMap(isAuthenticated => {
      if (!isAuthenticated) {
        console.log('🔒 Usuario no autenticado, redirigiendo a login');
        router.navigate(['/login']);
        return of(false);
      }

      // Obtener usuario actual de forma async
      return from(authService.getCurrentUser()).pipe(
        map(user => {
          if (!user) {
            console.log('❌ No se pudo obtener información del usuario');
            router.navigate(['/login']);
            return false;
          }

          console.log('👤 Usuario actual:', { email: user.email, rol: user.rol });

          // Verificar rol único
          if (requiredRole && user.rol !== requiredRole) {
            console.log(`❌ Acceso denegado - Requiere rol: ${requiredRole}, usuario tiene: ${user.rol}`);
            router.navigate([redirectTo]);
            return false;
          }

          // Verificar roles múltiples
          if (requiredRoles && !requiredRoles.includes(user.rol)) {
            console.log(`❌ Acceso denegado - Requiere roles: ${requiredRoles.join(', ')}, usuario tiene: ${user.rol}`);
            router.navigate([redirectTo]);
            return false;
          }

          console.log(`✅ Acceso permitido - Usuario: ${user.email}, Rol: ${user.rol}`);
          return true;
        })
      );
    })
  );
};