// src/app/app.routes.ts - RUTAS SIMPLES SIN GUARDS
import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'instituciones', 
    loadComponent: () => import('./components/instituciones/instituciones.component').then(m => m.InstitucionesComponent)
  },
  { 
    path: 'usuarios', 
    loadComponent: () => import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent)
  },
    {
    path: 'rifas',
    loadChildren: () => import('./features/rifas/rifas.routes').then(m => m.RIFAS_ROUTES)
  }
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];