// src/app/shared/components/navbar/navbar.component.ts

import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationCenterComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  // Control del menú
  mostrarMenuUsuario = signal(false);

  // Computed
  esVendedor = computed(() => {
    const user = this.authService.currentUser();
    return (user?.rol || user?.role) === 'vendedor';
  });
  
  esAdmin = computed(() => {
    const user = this.authService.currentUser();
    const rol = user?.rol || user?.role;
    return rol === 'admin_global' || rol === 'admin_institucion';
  });

  // ⭐ CERRAR MENÚ AL HACER CLICK FUERA
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.mostrarMenuUsuario.set(false);
    }
  }

  toggleMenuUsuario(): void {
    // console.log('🔘 Toggle menú'); // ⭐ DEBUG
    this.mostrarMenuUsuario.update(v => !v);
  }

  cerrarMenu(): void {
    // console.log('❌ Cerrar menú'); // ⭐ DEBUG
    this.mostrarMenuUsuario.set(false);
  }

  goToHome(): void {
    // console.log('🏠 Ir a home'); // ⭐ DEBUG
    const isAuth = this.authService.currentUser() !== null;
    if (isAuth) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
    this.cerrarMenu();
  }

  canManageUsers(): boolean {
    const user = this.authService.currentUser();
    return (user?.rol || user?.role) === 'admin_global';
  }

  canManageInstitutions(): boolean {
    const user = this.authService.currentUser();
    const rol = user?.rol || user?.role;
    return rol === 'admin_global' || rol === 'admin_institucion';
  }

  getRoleLabel(): string {
    const user = this.authService.currentUser();
    const rol = user?.rol || user?.role;
    const labels: any = {
      'admin_global': 'Admin Global',
      'admin_institucion': 'Admin Institución',
      'vendedor': 'Vendedor',
      'comprador': 'Participante'
    };
    return labels[rol || ''] || 'Usuario';
  }

  getNombreCompleto(): string {
    const user = this.authService.currentUser();
    if (user?.nombre && user?.apellido) {
      return `${user.nombre} ${user.apellido}`;
    }
    return user?.name || user?.nombre || 'Usuario';
  }

  // ⭐ MÉTODOS DE NAVEGACIÓN
  irAConfiguracion(): void {
    // console.log('⚙️ Ir a configuración'); // ⭐ DEBUG
    this.cerrarMenu();
    this.router.navigate(['/configuracion']);
  }

  irAMisNumeros(): void {
    // console.log('🎫 Ir a mis números'); // ⭐ DEBUG
    this.cerrarMenu();
    this.router.navigate(['/mis-numeros']);
  }

  irAMisVentas(): void {
    // console.log('💰 Ir a mis ventas'); // ⭐ DEBUG
    this.cerrarMenu();
    this.router.navigate(['/vendedor/mis-ventas']);
  }

  logout(): void {
    // console.log('🚪 Logout'); // ⭐ DEBUG
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
      this.cerrarMenu();
      this.authService.logout();
    }
  }
}