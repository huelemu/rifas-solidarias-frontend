// src/app/rifas/components/mis-numeros/mis-numeros.component.ts

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { NotificationService } from '../../../shared/services/notification.service';

interface NumeroComprado {
  id: number;
  numero: number;
  qr_code: string;
  precio: number;
  metodo_pago: string;
  fecha_compra: string;
  es_ganador: boolean;
}

interface RifaConNumeros {
  rifa: {
    id: number;
    nombre: string;
    descripcion: string;
    fecha_sorteo: string;
    estado: string;
    imagen_url: string;
    numero_ganador: number | null;
    institucion_nombre: string;
  };
  numeros: NumeroComprado[];
  total_gastado: number;
  hay_ganador: boolean;
}

interface ConsultaResponse {
  status: string;
  message: string;
  data: {
    email: string;
    total_rifas: number;
    total_numeros: number;
    total_invertido: number;
    rifas: RifaConNumeros[];
  };
}

@Component({
  selector: 'app-mis-numeros',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <div class="container">
      <div class="mis-numeros-page">
        
        <!-- Header -->
        <div class="page-header">
          <h1>🎟️ Mis Números</h1>
          <p>Consultá tus números comprando ingresando tu email</p>
        </div>

        <!-- Formulario de consulta -->
        @if (!datosConsulta()) {
          <div class="consulta-card">
            <div class="consulta-form">
              <div class="form-group">
                <label for="email">
                  <strong>Ingresá tu correo electrónico:</strong>
                </label>
                <input
                  id="email"
                  type="email"
                  [(ngModel)]="emailConsulta"
                  placeholder="ejemplo@email.com"
                  class="email-input"
                  (keyup.enter)="consultarNumeros()"
                  autocomplete="email">
              </div>

              <button 
                class="btn-consultar"
                [disabled]="loading() || !emailValido()"
                (click)="consultarNumeros()">
                @if (loading()) {
                  <span class="spinner"></span>
                  Consultando...
                } @else {
                  🔍 Buscar mis números
                }
              </button>

              @if (!emailValido() && emailConsulta.length > 0) {
                <small class="error-text">Por favor ingresá un email válido</small>
              }
            </div>

            <div class="info-privacidad">
              <p>🔒 <strong>Tu privacidad es importante:</strong></p>
              <ul>
                <li>Solo vos podrás ver tus números</li>
                <li>No guardamos tu email en cookies</li>
                <li>Consultá cuantas veces quieras</li>
              </ul>
            </div>
          </div>
        }

        <!-- Resultados -->
        @if (datosConsulta()) {
          <div class="resultados">
            
            <!-- Header de resultados -->
            <div class="resultados-header">
              <div class="email-consultado">
                <strong>Email:</strong> {{ datosConsulta()!.email }}
                <button class="btn-link" (click)="nuevaConsulta()">
                  Consultar otro email
                </button>
              </div>

              <div class="estadisticas-resumen">
                <div class="stat-item">
                  <span class="stat-value">{{ datosConsulta()!.total_rifas }}</span>
                  <span class="stat-label">Rifas</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ datosConsulta()!.total_numeros }}</span>
                  <span class="stat-label">Números</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">\${{ datosConsulta()!.total_invertido | number:'1.2-2' }}</span>
                  <span class="stat-label">Invertido</span>
                </div>
              </div>
            </div>

            <!-- Lista de rifas -->
            @if (datosConsulta()!.rifas.length === 0) {
              <div class="empty-state">
                <div class="empty-icon">🎫</div>
                <h3>No se encontraron números</h3>
                <p>No hay números comprados con el email <strong>{{ emailConsulta }}</strong></p>
                <button class="btn-secondary" (click)="nuevaConsulta()">
                  Intentar con otro email
                </button>
              </div>
            } @else {
              <div class="rifas-list">
                @for (rifaData of datosConsulta()!.rifas; track rifaData.rifa.id) {
                  <div class="rifa-card" [class.con-ganador]="rifaData.hay_ganador">
                    
                    <!-- Header de la rifa -->
                    <div class="rifa-header">
                      @if (rifaData.rifa.imagen_url) {
                        <img 
                          [src]="rifaData.rifa.imagen_url" 
                          [alt]="rifaData.rifa.nombre"
                          class="rifa-imagen">
                      }
                      <div class="rifa-info">
                        <h3>{{ rifaData.rifa.nombre }}</h3>
                        <p class="rifa-institucion">
                          📍 {{ rifaData.rifa.institucion_nombre }}
                        </p>
                        <div class="rifa-meta">
                          <span class="badge" [class]="'badge-' + rifaData.rifa.estado">
                            {{ rifaData.rifa.estado }}
                          </span>
                          @if (rifaData.rifa.fecha_sorteo) {
                            <span class="fecha-sorteo">
                              🎲 Sorteo: {{ rifaData.rifa.fecha_sorteo | date:'dd/MM/yyyy' }}
                            </span>
                          }
                        </div>
                      </div>
                    </div>

                    <!-- Número ganador si existe -->
                    @if (rifaData.rifa.numero_ganador) {
                      <div class="numero-ganador-anuncio">
                        <strong>🏆 Número ganador:</strong> {{ rifaData.rifa.numero_ganador }}
                        @if (rifaData.hay_ganador) {
                          <span class="felicitaciones">¡FELICITACIONES! 🎉</span>
                        }
                      </div>
                    }

                    <!-- Resumen -->
                    <div class="rifa-resumen">
                      <div class="resumen-item">
                        <span class="label">Números comprados:</span>
                        <span class="value">{{ rifaData.numeros.length }}</span>
                      </div>
                      <div class="resumen-item">
                        <span class="label">Total invertido:</span>
                        <span class="value">\${{ rifaData.total_gastado | number:'1.2-2' }}</span>
                      </div>
                    </div>

                    <!-- Números -->
                    <div class="numeros-grid">
                      @for (numero of rifaData.numeros; track numero.id) {
                        <div 
                          class="numero-card" 
                          [class.ganador]="numero.es_ganador">
                          
                          <div class="numero-principal">
                            {{ numero.numero }}
                          </div>
                          
                          @if (numero.es_ganador) {
                            <div class="ganador-badge">
                              🏆 GANADOR
                            </div>
                          }

                          <div class="numero-detalles">
                            <small>
                              <strong>\${{ numero.precio | number:'1.2-2' }}</strong>
                              <br>
                              {{ numero.fecha_compra | date:'dd/MM/yyyy' }}
                            </small>
                          </div>

                          <button 
                            class="btn-ver-qr"
                            (click)="verQR(numero)">
                            Ver QR
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Modal QR -->
        @if (numeroSeleccionado()) {
          <div class="modal-overlay" (click)="cerrarQR()">
            <div class="modal-qr" (click)="$event.stopPropagation()">
              <button class="modal-close" (click)="cerrarQR()">✕</button>
              
              <h3>Código QR - Número {{ numeroSeleccionado()!.numero }}</h3>
              
              @if (numeroSeleccionado()!.qr_code) {
                <img 
                  [src]="numeroSeleccionado()!.qr_code" 
                  alt="QR Code"
                  class="qr-image">
              } @else {
                <p>No hay código QR disponible</p>
              }

              <div class="qr-info">
                <p><strong>Precio:</strong> \${{ numeroSeleccionado()!.precio | number:'1.2-2' }}</p>
                <p><strong>Método de pago:</strong> {{ numeroSeleccionado()!.metodo_pago }}</p>
                <p><strong>Fecha:</strong> {{ numeroSeleccionado()!.fecha_compra | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #2d3748;
    }

    .page-header p {
      color: #718096;
      font-size: 1.1rem;
    }

    /* Formulario de consulta */
    .consulta-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 600px;
      margin: 0 auto;
    }

    .consulta-form {
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2d3748;
    }

    .email-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1.1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.3s;
    }

    .email-input:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    .btn-consultar {
      width: 100%;
      padding: 1rem;
      font-size: 1.1rem;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-consultar:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-consultar:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .info-privacidad {
      background: #f7fafc;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #4299e1;
    }

    .info-privacidad p {
      margin-bottom: 0.5rem;
      color: #2d3748;
    }

    .info-privacidad ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #4a5568;
    }

    .info-privacidad li {
      margin-bottom: 0.3rem;
    }

    /* Resultados */
    .resultados-header {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .email-consultado {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 1rem;
    }

    .btn-link {
      background: none;
      border: none;
      color: #4299e1;
      cursor: pointer;
      text-decoration: underline;
    }

    .estadisticas-resumen {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      text-align: center;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      display: block;
      color: #718096;
      font-size: 0.9rem;
    }

    /* Rifas */
    .rifas-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .rifa-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .rifa-card.con-ganador {
      border: 3px solid #f6ad55;
      box-shadow: 0 0 20px rgba(246, 173, 85, 0.3);
    }

    .rifa-header {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .rifa-imagen {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
    }

    .rifa-info h3 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
    }

    .rifa-institucion {
      color: #718096;
      margin-bottom: 0.75rem;
    }

    .rifa-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .badge-activa { background: #c6f6d5; color: #22543d; }
    .badge-finalizada { background: #e2e8f0; color: #2d3748; }
    .badge-borrador { background: #feebc8; color: #7c2d12; }

    .fecha-sorteo {
      color: #718096;
      font-size: 0.9rem;
    }

    .numero-ganador-anuncio {
      background: linear-gradient(135deg, #fef5e7 0%, #fadbd8 100%);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      text-align: center;
      border: 2px solid #f6ad55;
    }

    .felicitaciones {
      display: block;
      margin-top: 0.5rem;
      font-size: 1.2rem;
      color: #c53030;
      font-weight: 700;
    }

    .rifa-resumen {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .resumen-item {
      display: flex;
      justify-content: space-between;
    }

    .resumen-item .label {
      color: #718096;
    }

    .resumen-item .value {
      font-weight: 600;
      color: #2d3748;
    }

    /* Números Grid */
    .numeros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
    }

    .numero-card {
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      transition: all 0.3s;
    }

    .numero-card:hover {
      border-color: #4299e1;
      transform: translateY(-2px);
    }

    .numero-card.ganador {
      background: linear-gradient(135deg, #fef5e7 0%, #fadbd8 100%);
      border: 3px solid #f6ad55;
    }

    .numero-principal {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .ganador-badge {
      background: #f6ad55;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .numero-detalles {
      margin-bottom: 1rem;
      color: #718096;
    }

    .btn-ver-qr {
      width: 100%;
      padding: 0.5rem;
      background: #4299e1;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .btn-ver-qr:hover {
      background: #3182ce;
    }

    /* Modal QR */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-qr {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      position: relative;
    }

    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #718096;
    }

    .qr-image {
      width: 100%;
      max-width: 300px;
      margin: 1rem auto;
      display: block;
    }

    .qr-info {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .qr-info p {
      margin: 0.5rem 0;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #2d3748;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #718096;
      margin-bottom: 1.5rem;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: #e2e8f0;
      color: #2d3748;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .error-text {
      color: #e53e3e;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .spinner {
      border: 2px solid #f3f3f3;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      width: 1rem;
      height: 1rem;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .rifa-header {
        flex-direction: column;
      }

      .rifa-imagen {
        width: 100%;
        height: 200px;
      }

      .numeros-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }

      .estadisticas-resumen {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MisNumerosComponent {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);

  // API URL
  private readonly apiUrl: string;

  constructor() {
    const hostname = window.location.hostname;
    this.apiUrl = (hostname === 'localhost' || hostname === '127.0.0.1')
      ? 'http://localhost:3100'
      : 'https://apirifas.huelemu.com.ar';
  }

  // Signals
  emailConsulta = '';
  loading = signal(false);
  datosConsulta = signal<ConsultaResponse['data'] | null>(null);
  numeroSeleccionado = signal<NumeroComprado | null>(null);

  // Computed
  emailValido = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.emailConsulta);
  });

  /**
   * Consultar números por email
   */
  async consultarNumeros(): Promise<void> {
    if (!this.emailValido()) {
      this.notificationService.showError('Por favor ingresá un email válido');
      return;
    }

    this.loading.set(true);

    try {
      const response = await fetch(
        `${this.apiUrl}/api/numeros/consultar-por-email?email=${encodeURIComponent(this.emailConsulta.trim())}`
      );

      const data: ConsultaResponse = await response.json();

      if (data.status === 'success') {
        this.datosConsulta.set(data.data);
        
        if (data.data.total_numeros === 0) {
          this.notificationService.showInfo('Info', 'No se encontraron números con este email');
        } else {
          this.notificationService.showSuccess('Ok',
            `Se encontraron ${data.data.total_numeros} número(s) en ${data.data.total_rifas} rifa(s)`
          );
        }
      } else {
        this.notificationService.showError(data.message || 'Error al consultar números');
      }

    } catch (error) {
      console.error('Error al consultar números:', error);
      this.notificationService.showError('Error de conexión. Intentá nuevamente.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Nueva consulta
   */
  nuevaConsulta(): void {
    this.emailConsulta = '';
    this.datosConsulta.set(null);
    this.numeroSeleccionado.set(null);
  }

  /**
   * Ver código QR
   */
  verQR(numero: NumeroComprado): void {
    this.numeroSeleccionado.set(numero);
  }

  /**
   * Cerrar modal QR
   */
  cerrarQR(): void {
    this.numeroSeleccionado.set(null);
  }
}