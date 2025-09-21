import { Routes } from '@angular/router';

// Importar guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginRedirectGuard } from './guards/login-redirect.guard';

export const routes: Routes = [
  // Ruta raíz
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
// Rutas administrativas
//{ 
//  path: 'instituciones', 
//  loadComponent: () => import('./components/instituciones/instituciones.component').then(m => m.InstitucionesComponent),
//  canActivate: [AuthGuard]  // Sin AdminGuard por ahora
//},

  // Rutas públicas
  { 
    path: 'home', 
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  
  // Rutas de autenticación (NUEVAS)
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [LoginRedirectGuard]
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [LoginRedirectGuard]
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'unauthorized', 
    loadComponent: () => import('./components/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  
  // Solo diagnostico si existe y funciona
  { 
    path: 'diagnostico', 
    loadComponent: () => import('./components/diagnostico/diagnostico.component').then(m => m.DiagnosticoComponent),
    canActivate: [AuthGuard]
  },
  
  // Ruta comodín
  { path: '**', redirectTo: '/home' }
];