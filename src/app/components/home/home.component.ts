// =====================================
// 1. src/environments/environment.ts (DESARROLLO)
// =====================================
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3100'
};

// =====================================
// 2. src/environments/environment.prod.ts (PRODUCCIÓN)
// =====================================
export const environment = {
  production: true,
  apiUrl: 'https://apirifas.huelemu.com.ar'
};

// =====================================
// 3. src/app/components/home/home.component.ts (CORREGIDO)
// =====================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // ← AGREGAR ESTO

interface DatabaseInfo {
  base_datos: string;
  version: string;
  total_tablas: number;
  total_usuarios: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  connectionStatus = 'Verificando conexión...';
  dbInfo: DatabaseInfo | null = null;
  error = '';
  apiUrl = environment.apiUrl; // ← AGREGAR ESTO

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.testConnection();
  }

  testConnection() {
    this.connectionStatus = 'Verificando conexión...';
    this.error = '';
    this.dbInfo = null;

    // ✅ CAMBIADO: Usar environment.apiUrl en lugar de localhost hardcodeado
    this.http.get<any>(`${this.apiUrl}/test-db`).subscribe({
      next: (response) => {
        if (response.status === 'OK') {
          this.connectionStatus = '✅ Conexión exitosa al backend';
          this.dbInfo = {
            base_datos: response.base_datos || 'rifas_solidarias',
            version: response.version || 'MariaDB',
            total_tablas: response.total_tablas || 0,
            total_usuarios: response.total_usuarios || 0
          };
        } else {
          this.connectionStatus = '❌ Error en la respuesta del servidor';
          this.error = response.message || 'Error desconocido';
        }
      },
      error: (error) => {
        console.error('Error de conexión:', error);
        this.connectionStatus = '❌ Error de conexión al backend';
        this.error = `No se pudo conectar al servidor backend en ${this.apiUrl}. 
                     Verifica que el servidor esté ejecutándose.`;
      }
    });
  }
}

// =====================================
// 4. src/app/components/diagnostico/diagnostico.component.ts (CORREGIDO)
// =====================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // ← AGREGAR ESTO

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diagnostico-container">
      <h2>🔍 Diagnóstico del Sistema</h2>
      
      <div class="info-section">
        <h3>Configuración Actual</h3>
        <p><strong>Entorno:</strong> {{ isProduction ? 'Producción' : 'Desarrollo' }}</p>
        <p><strong>API URL:</strong> {{ apiUrl }}</p>
      </div>
      
      <div class="test-section">
        <h3>1. Test de Conexión Backend</h3>
        <button (click)="testBackend()" class="btn btn-primary">Probar Conexión</button>
        <div *ngIf="backendResult" class="result">
          <h4>Resultado:</h4>
          <pre>{{ backendResult | json }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h3>2. Test Endpoint Instituciones</h3>
        <button (click)="testInstituciones()" class="btn btn-primary">Probar /instituciones</button>
        <div *ngIf="institucionesResult" class="result">
          <h4>Resultado:</h4>
          <pre>{{ institucionesResult | json }}</pre>
        </div>
        <div *ngIf="institucionesError" class="error">
          <h4>Error:</h4>
          <pre>{{ institucionesError | json }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h3>3. Test Manual en Navegador</h3>
        <p>Prueba estos URLs directamente en tu navegador:</p>
        <ul>
          <li><a [href]="apiUrl" target="_blank">{{ apiUrl }}</a></li>
          <li><a [href]="apiUrl + '/test-db'" target="_blank">{{ apiUrl }}/test-db</a></li>
          <li><a [href]="apiUrl + '/instituciones'" target="_blank">{{ apiUrl }}/instituciones</a></li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .diagnostico-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .info-section {
      margin-bottom: 20px;
      padding: 15px;
      background: #e3f2fd;
      border-radius: 8px;
    }

    .test-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .btn {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 15px;
    }

    .btn:hover {
      background: #0056b3;
    }

    .result {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      padding: 15px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .error {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      padding: 15px;
      border-radius: 4px;
      margin-top: 10px;
    }

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 300px;
      overflow-y: auto;
    }
  `]
})
export class DiagnosticoComponent implements OnInit {
  apiUrl = environment.apiUrl;              // ← AGREGAR ESTO
  isProduction = environment.production;    // ← AGREGAR ESTO
  backendResult: any = null;
  institucionesResult: any = null;
  institucionesError: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log('Diagnóstico inicializado con API URL:', this.apiUrl);
  }

  testBackend() {
    this.backendResult = null;
    this.http.get<any>(`${this.apiUrl}/`).subscribe({  // ← CAMBIADO
      next: (response) => {
        this.backendResult = response;
      },
      error: (error) => {
        this.backendResult = { error: error.message };
      }
    });
  }

  testInstituciones() {
    this.institucionesResult = null;
    this.institucionesError = null;
    
    this.http.get<any>(`${this.apiUrl}/instituciones`).subscribe({  // ← CAMBIADO
      next: (response) => {
        this.institucionesResult = response;
      },
      error: (error) => {
        this.institucionesError = error;
      }
    });
  }
}

// =====================================
// 5. CREAR SERVICIO PARA API (OPCIONAL PERO RECOMENDADO)
// =====================================
// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Método genérico para GET
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`);
  }

  // Método genérico para POST
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data);
  }

  // Métodos específicos
  testDb(): Observable<any> {
    return this.get('/test-db');
  }

  getInstituciones(): Observable<any> {
    return this.get('/instituciones');
  }

  getUsuarios(): Observable<any> {
    return this.get('/usuarios');
  }
}

// =====================================
// 6. USAR EL SERVICIO EN COMPONENTES (OPCIONAL)
// =====================================
// En cualquier componente:
import { ApiService } from '../../services/api.service';

export class MiComponente {
  constructor(private apiService: ApiService) {}

  testConnection() {
    this.apiService.testDb().subscribe({
      next: (response) => {
        console.log('✅ Respuesta:', response);
      },
      error: (error) => {
        console.error('❌ Error:', error);
      }
    });
  }
}