// ====================================
// CÓDIGO COMPLETO CORREGIDO PARA app.routes.ts:
// ====================================

import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DiagnosticoComponent } from './components/diagnostico/diagnostico.component';
import { InstitucionesComponent } from './components/instituciones/instituciones.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';

// Componentes de rifas
import { RifasActivasComponent } from './components/rifas-activas/rifas-activas.component';
import { DetalleRifaComponent } from './components/detalle-rifa/detalle-rifa.component';
import { ComprarNumerosComponent } from './components/comprar-numeros/comprar-numeros.component';
import { MisRifasComponent } from './components/mis-rifas/mis-rifas.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginRedirectGuard } from './guards/login-redirect.guard';

export const routes: Routes = [
  // ==========================================
  // RUTAS PÚBLICAS
  // ==========================================
  { 
    path: '', 
    component: HomeComponent,
    title: 'Rifas Solidarias - Inicio'
  },
  
  { 
    path: 'diagnostico', 
    component: DiagnosticoComponent,
    title: 'Diagnóstico del Sistema'
  },

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [LoginRedirectGuard],
    title: 'Iniciar Sesión'
  },

  // ==========================================
  // RIFAS - MÓDULO PÚBLICO
  // ==========================================
  {
    path: 'rifas',
    children: [
      {
        path: '',
        component: RifasActivasComponent,
        title: 'Rifas Activas'
      },
      {
        path: ':id',
        component: DetalleRifaComponent,
        title: 'Detalle de Rifa'
      },
      {
        path: ':id/comprar',
        component: ComprarNumerosComponent,
        canActivate: [AuthGuard],
        title: 'Comprar Números'
      }
    ]
  },

  // ==========================================
  // ÁREA DE USUARIO AUTENTICADO
  // ==========================================
  {
    path: 'mi-cuenta',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        title: 'Mi Dashboard'
      },
      {
        path: 'mis-rifas',
        component: MisRifasComponent,
        title: 'Mis Rifas'
      }
    ]
  },

  // ==========================================
  // ADMINISTRACIÓN GENERAL
  // ==========================================
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        title: 'Panel Administrativo'
      },
      {
        path: 'instituciones',
        component: InstitucionesComponent,
        title: 'Gestión de Instituciones'
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        title: 'Gestión de Usuarios'
      }
    ]
  },

  // ==========================================
  // RUTAS DE COMPATIBILIDAD (LEGACY) - ✅ CORREGIDAS
  // ==========================================
  
  // ✅ CORRECCIONES CON pathMatch
  { path: 'dashboard', redirectTo: '/mi-cuenta', pathMatch: 'full' },
  { path: 'instituciones', redirectTo: '/admin/instituciones', pathMatch: 'full' },
  { path: 'usuarios', redirectTo: '/admin/usuarios', pathMatch: 'full' },
  { path: 'admin-rifas', redirectTo: '/dashboard', pathMatch: 'full' },
  
  // Legacy rifa routes
  { path: 'rifas/detalle/:id', redirectTo: '/rifas/:id', pathMatch: 'full' },

  // ==========================================
  // PÁGINA NO ENCONTRADA
  // ==========================================
  { 
    path: '**', 
    redirectTo: '',
    pathMatch: 'full'
  }
];
