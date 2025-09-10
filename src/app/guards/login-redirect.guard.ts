// src/app/guards/login-redirect.guard.ts - VERSIÓN SIMPLE
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginRedirectGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      console.log('👤 Usuario ya autenticado, redirigiendo al dashboard');
      this.authService.redirectToDashboard();
      return false;
    }
    return true;
  }
}
