// src/app/app.routes.ts - SIMPLIFICADO SIN ERRORES
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { InstitucionesComponent } from './components/instituciones/instituciones.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { DiagnosticoComponent } from './components/diagnostico/diagnostico.component';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

// ====== COMPONENTES DE RIFAS ======
import { ListaRifasComponent } from './components/rifas/lista-rifas.component';
import { CrearRifaComponent } from './components/rifas/crear-rifa.component';
import { DetalleRifaComponent } from './components/rifas/detalle-rifa.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginRedirectGuard } from './guards/login-redirect.guard';

export const routes: Routes = [
  // ==========================================
  // RUTAS PÚBLICAS
  // ==========================================
  { path: '', component: HomeComponent },
  { path: 'diagnostico', component: DiagnosticoComponent },
  
  // ==========================================
  // RUTAS DE AUTENTICACIÓN
  // ==========================================
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [LoginRedirectGuard] 
  },

  // ==========================================
  // RUTAS DE RIFAS (MÓDULO PRINCIPAL)
  // ==========================================
  
  // Lista pública de rifas
  { 
    path: 'rifas', 
    component: ListaRifasComponent 
  },
  
  // Detalle público de rifa
  { 
    path: 'rifas/detalle/:id', 
    component: DetalleRifaComponent 
  },
  
  // Crear nueva rifa (requiere autenticación)
  { 
    path: 'rifas/crear', 
    component: CrearRifaComponent,
    canActivate: [AuthGuard]
  },
  
  // Editar rifa existente (requiere autenticación)
  { 
    path: 'rifas/editar/:id', 
    component: CrearRifaComponent,
    canActivate: [AuthGuard]
  },

  // ==========================================
  // RUTAS PROTEGIDAS - DASHBOARD
  // ==========================================
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },

  // ==========================================
  // RUTAS DE ADMINISTRACIÓN
  // ==========================================
  { 
    path: 'instituciones', 
    component: InstitucionesComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },
  { 
    path: 'usuarios', 
    component: UsuariosComponent, 
    canActivate: [AuthGuard, AdminGuard] 
  },

  // ==========================================
  // REDIRECCIONES Y RUTAS NO ENCONTRADAS
  // ==========================================
  
  // Ruta wildcard - debe ir al final
  { 
    path: '**', 
    redirectTo: '' 
  }
];