// src/app/institutions/institutions.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth.guard';

export const institutionsRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => 
          import('./components/institution-list.component').then(m => m.InstitutionListComponent),
        title: 'Gestión de Instituciones'
      },
      
       {
        path: 'nueva',
        loadComponent: () => 
          import('./components/institution-form.component').then(m => m.InstitutionFormComponent),
        title: 'Nueva Institución'
      },
      {
        path: ':id/editar',
        loadComponent: () => 
          import('./components/institution-form.component').then(m => m.InstitutionFormComponent),
        title: 'Editar Institución'
      },
    ]
  }
];

// src/app/institutions/index.ts
export * from './models/institution.models';
export * from './services/institution.service';
export * from './components/institution-list.component';
export * from './institutions.routes';

// Para importar en app.routes.ts:
/*
import { institutionsRoutes } from './institutions/institutions.routes';

export const routes: Routes = [
  // ... otras rutas
  {
    path: 'instituciones',
    children: institutionsRoutes
  }
];
*/