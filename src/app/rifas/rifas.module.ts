// src/app/rifas/rifas.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RifasRoutingModule } from './rifas-routing.module';

// Componentes
import { RifaListComponent } from './components/rifa-list/rifa-list.component';
import { CrearRifaComponent } from './components/crear-rifa/crear-rifa.component';

// Servicios
import { RifasService } from './services/rifas.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RifasRoutingModule,
    // Componentes standalone
    RifaListComponent,
    CrearRifaComponent
  ],
  providers: [
    RifasService
  ]
})
export class RifasModule { }