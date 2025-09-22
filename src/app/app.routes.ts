// ====================================
// src/app/app.routes.ts
// ====================================
import { Routes } from '@angular/router';
import { authGuard } from '../app/guards/auth.guard';
import { loginRedirectGuard } from '../app/guards/login-redirect.guard';
import { roleGuard } from '../app/guards/role.guard';

export const routes: Routes = [
  // Ruta por defecto
  {
    path: '',
    redirectTo: '/rifas',
    pathMatch: 'full'
  },

  // Rutas de autenticación
  {
    path: 'login',
    loadComponent: () => import('../app/components/auth/login/login.component')
      .then(m => m.LoginComponent),
    canActivate: [loginRedirectGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('../app/components/auth/register/register.component')
      .then(m => m.RegisterComponent),
    canActivate: [loginRedirectGuard]
  },

  // Rutas públicas
  {
    path: 'rifas',
    loadComponent: () => import('../app/components/rifas/lista-rifas/lista-rifas.component')
      .then(m => m.ListaRifasComponent)
  },
  {
    path: 'rifas/:id',
    loadComponent: () => import('./components/rifas/detalle-rifa/detalle-rifa.component')
      .then(m => m.DetalleRifaComponent)
  },

  // Rutas protegidas - Dashboard general
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // Rutas protegidas - Administrador Global
  {
    path: 'admin',
    loadComponent: () => import('./components/dashboard/admin-dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin_global'] }
  },

  // Rutas protegidas - Administrador de Institución
  {
    path: 'admin-institucion',
    loadComponent: () => import('./components/dashboard/admin-institucion-dashboard/admin-institucion-dashboard.component')
      .then(m => m.AdminInstitucionDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin_institucion'] }
  },

  // Rutas protegidas - Vendedor
  {
    path: 'vendedor',
    loadComponent: () => import('./components/dashboard/vendedor-dashboard/vendedor-dashboard.component')
      .then(m => m.VendedorDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['vendedor'] }
  },

  // Rutas protegidas - Gestión de rifas
  {
    path: 'mis-rifas',
    loadComponent: () => import('./components/rifas/mis-rifas/mis-rifas.component')
      .then(m => m.MisRifasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'crear-rifa',
    loadComponent: () => import('./components/rifas/crear-rifa/crear-rifa.component')
      .then(m => m.CrearRifaComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin_global', 'admin_institucion'] }
  },

  // Rutas protegidas - Compras
  {
    path: 'mis-compras',
    loadComponent: () => import('./components/rifas/mis-compras/mis-compras.component')
      .then(m => m.MisComprasComponent),
    canActivate: [authGuard]
  },

  // Páginas de error
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/shared/unauthorized/unauthorized.component')
      .then(m => m.UnauthorizedComponent)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./components/shared/not-found/not-found.component')
      .then(m => m.NotFoundComponent)
  },

  // Wildcard route - debe ir al final
  {
    path: '**',
    redirectTo: '/not-found'
  }
];
