// src/app/guards/admin.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const adminGuard = (p0: unknown) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
      }
      
      const user = authService.getCurrentUser();
      const isAdmin = user && (user.rol === 'admin_global' || user.rol === 'admin_institucion');
      
      if (!isAdmin) {
        router.navigate(['/unauthorized']);
        return false;
      }
      
      return true;
    })
  );
};