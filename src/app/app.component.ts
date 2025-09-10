// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Rifas Solidarias';
  currentUser: User | null = null;
  isAuthenticated = false;
  isMenuOpen = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios de autenticación
    this.subscriptions.push(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      })
    );

    // Suscribirse a cambios de usuario
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
    this.closeMenu();
  }

  goToDashboard(): void {
    this.authService.redirectToDashboard();
    this.closeMenu();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Logout exitoso');
      },
      error: (error) => {
        console.error('❌ Error en logout:', error);
      }
    });
    this.closeMenu();
  }

getRoleDisplayName(role: string): string {
  const roleNames: { [key: string]: string } = { 
    'admin_global': 'Admin Global',
    'admin_institucion': 'Admin Institución', 
    'vendedor': 'Vendedor',
    'comprador': 'Comprador'
  };
  return roleNames[role] || role;
}

  canAccessSection(section: string): boolean {
    if (!this.isAuthenticated) return false;

    switch (section) {
      case 'instituciones':
        return this.authService.hasAnyRole(['admin_global', 'admin_institucion']);
      case 'usuarios':
        return this.authService.hasAnyRole(['admin_global', 'admin_institucion']);
      case 'rifas':
        return true; // Todos los usuarios autenticados pueden ver rifas
      case 'admin':
        return this.authService.hasRole('admin_global');
      default:
        return true;
    }
  }
}

