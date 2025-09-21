// src/app/components/diagnostico/diagnostico.component.ts - VERSIÓN MEJORADA
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnostico.component.html', 
  styleUrls: ['./diagnostico.component.css']
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