
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // ✅ IMPORTAR
import { routes } from './app.routes';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { notificationInterceptor } from './core/interceptors/notification.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Configurar router con las rutas
    provideRouter(routes),
    
    // ✅ AGREGAR: Proveedor de animaciones
    provideAnimationsAsync(),
    
    // Configurar HttpClient con interceptores
    provideHttpClient(
      withInterceptors([authInterceptor, notificationInterceptor]) // ✅ COMBINAR interceptores
    )
  ]
};