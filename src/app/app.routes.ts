// src/app/app.routes.ts - VERSIÓN OPTIMIZADA
import { Routes } from '@angular/router';

// ====== COMPONENTES PRINCIPALES ======
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DiagnosticoComponent } from './components/diagnostico/diagnostico.component';

// ====== COMPONENTES ADMINISTRATIVOS ======
import { InstitucionesComponent } from './components/instituciones/instituciones.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';

// ====== COMPONENTES DE RIFAS (NUEVOS) ======
import { RifasActivasComponent } from './components/rifas-activas/rifas-activas.component';
import { DetalleRifaComponent } from './components/detalle-rifa/detalle-rifa.component';
import { ComprarNumerosComponent } from './components/comprar-numeros/comprar-numeros.component';
import { MisRifasComponent } from './components/mis-rifas/mis-rifas.component';

// ====== COMPONENTES DE RIFAS (GESTIÓN - Si los tienes) ======
// Uncomment these if you have them created:
// import { ListaRifasComponent } from './components/rifas/lista-rifas.component';
// import { CrearRifaComponent } from './components/rifas/crear-rifa.component';

// ====== GUARDS ======
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
      // Lista pública de rifas activas
      {
        path: '',
        component: RifasActivasComponent,
        title: 'Rifas Activas'
      },
      
      // Detalle de una rifa específica
      {
        path: ':id',
        component: DetalleRifaComponent,
        title: 'Detalle de Rifa'
      },
      
      // Comprar números (requiere login)
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
      // Dashboard personal
      {
        path: '',
        component: DashboardComponent,
        title: 'Mi Dashboard'
      },
      
      // Mis rifas (historial de participaciones)
      {
        path: 'mis-rifas',
        component: MisRifasComponent,
        title: 'Mis Rifas'
      }
    ]
  },

  // ==========================================
  // ADMINISTRACIÓN DE RIFAS
  // ==========================================
  {
    path: 'admin-rifas',
    canActivate: [AuthGuard],
    children: [
      // Lista de rifas para gestionar (admin/vendedor)
      {
        path: '',
        // component: ListaRifasComponent, // Uncomment when created
        redirectTo: '/dashboard', // Temporary redirect
        title: 'Gestión de Rifas'
      },
      
      // Crear nueva rifa
      {
        path: 'crear',
        // component: CrearRifaComponent, // Uncomment when created
        redirectTo: '/dashboard', // Temporary redirect
        title: 'Crear Nueva Rifa'
      },
      
      // Editar rifa existente
      {
        path: 'editar/:id',
        // component: CrearRifaComponent, // Uncomment when created
        redirectTo: '/dashboard', // Temporary redirect
        title: 'Editar Rifa'
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
      // Dashboard administrativo
      {
        path: '',
        component: DashboardComponent,
        title: 'Panel Administrativo'
      },
      
      // Gestión de instituciones
      {
        path: 'instituciones',
        component: InstitucionesComponent,
        title: 'Gestión de Instituciones'
      },
      
      // Gestión de usuarios
      {
        path: 'usuarios',
        component: UsuariosComponent,
        title: 'Gestión de Usuarios'
      }
    ]
  },

  // ==========================================
  // RUTAS DE COMPATIBILIDAD (LEGACY)
  // ==========================================
  
  // Redirect old routes to new structure
  { path: 'dashboard', redirectTo: '/mi-cuenta', pathMatch: 'full' },
  { path: 'instituciones', redirectTo: '/admin/instituciones', pathMatch: 'full' },
  { path: 'usuarios', redirectTo: '/admin/usuarios', pathMatch: 'full' },
  
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

// ==========================================
// TIPOS Y CONFIGURACIÓN ADICIONAL
// ==========================================

/**
 * Roles permitidos para cada sección:
 * 
 * PÚBLICO:
 * - /rifas (ver rifas activas)
 * - /rifas/:id (detalle de rifa)
 * 
 * AUTENTICADO:
 * - /rifas/:id/comprar (comprar números)
 * - /mi-cuenta (dashboard personal)
 * - /mi-cuenta/mis-rifas (historial)
 * - /admin-rifas/* (gestión de rifas)
 * 
 * ADMIN:
 * - /admin/* (administración general)
 */

/**
 * Estructura de navegación sugerida:
 * 
 * NAVBAR PÚBLICO:
 * - Inicio
 * - Rifas
 * - Login
 * 
 * NAVBAR AUTENTICADO:
 * - Inicio
 * - Rifas
 * - Mi Cuenta
 *   - Dashboard
 *   - Mis Rifas
 * - Gestión Rifas (si es vendedor/admin)
 * - Admin (si es admin)
 * - Logout
 */