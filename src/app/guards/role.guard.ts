// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    const requiredRole = route.data['role'] as string;
    const requiredRoles = route.data['roles'] as string[];
    
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          console.log('🚫 Acceso denegado - Usuario no autenticado');
          this.router.navigate(['/login']);
          return false;
        }

        const user = this.authService.getCurrentUser();
        if (!user) {
          console.log('🚫 Acceso denegado - Sin datos de usuario');
          this.router.navigate(['/login']);
          return false;
        }

        // Verificar rol específico
        if (requiredRole && !this.authService.hasRole(requiredRole)) {
          console.log(`🚫 Acceso denegado - Requiere rol: ${requiredRole}, usuario tiene: ${user.rol}`);
          this.router.navigate(['/dashboard']);
          return false;
        }

        // Verificar múltiples roles
        if (requiredRoles && !this.authService.hasAnyRole(requiredRoles)) {
          console.log(`🚫 Acceso denegado - Requiere roles: ${requiredRoles.join(', ')}, usuario tiene: ${user.rol}`);
          this.router.navigate(['/dashboard']);
          return false;
        }

        console.log(`✅ Acceso permitido - Usuario: ${user.email}, Rol: ${user.rol}`);
        return true;
      })
    );
  }
}

