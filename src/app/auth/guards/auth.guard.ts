// src/app/auth/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


/**
 * Guard que requiere que el usuario sea administrador global
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ AdminGuard: Verificando permisos de administrador...');

  // Verificar autenticación primero
  if (!authService.isAuthenticated()) {
    console.log('❌ AdminGuard: Usuario no autenticado');
    return router.createUrlTree(['/login']);
  }

  // CORREGIR: usar isAdmin() en lugar de isAdmin() undefined
  if (authService.isAdmin()) {  // Esto incluye admin_global y admin_institucion
    console.log('✅ AdminGuard: Usuario es administrador, acceso permitido');
    return true;
  }

  // No es administrador
  console.log('❌ AdminGuard: Usuario no es administrador');
  console.log('👤 Rol actual:', authService.userRole());
  
  return router.createUrlTree(['/unauthorized']);
};

/**
 * Guard que requiere específicamente administrador global
 */
export const globalAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ GlobalAdminGuard: Verificando permisos de administrador global...');

  // Verificar autenticación primero
  if (!authService.isAuthenticated()) {
    console.log('❌ GlobalAdminGuard: Usuario no autenticado');
    return router.createUrlTree(['/login']);
  }

  // Verificar si es administrador global
  if (authService.isGlobalAdmin()) {
    console.log('✅ GlobalAdminGuard: Usuario es administrador global, acceso permitido');
    return true;
  }

  // No es administrador global
  console.log('❌ GlobalAdminGuard: Usuario no es administrador global');
  console.log('👤 Rol actual:', authService.userRole());
  
  return router.createUrlTree(['/unauthorized']);
};



/**
 * Guard que protege rutas requiriendo autenticación
 * Funcional guard usando la nueva sintaxis de Angular
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si está autenticado, permitir acceso
  if (authService.isAuthenticated()) {
    console.log('✅ AuthGuard: Usuario autenticado, acceso permitido');
    return true;
  }

  // Si no está autenticado, redirigir al login
  console.log('❌ AuthGuard: Usuario no autenticado, redirigiendo al login');
  console.log('📍 Ruta intentada:', state.url);
  
  // Guardar la ruta intentada para redirigir después del login
  sessionStorage.setItem('returnUrl', state.url);
  
  return router.createUrlTree(['/login']);
};

/**
 * Guard que redirige usuarios ya autenticados (útil para login/register)
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si NO está autenticado, permitir acceso (es invitado)
  if (!authService.isAuthenticated()) {
    console.log('✅ GuestGuard: Usuario no autenticado, acceso a página pública permitido');
    return true;
  }

  // Si está autenticado, redirigir al dashboard
  console.log('🔄 GuestGuard: Usuario ya autenticado, redirigiendo al dashboard');
  return router.createUrlTree(['/dashboard']);
};