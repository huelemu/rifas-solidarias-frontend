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
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        
        <!-- Logo y título -->
        <div class="navbar-brand" routerLink="/">
          <div class="logo">🎲</div>
          <div class="brand-text">
            <span class="brand-title">Rifas Solidarias</span>
            <span class="brand-subtitle">Huelemu</span>
          </div>
        </div>

        <!-- Menú hamburguesa para móvil -->
        <button 
          class="mobile-menu-btn"
          (click)="toggleMobileMenu()"
          [class.active]="mobileMenuOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <!-- Enlaces de navegación -->
        <div class="navbar-menu" [class.active]="mobileMenuOpen">
          
          <!-- Enlaces principales -->
          <div class="navbar-links">
            
            <!-- Inicio -->
            <a 
              routerLink="/" 
              routerLinkActive="active"
              [routerLinkActiveOptions]="{exact: true}"
              class="nav-link"
              (click)="closeMobileMenu()">
              <span class="nav-icon">🏠</span>
              <span class="nav-text">Inicio</span>
            </a>

            <!-- Rifas (siempre visible) -->
            <a 
              routerLink="/rifas" 
              routerLinkActive="active"
              class="nav-link"
              (click)="closeMobileMenu()">
              <span class="nav-icon">🎲</span>
              <span class="nav-text">Rifas</span>
            </a>

            <!-- Crear Rifa (solo si está autenticado) -->
            <a 
              *ngIf="isAuthenticated"
              routerLink="/rifas/crear" 
              routerLinkActive="active"
              class="nav-link nav-link-create"
              (click)="closeMobileMenu()">
              <span class="nav-icon">➕</span>
              <span class="nav-text">Crear Rifa</span>
            </a>

            <!-- Dashboard (solo si está autenticado) -->
            <a 
              *ngIf="isAuthenticated"
              routerLink="/dashboard" 
              routerLinkActive="active"
              class="nav-link"
              (click)="closeMobileMenu()">
              <span class="nav-icon">📊</span>
              <span class="nav-text">Dashboard</span>
            </a>

            <!-- Administración (solo para admins) -->
            <div *ngIf="isAdmin" class="nav-dropdown">
              <button 
                class="nav-link dropdown-toggle"
                (click)="toggleAdminDropdown()"
                [class.active]="adminDropdownOpen">
                <span class="nav-icon">⚙️</span>
                <span class="nav-text">Administrar</span>
                <span class="dropdown-arrow">{{ adminDropdownOpen ? '▼' : '▶' }}</span>
              </button>
              
              <div class="dropdown-menu" [class.show]="adminDropdownOpen">
                <a 
                  routerLink="/instituciones" 
                  routerLinkActive="active"
                  class="dropdown-link"
                  (click)="closeMobileMenu()">
                  <span class="nav-icon">🏢</span>
                  <span class="nav-text">Instituciones</span>
                </a>
                
                <a 
                  routerLink="/usuarios" 
                  routerLinkActive="active"
                  class="dropdown-link"
                  (click)="closeMobileMenu()">
                  <span class="nav-icon">👥</span>
                  <span class="nav-text">Usuarios</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Usuario y acciones -->
          <div class="navbar-user">
            
            <!-- Si está autenticado -->
            <div *ngIf="isAuthenticated && currentUser" class="user-menu">
              <div class="user-info" (click)="toggleUserDropdown()">
                <div class="user-avatar">{{ getUserInitials() }}</div>
                <div class="user-details">
                  <span class="user-name">{{ currentUser.nombre }} {{ currentUser.apellido }}</span>
                  <span class="user-role">{{ getRoleText(currentUser.rol) }}</span>
                </div>
                <span class="dropdown-arrow">{{ userDropdownOpen ? '▼' : '▶' }}</span>
              </div>
              
              <div class="dropdown-menu user-dropdown" [class.show]="userDropdownOpen">
                <div class="dropdown-header">
                  <div class="user-email">{{ currentUser.email }}</div>
                  <div class="user-role-info">{{ getRoleText(currentUser.rol) }}</div>
                </div>
                
                <div class="dropdown-divider"></div>
                
                <a routerLink="/dashboard" class="dropdown-link" (click)="closeMobileMenu()">
                  <span class="nav-icon">📊</span>
                  <span class="nav-text">Mi Dashboard</span>
                </a>
                
                <a routerLink="/rifas/crear" class="dropdown-link" (click)="closeMobileMenu()">
                  <span class="nav-icon">➕</span>
                  <span class="nav-text">Nueva Rifa</span>
                </a>
                
                <div class="dropdown-divider"></div>
                
                <button class="dropdown-link logout-btn" (click)="logout()">
                  <span class="nav-icon">🚪</span>
                  <span class="nav-text">Cerrar Sesión</span>
                </button>
              </div>
            </div>

            <!-- Si no está autenticado -->
            <div *ngIf="!isAuthenticated" class="auth-buttons">
              <a 
                routerLink="/login" 
                routerLinkActive="active"
                class="nav-link login-btn"
                (click)="closeMobileMenu()">
                <span class="nav-icon">🔐</span>
                <span class="nav-text">Iniciar Sesión</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-decoration: none;
      color: white;
      transition: transform 0.2s ease;
    }

    .navbar-brand:hover {
      transform: scale(1.02);
    }

    .logo {
      font-size: 2rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 1.4rem;
      font-weight: 700;
      line-height: 1;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .brand-subtitle {
      font-size: 0.9rem;
      opacity: 0.9;
      font-weight: 400;
      margin-top: -2px;
    }

    .mobile-menu-btn {
      display: none;
      flex-direction: column;
      justify-content: center;
      width: 30px;
      height: 30px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }

    .mobile-menu-btn span {
      width: 25px;
      height: 3px;
      background: white;
      margin: 2px 0;
      transition: 0.3s;
      border-radius: 2px;
    }

    .mobile-menu-btn.active span:nth-child(1) {
      transform: rotate(-45deg) translate(-5px, 6px);
    }

    .mobile-menu-btn.active span:nth-child(2) {
      opacity: 0;
    }

    .mobile-menu-btn.active span:nth-child(3) {
      transform: rotate(45deg) translate(-5px, -6px);
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 30px;
      flex: 1;
      justify-content: space-between;
      margin-left: 50px;
    }

    .navbar-links {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 25px;
      text-decoration: none;
      color: white;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
      white-space: nowrap;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    .nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .nav-link-create {
      background: rgba(255, 255, 255, 0.15);
      font-weight: 600;
    }

    .nav-link-create:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .nav-icon {
      font-size: 1.1rem;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }

    .nav-text {
      font-size: 0.95rem;
    }

    .nav-dropdown {
      position: relative;
    }

    .dropdown-toggle {
      background: none;
      border: none;
      cursor: pointer;
    }

    .dropdown-arrow {
      font-size: 0.8rem;
      margin-left: 5px;
      transition: transform 0.2s ease;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1001;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      color: #333;
      text-decoration: none;
      transition: background 0.2s ease;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .dropdown-link:hover {
      background: #f8f9fa;
    }

    .dropdown-link:first-child {
      border-radius: 12px 12px 0 0;
    }

    .dropdown-link:last-child {
      border-radius: 0 0 12px 12px;
    }

    .navbar-user {
      display: flex;
      align-items: center;
    }

    .user-menu {
      position: relative;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 25px;
      transition: background 0.2s ease;
    }

    .user-info:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .user-details {
      display: flex;
      flex-direction: column;
      color: white;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
      line-height: 1.2;
    }

    .user-role {
      font-size: 0.8rem;
      opacity: 0.8;
      text-transform: capitalize;
    }

    .user-dropdown {
      right: 0;
      left: auto;
      min-width: 250px;
    }

    .dropdown-header {
      padding: 16px;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 12px 12px 0 0;
    }

    .user-email {
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }

    .user-role-info {
      font-size: 0.8rem;
      color: #888;
      margin-top: 4px;
      text-transform: capitalize;
    }

    .dropdown-divider {
      height: 1px;
      background: #e9ecef;
      margin: 0;
    }

    .logout-btn {
      color: #dc3545;
      font-weight: 500;
    }

    .logout-btn:hover {
      background: #f8d7da;
    }

    .auth-buttons .login-btn {
      background: rgba(255, 255, 255, 0.15);
      font-weight: 600;
    }

    .auth-buttons .login-btn:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .navbar-container {
        padding: 0 15px;
        height: 60px;
      }

      .mobile-menu-btn {
        display: flex;
      }

      .navbar-menu {
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        flex-direction: column;
        padding: 20px;
        gap: 0;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        margin-left: 0;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .navbar-menu.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .navbar-links {
        flex-direction: column;
        width: 100%;
        gap: 8px;
        margin-bottom: 20px;
      }

      .nav-link {
        width: 100%;
        justify-content: flex-start;
        padding: 15px 20px;
        border-radius: 12px;
      }

      .navbar-user {
        width: 100%;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        padding-top: 20px;
      }

      .user-info {
        width: 100%;
        justify-content: flex-start;
        padding: 15px 20px;
        border-radius: 12px;
      }

      .dropdown-menu {
        position: static;
        opacity: 1;
        visibility: visible;
        transform: none;
        box-shadow: none;
        background: rgba(255, 255, 255, 0.1);
        margin-top: 10px;
      }

      .dropdown-link {
        color: white;
        padding: 12px 20px;
      }

      .dropdown-link:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .dropdown-header {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-bottom-color: rgba(255, 255, 255, 0.2);
      }

      .user-email {
        color: rgba(255, 255, 255, 0.9);
      }

      .user-role-info {
        color: rgba(255, 255, 255, 0.7);
      }

      .logout-btn {
        color: #ffcccb;
      }

      .brand-text {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .navbar-container {
        padding: 0 10px;
      }

      .brand-title {
        font-size: 1.2rem;
      }

      .nav-text {
        font-size: 0.9rem;
      }
    }
  `]
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