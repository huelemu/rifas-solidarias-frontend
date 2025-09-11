// src/app/app.component.ts - CORREGIDO PARA TU AUTHSERVICE ACTUAL
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'rifas-frontend';
  showMobileMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Cerrar menú móvil al navegar
    this.router.events.subscribe(() => {
      this.showMobileMenu = false;
    });
  }

  // ✅ USAR MÉTODO CORRECTO DE TU AUTHSERVICE
  isLoggedIn(): boolean {
    return this.authService.isAuthenticated(); // ← Cambio aquí
  }

  // ✅ VERIFICAR SI ES ADMIN - MÉTODOS COMPATIBLES
  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.rol === 'admin_global' || user?.rol === 'admin_institucion';
  }

  // ✅ VERIFICAR SI PUEDE GESTIONAR RIFAS
  canManageRifas(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.rol === 'admin_global' || 
           user?.rol === 'admin_institucion' || 
           user?.rol === 'vendedor';
  }

  // ✅ OBTENER NOMBRE DEL USUARIO
  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.nombre || 'Usuario';
  }

  // ✅ OBTENER ROL DEL USUARIO
  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    const roleLabels: { [key: string]: string } = {
      'admin_global': 'Administrador',
      'admin_institucion': 'Admin Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Comprador'
    };
    return roleLabels[user?.rol || ''] || 'Usuario';
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  // ✅ LOGOUT ADAPTADO A TU AUTHSERVICE
  logout() {
    // Tu AuthService tiene logout() que devuelve Observable
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Logout exitoso');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.log('⚠️ Error en logout, limpiando localmente:', error);
        // Fallback: limpiar localStorage directamente
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        this.router.navigate(['/']);
      }
    });
  }
}