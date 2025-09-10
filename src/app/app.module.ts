// src/app/app.module.ts - VERSIÓN SIMPLIFICADA PARA EMPEZAR
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

// Importar solo los componentes existentes que funcionan
import { HomeComponent } from './components/home/home.component';
import { InstitucionesComponent } from './components/instituciones/instituciones.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { DiagnosticoComponent } from './components/diagnostico/diagnostico.component';

// Servicios
import { AuthService } from './services/auth.service';

// Rutas simplificadas - sin guards por ahora
const routes = [
  { path: '', component: HomeComponent },
  { path: 'instituciones', component: InstitucionesComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'diagnostico', component: DiagnosticoComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent
    // NO declares los standalone components aquí
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    
    // Importar los standalone components
    HomeComponent,
    InstitucionesComponent,
    UsuariosComponent,
    DiagnosticoComponent
  ],
  providers: [
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

