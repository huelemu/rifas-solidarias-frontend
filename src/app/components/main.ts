// ====================================
// src/main.ts
// ====================================
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { EnvironmentDetector } from './app/utils/environment-detector';

// Log de información de entorno al iniciar
EnvironmentDetector.logEnvironmentInfo();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('❌ Error starting app:', err));