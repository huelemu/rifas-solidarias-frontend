// src/app/dashboard/dashboard.component.ts - VERSIÓN COMPLETA CON RIFAS HABILITADO

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>🎯 Rifas Solidarias</h1>
          <div class="user-info">
            <span class="welcome-text">Bienvenido, {{ authService.currentUser()?.name }}!</span>
            <button (click)="logout()" class="logout-button">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <div class="welcome-card">
          <h2>Dashboard Principal</h2>
          <p>Sistema de gestión de rifas solidarias</p>
          
          <!-- Estado de conexión -->
          <div class="connection-status" [class]="getConnectionStatusClass()">
            <span class="status-indicator"></span>
            <span>{{ getConnectionStatusText() }}</span>
          </div>
          
          <div class="user-details">
            <h3>📋 Información del Usuario</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Nombre:</label>
                <span>{{ authService.currentUser()?.name }}</span>
              </div>
              <div class="info-item">
                <label>Email:</label>
                <span>{{ authService.currentUser()?.email }}</span>
              </div>
              <div class="info-item">
                <label>ID de Usuario:</label>
                <span>{{ authService.currentUser()?.id }}</span>
              </div>
              <div class="info-item">
                <label>Rol:</label>
                <span class="role-badge" [class]="getRoleClass()">
                  {{ getRoleLabel() }}
                </span>
              </div>
              @if (authService.currentUser()?.institucion) {
                <div class="info-item">
                  <label>Institución:</label>
                  <span>{{ authService.currentUser()?.institucion?.nombre }}</span>
                </div>
              }
            </div>
          </div>

          <!-- MÓDULOS PRINCIPALES -->
          <div class="modules-section">
            <h3>📋 Módulos del Sistema</h3>
            <div class="actions-grid">
              
              <!-- MÓDULO DE GESTIÓN DE USUARIOS -->
              <div class="action-card">
                <div class="card-header">
                  <h4>👥 Gestión de Usuarios</h4>
                  <span class="status-badge active">Activo</span>
                </div>
                <p>Administrar usuarios del sistema</p>
                <ul class="feature-list">
                  <li>✅ CRUD completo de usuarios</li>
                  <li>✅ Asignación de roles</li>
                  <li>✅ Filtros y búsquedas</li>
                  <li>✅ Validaciones completas</li>
                </ul>
                <button 
                  (click)="goToUsers()" 
                  class="action-button"
                  [disabled]="!canManageUsers()"
                  [title]="!canManageUsers() ? 'No tienes permisos para gestionar usuarios' : ''"
                >
                  {{ canManageUsers() ? '👥 Gestionar Usuarios' : '🔒 Sin permisos' }}
                </button>
              </div>

              <!-- MÓDULO DE GESTIÓN DE INSTITUCIONES -->
              <div class="action-card">
                <div class="card-header">
                  <h4>🏢 Gestión de Instituciones</h4>
                  <span class="status-badge active">Activo</span>
                </div>
                <p>Administrar instituciones participantes</p>
                <ul class="feature-list">
                  <li>✅ CRUD de instituciones</li>
                  <li>✅ Configuración de parámetros</li>
                  <li>✅ Gestión de participaciones</li>
                  <li>✅ Reportes institucionales</li>
                </ul>
                <button 
                  (click)="goToInstitutions()" 
                  class="action-button"
                  [disabled]="!canManageInstitutions()"
                  [title]="!canManageInstitutions() ? 'No tienes permisos para gestionar instituciones' : ''"
                >
                  {{ canManageInstitutions() ? '🏢 Gestionar Instituciones' : '🔒 Sin permisos' }}
                </button>
              </div>

              <!-- MÓDULO DE RIFAS - CORE DEL NEGOCIO - ¡AHORA HABILITADO! -->
              <div class="action-card featured">
                <div class="card-header">
                  <h4>🎫 Sistema de Rifas</h4>
                  <span class="status-badge active">¡ACTIVO!</span>
                </div>
                <p class="card-description">Crear y gestionar rifas solidarias</p>
                <div class="feature-list">
                  <div class="feature-item">✅ Crear y editar rifas</div>
                  <div class="feature-item">✅ Gestión de números</div>
                  <div class="feature-item">✅ Sistema de ventas</div>
                  <div class="feature-item">✅ Reportes y estadísticas</div>
                </div>
                <div class="button-group">
                  <button (click)="goToRifasList()" class="action-button featured">
                    📋 Ver Rifas
                  </button>
                  <button 
                    (click)="goToCreateRifa()" 
                    class="action-button secondary"
                    [disabled]="!canCreateRifas()"
                    [title]="!canCreateRifas() ? 'No tienes permisos para crear rifas' : ''"
                  >
                    ➕ Crear Rifa
                  </button>
                  <button (click)="goToPublicRifas()" class="action-button outline">
                    🌐 Rifas Públicas
                  </button>
                </div>
              </div>

              <!-- MÓDULO DE REPORTES -->
              <div class="action-card">
                <div class="card-header">
                  <h4>📊 Reportes y Estadísticas</h4>
                  <span class="status-badge active">Activo</span>
                </div>
                <p>Análisis y estadísticas del sistema</p>
                <ul class="feature-list">
                  <li>✅ Dashboard de ventas</li>
                  <li>✅ Reportes por institución</li>
                  <li>✅ Análisis de rendimiento</li>
                  <li>✅ Exportación de datos</li>
                </ul>
                <button (click)="goToReports()" class="action-button">
                  📈 Ver Reportes
                </button>
              </div>

              <!-- MÓDULO DE DIAGNÓSTICO -->
              <div class="action-card">
                <div class="card-header">
                  <h4>🔧 Diagnóstico del Sistema</h4>
                  <span class="status-badge active">Activo</span>
                </div>
                <p>Testing y debugging del sistema</p>
                <ul class="feature-list">
                  <li>✅ Estado de conexiones</li>
                  <li>✅ Tests de endpoints</li>
                  <li>✅ Logs del sistema</li>
                  <li>✅ Métricas de rendimiento</li>
                </ul>
                <button (click)="goToDiagnostic()" class="action-button">
                  🔧 Diagnóstico
                </button>
              </div>
            </div>
          </div>

          <!-- Información técnica -->
          <div class="tech-info">
            <h3>🔧 Información Técnica</h3>
            <div class="tech-grid">
              <div class="tech-item">
                <label>Backend:</label>
                <span class="tech-value">{{ getBackendUrl() }}</span>
              </div>
              <div class="tech-item">
                <label>Autenticación:</label>
                <span class="tech-value">JWT ✅</span>
              </div>
              <div class="tech-item">
                <label>Frontend:</label>
                <span class="tech-value">Angular 20 Standalone</span>
              </div>
              <div class="tech-item">
                <label>Token válido:</label>
                <span class="tech-value" [class]="authService.isAuthenticated() ? 'success' : 'error'">
                  {{ authService.isAuthenticated() ? 'Sí ✅' : 'No ❌' }}
                </span>
              </div>
              <div class="tech-item">
                <label>Módulos:</label>
                <span class="tech-value">Login ✅, Usuarios ✅, Instituciones ✅, Rifas ✅, Dashboard ✅</span>
              </div>
              <div class="tech-item">
                <label>Permisos:</label>
                <span class="tech-value">
                  {{ canManageUsers() ? 'Admin ✅' : 'Usuario estándar' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="quick-actions">
            <h3>⚡ Acciones Rápidas</h3>
            <div class="quick-buttons">
              @if (canManageUsers()) {
                <button (click)="goToUsers()" class="quick-btn">
                  👥 Ver Usuarios
                </button>
              }
              @if (canManageInstitutions()) {
                <button (click)="goToInstitutions()" class="quick-btn">
                  🏢 Ver Instituciones
                </button>
              }
              <button (click)="goToRifasList()" class="quick-btn primary">
                🎫 Ver Rifas
              </button>
              @if (canCreateRifas()) {
                <button (click)="goToCreateRifa()" class="quick-btn success">
                  ➕ Crear Rifa
                </button>
              }
              <button (click)="goToDiagnostic()" class="quick-btn">
                🔧 Diagnóstico
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .dashboard-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .welcome-text {
      font-weight: 500;
    }

    .logout-button {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;
      font-family: inherit;
    }

    .logout-button:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .dashboard-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .welcome-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .welcome-card h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.5rem;
    }

    .welcome-card p {
      margin: 0 0 1.5rem 0;
      color: #666;
      font-size: 1.1rem;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-weight: 500;
    }

    .connection-status.connected {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .connection-status.disconnected {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .connected .status-indicator {
      background-color: #28a745;
      animation: pulse 2s infinite;
    }

    .disconnected .status-indicator {
      background-color: #dc3545;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .user-details {
      margin-bottom: 2rem;
    }

    .user-details h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
    }

    .info-item label {
      font-weight: 600;
      color: #333;
      min-width: 120px;
    }

    .info-item span {
      color: #666;
      flex: 1;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .role-badge.admin_global {
      background-color: #ff6b6b;
      color: white;
    }

    .role-badge.admin_institucion {
      background-color: #4ecdc4;
      color: white;
    }

    .role-badge.vendedor {
      background-color: #45b7d1;
      color: white;
    }

    .role-badge.comprador {
      background-color: #96ceb4;
      color: white;
    }

    .modules-section {
      margin-bottom: 2rem;
    }

    .modules-section h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
      font-size: 1.3rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .action-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 280px; /* Altura uniforme */
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .action-card.featured {
      border: 2px solid #667eea;
      background: linear-gradient(135deg, #667eea08 0%, #764ba208 100%);
    }

    .action-card.featured:hover {
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-shrink: 0;
    }

    .card-header h4 {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .card-description {
      color: #666;
      font-size: 0.95rem;
      margin: 0 0 1rem 0;
      line-height: 1.5;
      flex-shrink: 0;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .status-badge.active {
      background-color: #d4edda;
      color: #155724;
    }

    .status-badge.planned {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-badge.development {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .feature-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 0 0 1.5rem 0;
      min-height: 120px; /* Altura mínima para features */
    }

    .feature-item {
      color: #666;
      font-size: 0.9rem;
      padding: 0.25rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .button-group {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-top: auto; /* Empujar botones al fondo */
    }

    .action-button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      flex: 1;
      min-width: 120px;
    }

    .action-button:not(:disabled) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .action-button.featured:not(:disabled) {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      color: white;
      font-weight: 600;
    }

    .action-button.secondary:not(:disabled) {
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      color: white;
    }

    .action-button.outline:not(:disabled) {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .action-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .action-button.featured:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
    }

    .action-button:disabled {
      background: #e9ecef;
      color: #6c757d;
      cursor: not-allowed;
      transform: none;
    }

    .tech-info {
      margin-bottom: 2rem;
    }

    .tech-info h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .tech-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f1f1f1;
    }

    .tech-item label {
      font-weight: 600;
      color: #333;
      min-width: 120px;
    }

    .tech-value {
      color: #666;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      word-break: break-all;
    }

    .tech-value.success {
      color: #28a745;
      font-weight: 600;
    }

    .tech-value.error {
      color: #dc3545;
      font-weight: 600;
    }

    .quick-actions {
      border-top: 1px solid #e9ecef;
      padding-top: 2rem;
    }

    .quick-actions h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .quick-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .quick-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .quick-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .quick-btn.primary {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    }

    .quick-btn.success {
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    }

    .quick-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .quick-btn.primary:hover {
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
    }

    .quick-btn.success:hover {
      box-shadow: 0 4px 12px rgba(78, 205, 196, 0.4);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .user-info {
        flex-direction: column;
        gap: 0.5rem;
      }

      .info-grid, .tech-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .quick-buttons {
        flex-direction: column;
      }

      .button-group {
        flex-direction: column;
      }

      .action-button {
        min-width: auto;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  readonly isConnected = signal(true);

  ngOnInit(): void {
    this.checkConnection();
  }

  private checkConnection(): void {
    this.isConnected.set(this.authService.isAuthenticated());
  }

  getBackendUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  getConnectionStatusClass(): string {
    return this.isConnected() ? 'connected' : 'disconnected';
  }

  getConnectionStatusText(): string {
    return this.isConnected() ? 
      '✅ Conectado al sistema' : 
      '❌ Sin conexión - Verificar servidor';
  }

  getRoleClass(): string {
    const role = this.authService.currentUser()?.role;
    return role || 'comprador';
  }

  getRoleLabel(): string {
    const role = this.authService.currentUser()?.role;
    const roleLabels = {
      'admin_global': '👑 Administrador Global',
      'admin_institucion': '🏛️ Admin Institución',
      'vendedor': '💼 Vendedor',
      'comprador': '🛒 Comprador'
    };
    return roleLabels[role as keyof typeof roleLabels] || '👤 Usuario';
  }

  // MÉTODOS DE PERMISOS
  canManageUsers(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'admin_global' || role === 'admin_institucion';
  }

  canManageInstitutions(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'admin_global';
  }

  canCreateRifas(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'admin_global' || role === 'admin_institucion';
  }

  // MÉTODOS DE NAVEGACIÓN
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToUsers(): void {
    if (this.canManageUsers()) {
      this.router.navigate(['/usuarios']);
    }
  }

  goToInstitutions(): void {
    if (this.canManageInstitutions()) {
      this.router.navigate(['/instituciones']);
    }
  }

  // NUEVOS MÉTODOS DE NAVEGACIÓN PARA RIFAS
  goToRifasList(): void {
    this.router.navigate(['/rifas']);
  }

  goToCreateRifa(): void {
    if (this.canCreateRifas()) {
      this.router.navigate(['/rifas/crear']);
    }
  }

  goToPublicRifas(): void {
    this.router.navigate(['/rifas/publicas']);
  }

  goToReports(): void {
    this.router.navigate(['/reportes']);
  }

  goToDiagnostic(): void {
    this.router.navigate(['/diagnostico']);
  }
}