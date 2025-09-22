// ====================================
// src/app/app.component.ts
// ====================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { EnvironmentDetector } from './utils/environment-detector';

// Layout components
import { HeaderComponent } from './components/layout/header/header.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { FooterComponent } from './components/layout/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  template: `
    <div class="app-container">
      <!-- Header -->
      <app-header></app-header>
      
      <!-- Main content area -->
      <div class="main-content" [class.with-sidebar]="showSidebar">
        <!-- Sidebar -->
        <app-sidebar *ngIf="showSidebar" class="sidebar"></app-sidebar>
        
        <!-- Page content -->
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
      
      <!-- Footer -->
      <app-footer></app-footer>
      
      <!-- Environment indicator (solo en desarrollo) -->
      <div *ngIf="showEnvironmentIndicator" class="environment-indicator">
        <span class="environment-badge">{{ environmentInfo.isLocalhost ? 'DEV' : 'PROD' }}</span>
        <span class="api-url">{{ environmentInfo.apiUrl }}</span>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #f8fafc;
    }

    .main-content {
      display: flex;
      flex: 1;
      transition: all 0.3s ease;
    }

    .main-content.with-sidebar {
      margin-left: 0;
    }

    .sidebar {
      width: 250px;
      min-width: 250px;
      background: white;
      border-right: 1px solid #e2e8f0;
      z-index: 100;
    }

    .content {
      flex: 1;
      padding: 1rem;
      overflow-x: hidden;
    }

    .environment-indicator {
      position: fixed;
      bottom: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 9999;
    }

    .environment-badge {
      background: #10b981;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: bold;
    }

    .environment-badge.dev {
      background: #f59e0b;
    }

    .api-url {
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .main-content.with-sidebar .sidebar {
        position: fixed;
        top: 64px;
        left: -250px;
        height: calc(100vh - 64px);
        transition: left 0.3s ease;
      }

      .main-content.with-sidebar.sidebar-open .sidebar {
        left: 0;
      }

      .content {
        padding: 0.5rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Rifas Solidarias';
  
  showSidebar = false;
  showEnvironmentIndicator = false;
  environmentInfo: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Configurar sidebar basado en autenticación
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.showSidebar = isAuth;
    });

    // Obtener información del entorno
    this.environmentInfo = EnvironmentDetector.getEnvironmentInfo();
    this.showEnvironmentIndicator = !this.environmentInfo.isProduction;

    console.log('🚀 App iniciada:', this.title);
    console.log('🌍 Entorno:', this.environmentInfo);
  }
}