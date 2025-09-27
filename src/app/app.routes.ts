// src/app/app.routes.ts - VERSIÓN COMPLETA CON RUTAS DE RIFAS HABILITADAS

import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  // ===================================================
  // RUTAS PÚBLICAS
  // ===================================================
  {
    path: 'login',
    loadComponent: () => import('./auth/components/login.component').then(m => m.LoginComponent),
    title: 'Iniciar Sesión - Rifas Solidarias'
  },

  // ===================================================
  // RUTAS PROTEGIDAS - REQUIEREN AUTENTICACIÓN
  // ===================================================
  
  // Dashboard principal
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - Rifas Solidarias'
  },

  // ===================================================
  // MÓDULO DE GESTIÓN DE USUARIOS
  // ===================================================
  {
    path: 'usuarios',
    loadComponent: () => import('./users/components/user-list.component').then(m => m.UserListComponent),
    canActivate: [authGuard],
    title: 'Gestión de Usuarios - Rifas Solidarias'
  },

  // ===================================================
  // MÓDULO DE GESTIÓN DE INSTITUCIONES
  // ===================================================
  {
    path: 'instituciones',
    loadComponent: () => import('./institutions/components/institution-list.component').then(m => m.InstitutionListComponent),
    canActivate: [authGuard],
    title: 'Gestión de Instituciones - Rifas Solidarias'
  },

  // ===================================================
  // MÓDULO DE RIFAS - ¡TODAS LAS RUTAS HABILITADAS!
  // ===================================================
  
  // Lista principal de rifas (admin)
  {
    path: 'rifas',
    loadComponent: () => import('./rifas/components/rifa-list/rifa-list.component').then(m => m.RifaListComponent),
    canActivate: [authGuard],
    title: 'Gestión de Rifas - Rifas Solidarias'
  },

  // Crear nueva rifa
  {
    path: 'rifas/crear',
    loadComponent: () => import('./rifas/components/crear-rifa/crear-rifa.component').then(m => m.CrearRifaComponent),
    canActivate: [authGuard],
    title: 'Crear Rifa - Rifas Solidarias'
  },

  // Ver detalle de rifa (admin) - HABILITADO
  {
    path: 'rifas/:id',
    loadComponent: () => import('./rifas/components/rifa-detail/rifa-detail.component').then(m => m.RifaDetailComponent),
    canActivate: [authGuard],
    title: 'Detalle de Rifa - Rifas Solidarias'
  },

  // Editar rifa existente - HABILITADO
  {
    path: 'rifas/:id/editar',
    loadComponent: () => import('./rifas/components/edit-rifa/edit-rifa.component').then(m => m.EditRifaComponent),
    canActivate: [authGuard],
    title: 'Editar Rifa - Rifas Solidarias'
  },

  // Gestión de números de una rifa - HABILITADO
  {
    path: 'rifas/:id/numeros',
    loadComponent: () => import('./rifas/components/rifa-numbers/rifa-numbers.component').then(m => m.RifaNumbersComponent),
    canActivate: [authGuard],
    title: 'Números de Rifa - Rifas Solidarias'
  },
 
  // Comprar números - HABILITADO
  {
    path: 'rifas/:id/comprar',
    loadComponent: () => import('./rifas/components/buy-numbers/buy-numbers.component').then(m => m.BuyNumbersComponent),
    canActivate: [authGuard],
    title: 'Comprar Números - Rifas Solidarias'
  },

  // Mis números comprados - HABILITADO
  {
    path: 'mis-numeros',
    loadComponent: () => import('./rifas/components/my-numbers/my-numbers.component').then(m => m.MyNumbersComponent),
    canActivate: [authGuard],
    title: 'Mis Números - Rifas Solidarias'
  },
/*
  // Estadísticas de rifa - HABILITADO
  {
    path: 'rifas/:id/estadisticas',
    loadComponent: () => import('./rifas/components/rifa-stats/rifa-stats.component').then(m => m.RifaStatsComponent),
    canActivate: [authGuard],
    title: 'Estadísticas - Rifas Solidarias'
  },

  // Rifas públicas - accesibles sin autenticación
  {
    path: 'rifas/publicas',
    loadComponent: () => import('./rifas/components/public-rifas-list/public-rifas-list.component').then(m => m.PublicRifasListComponent),
    title: 'Rifas Públicas - Rifas Solidarias'
  },

  {
    path: 'rifas/publicas/:id',
    loadComponent: () => import('./rifas/components/public-rifa-detail/public-rifa-detail.component').then(m => m.PublicRifaDetailComponent),
    title: 'Ver Rifa - Rifas Solidarias'
  },

  // ===================================================
  // MÓDULO DE REPORTES (FUTURO)
  // ===================================================
 
  {
    path: 'reportes',
    loadComponent: () => import('./reports/components/reports-dashboard.component').then(m => m.ReportsDashboardComponent),
    canActivate: [authGuard],
    title: 'Reportes - Rifas Solidarias'
  },

  {
    path: 'reportes/ventas',
    loadComponent: () => import('./reports/components/sales-report.component').then(m => m.SalesReportComponent),
    canActivate: [authGuard],
    title: 'Reporte de Ventas - Rifas Solidarias'
  },

  {
    path: 'reportes/instituciones',
    loadComponent: () => import('./reports/components/institutions-report.component').then(m => m.InstitutionsReportComponent),
    canActivate: [authGuard],
    title: 'Reporte de Instituciones - Rifas Solidarias'
  },
  */

  // ===================================================
  // RUTAS DE REDIRECCIÓN Y ERROR
  // ===================================================
  
  // Redirección por defecto
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Página no encontrada
  {
    path: '**',
    loadComponent: () => import('../app/shared/components/not-found.component').then(m => m.NotFoundComponent),
    title: 'Página no encontrada - Rifas Solidarias'
  }
];