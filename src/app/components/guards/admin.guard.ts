// admin.guard.ts - Guard específico para administradores
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators';

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
          this.router.navigate(['/login']);
          return false;
        }

        const hasAdminAccess = this.authService.hasAnyRole(['admin_global', 'admin_institucion']);
        
        if (!hasAdminAccess) {
          console.log('🚫 Acceso denegado - Requiere permisos de administrador');
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
}