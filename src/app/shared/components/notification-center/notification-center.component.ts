// src/app/shared/components/notification-center/notification-center.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-trigger" (click)="togglePanel()">
      <div class="notification-icon">
        🔔
        @if (notificationService.unreadCount() > 0) {
          <span class="notification-badge">
            {{ notificationService.unreadCount() > 99 ? '99+' : notificationService.unreadCount() }}
          </span>
        }
      </div>
    </div>

    @if (isPanelOpen()) {
      <div class="notification-overlay" (click)="closePanel()"></div>
      <div class="notification-panel">
        <!-- Header -->
        <div class="notification-header">
          <h3>Notificaciones</h3>
          <div class="header-actions">
            @if (notificationService.unreadCount() > 0) {
              <button 
                class="btn-text"
                (click)="markAllAsRead()">
                Marcar todas como leídas
              </button>
            }
            <button 
              class="btn-text"
              (click)="clearAll()">
              Limpiar todas
            </button>
          </div>
        </div>

        <!-- Lista de notificaciones -->
        <div class="notification-list">
          @if (notificationService.currentNotifications().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">🔔</div>
              <p>No tienes notificaciones</p>
            </div>
          } @else {
            @for (notification of notificationService.currentNotifications(); track notification.id) {
              <div 
                class="notification-item"
                [class.unread]="!notification.read"
                (click)="handleNotificationClick(notification)">
                
                <div class="notification-icon-wrapper">
                  <span class="notification-type-icon">
                    {{ getIcon(notification.type) }}
                  </span>
                  @if (!notification.read) {
                    <span class="unread-dot"></span>
                  }
                </div>

                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">{{ notification.message }}</div>
                  <div class="notification-time">{{ getTimeAgo(notification.timestamp) }}</div>
                </div>

                <button 
                  class="btn-delete"
                  (click)="deleteNotification($event, notification.id)">
                  🗑️
                </button>
              </div>
            }
          }
        </div>

        <!-- Footer -->
        @if (notificationService.currentNotifications().length > 0) {
          <div class="notification-footer">
            <button 
              class="btn-clear-read"
              (click)="clearRead()">
              Limpiar leídas
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .notification-trigger {
      position: relative;
      cursor: pointer;
    }

    .notification-icon {
      position: relative;
      font-size: 24px;
      padding: 8px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .notification-icon:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .notification-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #dc3545;
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 5px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .notification-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 998;
      animation: fadeIn 0.2s ease-out;
    }

    .notification-panel {
      position: fixed;
      top: 70px;
      right: 20px;
      width: 400px;
      max-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      z-index: 999;
      display: flex;
      flex-direction: column;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .notification-header {
      padding: 20px;
      border-bottom: 1px solid #ecf0f1;
    }

    .notification-header h3 {
      margin: 0 0 10px 0;
      font-size: 18px;
      color: #2c3e50;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .btn-text {
      background: none;
      border: none;
      color: #667eea;
      cursor: pointer;
      font-size: 12px;
      padding: 0;
      transition: color 0.2s;
    }

    .btn-text:hover {
      color: #5568d3;
      text-decoration: underline;
    }

    .notification-list {
      flex: 1;
      overflow-y: auto;
      max-height: 450px;
    }

    .empty-state {
      padding: 60px 20px;
      text-align: center;
      color: #95a5a6;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 10px;
      opacity: 0.5;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid #ecf0f1;
      cursor: pointer;
      transition: background 0.2s;
    }

    .notification-item:hover {
      background: #f8f9fa;
    }

    .notification-item.unread {
      background: #f0f8ff;
    }

    .notification-icon-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .notification-type-icon {
      font-size: 24px;
    }

    .unread-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      border: 2px solid white;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 14px;
      color: #2c3e50;
      margin-bottom: 4px;
    }

    .notification-message {
      font-size: 13px;
      color: #7f8c8d;
      line-height: 1.4;
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .notification-time {
      font-size: 11px;
      color: #95a5a6;
    }

    .btn-delete {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s;
      padding: 4px;
      flex-shrink: 0;
    }

    .btn-delete:hover {
      opacity: 1;
    }

    .notification-footer {
      padding: 12px 20px;
      border-top: 1px solid #ecf0f1;
      text-align: center;
    }

    .btn-clear-read {
      background: none;
      border: 1px solid #dee2e6;
      color: #6c757d;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }

    .btn-clear-read:hover {
      background: #f8f9fa;
      border-color: #adb5bd;
    }

    @media (max-width: 768px) {
      .notification-panel {
        left: 10px;
        right: 10px;
        width: auto;
      }
    }
  `]
})
export class NotificationCenterComponent {
  readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly isPanelOpen = signal(false);

  togglePanel(): void {
    this.isPanelOpen.update(v => !v);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
      this.notificationService.clearAllNotifications();
    }
  }

  clearRead(): void {
    this.notificationService.clearReadNotifications();
  }

  handleNotificationClick(notification: any): void {
    // Marcar como leída
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }

    // Si tiene URL de acción, navegar
    if (notification.actionUrl) {
      this.router.navigateByUrl(notification.actionUrl);
      this.closePanel();
    }
  }

  deleteNotification(event: Event, id: string): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(id);
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'Ahora mismo';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
    
    return new Date(date).toLocaleDateString('es-AR');
  }
}