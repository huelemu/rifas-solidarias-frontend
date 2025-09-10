// src/app/guards/admin.guard.ts - VERSIÓN SIMPLE
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasAdminAccess = this.authService.hasAnyRole(['admin_global', 'admin_institucion']);
    
    if (!hasAdminAccess) {
      console.log('🚫 Acceso denegado - Requiere permisos de administrador');
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}