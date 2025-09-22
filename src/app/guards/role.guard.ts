// ====================================
// src/app/guards/role.guard.ts
// ====================================
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      const requiredRoles = route.data?.['roles'] as string[];
      
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      const hasRequiredRole = requiredRoles.includes(user.rol);
      
      if (!hasRequiredRole) {
        router.navigate(['/unauthorized']);
        return false;
      }

      return true;
    })
  );
};