// ===================================================================
// 🗺️ APP ROUTING MODULE - src/app/app-routing.module.ts
// ===================================================================

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UnauthorizedComponent } from './components/auth/unauthorized/unauthorized.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { RoleGuard } from './guards/role.guard';
import { LoginRedirectGuard } from './guards/login-redirect.guard';

const routes: Routes = [
  // ==========================================
  // RUTAS PÚBLICAS
  // ==========================================
  { 
    path: '', 
    component: HomeComponent,
    title: 'Rifas Solidarias - Inicio'
  },
  
  // ==========================================
  // AUTENTICACIÓN
  // ==========================================
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [LoginRedirectGuard],
    title: 'Iniciar Sesión - Rifas Solidarias'
  },
  
  { 
    path: 'register', 
    component: RegisterComponent, 
    canActivate: [LoginRedirectGuard],
    title: 'Registro - Rifas Solidarias'
  },
  
  { 
    path: 'unauthorized', 
    component: UnauthorizedComponent,
    title: 'Acceso Denegado - Rifas Solidarias'
  },

  // ==========================================
  // ÁREA DE USUARIO AUTENTICADO
  // ==========================================
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    title: 'Dashboard - Rifas Solidarias'
  },

  // ==========================================
  // ÁREA DE ADMINISTRACIÓN
  // ==========================================
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        title: 'Panel Administrativo - Rifas Solidarias'
      },
      {
        path: 'instituciones',
        component: DashboardComponent, // Reemplazar con InstitucionesComponent cuando esté listo
        title: 'Gestión de Instituciones - Rifas Solidarias'
      },
      {
        path: 'usuarios',
        component: DashboardComponent, // Reemplazar con UsuariosComponent cuando esté listo
        title: 'Gestión de Usuarios - Rifas Solidarias'
      }
    ]
  },

  // ==========================================
  // RUTAS ESPECÍFICAS POR ROL
  // ==========================================
  {
    path: 'vendedor',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'vendedor' },
    children: [
      {
        path: '',
        component: DashboardComponent,
        title: 'Panel Vendedor - Rifas Solidarias'
      }
    ]
  },

  // ==========================================
  // RUTAS DE REDIRECCIÓN Y FALLBACK
  // ==========================================
  { 
    path: 'home', 
    redirectTo: '', 
    pathMatch: 'full' 
  },
  
  // Wildcard route - debe ir al final
  { 
    path: '**', 
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Cambiar a true para debug
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }