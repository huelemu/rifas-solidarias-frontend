// ====================================
// src/app/utils/environment-detector.ts
// ====================================
import { environment } from '../../environments/environment';

export class EnvironmentDetector {
  
  static isLocalhost(): boolean {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }

  static getApiUrl(): string {
    // Auto-detección de entorno basada en URL actual
    if (this.isLocalhost()) {
      return 'http://localhost:3100';
    }
    return 'https://apirifas.huelemu.com.ar';
  }

  static getEnvironmentInfo() {
    return {
      isProduction: environment.production,
      isLocalhost: this.isLocalhost(),
      apiUrl: this.getApiUrl(),
      frontendUrl: environment.frontendUrl,
      hostname: window.location.hostname
    };
  }

  static logEnvironmentInfo() {
    const info = this.getEnvironmentInfo();
    console.log('🌍 Environment Info:', info);
  }
}