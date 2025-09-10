// src/app/components/diagnostico/diagnostico.component.ts - VERSIÓN MEJORADA
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diagnostico-container">
      <div class="header">
        <h2>🔍 Diagnóstico del Sistema</h2>
        <div class="environment-info">
          <span class="env-badge">{{ getEnvironment() }}</span>
          <span class="backend-url">{{ getBackendUrl() }}</span>
        </div>
      </div>

      <!-- Authentication Status -->
      <div class="auth-section" *ngIf="authStatus">
        <h3>🔐 Estado de Autenticación</h3>
        <div class="auth-info" [ngClass]="authStatus.isAuthenticated ? 'authenticated' : 'not-authenticated'">
          <div class="auth-status">
            {{ authStatus.isAuthenticated ? '✅ Autenticado' : '❌ No autenticado' }}
          </div>
          <div *ngIf="authStatus.user" class="user-info">
            <strong>Usuario:</strong> {{ authStatus.user.email }} ({{ authStatus.user.rol }})
          </div>
          <div *ngIf="authStatus.token" class="token-info">
            <strong>Token:</strong> {{ authStatus.token.substring(0, 20) }}...
          </div>
        </div>
      </div>

      <!-- Tests Automáticos -->
      <div class="test-section">
        <h3>🚀 Tests Automáticos</h3>
        <button (click)="runAllTests()" [disabled]="isRunningTests" class="btn btn-primary">
          {{ isRunningTests ? '⏳ Ejecutando...' : '▶️ Ejecutar Todos los Tests' }}
        </button>
      </div>

      <!-- Test 1: Backend -->
      <div class="test-section">
        <div class="test-header">
          <h3>1. Test de Conexión Backend</h3>
          <button (click)="testBackend()" class="btn btn-secondary">Probar</button>
        </div>
        <div *ngIf="backendResult" class="result">
          <h4>Resultado:</h4>
          <pre>{{ backendResult | json }}</pre>
        </div>
      </div>

      <!-- Test 2: Instituciones -->
      <div class="test-section">
        <div class="test-header">
          <h3>2. Test Endpoint Instituciones</h3>
          <button (click)="testInstituciones()" class="btn btn-secondary">Probar</button>
        </div>
        <div *ngIf="institucionesResult" class="result">
          <h4>Resultado ({{ institucionesResult.data?.length || 0 }} instituciones):</h4>
          <pre>{{ institucionesResult | json }}</pre>
        </div>
        <div *ngIf="institucionesError" class="error">
          <h4>Error:</h4>
          <pre>{{ institucionesError | json }}</pre>
        </div>
      </div>

      <!-- Test 3: Usuarios (con y sin auth) -->
      <div class="test-section">
        <div class="test-header">
          <h3>3. Test Endpoint Usuarios</h3>
          <div class="test-buttons">
            <button (click)="testUsuarios()" class="btn btn-secondary">Probar sin Auth</button>
            <button (click)="testUsuariosAuth()" 
                    [disabled]="!authStatus?.isAuthenticated" 
                    class="btn btn-primary">
              Probar con Auth
            </button>
          </div>
        </div>
        <div *ngIf="usuariosResult" class="result">
          <h4>Resultado ({{ usuariosResult.data?.length || 0 }} usuarios):</h4>
          <pre>{{ usuariosResult | json }}</pre>
        </div>
        <div *ngIf="usuariosError" class="error">
          <h4>Error:</h4>
          <pre>{{ usuariosError | json }}</pre>
        </div>
      </div>

      <!-- Test 4: Auth Me -->
      <div class="test-section" *ngIf="authStatus?.isAuthenticated">
        <div class="test-header">
          <h3>4. Test Validación Token</h3>
          <button (click)="testAuthMe()" class="btn btn-secondary">Validar Token</button>
        </div>
        <div *ngIf="authMeResult" class="result">
          <h4>Resultado:</h4>
          <pre>{{ authMeResult | json }}</pre>
        </div>
        <div *ngIf="authMeError" class="error">
          <h4>Error:</h4>
          <pre>{{ authMeError | json }}</pre>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="test-section">
        <h3>⚡ Acciones Rápidas</h3>
        <div class="quick-actions">
          <button (click)="clearLocalStorage()" class="btn btn-warning">
            🗑️ Limpiar Storage
          </button>
          <button (click)="refreshAuth()" class="btn btn-info">
            🔄 Refrescar Auth
          </button>
          <a [href]="getBackendUrl() + '/api-docs'" target="_blank" class="btn btn-success">
            📚 Ver API Docs
          </a>
        </div>
      </div>

      <!-- Manual Tests -->
      <div class="test-section">
        <h3>4. Test Manual en Navegador</h3>
        <p>Prueba estos URLs directamente en tu navegador:</p>
        <ul>
          <li><a [href]="getBackendUrl()" target="_blank">{{ getBackendUrl() }}</a> - Salud del backend</li>
          <li><a [href]="getBackendUrl() + '/test-db'" target="_blank">{{ getBackendUrl() }}/test-db</a> - Test de BD</li>
          <li><a [href]="getBackendUrl() + '/instituciones'" target="_blank">{{ getBackendUrl() }}/instituciones</a> - Instituciones</li>
          <li><a [href]="getBackendUrl() + '/api-docs'" target="_blank">{{ getBackendUrl() }}/api-docs</a> - Documentación</li>
        </ul>
      </div>

      <!-- Commands -->
      <div class="test-section">
        <h3>5. Comandos cURL</h3>
        <div class="commands">
          <p><strong>1. Verificar backend:</strong></p>
          <code>curl {{ getBackendUrl() }}</code>
          
          <p><strong>2. Test de base de datos:</strong></p>
          <code>curl {{ getBackendUrl() }}/test-db</code>
          
          <p><strong>3. Instituciones públicas:</strong></p>
          <code>curl {{ getBackendUrl() }}/instituciones</code>
          
          <p><strong>4. Usuarios (requiere auth):</strong></p>
          <code *ngIf="authStatus?.token">curl -H "Authorization: Bearer {{ authStatus.token.substring(0, 20) }}..." {{ getBackendUrl() }}/usuarios</code>
          <code *ngIf="!authStatus?.token">curl -H "Authorization: Bearer TU_TOKEN" {{ getBackendUrl() }}/usuarios</code>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="test-section" *ngIf="testResults.length > 0">
        <h3>📊 Resumen de Resultados</h3>
        <div class="results-summary">
          <div *ngFor="let result of testResults" 
               class="result-item" 
               [ngClass]="result.status">
            <span class="result-name">{{ result.name }}</span>
            <span class="result-status">{{ result.status }}</span>
            <span class="result-message">{{ result.message }}</span>
          </div>
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

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
    }

    .header h2 {
      margin: 0 0 10px 0;
    }

    .environment-info {
      display: flex;
      justify-content: center;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }

    .env-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: bold;
    }

    .backend-url {
      font-family: monospace;
      background: rgba(255, 255, 255, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .auth-section {
      margin-bottom: 30px;
      padding: 20px;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .auth-info {
      padding: 15px;
      border-radius: 8px;
      border: 2px solid;
    }

    .auth-info.authenticated {
      background: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }

    .auth-info.not-authenticated {
      background: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }

    .auth-status {
      font-weight: bold;
      margin-bottom: 10px;
    }

    .user-info, .token-info {
      margin: 5px 0;
      font-size: 0.9rem;
    }

    .test-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .test-section h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .test-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .quick-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s ease;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn-info {
      background: #17a2b8;
      color: white;
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
      margin: 10px 0 0 0;
      font-size: 0.875rem;
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
      padding: 8px 12px;
      border-radius: 4px;
      display: block;
      margin: 5px 0 15px 0;
      font-family: monospace;
      font-size: 0.875rem;
      word-break: break-all;
    }

    ul {
      list-style-type: disc;
      margin-left: 20px;
    }

    ul li {
      margin: 8px 0;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .results-summary {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-radius: 6px;
      border: 1px solid;
    }

    .result-item.success {
      background: #d4edda;
      border-color: #c3e6cb;
    }

    .result-item.error {
      background: #f8d7da;
      border-color: #f5c6cb;
    }

    .result-item.testing {
      background: #fff3cd;
      border-color: #ffeaa7;
    }

    .result-name {
      font-weight: bold;
    }

    .result-status {
      text-transform: uppercase;
      font-size: 0.875rem;
      font-weight: bold;
    }

    .result-message {
      font-size: 0.875rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .diagnostico-container {
        padding: 15px;
      }

      .test-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .quick-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        text-align: center;
      }

      .environment-info {
        flex-direction: column;
        gap: 10px;
      }
    }
  `]
})
export class DiagnosticoComponent implements OnInit {
  backendResult: any = null;
  institucionesResult: any = null;
  institucionesError: any = null;
  usuariosResult: any = null;
  usuariosError: any = null;
  authMeResult: any = null;
  authMeError: any = null;
  
  authStatus: any = null;
  isRunningTests = false;
  testResults: Array<{name: string, status: string, message: string}> = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('🔍 Componente de diagnóstico iniciado');
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.authStatus = {
      isAuthenticated: this.authService.isAuthenticated(),
      user: this.authService.getCurrentUser(),
      token: this.authService.getAccessToken()
    };
  }

  getEnvironment(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'DESARROLLO';
    } else {
      return 'PRODUCCIÓN';
    }
  }

  getBackendUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  async runAllTests() {
    this.isRunningTests = true;
    this.testResults = [];
    
    console.log('🚀 Ejecutando todos los tests...');
    
    await this.testBackend();
    await this.delay(500);
    
    await this.testInstituciones();
    await this.delay(500);
    
    await this.testUsuarios();
    await this.delay(500);
    
    if (this.authStatus?.isAuthenticated) {
      await this.testUsuariosAuth();
      await this.delay(500);
      
      await this.testAuthMe();
    }
    
    this.isRunningTests = false;
    console.log('✅ Todos los tests completados');
  }

  testBackend() {
    console.log('🚀 Probando conexión al backend...');
    this.backendResult = null;
    
    return this.http.get(this.getBackendUrl()).toPromise().then(
      (response) => {
        console.log('✅ Backend responde:', response);
        this.backendResult = response;
        this.addTestResult('Backend', 'success', 'Conexión exitosa');
      }
    ).catch(
      (error) => {
        console.error('❌ Error en backend:', error);
        this.backendResult = { error: error.message, status: error.status };
        this.addTestResult('Backend', 'error', error.message);
      }
    );
  }

  testInstituciones() {
    console.log('🏢 Probando endpoint de instituciones...');
    this.institucionesResult = null;
    this.institucionesError = null;
    
    return this.http.get(`${this.getBackendUrl()}/instituciones`).toPromise().then(
      (response: any) => {
        console.log('✅ Instituciones responde:', response);
        this.institucionesResult = response;
        this.addTestResult('Instituciones', 'success', `${response.data?.length || 0} instituciones encontradas`);
      }
    ).catch(
      (error) => {
        console.error('❌ Error en instituciones:', error);
        this.institucionesError = { 
          message: error.message, 
          status: error.status,
          error: error.error 
        };
        this.addTestResult('Instituciones', 'error', error.message);
      }
    );
  }

  testUsuarios() {
    console.log('👥 Probando endpoint de usuarios sin auth...');
    this.usuariosResult = null;
    this.usuariosError = null;
    
    return this.http.get(`${this.getBackendUrl()}/usuarios`).toPromise().then(
      (response: any) => {
        console.log('✅ Usuarios responde:', response);
        this.usuariosResult = response;
        this.addTestResult('Usuarios (sin auth)', 'success', `${response.data?.length || 0} usuarios encontrados`);
      }
    ).catch(
      (error) => {
        console.error('❌ Error en usuarios:', error);
        this.usuariosError = { 
          message: error.message, 
          status: error.status,
          error: error.error 
        };
        this.addTestResult('Usuarios (sin auth)', 'error', `${error.status} - ${error.error?.message || error.message}`);
      }
    );
  }

  testUsuariosAuth() {
    console.log('👥 Probando endpoint de usuarios CON auth...');
    
    const token = this.authService.getAccessToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    
    return this.http.get(`${this.getBackendUrl()}/usuarios`, { headers }).toPromise().then(
      (response: any) => {
        console.log('✅ Usuarios con auth responde:', response);
        this.usuariosResult = response;
        this.addTestResult('Usuarios (con auth)', 'success', `${response.data?.length || 0} usuarios encontrados`);
      }
    ).catch(
      (error) => {
        console.error('❌ Error en usuarios con auth:', error);
        this.usuariosError = { 
          message: error.message, 
          status: error.status,
          error: error.error 
        };
        this.addTestResult('Usuarios (con auth)', 'error', `${error.status} - ${error.error?.message || error.message}`);
      }
    );
  }

  testAuthMe() {
    console.log('🔐 Validando token con /auth/me...');
    this.authMeResult = null;
    this.authMeError = null;
    
    return this.authService.authenticatedRequest('/auth/me').toPromise().then(
      (response: any) => {
        console.log('✅ Auth/me responde:', response);
        this.authMeResult = response;
        this.addTestResult('Validación Token', 'success', 'Token válido');
      }
    ).catch(
      (error) => {
        console.error('❌ Error en auth/me:', error);
        this.authMeError = { 
          message: error.message, 
          status: error.status,
          error: error.error 
        };
        this.addTestResult('Validación Token', 'error', error.message);
      }
    );
  }

  clearLocalStorage() {
    if (confirm('¿Estás seguro de limpiar el localStorage? Esto cerrará tu sesión.')) {
      localStorage.clear();
      console.log('🗑️ LocalStorage limpiado');
      this.checkAuthStatus();
      window.location.reload();
    }
  }

  refreshAuth() {
    this.checkAuthStatus();
    console.log('🔄 Estado de auth actualizado');
  }

  private addTestResult(name: string, status: string, message: string) {
    this.testResults.push({ name, status, message });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}