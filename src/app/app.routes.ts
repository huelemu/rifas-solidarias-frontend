// src/app/app.routes.ts - AGREGAR GUARDS BÁSICOS
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { InstitucionesComponent } from './components/instituciones/instituciones.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { DiagnosticoComponent } from './components/diagnostico/diagnostico.component';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent }, // Sin guard por ahora
  { path: 'instituciones', component: InstitucionesComponent }, // Sin guard por ahora
  { path: 'usuarios', component: UsuariosComponent }, // Sin guard por ahora
  { path: 'diagnostico', component: DiagnosticoComponent },
  { path: '**', redirectTo: '' }
];