// src/app/app.routes.ts - VERSIÓN COMPLETA CON RIFAS HABILITADO

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
/*
  // Rifas públicas - accesibles sin autenticación
  {
    path: 'rifas/publicas',
    loadComponent: () => import('./rifas/components/public-rifas-list.component').then(m => m.PublicRifasListComponent),
    title: 'Rifas Públicas - Rifas Solidarias'
  },

  {
    path: 'rifas/publicas/:id',
    loadComponent: () => import('./rifas/components/public-rifa-detail.component').then(m => m.PublicRifaDetailComponent),
    title: 'Ver Rifa - Rifas Solidarias'
  },
*/
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
  // MÓDULO DE RIFAS - ¡CORE DEL NEGOCIO HABILITADO!
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
/*
  // Editar rifa existente
  {
    path: 'rifas/editar/:id',
    loadComponent: () => import('./rifas/components/edit-rifa.component').then(m => m.EditRifaComponent),
    canActivate: [authGuard],
    title: 'Editar Rifa - Rifas Solidarias'
  },

  // Ver detalle de rifa (admin)
  {
    path: 'rifas/:id',
    loadComponent: () => import('./rifas/components/rifa-detail.component').then(m => m.RifaDetailComponent),
    canActivate: [authGuard],
    title: 'Detalle de Rifa - Rifas Solidarias'
  },

  // Gestión de números de una rifa
  {
    path: 'rifas/:id/numeros',
    loadComponent: () => import('./rifas/components/rifa-numbers.component').then(m => m.RifaNumbersComponent),
    canActivate: [authGuard],
    title: 'Números de Rifa - Rifas Solidarias'
  },

  // Comprar números
  {
    path: 'rifas/:id/comprar',
    loadComponent: () => import('./rifas/components/buy-numbers.component').then(m => m.BuyNumbersComponent),
    canActivate: [authGuard],
    title: 'Comprar Números - Rifas Solidarias'
  },

  // Mis números comprados
  {
    path: 'mis-numeros',
    loadComponent: () => import('./rifas/components/my-numbers.component').then(m => m.MyNumbersComponent),
    canActivate: [authGuard],
    title: 'Mis Números - Rifas Solidarias'
  },

  // Estadísticas de rifa
  {
    path: 'rifas/:id/estadisticas',
    loadComponent: () => import('./rifas/components/rifa-stats.component').then(m => m.RifaStatsComponent),
    canActivate: [authGuard],
    title: 'Estadísticas - Rifas Solidarias'
  },
*/
  // ===================================================
  // MÓDULO DE REPORTES
  // ===================================================
  /*
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

  // ===================================================
  // MÓDULO DE DIAGNÓSTICO
  // ===================================================
  {
    path: 'diagnostico',
    loadComponent: () => import('./diagnostic/diagnostic.component').then(m => m.DiagnosticComponent),
    canActivate: [authGuard],
    title: 'Diagnóstico del Sistema - Rifas Solidarias'
  },
*/

  // ===================================================
  // PÁGINAS DE ERROR Y ESTADO
  // ===================================================
  
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

  // ===================================================
  // RUTAS DE REDIRECCIÓN
  // ===================================================
  
  // Ruta por defecto - redirige al dashboard si está autenticado
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Redirección para compatibilidad
  {
    path: 'home',
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