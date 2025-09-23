// src/app/dashboard/dashboard.component.ts - ESTILOS ARREGLADOS

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
                <div class="info-item">
                  <label>ID Institución:</label>
                  <span>{{ authService.currentUser()?.institucion_id }}</span>
                </div>
              }
            </div>
          </div>

          <div class="action-section">
            <h3>📱 Módulos del Sistema</h3>
            <div class="actions-grid">
              
              <!-- MÓDULO DE USUARIOS - YA DISPONIBLE -->
              <div class="action-card">
                <div class="card-header">
                  <h4>👥 Gestión de Usuarios</h4>
                  <span class="status-badge ready">✅ Disponible</span>
                </div>
                <p>Administrar usuarios del sistema</p>
                <ul class="feature-list">
                  <li>✅ Ver lista de usuarios</li>
                  <li>✅ Filtrar y buscar</li>
                  <li>✅ Activar/desactivar</li>
                  <li>✅ Gestionar permisos</li>
                </ul>
                <button 
                  (click)="goToUsers()" 
                  class="action-button ready"
                  [disabled]="!canManageUsers()"
                >
                  {{ canManageUsers() ? '👥 Gestionar Usuarios' : '🔒 Sin permisos' }}
                </button>
              </div>

              <!-- MÓDULO DE INSTITUCIONES - ¡AHORA DISPONIBLE! -->
              <div class="action-card">
                <div class="card-header">
                  <h4>🏢 Instituciones</h4>
                  <span class="status-badge ready">✅ Disponible</span>
                </div>
                <p>Gestionar instituciones participantes</p>
                <ul class="feature-list">
                  <li>✅ Crear instituciones</li>
                  <li>✅ Asignar administradores</li>
                  <li>✅ Configurar permisos</li>
                  <li>✅ Ver estadísticas</li>
                </ul>
                <button 
                  (click)="goToInstitutions()" 
                  class="action-button ready"
                  [disabled]="!canManageInstitutions()"
                >
                  {{ canManageInstitutions() ? '🏢 Gestionar Instituciones' : '🔒 Sin permisos' }}
                </button>
              </div>

              <!-- MÓDULO DE RIFAS - CORE DEL NEGOCIO -->
              <div class="action-card featured">
                <div class="card-header">
                  <h4>🎫 Sistema de Rifas</h4>
                  <span class="status-badge planned">Planificado</span>
                </div>
                <p>Crear y gestionar rifas solidarias</p>
                <ul class="feature-list">
                  <li>🎯 Crear rifas</li>
                  <li>🎫 Vender números</li>
                  <li>💰 Procesar pagos</li>
                  <li>🏆 Realizar sorteos</li>
                </ul>
                <button class="action-button featured" disabled>
                  🚀 Próximamente
                </button>
              </div>

              <!-- MÓDULO DE REPORTES -->
              <div class="action-card">
                <div class="card-header">
                  <h4>📊 Reportes</h4>
                  <span class="status-badge planned">Futuro</span>
                </div>
                <p>Análisis y estadísticas del sistema</p>
                <ul class="feature-list">
                  <li>🔄 Dashboard de ventas</li>
                  <li>🔄 Reportes por institución</li>
                  <li>🔄 Análisis de performance</li>
                  <li>🔄 Exportación de datos</li>
                </ul>
                <button class="action-button" disabled>
                  📈 En desarrollo
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
                <span class="tech-value">Login ✅, Usuarios ✅, Instituciones ✅, Dashboard ✅</span>
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
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .welcome-card h2 {
      color: #333;
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .welcome-card > p {
      color: #666;
      margin: 0 0 1.5rem 0;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 2rem;
      font-size: 0.9rem;
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
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: currentColor;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .user-details {
      margin-bottom: 2rem;
    }

    .user-details h3,
    .action-section h3,
    .tech-info h3,
    .quick-actions h3 {
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .info-grid,
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .info-item,
    .tech-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label,
    .tech-item label {
      font-weight: 600;
      color: #666;
      font-size: 0.9rem;
    }

    .info-item span,
    .tech-item span {
      color: #333;
      font-size: 0.95rem;
    }

    .tech-value {
      font-family: 'Courier New', monospace;
      background: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem !important;
    }

    .tech-value.success {
      background: #d4edda;
      color: #155724;
    }

    .tech-value.error {
      background: #f8d7da;
      color: #721c24;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-badge.role-admin {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      color: white;
    }

    .role-badge.role-vendedor {
      background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
      color: white;
    }

    .role-badge.role-comprador {
      background: linear-gradient(135deg, #55a3ff 0%, #003d82 100%);
      color: white;
    }

    .action-section {
      margin-bottom: 2rem;
    }

    /* GRID UNIFORME - IGUAL TAMAÑO PARA TODAS LAS TARJETAS */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .action-card {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.25rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
      min-height: 200px; /* ALTURA MÍNIMA FIJA */
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .action-card.featured {
      border-left: 4px solid #ff6b6b;
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(238, 90, 36, 0.05) 100%);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .card-header h4 {
      margin: 0;
      color: #333;
      font-size: 1rem;
      font-weight: 600;
    }

    .status-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.ready {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.upcoming {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.planned {
      background: #d1ecf1;
      color: #0c5460;
    }

    .action-card p {
      color: #666;
      margin: 0 0 0.75rem 0;
      line-height: 1.4;
      font-size: 0.9rem;
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0 0 1rem 0;
      flex: 1; /* EMPUJA EL BOTÓN HACIA ABAJO */
    }

    .feature-list li {
      padding: 0.2rem 0;
      color: #666;
      font-size: 0.85rem;
    }

    .action-button {
      width: 100%;
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      margin-top: auto; /* SE ALINEA EN LA PARTE INFERIOR */
    }

    .action-button.ready {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }

    .action-button.ready:hover:not(:disabled) {
      background: linear-gradient(135deg, #218838 0%, #1ba085 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .action-button.featured {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      color: white;
    }

    .action-button:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .action-button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    .tech-info {
      margin-bottom: 2rem;
    }

    .quick-actions {
      border-top: 1px solid #e9ecef;
      padding-top: 2rem;
    }

    .quick-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .quick-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .quick-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
    return this.isConnected() ? 'Conectado al backend' : 'Desconectado del backend';
  }

  getRoleClass(): string {
    const role = this.authService.userRole();
    switch (role) {
      case 'admin_global':
      case 'admin_institucion':
        return 'role-admin';
      case 'vendedor':
        return 'role-vendedor';
      case 'comprador':
        return 'role-comprador';
      default:
        return '';
    }
  }

  getRoleLabel(): string {
    const role = this.authService.userRole();
    switch (role) {
      case 'admin_global':
        return 'Administrador Global';
      case 'admin_institucion':
        return 'Administrador de Institución';
      case 'vendedor':
        return 'Vendedor';
      case 'comprador':
        return 'Comprador';
      default:
        return 'Sin rol';
    }
  }

  canManageUsers(): boolean {
    return this.authService.isAdmin();
  }

  canManageInstitutions(): boolean {
    const role = this.authService.userRole();
    return role === 'admin_global' || role === 'admin_institucion';
  }

  goToUsers(): void {
    this.router.navigate(['/usuarios']);
  }

  goToInstitutions(): void {
    this.router.navigate(['/instituciones']);
  }

  goToDiagnostic(): void {
    this.router.navigate(['/diagnostico']);
  }

  logout(): void {
    this.authService.logout();
  }
}