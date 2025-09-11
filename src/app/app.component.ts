// src/app/app.component.ts - NAVEGACIÓN ACTUALIZADA
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Navigation -->
      <nav class="navbar">
        <div class="nav-container">
          <!-- Brand -->
          <div class="nav-brand">
            <a routerLink="/" class="brand-link">
              <i class="fas fa-gift"></i>
              <span class="brand-text">Rifas Solidarias</span>
            </a>
          </div>
          
          <!-- Menu Principal -->
          <div class="nav-menu" [class.mobile-hidden]="!showMobileMenu">
            <!-- Rifas (Público) -->
            <a routerLink="/rifas" 
               routerLinkActive="active" 
               class="nav-link">
              <i class="fas fa-ticket-alt"></i>
              <span>Rifas</span>
            </a>
            
            <!-- Mi Cuenta (Solo autenticados) -->
            <div *ngIf="isLoggedIn()" class="nav-dropdown">
              <a routerLink="/mi-cuenta" 
                 routerLinkActive="active" 
                 class="nav-link dropdown-toggle">
                <i class="fas fa-user"></i>
                <span>Mi Cuenta</span>
                <i class="fas fa-chevron-down arrow"></i>
              </a>
              <div class="dropdown-menu">
                <a routerLink="/mi-cuenta" 
                   routerLinkActive="active" 
                   class="dropdown-item">
                  <i class="fas fa-tachometer-alt"></i>
                  Dashboard
                </a>
                <a routerLink="/mi-cuenta/mis-rifas" 
                   routerLinkActive="active" 
                   class="dropdown-item">
                  <i class="fas fa-history"></i>
                  Mis Rifas
                </a>
              </div>
            </div>
            
            <!-- Gestión de Rifas (Vendedores/Admins) -->
            <div *ngIf="canManageRifas()" class="nav-dropdown">
              <a href="#" class="nav-link dropdown-toggle">
                <i class="fas fa-cogs"></i>
                <span>Gestión</span>
                <i class="fas fa-chevron-down arrow"></i>
              </a>
              <div class="dropdown-menu">
                <a routerLink="/admin-rifas" 
                   routerLinkActive="active" 
                   class="dropdown-item">
                  <i class="fas fa-list"></i>
                  Mis Rifas
                </a>
                <a routerLink="/admin-rifas/crear" 
                   routerLinkActive="active" 
                   class="dropdown-item">
                  <i class="fas fa-plus"></i>
                  Crear Rifa
                </a>
              </div>
            </div>
            
            <!-- Administración (Solo admins) -->
            <div *ngIf="isAdmin()" class="nav-dropdown">
              <a href="#" class="nav-link dropdown-toggle">
                <i class="fas fa-shield-alt"></i>
                <span>Admin</span>
                <i class="fas fa-chevron-down arrow"></i>
              </a>
              <div class="dropdown-menu">
                <a routerLink="/admin" 
                   routerLinkActive="active" 
                   class="dropdown-item">
                  <i class="fas fa-tachometer-alt"></i>
                  Dashboard
                </a>
                <a routerLink="/admin/instituciones" 
                   routerLinkActive="active" 
                   class="dropdown-item">
                  <i class="fas fa-building"></i>
                  Instituciones
                </a>
                <a routerLink="/admin/usuarios" 
                   routerLinkActive="active" 
                   class="dropdown-item">
                  <i class="fas fa-users"></i>
                  Usuarios
                </a>
                <div class="dropdown-divider"></div>
                <a routerLink="/diagnostico" 
                   routerLinkActive="active" 
                   class="dropdown-item">
                  <i class="fas fa-bug"></i>
                  Diagnóstico
                </a>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="nav-actions">
            <!-- Usuario no autenticado -->
            <div *ngIf="!isLoggedIn()" class="auth-actions">
              <a routerLink="/login" class="btn-login">
                <i class="fas fa-sign-in-alt"></i>
                <span>Ingresar</span>
              </a>
            </div>
            
            <!-- Usuario autenticado -->
            <div *ngIf="isLoggedIn()" class="user-menu">
              <div class="user-info">
                <div class="user-avatar">
                  <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-details">
                  <span class="user-name">{{ getUserName() }}</span>
                  <span class="user-role">{{ getUserRole() }}</span>
                </div>
              </div>
              
              <button (click)="logout()" 
                      class="btn-logout" 
                      title="Cerrar sesión">
                <i class="fas fa-sign-out-alt"></i>
                <span class="logout-text">Salir</span>
              </button>
            </div>
            
            <!-- Mobile menu toggle -->
            <button class="mobile-menu-btn" 
                    (click)="toggleMobileMenu()"
                    [class.active]="showMobileMenu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-content">
          <div class="footer-section">
            <h4>Rifas Solidarias</h4>
            <p>Plataforma para la gestión de rifas benéficas y solidarias.</p>
          </div>
          
          <div class="footer-section">
            <h4>Enlaces</h4>
            <ul>
              <li><a routerLink="/rifas">Rifas Activas</a></li>
              <li><a routerLink="/login" *ngIf="!isLoggedIn()">Ingresar</a></li>
              <li><a routerLink="/mi-cuenta" *ngIf="isLoggedIn()">Mi Cuenta</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Contacto</h4>
            <p>Email: info@rifassolidarias.com</p>
            <p>Teléfono: +54 11 1234-5678</p>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2025 Rifas Solidarias. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* ================================ */
    /* NAVBAR */
    /* ================================ */
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 15px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      min-height: 70px;
    }

    /* Brand */
    .nav-brand {
      flex-shrink: 0;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: white;
      font-size: 1.5em;
      font-weight: 700;
      transition: opacity 0.3s ease;
    }

    .brand-link:hover {
      opacity: 0.9;
    }

    .brand-link i {
      font-size: 1.3em;
    }

    /* Navigation Menu */
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 35px;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      text-decoration: none;
      padding: 12px 16px;
      border-radius: 10px;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
    }

    .nav-link:hover,
    .nav-link.active {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
    }

    /* Dropdowns */
    .nav-dropdown {
      position: relative;
    }

    .dropdown-toggle {
      cursor: pointer;
    }

    .dropdown-toggle .arrow {
      font-size: 0.8em;
      margin-left: 4px;
      transition: transform 0.3s ease;
    }

    .nav-dropdown:hover .arrow {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      min-width: 220px;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      padding: 8px 0;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1000;
    }

    .nav-dropdown:hover .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      color: #333;
      text-decoration: none;
      transition: background 0.3s ease;
      font-weight: 500;
    }

    .dropdown-item:hover,
    .dropdown-item.active {
      background: #f8f9ff;
      color: #667eea;
    }

    .dropdown-item i {
      width: 16px;
      text-align: center;
    }

    .dropdown-divider {
      height: 1px;
      background: #e0e0e0;
      margin: 8px 0;
    }

    /* User Actions */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-shrink: 0;
    }

    .btn-login {
      background: rgba(255,255,255,0.15);
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .btn-login:hover {
      background: rgba(255,255,255,0.25);
      transform: translateY(-1px);
    }

    /* User Menu */
    .user-menu {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.15);
      border-radius: 50%;
      backdrop-filter: blur(10px);
    }

    .user-avatar i {
      font-size: 1.5em;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.95em;
    }

    .user-role {
      font-size: 0.8em;
      opacity: 0.8;
      text-transform: capitalize;
    }

    .btn-logout {
      background: rgba(255,255,255,0.15);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .btn-logout:hover {
      background: rgba(255,255,255,0.25);
    }

    /* Mobile Menu */
    .mobile-menu-btn {
      display: none;
      flex-direction: column;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      gap: 4px;
    }

    .mobile-menu-btn span {
      width: 25px;
      height: 3px;
      background: white;
      transition: all 0.3s ease;
      border-radius: 2px;
    }

    .mobile-menu-btn.active span:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }

    .mobile-menu-btn.active span:nth-child(2) {
      opacity: 0;
    }

    .mobile-menu-btn.active span:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }

    /* ================================ */
    /* MAIN CONTENT */
    /* ================================ */
    .main-content {
      flex: 1;
      background: #f8f9fa;
    }

    /* ================================ */
    /* FOOTER */
    /* ================================ */
    .footer {
      background: #2c3e50;
      color: white;
      padding: 40px 20px 20px 20px;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }

    .footer-section h4 {
      margin: 0 0 15px 0;
      color: #ecf0f1;
      font-size: 1.2em;
    }

    .footer-section p {
      margin: 8px 0;
      opacity: 0.9;
      line-height: 1.5;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-section ul li {
      margin: 8px 0;
    }

    .footer-section ul li a {
      color: white;
      text-decoration: none;
      opacity: 0.9;
      transition: opacity 0.3s ease;
    }

    .footer-section ul li a:hover {
      opacity: 1;
    }

    .footer-bottom {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      text-align: center;
      opacity: 0.8;
    }

    /* ================================ */
    /* RESPONSIVE */
    /* ================================ */
    @media (max-width: 768px) {
      .nav-container {
        padding: 0 15px;
        flex-wrap: wrap;
        min-height: 60px;
      }

      .brand-text {
        display: none;
      }

      .nav-menu {
        display: none;
        width: 100%;
        flex-direction: column;
        gap: 0;
        background: rgba(0,0,0,0.1);
        border-radius: 10px;
        margin-top: 15px;
        padding: 15px;
        backdrop-filter: blur(10px);
      }

      .nav-menu.mobile-hidden {
        display: none;
      }

      .nav-menu:not(.mobile-hidden) {
        display: flex;
      }

      .nav-link {
        width: 100%;
        justify-content: flex-start;
        padding: 15px;
        border-radius: 8px;
      }

      .nav-dropdown .dropdown-menu {
        position: static;
        opacity: 1;
        visibility: visible;
        transform: none;
        box-shadow: none;
        background: rgba(255,255,255,0.1);
        margin-left: 20px;
        margin-top: 10px;
      }

      .nav-dropdown .dropdown-item {
        color: white;
        padding: 10px 15px;
      }

      .nav-dropdown .dropdown-item:hover {
        background: rgba(255,255,255,0.1);
        color: white;
      }

      .mobile-menu-btn {
        display: flex;
      }

      .user-details {
        display: none;
      }

      .logout-text {
        display: none;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 20px;
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .nav-container {
        padding: 0 10px;
      }

      .user-menu {
        gap: 10px;
      }

      .btn-login span,
      .nav-link span {
        display: none;
      }
    }
  `]
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

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.rol === 'admin_global' || user?.rol === 'admin_institucion';
  }

  canManageRifas(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.rol === 'admin_global' || 
           user?.rol === 'admin_institucion' || 
           user?.rol === 'vendedor';
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.nombre || 'Usuario';
  }

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

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        // Logout local si falla el servidor
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/']);
      }
    });
  }
}