import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const RIFAS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/rifas-list.component').then(c => c.RifasListComponent),
        title: 'Rifas Activas'
      },
      {
        path: 'nueva',
        loadComponent: () => import('./components/rifa-form.component').then(c => c.RifaFormComponent),
        title: 'Nueva Rifa'
      },
      {
        path: ':id',
        loadComponent: () => import('./components/rifa-detail.component').then(c => c.RifaDetailComponent),
        title: 'Detalle de Rifa'
      },
      {
        path: ':id/numeros',
        loadComponent: () => import('./components/rifa-numbers.component').then(c => c.RifaNumbersComponent),
        title: 'Números de Rifa'
      },
      {
        path: ':id/comprar',
        loadComponent: () => import('./components/rifa-checkout.component').then(c => c.RifaCheckoutComponent),
        title: 'Comprar Números'
      }
    ]
  }
];