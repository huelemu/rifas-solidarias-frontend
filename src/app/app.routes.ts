// src/app/app.routes.ts - RUTAS LIMPIAS SOLO CON LO QUE EXISTE
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { InstitucionesComponent } from './components/instituciones/instituciones.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { DiagnosticoComponent } from './components/diagnostico/diagnostico.component';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ListaRifasComponent } from './components/rifas/lista-rifas.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginRedirectGuard } from './guards/login-redirect.guard';

export const routes: Routes = [
  // Rutas públicas
  {path: '', component: HomeComponent },
  {path: 'diagnostico', component: DiagnosticoComponent},

  // Rutas de autenticación - redirige si ya está logueado
  {path: 'login',component: LoginComponent,canActivate: [LoginRedirectGuard]},

  // Rutas protegidas - requieren autenticación
  {path: 'dashboard', component: DashboardComponent,canActivate: [AuthGuard]},
  { path: 'rifas', component: ListaRifasComponent },

  // Rutas para administradores
  {path: 'instituciones', component: InstitucionesComponent, canActivate: [AuthGuard, AdminGuard]},
  {path: 'usuarios', component: UsuariosComponent,canActivate: [AuthGuard, AdminGuard]},

  // Ruta por defecto
  {
    path: '**',
    redirectTo: ''
  }
];