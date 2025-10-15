// src/app/shared/services/api-config.service.ts - CREAR ESTE ARCHIVO

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly API_URL: string;

  constructor() {
    // Detectar automáticamente según el hostname
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      this.API_URL = 'http://localhost:3100';
    } else {
      // ✅ TU URL DE PRODUCCIÓN
      this.API_URL = 'https://apirifas.huelemu.com.ar';
    }

    console.log(`🔧 API URL configurada: ${this.API_URL}`);
  }

  /**
   * Obtiene la URL base del API
   */
  getApiUrl(): string {
    return this.API_URL;
  }

  /**
   * Construye URL completa de endpoint
   */
  buildUrl(endpoint: string): string {
    // Asegurar que endpoint comience con /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.API_URL}${cleanEndpoint}`;
  }
}