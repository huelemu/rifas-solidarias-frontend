// src/app/app.routes.ts - VERSIÓN CORREGIDA

import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/guards/auth.guard';

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

  // ===================================================
  // RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)
  // ===================================================
  {
    path: 'login',
    loadComponent: () => import('./auth/components/login.component')
      .then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Iniciar Sesión - Rifas Solidarias'
  },

  {
    path: 'register',
    loadComponent: () => import('./auth/components/register.component')
      .then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Crear Cuenta - Rifas Solidarias'
  },

  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/components/forgot-password.component')
      .then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard],
    title: 'Recuperar Contraseña - Rifas Solidarias'
  },

  {
    path: 'reset-password',
    loadComponent: () => import('./auth/components/reset-password.component')
      .then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard],
    title: 'Restablecer Contraseña - Rifas Solidarias'
  },

  {
    path: 'auth/google/callback',
    loadComponent: () => import('./auth/components/google-callback.component')
      .then(m => m.GoogleCallbackComponent),
    title: 'Autenticación Google - Rifas Solidarias'
  },

  // Vista pública de rifa individual
  {
    path: 'public/rifas/:rifaId',
    loadComponent: () => import('./rifas/components/rifa-public-view/rifa-public-view.component')
      .then(m => m.RifaPublicViewComponent),
    title: 'Ver Rifa - Rifas Solidarias'
  },

  // Vista pública de número individual
  {
    path: 'public/rifas/:rifaId/numero/:numero',
    loadComponent: () => import('./rifas/components/numero-publico/numero-publico.component')
      .then(m => m.NumeroPublicoComponent),
    title: 'Ver Número - Rifas Solidarias'
  },

  // Términos y condiciones
  {
    path: 'terminos-condiciones',
    loadComponent: () => import('./legal/components/terminos-condiciones.component')
      .then(m => m.TerminosCondicionesComponent),
    title: 'Términos y Condiciones - Rifas Solidarias'
  },

  {
    path: 'politica-privacidad',
    loadComponent: () => import('./legal/components/politica-privacidad.component')
      .then(m => m.PoliticaPrivacidadComponent),
    title: 'Política de Privacidad - Rifas Solidarias'
  },

  // ===================================================
  // DASHBOARD AUTENTICADO
  // ===================================================
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Dashboard - Rifas Solidarias'
  },

  // Configuración de usuario
  {
    path: 'configuracion',
    loadComponent: () => import('./users/components/user-profile/user-profile.component')
      .then(m => m.UserProfileComponent),
    canActivate: [authGuard],
    title: 'Configuración - Rifas Solidarias'
  },

  // ===================================================
  // MÓDULO DE GESTIÓN DE USUARIOS
  // ===================================================
  {
    path: 'usuarios',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./users/components/user-list.component')
          .then(m => m.UserListComponent),
        title: 'Gestión de Usuarios - Rifas Solidarias'
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./users/components/user-form.component')
          .then(m => m.UserFormComponent),
        title: 'Crear Usuario - Rifas Solidarias'
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./users/components/user-form.component')
          .then(m => m.UserFormComponent),
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
        loadComponent: () => import('./institutions/components/institution-list.component')
          .then(m => m.InstitutionListComponent),
        title: 'Gestión de Instituciones - Rifas Solidarias'
      },
      {
        path: 'nueva',
        loadComponent: () => import('./institutions/components/institution-form.component')
          .then(m => m.InstitutionFormComponent),
        title: 'Nueva Institución - Rifas Solidarias'
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./institutions/components/institution-form.component')
          .then(m => m.InstitutionFormComponent),
        title: 'Editar Institución - Rifas Solidarias'
      }
    ]
  },

  // ===================================================
  // MÓDULO DE RIFAS
  // ===================================================
  {
    path: 'rifas',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./rifas/components/rifa-list/rifa-list.component')
          .then(m => m.RifaListComponent),
        title: 'Gestión de Rifas - Rifas Solidarias'
      },
      {
        path: 'crear',
        loadComponent: () => import('./rifas/components/crear-rifa/crear-rifa.component')
          .then(m => m.CrearRifaComponent),
        title: 'Crear Rifa - Rifas Solidarias'
      },
      {
        path: ':id',
        loadComponent: () => import('./rifas/components/rifa-detail/rifa-detail.component')
          .then(m => m.RifaDetailComponent),
        title: 'Detalle de Rifa - Rifas Solidarias'
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./rifas/components/edit-rifa/edit-rifa.component')
          .then(m => m.EditRifaComponent),
        title: 'Editar Rifa - Rifas Solidarias'
      },
      {
        path: ':id/numeros',
        loadComponent: () => import('./rifas/components/rifa-numbers/rifa-numbers.component')
          .then(m => m.RifaNumbersComponent),
        title: 'Números de Rifa - Rifas Solidarias'
      },
      {
        path: ':id/comprar',
        loadComponent: () => import('./rifas/components/buy-numbers/buy-numbers.component')
          .then(m => m.BuyNumbersComponent),
        title: 'Comprar Números - Rifas Solidarias'
      },
      {
        path: ':rifaId/boletos',
        loadComponent: () => import('./rifas/components/boletos-viewer/boletos-viewer.component')
          .then(m => m.BoletosViewerComponent),
        title: 'Boletos de Rifa - Rifas Solidarias'
      }
    ]
  },

  // Mis números (fuera del módulo rifas para URL más corta)
  {
    path: 'mis-numeros',
    loadComponent: () => import('./rifas/components/mis-numeros/mis-numeros.component')
      .then(m => m.MisNumerosComponent),
    canActivate: [authGuard],
    title: 'Mis Números - Rifas Solidarias'
  },

  // ===================================================
  // MÓDULO DE VENDEDORES ⭐ NUEVO
  // ===================================================
// Vendedor usa el mismo componente
{
  path: 'vendedor/rifas/:rifaId/numeros',
  loadComponent: () => import('./rifas/components/boletos-viewer/boletos-viewer.component')
    .then(m => m.BoletosViewerComponent),
  canActivate: [authGuard],
  title: 'Mis Números de Venta - Rifas Solidarias'
},

{
  path: 'vendedor/mis-ventas',
  loadComponent: () => import('./vendedor/components/mis-ventas/mis-ventas.component')
    .then(m => m.MisVentasComponent),
  canActivate: [authGuard],
  title: 'Mis Ventas - Rifas Solidarias'
},

  // ===================================================
  // PÁGINA NO ENCONTRADA (SIEMPRE AL FINAL)
  // ===================================================
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found.component')
      .then(m => m.NotFoundComponent),
    title: 'Página no encontrada - Rifas Solidarias'
  }
];