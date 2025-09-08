// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { InstitucionesComponent } from './components/instituciones/instituciones.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'instituciones', component: InstitucionesComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: '**', redirectTo: '' }
];