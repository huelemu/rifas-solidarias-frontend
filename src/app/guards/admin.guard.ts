// ===================================================================
// 👑 ADMIN GUARD - src/app/guards/admin.guard.ts
// ===================================================================

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, UserRole } from '../services/auth.service';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          console.log('🚫 Acceso denegado - Usuario no autenticado');
          this.router.navigate(['/login']);
          return false;
        }

        const user = this.authService.getCurrentUser();
        const isAdmin = user && (
          user.rol === UserRole.ADMIN_GLOBAL || 
          user.rol === UserRole.ADMIN_INSTITUCION
        );

        if (!isAdmin) {
          console.log('🚫 Acceso denegado - Requiere permisos de administrador');
          this.router.navigate(['/unauthorized']);
          return false;
        }

        console.log('✅ Acceso autorizado para administrador');
        return true;
      })
    );
  }
}