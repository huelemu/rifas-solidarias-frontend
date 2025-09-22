import { Routes } from '@angular/router';

export const RIFAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/rifas-list/rifas-list.component').then(c => c.RifasListComponent),
    title: 'Rifas Activas'
  },
  {
    path: 'nueva',
    loadComponent: () => import('./components/rifa-form/rifa-form.component').then(c => c.RifaFormComponent),
    title: 'Nueva Rifa'
  },
  {
    path: ':id',
    loadComponent: () => import('./components/rifa-detail/rifa-detail.component').then(c => c.RifaDetailComponent),
    title: 'Detalle de Rifa'
  },
  {
    path: ':id/comprar',
    loadComponent: () => import('./components/rifa-checkout/rifa-checkout.component').then(c => c.RifaCheckoutComponent),
    title: 'Comprar Números'
  }
];