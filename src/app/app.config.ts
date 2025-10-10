// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { notificationInterceptor } from './core/interceptors/notification.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    // Configurar router con las rutas
    provideRouter(routes),
    
    // Configurar HttpClient con interceptor de autenticación
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideHttpClient(
      withInterceptors([notificationInterceptor]) // ✅ AGREGAR
    )
  ]
};