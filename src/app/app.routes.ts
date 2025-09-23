// src/app/app.routes.ts - VERSIÓN SIMPLIFICADA SIN ERRORES

import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas
  {
    path: 'login',
    loadComponent: () => import('./auth/components/login.component').then(m => m.LoginComponent),
    title: 'Iniciar Sesión - Rifas Solidarias'
  },

  // Dashboard - ruta protegida
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - Rifas Solidarias'
  },

  // Gestión de usuarios - ruta protegida
  {
    path: 'usuarios',
    loadComponent: () => import('./users/components/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard],
    title: 'Gestión de Usuarios - Rifas Solidarias'
  },

  // Gestión de instituciones - ¡NUEVA RUTA HABILITADA!
  {
    path: 'instituciones',
    loadComponent: () => import('./institutions/components/institution-list.component').then(m => m.InstitutionListComponent),
    canActivate: [authGuard],
    title: 'Gestión de Instituciones - Rifas Solidarias'
  },

  // Diagnóstico - ruta protegida
 // {
 //   path: 'diagnostico',
 //   loadComponent: () => import('./diagnostic/diagnostic.component').then(m => m.DiagnosticComponent),
 //   canActivate: [authGuard],
 //   title: 'Diagnóstico del Sistema - Rifas Solidarias'
 //  },

  // Página de acceso denegado
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Acceso Denegado - Rifas Solidarias'
  },

  // 404 - Página no encontrada
  {
    path: 'not-found',
    loadComponent: () => import('./shared/components/not-found.component').then(m => m.NotFoundComponent),
    title: 'Página No Encontrada - Rifas Solidarias'
  },

  // Ruta por defecto
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Ruta wildcard para páginas no encontradas
  {
    path: '**',
    redirectTo: '/not-found',
    pathMatch: 'full'
  }
];