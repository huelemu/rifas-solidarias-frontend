// ====================================
// src/app/app.config.ts
// ====================================
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';

// Material Design
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

// Routes
import { routes } from './app.routes';

// Interceptors
import { authInterceptor } from './interceptors/auth.interceptor';

// Environment
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router con binding de inputs
    provideRouter(routes, withComponentInputBinding()),
    
    // HTTP Client con interceptores y fetch API
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
    
    // Animaciones
    provideAnimations(),
    
    // Material Design modules
    importProvidersFrom(
      MatSnackBarModule,
      MatDialogModule
    ),
    
    // Service Worker para PWA (solo en producción)
    ...(environment.production ? [
      provideServiceWorker('ngsw-worker.js', {
        enabled: environment.production,
        registrationStrategy: 'registerWhenStable:30000'
      })
    ] : [])
  ]
};
