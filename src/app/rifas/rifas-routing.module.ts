// src/app/rifas/rifas-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RifaListComponent } from './components/rifa-list/rifa-list.component';
import { CrearRifaComponent } from './components/crear-rifa/crear-rifa.component';

const routes: Routes = [
  {
    path: '',
    component: RifaListComponent,
    title: 'Gestión de Rifas'
  },
  {
    path: 'crear',
    component: CrearRifaComponent,
    title: 'Crear Nueva Rifa'
  },
  {
    path: ':id',
    component: RifaListComponent, // TODO: Cambiar por RifaDetailComponent cuando lo creemos
    title: 'Detalle de Rifa'
  },
  {
    path: ':id/editar',
    component: CrearRifaComponent, // Reutilizamos el componente en modo edición
    title: 'Editar Rifa'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RifasRoutingModule { }