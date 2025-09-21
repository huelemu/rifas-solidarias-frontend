import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService, User } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'rifas-solidarias-frontend';
  currentUser: User | null = null;
  isLoading = true;
  showNavigation = true;

  // Rutas donde no mostrar la navegación
  private hiddenNavRoutes = ['/login', '/register', '/dashboard'];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeApp();
    this.setupRouterEvents();
  }

  private initializeApp(): void {
    // Suscribirse al estado del usuario
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoading = false;
    });
  }

  private setupRouterEvents(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateNavigationVisibility(event.url);
      });
  }

  private updateNavigationVisibility(url: string): void {
    this.showNavigation = !this.hiddenNavRoutes.some(route => url.startsWith(route));
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getRoleIcon(role: string): string {
    const roleIcons: { [key: string]: string } = {
      'admin_global': '👑',
      'admin_institucion': '🏢',
      'vendedor': '💼',
      'comprador': '🛒'
    };
    return roleIcons[role] || '👤';
  }
}