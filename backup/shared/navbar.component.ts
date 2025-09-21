// src/app/components/shared/navbar.component.ts - LIMPIO SIN ERRORES
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isAdmin = false;
  currentUser: User | null = null;
  mobileMenuOpen = false;
  adminDropdownOpen = false;
  userDropdownOpen = false;
  
  private authSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authSubscription.add(
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.currentUser = this.authService.getCurrentUser();
          this.isAdmin = this.checkIsAdmin();
        } else {
          this.currentUser = null;
          this.isAdmin = false;
        }
      })
    );

    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.currentUser = this.authService.getCurrentUser();
      this.isAdmin = this.checkIsAdmin();
    }
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

  checkIsAdmin(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.rol === 'admin_global' || this.currentUser.rol === 'admin_institucion';
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.adminDropdownOpen = false;
      this.userDropdownOpen = false;
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    this.adminDropdownOpen = false;
    this.userDropdownOpen = false;
  }

  toggleAdminDropdown() {
    this.adminDropdownOpen = !this.adminDropdownOpen;
    this.userDropdownOpen = false;
  }

  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
    this.adminDropdownOpen = false;
  }

  getUserInitials(): string {
    if (!this.currentUser) return '?';
    const nombre = this.currentUser.nombre?.charAt(0) || '';
    const apellido = this.currentUser.apellido?.charAt(0) || '';
    return (nombre + apellido).toUpperCase();
  }

  getRoleText(rol: string): string {
    const roles: Record<string, string> = {
      'admin_global': 'Admin Global',
      'admin_institucion': 'Admin Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Comprador'
    };
    return roles[rol] || rol;
  }

  async logout() {
    try {
      await this.authService.logout();
      this.closeMobileMenu();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  closeDropdowns() {
    this.adminDropdownOpen = false;
    this.userDropdownOpen = false;
  }
}