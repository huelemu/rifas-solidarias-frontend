// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  // Redirigir raíz al dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Ruta de login (solo para usuarios no autenticados)
  {
    path: 'login',
    loadComponent: () => import('./auth/components/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard], // Redirige al dashboard si ya está logueado
    title: 'Iniciar Sesión - Rifas Solidarias'
  },
  
  // Dashboard protegido por autenticación
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard], // Requiere estar autenticado
    title: 'Dashboard - Rifas Solidarias'
  },
  
  // ===== RUTAS DE USUARIOS =====
  {
    path: 'usuarios',
    loadComponent: () => import('./users/components/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard, adminGuard], // Solo administradores
    title: 'Gestión de Usuarios - Rifas Solidarias'
  },
  
  {
    path: 'usuarios/nuevo',
    loadComponent: () => import('./users/components/user-form.component').then(m => m.UserFormComponent),
    canActivate: [authGuard, adminGuard], // Solo administradores
    title: 'Nuevo Usuario - Rifas Solidarias'
  },
  
  {
    path: 'usuarios/:id/editar',
    loadComponent: () => import('./users/components/user-form.component').then(m => m.UserFormComponent),
    canActivate: [authGuard, adminGuard], // Solo administradores
    title: 'Editar Usuario - Rifas Solidarias'
  },
  
  // Ruta para usuarios no autorizados (acceso público)
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Acceso Denegado - Rifas Solidarias'
  },
  
  // Rutas futuras protegidas (comentadas por ahora)
  /*
  {
    path: 'usuarios/nuevo',
    loadComponent: () => import('./users/components/user-form.component').then(m => m.UserFormComponent),
    canActivate: [authGuard, adminGuard],
    title: 'Nuevo Usuario - Rifas Solidarias'
  },
  
  {
    path: 'usuarios/:id',
    loadComponent: () => import('./users/components/user-detail.component').then(m => m.UserDetailComponent),
    canActivate: [authGuard],
    title: 'Detalle Usuario - Rifas Solidarias'
  },
  
  {
    path: 'usuarios/:id/editar',
    loadComponent: () => import('./users/components/user-form.component').then(m => m.UserFormComponent),
    canActivate: [authGuard, adminGuard],
    title: 'Editar Usuario - Rifas Solidarias'
  },
  
  {
    path: 'instituciones',
    loadComponent: () => import('./institutions/components/institution-list.component').then(m => m.InstitutionListComponent),
    canActivate: [authGuard, adminGuard],
    title: 'Gestión de Instituciones - Rifas Solidarias'
  },
  */
  
  // Ruta wildcard - redirigir al dashboard
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];