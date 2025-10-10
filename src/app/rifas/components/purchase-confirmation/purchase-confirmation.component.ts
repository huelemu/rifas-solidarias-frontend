// src/app/rifas/components/purchase-confirmation/purchase-confirmation.component.ts
// Sistema de confirmación de compra entre comprador y vendedor

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';

/**
 * Estados posibles de una transacción
 */
type EstadoTransaccion = 'pendiente' | 'pagado' | 'confirmado' | 'rechazado' | 'expirado';

/**
 * Métodos de pago disponibles
 */
type MetodoPago = 'efectivo' | 'transferencia' | 'mercadopago' | 'otro';

/**
 * Interfaz de transacción de compra
 */
interface TransaccionCompra {
  id: number;
  rifa_id: number;
  rifa_nombre: string;
  numeros: number[];
  comprador_id: number;
  comprador_nombre: string;
  comprador_email: string;
  comprador_telefono: string;
  vendedor_id: number;
  vendedor_nombre: string;
  vendedor_email: string;
  metodo_pago: MetodoPago;
  monto_total: number;
  referencia_pago?: string;
  comprobante_url?: string;
  estado: EstadoTransaccion;
  fecha_solicitud: string;
  fecha_confirmacion?: string;
  fecha_expiracion: string;
  observaciones_comprador?: string;
  observaciones_vendedor?: string;
}

@Component({
  selector: 'app-purchase-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="confirmation-container">
      
      <!-- Vista para COMPRADOR -->
      @if (esComprador()) {
        <div class="comprador-view">
          <header class="confirmation-header">
            <h1>🛒 Confirmación de Compra</h1>
            <p class="subtitle">Completa tu compra de números de rifa</p>
          </header>

          <main class="confirmation-main">
            
            <!-- Paso 1: Información de la compra -->
            <section class="info-section">
              <h2>📋 Resumen de tu Compra</h2>
              
              <div class="info-card">
                <div class="info-row">
                  <label>Rifa:</label>
                  <span class="info-value">{{ transaccion().rifa_nombre }}</span>
                </div>
                
                <div class="info-row">
                  <label>Números seleccionados:</label>
                  <span class="info-value">{{ formatNumeros(transaccion().numeros) }}</span>
                </div>
                
                <div class="info-row">
                  <label>Cantidad:</label>
                  <span class="info-value">{{ transaccion().numeros.length }} números</span>
                </div>
                
                <div class="info-row">
                  <label>Monto total:</label>
                  <span class="info-value highlight">{{ formatCurrency(transaccion().monto_total) }}</span>
                </div>

                <div class="info-row">
                  <label>Vendedor:</label>
                  <span class="info-value">{{ transaccion().vendedor_nombre }}</span>
                </div>
              </div>
            </section>

            <!-- Paso 2: Método de pago -->
            <section class="payment-section">
              <h2>💳 Método de Pago</h2>
              
              <div class="payment-methods">
                <label class="payment-option">
                  <input 
                    type="radio" 
                    name="metodo_pago" 
                    value="efectivo"
                    [(ngModel)]="metodoPagoSeleccionado"
                    (change)="actualizarMetodoPago()">
                  <div class="payment-card">
                    <span class="payment-icon">💵</span>
                    <span class="payment-label">Efectivo</span>
                    <p class="payment-desc">Paga en persona al vendedor</p>
                  </div>
                </label>

                <label class="payment-option">
                  <input 
                    type="radio" 
                    name="metodo_pago" 
                    value="transferencia"
                    [(ngModel)]="metodoPagoSeleccionado"
                    (change)="actualizarMetodoPago()">
                  <div class="payment-card">
                    <span class="payment-icon">🏦</span>
                    <span class="payment-label">Transferencia</span>
                    <p class="payment-desc">Transferencia bancaria</p>
                  </div>
                </label>

                <label class="payment-option">
                  <input 
                    type="radio" 
                    name="metodo_pago" 
                    value="mercadopago"
                    [(ngModel)]="metodoPagoSeleccionado"
                    (change)="actualizarMetodoPago()">
                  <div class="payment-card">
                    <span class="payment-icon">💳</span>
                    <span class="payment-label">MercadoPago</span>
                    <p class="payment-desc">Pago online seguro</p>
                  </div>
                </label>
              </div>

              <!-- Instrucciones según método de pago -->
              @if (metodoPagoSeleccionado === 'transferencia') {
                <div class="payment-instructions">
                  <h3>📝 Datos para Transferencia</h3>
                  <div class="bank-data">
                    <p><strong>CBU:</strong> 0000003100010012345678</p>
                    <p><strong>Alias:</strong> RIFAS.SOLIDARIAS</p>
                    <p><strong>Titular:</strong> {{ transaccion().vendedor_nombre }}</p>
                    <p><strong>CUIT:</strong> 20-12345678-9</p>
                    <p><strong>Monto:</strong> {{ formatCurrency(transaccion().monto_total) }}</p>
                  </div>
                  
                  <div class="form-group">
                    <label>Número de transferencia / Referencia:</label>
                    <input 
                      type="text" 
                      [(ngModel)]="referenciaPago"
                      placeholder="Ej: 123456789"
                      class="form-input">
                  </div>

                  <div class="form-group">
                    <label>Adjuntar comprobante (opcional):</label>
                    <input 
                      type="file" 
                      (change)="subirComprobante($event)"
                      accept="image/*,application/pdf"
                      class="form-input">
                  </div>
                </div>
              }

              @if (metodoPagoSeleccionado === 'mercadopago') {
                <div class="payment-instructions">
                  <h3>💳 Pago con MercadoPago</h3>
                  <div class="mercadopago-link">
                    <p>Link de pago generado:</p>
                    <a href="#" class="btn-mercadopago" target="_blank">
                      Pagar con MercadoPago
                    </a>
                  </div>
                </div>
              }

              @if (metodoPagoSeleccionado === 'efectivo') {
                <div class="payment-instructions">
                  <h3>💵 Pago en Efectivo</h3>
                  <p>Coordina con el vendedor la entrega del efectivo.</p>
                  <p><strong>Contacto del vendedor:</strong> {{ transaccion().vendedor_email }}</p>
                </div>
              }
            </section>

            <!-- Paso 3: Confirmar intención de pago -->
            <section class="confirmation-section">
              <div class="form-group">
                <label>Observaciones (opcional):</label>
                <textarea 
                  [(ngModel)]="observacionesComprador"
                  placeholder="Agrega cualquier comentario relevante..."
                  rows="3"
                  class="form-textarea"></textarea>
              </div>

              <div class="actions">
                <button class="btn-cancel" (click)="cancelarCompra()">
                  Cancelar
                </button>
                
                <button 
                  class="btn-confirm"
                  [disabled]="!puedeConfirmarPago()"
                  (click)="notificarPagoRealizado()">
                  {{ getTextoBotonConfirmar() }}
                </button>
              </div>
            </section>

            <!-- Estado de la transacción -->
            <section class="status-section">
              <div class="status-card" [class]="getEstadoClass()">
                <h3>{{ getEstadoTitulo() }}</h3>
                <p>{{ getEstadoDescripcion() }}</p>
                
                @if (transaccion().estado === 'pendiente') {
                  <div class="countdown">
                    <span class="countdown-label">Tiempo restante:</span>
                    <span class="countdown-value">{{ tiempoRestante }}</span>
                  </div>
                }
              </div>
            </section>
          </main>
        </div>
      }

      <!-- Vista para VENDEDOR -->
      @if (esVendedor()) {
        <div class="vendedor-view">
          <header class="confirmation-header">
            <h1>✅ Confirmar Venta</h1>
            <p class="subtitle">Valida el pago del comprador</p>
          </header>

          <main class="confirmation-main">
            
            <!-- Información de la venta -->
            <section class="info-section">
              <h2>📋 Detalles de la Venta</h2>
              
              <div class="info-card">
                <div class="info-row">
                  <label>Comprador:</label>
                  <span class="info-value">{{ transaccion().comprador_nombre }}</span>
                </div>
                
                <div class="info-row">
                  <label>Email:</label>
                  <span class="info-value">{{ transaccion().comprador_email }}</span>
                </div>
                
                <div class="info-row">
                  <label>Teléfono:</label>
                  <span class="info-value">{{ transaccion().comprador_telefono }}</span>
                </div>
                
                <div class="info-row">
                  <label>Números vendidos:</label>
                  <span class="info-value">{{ formatNumeros(transaccion().numeros) }}</span>
                </div>
                
                <div class="info-row">
                  <label>Monto total:</label>
                  <span class="info-value highlight">{{ formatCurrency(transaccion().monto_total) }}</span>
                </div>

                <div class="info-row">
                  <label>Método de pago:</label>
                  <span class="info-value">{{ formatMetodoPago(transaccion().metodo_pago) }}</span>
                </div>

                @if (transaccion().referencia_pago) {
                  <div class="info-row">
                    <label>Referencia de pago:</label>
                    <span class="info-value">{{ transaccion().referencia_pago }}</span>
                  </div>
                }

                @if (transaccion().comprobante_url) {
                  <div class="info-row">
                    <label>Comprobante:</label>
                    <a [href]="transaccion().comprobante_url" target="_blank" class="link">
                      Ver comprobante
                    </a>
                  </div>
                }

                @if (transaccion().observaciones_comprador) {
                  <div class="info-row">
                    <label>Observaciones del comprador:</label>
                    <p class="info-value">{{ transaccion().observaciones_comprador }}</p>
                  </div>
                }
              </div>
            </section>

            <!-- Acciones del vendedor -->
            <section class="vendedor-actions-section">
              <h2>⚙️ Validar Pago</h2>
              
              <div class="vendedor-actions-card">
                @if (transaccion().estado === 'pendiente' || transaccion().estado === 'pagado') {
                  <div class="action-buttons">
                    <button 
                      class="btn-approve"
                      (click)="confirmarPago()">
                      ✅ Confirmar Pago Recibido
                    </button>
                    
                    <button 
                      class="btn-reject"
                      (click)="rechazarPago()">
                      ❌ Rechazar - No Recibí el Pago
                    </button>
                  </div>

                  <div class="form-group">
                    <label>Observaciones (opcional):</label>
                    <textarea 
                      [(ngModel)]="observacionesVendedor"
                      placeholder="Agrega detalles sobre la confirmación o rechazo..."
                      rows="3"
                      class="form-textarea"></textarea>
                  </div>
                } @else {
                  <div class="status-message">
                    <p>{{ getEstadoDescripcion() }}</p>
                  </div>
                }
              </div>
            </section>

            <!-- Historial de la transacción -->
            <section class="timeline-section">
              <h2>📜 Historial de la Transacción</h2>
              
              <div class="timeline">
                <div class="timeline-item completed">
                  <div class="timeline-icon">📝</div>
                  <div class="timeline-content">
                    <h4>Solicitud de Compra</h4>
                    <p>{{ formatDateTime(transaccion().fecha_solicitud) }}</p>
                  </div>
                </div>

                @if (transaccion().estado === 'pagado' || transaccion().estado === 'confirmado') {
                  <div class="timeline-item completed">
                    <div class="timeline-icon">💰</div>
                    <div class="timeline-content">
                      <h4>Pago Informado</h4>
                      <p>{{ formatMetodoPago(transaccion().metodo_pago) }}</p>
                    </div>
                  </div>
                }

                @if (transaccion().estado === 'confirmado' && transaccion().fecha_confirmacion) {
                  <div class="timeline-item completed">
                    <div class="timeline-icon">✅</div>
                    <div class="timeline-content">
                      <h4>Venta Confirmada</h4>
                      <p>{{ formatDateTime(transaccion().fecha_confirmacion!) }}</p>
                    </div>
                  </div>
                }

                @if (transaccion().estado === 'rechazado') {
                  <div class="timeline-item rejected">
                    <div class="timeline-icon">❌</div>
                    <div class="timeline-content">
                      <h4>Pago Rechazado</h4>
                      <p>El vendedor no confirmó el pago</p>
                    </div>
                  </div>
                }
              </div>
            </section>
          </main>
        </div>
      }
    </div>
  `,
  styles: [`
    .confirmation-container {
      min-height: calc(100vh - 64px);
      background: var(--bg-page);
    }

    /* Header */
    .confirmation-header {
      background: white;
      padding: 2rem;
      border-bottom: 1px solid var(--border-color);
      text-align: center;
    }

    .confirmation-header h1 {
      margin: 0;
      font-size: 2rem;
      color: var(--text-primary);
    }

    .subtitle {
      margin: 0.5rem 0 0 0;
      color: var(--text-secondary);
    }

    /* Main */
    .confirmation-main {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Sections */
    section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-md);
    }

    section h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      color: var(--text-primary);
    }

    /* Info Card */
    .info-card {
      background: var(--gray-50);
      border-radius: 8px;
      padding: 1.5rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row label {
      font-weight: 600;
      color: var(--text-secondary);
    }

    .info-value {
      color: var(--text-primary);
      font-weight: 500;
    }

    .info-value.highlight {
      font-size: 1.5rem;
      color: var(--success);
      font-weight: 700;
    }

    /* Payment Methods */
    .payment-methods {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .payment-option {
      cursor: pointer;
    }

    .payment-option input[type="radio"] {
      display: none;
    }

    .payment-card {
      background: var(--gray-50);
      border: 2px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      transition: var(--transition);
    }

    .payment-option input[type="radio"]:checked + .payment-card {
      border-color: var(--primary);
      background: linear-gradient(135deg, #f0f4ff 0%, #e9f0ff 100%);
    }

    .payment-card:hover {
      border-color: var(--primary);
    }

    .payment-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .payment-label {
      display: block;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .payment-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    /* Payment Instructions */
    .payment-instructions {
      background: var(--gray-50);
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 1rem;
    }

    .payment-instructions h3 {
      margin: 0 0 1rem 0;
      color: var(--text-primary);
    }

    .bank-data {
      background: white;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1rem;
      font-family: 'Courier New', monospace;
    }

    .bank-data p {
      margin: 0.5rem 0;
    }

    .btn-mercadopago {
      display: inline-block;
      background: #00b1ea;
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: var(--transition);
    }

    .btn-mercadopago:hover {
      background: #009ed8;
    }

    /* Form Elements */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-family: inherit;
      font-size: 1rem;
    }

    .form-textarea {
      resize: vertical;
    }

    /* Actions */
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn-cancel,
    .btn-confirm {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-cancel {
      background: var(--gray-200);
      color: var(--text-primary);
    }

    .btn-cancel:hover {
      background: var(--gray-300);
    }

    .btn-confirm {
      background: var(--primary);
      color: white;
    }

    .btn-confirm:hover:not(:disabled) {
      background: var(--primary-dark);
    }

    .btn-confirm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Vendedor Actions */
    .vendedor-actions-card {
      background: var(--gray-50);
      border-radius: 8px;
      padding: 1.5rem;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .btn-approve,
    .btn-reject {
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-approve {
      background: var(--success);
      color: white;
    }

    .btn-approve:hover {
      opacity: 0.9;
    }

    .btn-reject {
      background: var(--danger);
      color: white;
    }

    .btn-reject:hover {
      opacity: 0.9;
    }

    /* Status Card */
    .status-section {
      margin-top: 2rem;
    }

    .status-card {
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
    }

    .status-card.pendiente {
      background: #fff3cd;
      border: 2px solid #ffc107;
    }

    .status-card.pagado {
      background: #d1ecf1;
      border: 2px solid #17a2b8;
    }

    .status-card.confirmado {
      background: #d4edda;
      border: 2px solid #28a745;
    }

    .status-card.rechazado {
      background: #f8d7da;
      border: 2px solid #dc3545;
    }

    .status-card h3 {
      margin: 0 0 0.5rem 0;
    }

    .countdown {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(0,0,0,0.1);
    }

    .countdown-label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .countdown-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--danger);
    }

    /* Timeline */
    .timeline {
      position: relative;
      padding-left: 3rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 1.25rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--border-color);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 2rem;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-icon {
      position: absolute;
      left: -2.5rem;
      width: 2.5rem;
      height: 2.5rem;
      background: white;
      border: 2px solid var(--border-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .timeline-item.completed .timeline-icon {
      border-color: var(--success);
      background: var(--success);
    }

    .timeline-item.rejected .timeline-icon {
      border-color: var(--danger);
      background: var(--danger);
    }

    .timeline-content h4 {
      margin: 0 0 0.25rem 0;
      color: var(--text-primary);
    }

    .timeline-content p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    /* Link */
    .link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover {
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .confirmation-main {
        padding: 1rem;
      }

      .payment-methods {
        grid-template-columns: 1fr;
      }

      .actions,
      .action-buttons {
        flex-direction: column;
        grid-template-columns: 1fr;
      }

      .actions button,
      .action-buttons button {
        width: 100%;
      }
    }
  `]
})
export class PurchaseConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Signals
  transaccion = signal<TransaccionCompra>({
    id: 1,
    rifa_id: 1,
    rifa_nombre: 'Rifa Solidaria Cruz Roja 2024',
    numeros: [15, 28, 42],
    comprador_id: 2,
    comprador_nombre: 'Juan Pérez',
    comprador_email: 'juan.perez@example.com',
    comprador_telefono: '+54 9 11 1234-5678',
    vendedor_id: 1,
    vendedor_nombre: 'María González',
    vendedor_email: 'maria.gonzalez@cruzroja.org',
    metodo_pago: 'transferencia',
    monto_total: 4500,
    estado: 'pendiente',
    fecha_solicitud: new Date().toISOString(),
    fecha_expiracion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });

  // Estado del formulario
  metodoPagoSeleccionado: MetodoPago = 'transferencia';
  referenciaPago = '';
  observacionesComprador = '';
  observacionesVendedor = '';
  tiempoRestante = '23:59:45';

  ngOnInit(): void {
    const transaccionId = this.route.snapshot.paramMap.get('id');
    if (transaccionId) {
      this.cargarTransaccion(+transaccionId);
    }
    
    // Iniciar contador de tiempo
    this.iniciarContador();
  }

  /**
   * Carga los datos de la transacción
   */
  private async cargarTransaccion(id: number): Promise<void> {
    try {
      // TODO: Implementar llamada al backend
      console.log('Cargando transacción:', id);
    } catch (error) {
      console.error('Error cargando transacción:', error);
      this.notificationService.showError('Error al cargar la transacción');
    }
  }

  /**
   * Inicia el contador de tiempo restante
   */
  private iniciarContador(): void {
    setInterval(() => {
      const ahora = new Date().getTime();
      const expiracion = new Date(this.transaccion().fecha_expiracion).getTime();
      const diferencia = expiracion - ahora;

      if (diferencia <= 0) {
        this.tiempoRestante = 'Expirado';
        return;
      }

      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

      this.tiempoRestante = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }, 1000);
  }

  /**
   * Verifica si el usuario actual es el comprador
   */
  esComprador(): boolean {
    const userId = this.authService.currentUser()?.id;
    return userId === this.transaccion().comprador_id;
  }

  /**
   * Verifica si el usuario actual es el vendedor
   */
  esVendedor(): boolean {
    const userId = this.authService.currentUser()?.id;
    return userId === this.transaccion().vendedor_id;
  }

  /**
   * Actualiza el método de pago
   */
  actualizarMetodoPago(): void {
    // Resetear campos relacionados
    this.referenciaPago = '';
  }

  /**
   * Sube el comprobante de pago
   */
  async subirComprobante(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      try {
        // TODO: Implementar upload a servidor
        console.log('Subiendo comprobante:', file.name);
        this.notificationService.showSuccess('OK', 'Comprobante adjuntado correctamente');
      } catch (error) {
        console.error('Error subiendo comprobante:', error);
        this.notificationService.showError('Error al subir el comprobante');
      }
    }
  }

  /**
   * Verifica si se puede confirmar el pago
   */
  puedeConfirmarPago(): boolean {
    if (this.metodoPagoSeleccionado === 'transferencia') {
      return this.referenciaPago.trim().length > 0;
    }
    return true;
  }

  /**
   * Texto del botón de confirmar
   */
  getTextoBotonConfirmar(): string {
    if (this.transaccion().estado === 'pendiente') {
      return 'Notificar Pago Realizado';
    }
    if (this.transaccion().estado === 'pagado') {
      return 'Esperando Confirmación del Vendedor';
    }
    return 'Confirmar';
  }

  /**
   * Notifica que el pago fue realizado
   */
  async notificarPagoRealizado(): Promise<void> {
    try {
      // TODO: Implementar llamada al backend
      console.log('Notificando pago realizado');
      
      // Actualizar estado
      this.transaccion.update(t => ({
        ...t,
        estado: 'pagado',
        referencia_pago: this.referenciaPago,
        observaciones_comprador: this.observacionesComprador
      }));

      this.notificationService.showSuccess(
        'Pago notificado. El vendedor debe confirmar la recepción.',
        '✅ Notificación Enviada'
      );
    } catch (error) {
      console.error('Error notificando pago:', error);
      this.notificationService.showError('Error al notificar el pago');
    }
  }

  /**
   * Cancela la compra
   */
  async cancelarCompra(): Promise<void> {
    if (confirm('¿Estás seguro de cancelar esta compra?')) {
      try {
        // TODO: Implementar llamada al backend
        this.router.navigate(['/rifas']);
        this.notificationService.showInfo('Info','Compra cancelada');
      } catch (error) {
        console.error('Error cancelando compra:', error);
        this.notificationService.showError('Error al cancelar la compra');
      }
    }
  }

  /**
   * Confirma el pago (vendedor)
   */
  async confirmarPago(): Promise<void> {
    try {
      // TODO: Implementar llamada al backend
      console.log('Confirmando pago');
      
      this.transaccion.update(t => ({
        ...t,
        estado: 'confirmado',
        fecha_confirmacion: new Date().toISOString(),
        observaciones_vendedor: this.observacionesVendedor
      }));

      this.notificationService.showSuccess(
        'Venta confirmada exitosamente. Los números se asignaron al comprador.',
        '✅ Venta Confirmada'
      );
    } catch (error) {
      console.error('Error confirmando pago:', error);
      this.notificationService.showError('Error al confirmar el pago');
    }
  }

  /**
   * Rechaza el pago (vendedor)
   */
  async rechazarPago(): Promise<void> {
    if (confirm('¿Estás seguro de rechazar este pago?')) {
      try {
        // TODO: Implementar llamada al backend
        console.log('Rechazando pago');
        
        this.transaccion.update(t => ({
          ...t,
          estado: 'rechazado',
          observaciones_vendedor: this.observacionesVendedor
        }));

        this.notificationService.showError('Pago rechazado. El comprador será notificado.');
      } catch (error) {
        console.error('Error rechazando pago:', error);
        this.notificationService.showError('Error al rechazar el pago');
      }
    }
  }

  /**
   * Helpers de estado
   */
  getEstadoClass(): string {
    return this.transaccion().estado;
  }

  getEstadoTitulo(): string {
    const titulos: Record<EstadoTransaccion, string> = {
      'pendiente': '⏳ Pendiente de Pago',
      'pagado': '💰 Pago Informado',
      'confirmado': '✅ Venta Confirmada',
      'rechazado': '❌ Pago Rechazado',
      'expirado': '⌛ Transacción Expirada'
    };
    return titulos[this.transaccion().estado];
  }

  getEstadoDescripcion(): string {
    const descripciones: Record<EstadoTransaccion, string> = {
      'pendiente': 'Completa el pago y notifica al vendedor.',
      'pagado': 'Esperando que el vendedor confirme la recepción del pago.',
      'confirmado': '¡Felicitaciones! Los números ya son tuyos.',
      'rechazado': 'El vendedor no confirmó el pago. Contacta con él para resolver.',
      'expirado': 'El tiempo límite para completar la transacción ha expirado.'
    };
    return descripciones[this.transaccion().estado];
  }

  /**
   * Helpers de formato
   */
  formatNumeros(numeros: number[]): string {
    return numeros.join(', ');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  }

  formatMetodoPago(metodo: MetodoPago): string {
    const metodos: Record<MetodoPago, string> = {
      'efectivo': '💵 Efectivo',
      'transferencia': '🏦 Transferencia',
      'mercadopago': '💳 MercadoPago',
      'otro': '📝 Otro'
    };
    return metodos[metodo];
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}