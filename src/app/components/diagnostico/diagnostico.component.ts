// src/app/components/diagnostico/diagnostico.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diagnostico-container">
      <h2>🔍 Diagnóstico del Sistema</h2>
      
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
        <h3>3. Test Endpoint Usuarios</h3>
        <button (click)="testUsuarios()" class="btn btn-primary">Probar /usuarios</button>
        <div *ngIf="usuariosResult" class="result">
          <h4>Resultado:</h4>
          <pre>{{ usuariosResult | json }}</pre>
        </div>
        <div *ngIf="usuariosError" class="error">
          <h4>Error:</h4>
          <pre>{{ usuariosError | json }}</pre>
        </div>
      </div>

      <div class="test-section">
        <h3>4. Test Manual en Navegador</h3>
        <p>Prueba estos URLs directamente en tu navegador:</p>
        <ul>
          <li><a href="http://localhost:3100" target="_blank">http://localhost:3100</a></li>
          <li><a href="http://localhost:3100/test-db" target="_blank">http://localhost:3100/test-db</a></li>
          <li><a href="http://localhost:3100/instituciones" target="_blank">http://localhost:3100/instituciones</a></li>
          <li><a href="http://localhost:3100/usuarios" target="_blank">http://localhost:3100/usuarios</a></li>
        </ul>
      </div>

      <div class="test-section">
        <h3>5. Comandos para Verificar Backend</h3>
        <div class="commands">
          <p><strong>1. Verificar que el servidor esté corriendo:</strong></p>
          <code>curl http://localhost:3100</code>
          
          <p><strong>2. Verificar endpoint de instituciones:</strong></p>
          <code>curl http://localhost:3100/instituciones</code>
          
          <p><strong>3. Verificar endpoint de usuarios:</strong></p>
          <code>curl http://localhost:3100/usuarios</code>
          
          <p><strong>4. Verificar base de datos:</strong></p>
          <code>curl http://localhost:3100/test-db</code>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .diagnostico-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .test-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .test-section h3 {
      margin-bottom: 15px;
      color: #333;
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

    .commands {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
    }

    .commands p {
      margin: 15px 0 5px 0;
      font-weight: bold;
    }

    code {
      background: #e9ecef;
      padding: 5px 10px;
      border-radius: 3px;
      display: block;
      margin: 5px 0 15px 0;
    }

    ul {
      list-style-type: disc;
      margin-left: 20px;
    }

    ul li {
      margin: 5px 0;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `]
})
export class DiagnosticoComponent implements OnInit {
  backendResult: any = null;
  institucionesResult: any = null;
  institucionesError: any = null;
  usuariosResult: any = null;
  usuariosError: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log('🔍 Componente de diagnóstico iniciado');
  }

  testBackend() {
    console.log('🚀 Probando conexión al backend...');
    this.backendResult = null;
    
    this.http.get('http://localhost:3100').subscribe({
      next: (response) => {
        console.log('✅ Backend responde:', response);
        this.backendResult = response;
      },
      error: (error) => {
        console.error('❌ Error en backend:', error);
        this.backendResult = { error: error.message, status: error.status };
      }
    });
  }

  testInstituciones() {
    console.log('🏢 Probando endpoint de instituciones...');
    this.institucionesResult = null;
    this.institucionesError = null;
    
    this.http.get('http://localhost:3100/instituciones').subscribe({
      next: (response) => {
        console.log('✅ Instituciones responde:', response);
        this.institucionesResult = response;
      },
      error: (error) => {
        console.error('❌ Error en instituciones:', error);
        this.institucionesError = { 
          message: error.message, 
          status: error.status,
          error: error.error 
        };
      }
    });
  }

  testUsuarios() {
    console.log('👥 Probando endpoint de usuarios...');
    this.usuariosResult = null;
    this.usuariosError = null;
    
    this.http.get('http://localhost:3100/usuarios').subscribe({
      next: (response) => {
        console.log('✅ Usuarios responde:', response);
        this.usuariosResult = response;
      },
      error: (error) => {
        console.error('❌ Error en usuarios:', error);
        this.usuariosError = { 
          message: error.message, 
          status: error.status,
          error: error.error 
        };
      }
    });
  }
}