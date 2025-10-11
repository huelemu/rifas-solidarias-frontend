// src/app/app.routes.ts - VERSIÓN ACTUALIZADA CON REGISTRO

import { Routes } from '@angular/router';
import { authGuard, guestGuard} from './auth/guards/auth.guard';

export const routes: Routes = [

   // ===================================================
  // RUTA PRINCIPAL - DASHBOARD PÚBLICO (LANDING PAGE)
  // ===================================================
{
  path: '',
  loadComponent: () => import('./dashboard/public-dashboard.component')
    .then(m => m.PublicDashboardComponent),
  title: 'Rifas Solidarias - Participa y Ayuda'
},

  {
    path: 'terminos-condiciones',
    loadComponent: () => import('./legal/components/terminos-condiciones.component').then(m => m.TerminosCondicionesComponent)
  },
  {
    path: 'politica-privacidad',
    loadComponent: () => import('./legal/components/politica-privacidad.component').then(m => m.PoliticaPrivacidadComponent)
  },


  // ===================================================
  // RUTAS PÚBLICAS
  // ===================================================
  {
    path: 'login',
    loadComponent: () => import('./auth/components/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Iniciar Sesión - Rifas Solidarias'
  },
  

  {
    path: 'register',
    loadComponent: () => import('./auth/components/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Crear Cuenta - Rifas Solidarias'
  },


  // Vista pública de rifa individual
  {
    path: 'public/rifas/:rifaId',
    loadComponent: () => import('./rifas/components/rifa-public-view/rifa-public-view.component').then(m => m.RifaPublicViewComponent),
    title: 'Ver Rifa - Rifas Solidarias'
  },

  // ===================================================
  // DASHBOARD AUTENTICADO (diferente del público)
  // ===================================================
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - Rifas Solidarias'
  },
  // Dashboard principal


   // ===================================================
  // RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)
  // ===================================================

  // ⭐ NUEVA RUTA - OLVIDÉ MI CONTRASEÑA
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/components/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard],
    title: 'Recuperar Contraseña - Rifas Solidarias'
  },

  // ⭐ NUEVA RUTA - RESTABLECER CONTRASEÑA
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/components/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard],
    title: 'Restablecer Contraseña - Rifas Solidarias'
  },

  {
    path: 'auth/google/callback',
    loadComponent: () => import('./auth/components/google-callback.component').then(m => m.GoogleCallbackComponent),
    title: 'Autenticación Google - Rifas Solidarias'
  },

  // ===================================================
  // ⭐ MÓDULO DE GESTIÓN DE USUARIOS - CORREGIDO
  // ===================================================
  {
    path: 'usuarios',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./users/components/user-list.component').then(m => m.UserListComponent),
        title: 'Gestión de Usuarios - Rifas Solidarias'
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./users/components/user-form.component').then(m => m.UserFormComponent),
        title: 'Crear Usuario - Rifas Solidarias'
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./users/components/user-form.component').then(m => m.UserFormComponent),
        title: 'Editar Usuario - Rifas Solidarias'
      }
    ]
  },


  // ===================================================
  // MÓDULO DE GESTIÓN DE INSTITUCIONES
  // ===================================================
  {
    path: 'instituciones',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./institutions/components/institution-list.component').then(m => m.InstitutionListComponent),
        title: 'Gestión de Instituciones - Rifas Solidarias'
      },
      {
        path: 'nueva',
        loadComponent: () => import('./institutions/components/institution-form.component').then(m => m.InstitutionFormComponent),
        title: 'Nueva Institución - Rifas Solidarias'
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./institutions/components/institution-form.component').then(m => m.InstitutionFormComponent),
        title: 'Editar Institución - Rifas Solidarias'
      }
    ]
  },

  // ===================================================
  // MÓDULO DE RIFAS - TODAS LAS RUTAS HABILITADAS
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

  // Ver detalle de rifa (admin)
  {
    path: 'rifas/:id',
    loadComponent: () => import('./rifas/components/rifa-detail/rifa-detail.component').then(m => m.RifaDetailComponent),
    canActivate: [authGuard],
    title: 'Detalle de Rifa - Rifas Solidarias'
  },

  // Editar rifa existente
  {
    path: 'rifas/:id/editar',
    loadComponent: () => import('./rifas/components/edit-rifa/edit-rifa.component').then(m => m.EditRifaComponent),
    canActivate: [authGuard],
    title: 'Editar Rifa - Rifas Solidarias'
  },

  // Gestión de números de una rifa
  {
    path: 'rifas/:id/numeros',
    loadComponent: () => import('./rifas/components/rifa-numbers/rifa-numbers.component').then(m => m.RifaNumbersComponent),
    canActivate: [authGuard],
    title: 'Números de Rifa - Rifas Solidarias'
  },
 
  // Comprar números
  {
    path: 'rifas/:id/comprar',
    loadComponent: () => import('./rifas/components/buy-numbers/buy-numbers.component').then(m => m.BuyNumbersComponent),
    canActivate: [authGuard],
    title: 'Comprar Números - Rifas Solidarias'
  },

  // Mis números comprados
  {
    path: 'mis-numeros',
    loadComponent: () => import('./rifas/components/my-numbers/my-numbers.component').then(m => m.MyNumbersComponent),
    canActivate: [authGuard],
    title: 'Mis Números - Rifas Solidarias'
  },

  {
  path: 'rifas/:rifaId/boletos',
  loadComponent: () => 
    import('./rifas/components/boletos-viewer/boletos-viewer.component')
      .then(m => m.BoletosViewerComponent),
  canActivate: [authGuard],
  title: 'Boletos de Rifa - Rifas Solidarias'
},



{
  path: 'public/rifas/:rifaId/numero/:numero',
  loadComponent: () => 
    import('./rifas/components/numero-publico/numero-publico.component')
      .then(m => m.NumeroPublicoComponent),
  title: 'Ver Número - Rifas Solidarias'
},

{
  path: 'public/rifas/:rifaId',
  loadComponent: () => 
    import('./rifas/components/rifa-public-view/rifa-public-view.component')
      .then(m => m.RifaPublicViewComponent),
  title: 'Ver Rifa - Rifas Solidarias'
},

 /*
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
    loadComponent: () => import('./shared/components/not-found.component').then(m => m.NotFoundComponent),
    title: 'Página no encontrada - Rifas Solidarias'
  }
];