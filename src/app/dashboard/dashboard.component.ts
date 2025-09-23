// src/app/dashboard/dashboard.component.ts

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

              <!-- MÓDULO DE INSTITUCIONES -->
              <div class="action-card">
                <div class="card-header">
                  <h4>🏢 Instituciones</h4>
                  <span class="status-badge upcoming">Próximamente</span>
                </div>
                <p>Gestionar instituciones participantes</p>
                <ul class="feature-list">
                  <li>🔄 Crear instituciones</li>
                  <li>🔄 Asignar administradores</li>
                  <li>🔄 Configurar permisos</li>
                  <li>🔄 Ver estadísticas</li>
                </ul>
                <button class="action-button" disabled>
                  🏗️ Implementar Módulo
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
                  🚀 Implementar Core
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
                <span class="tech-value">Login ✅, Usuarios ✅, Dashboard ✅</span>
              </div>
              <div class="tech-item">
                <label>Permisos:</label>
                <span class="tech-value">
                  {{ canManageUsers() ? 'Admin ✅' : 'Usuario estándar' }}
                </span>
              </div>
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
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .user-details, .action-section, .tech-info {
      margin-bottom: 2.5rem;
    }

    .user-details h3, .action-section h3, .tech-info h3 {
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .info-grid, .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .info-item, .tech-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item label, .tech-item label {
      font-weight: 500;
      color: #555;
      font-size: 0.9rem;
    }

    .info-item span, .tech-item span {
      color: #333;
    }

    .tech-value {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      background-color: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .tech-value.success {
      background-color: #d4edda;
      color: #155724;
    }

    .tech-value.error {
      background-color: #f8d7da;
      color: #721c24;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-admin {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .role-vendedor {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .role-comprador {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 1.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .action-card.featured {
      background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
      border-color: #ffcdd2;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .action-card h4 {
      color: #333;
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.ready {
      background-color: #d4edda;
      color: #155724;
    }

    .status-badge.upcoming {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .status-badge.planned {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .action-card p {
      color: #666;
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem 0;
    }

    .feature-list li {
      padding: 0.25rem 0;
      font-size: 0.85rem;
      color: #555;
    }

    .action-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: transform 0.2s;
      width: 100%;
      font-family: inherit;
    }

    .action-button.ready {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }

    .action-button.ready:hover:not(:disabled) {
      background: linear-gradient(135deg, #218838 0%, #1ba085 100%);
      transform: translateY(-2px);
    }

    .action-button.featured {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    }

    .action-button:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .action-button:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
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
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  // Signal para el estado de conexión
  readonly isConnected = signal(true);

  ngOnInit(): void {
    // Verificar conexión al cargar
    this.checkConnection();
  }

  /**
   * Verifica la conexión con el backend
   */
  private checkConnection(): void {
    // Si tenemos un usuario autenticado, asumimos que la conexión funciona
    this.isConnected.set(this.authService.isAuthenticated());
  }

  /**
   * Obtiene la URL del backend
   */
  getBackendUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';  // Sin /api
    } else {
      return 'https://apirifas.huelemu.com.ar';  // Sin /api
    }
  }

  /**
   * Obtiene la clase CSS para el estado de conexión
   */
  getConnectionStatusClass(): string {
    return this.isConnected() ? 'connected' : 'disconnected';
  }

  /**
   * Obtiene el texto del estado de conexión
   */
  getConnectionStatusText(): string {
    return this.isConnected() ? 'Conectado al backend' : 'Desconectado del backend';
  }

  /**
   * Obtiene la clase CSS según el rol del usuario
   */
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

  /**
   * Obtiene la etiqueta legible del rol
   */
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

  /**
   * Verifica si puede gestionar usuarios
   */
  canManageUsers(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * Navega a gestión de usuarios
   */
  goToUsers(): void {
    this.router.navigate(['/usuarios']);
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.authService.logout();
  }
}