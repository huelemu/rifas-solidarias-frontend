// src/app/shared/services/notification.service.ts

import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface ToastNotification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  timestamp: Date;
}

export interface PersistentNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Signals para toasts (notificaciones temporales)
  private readonly toasts = signal<ToastNotification[]>([]);
  
  // Signals para notificaciones persistentes
  private readonly notifications = signal<PersistentNotification[]>([]);
  
  // Exponer como readonly
  readonly currentToasts = this.toasts.asReadonly();
  readonly currentNotifications = this.notifications.asReadonly();

  // Contador de notificaciones no leídas
  readonly unreadCount = signal(0);

  constructor() {
    this.loadNotificationsFromStorage();
    this.updateUnreadCount();
  }

  // =====================================================
  // TOAST NOTIFICATIONS (TEMPORALES)
  // =====================================================

  /**
   * Muestra una notificación toast de éxito
   */
  success(message: string, title?: string, duration: number = 3000): void {
    this.showToast('success', message, title, duration);
  }

  /**
   * Muestra una notificación toast de error
   */
  error(message: string, title?: string, duration: number = 5000): void {
    this.showToast('error', message, title, duration);
  }

  /**
   * Muestra una notificación toast de advertencia
   */
  warning(message: string, title?: string, duration: number = 4000): void {
    this.showToast('warning', message, title, duration);
  }

  /**
   * Muestra una notificación toast de información
   */
  info(message: string, title?: string, duration: number = 3000): void {
    this.showToast('info', message, title, duration);
  }

  /**
   * Muestra un toast genérico
   */
  private showToast(
    type: NotificationType, 
    message: string, 
    title?: string, 
    duration: number = 3000
  ): void {
    const toast: ToastNotification = {
      id: this.generateId(),
      type,
      message,
      title,
      duration,
      timestamp: new Date()
    };

    // Agregar el toast
    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-dismiss si duration > 0
    if (duration > 0) {
      setTimeout(() => this.dismissToast(toast.id), duration);
    }
  }

  /**
   * Cierra un toast específico
   */
  dismissToast(id: string): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  /**
   * Cierra todos los toasts
   */
  dismissAllToasts(): void {
    this.toasts.set([]);
  }

  // =====================================================
  // PERSISTENT NOTIFICATIONS (PERMANENTES)
  // =====================================================

  /**
   * Agrega una notificación persistente
   */
  addNotification(
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    actionText?: string
  ): void {
    const notification: PersistentNotification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      actionUrl,
      actionText
    };

    this.notifications.update(notifications => [notification, ...notifications]);
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  /**
   * Marca una notificación como leída
   */
  markAsRead(id: string): void {
    this.notifications.update(notifications =>
      notifications.map(n => n.id === id ? { ...n, read: true } : n)
    );
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead(): void {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  /**
   * Elimina una notificación
   */
  deleteNotification(id: string): void {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  /**
   * Elimina todas las notificaciones
   */
  clearAllNotifications(): void {
    this.notifications.set([]);
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  /**
   * Elimina solo las notificaciones leídas
   */
  clearReadNotifications(): void {
    this.notifications.update(notifications =>
      notifications.filter(n => !n.read)
    );
    this.saveNotificationsToStorage();
    this.updateUnreadCount();
  }

  // =====================================================
  // HELPERS
  // =====================================================

  /**
   * Actualiza el contador de notificaciones no leídas
   */
  private updateUnreadCount(): void {
    const count = this.notifications().filter(n => !n.read).length;
    this.unreadCount.set(count);
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Guarda notificaciones en localStorage
   */
  private saveNotificationsToStorage(): void {
    try {
      const notificationsData = this.notifications().map(n => ({
        ...n,
        timestamp: n.timestamp.toISOString()
      }));
      localStorage.setItem('app-notifications', JSON.stringify(notificationsData));
    } catch (error) {
      console.error('Error guardando notificaciones:', error);
    }
  }

  /**
   * Carga notificaciones desde localStorage
   */
  private loadNotificationsFromStorage(): void {
    try {
      const stored = localStorage.getItem('app-notifications');
      if (stored) {
        const notificationsData = JSON.parse(stored);
        const notifications = notificationsData.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notifications.set(notifications);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  }
}