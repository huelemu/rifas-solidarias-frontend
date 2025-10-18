import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NumeroDetalleComponent } from './numero-detalle/numero-detalle.component';

const routes: Routes = [
  {
    path: 'rifas/:rifaId/numero/:numeroId',
    component: NumeroDetalleComponent
  }
  // ... otras rutas públicas
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }