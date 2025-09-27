// src/app/rifas/components/buy-numbers/buy-numbers.component.ts

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';

interface NumeroSeleccionado {
  numero: number;
  precio: number;
  seleccionado: boolean;
}

@Component({
  selector: 'app-buy-numbers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="buy-numbers-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <button 
              class="btn btn-outline back-btn"
              (click)="goBack()">
              ← Volver
            </button>
            <div class="header-title">
              <h1>🛒 Comprar Números</h1>
              @if (rifa()) {
                <p>{{ rifa().nombre }}</p>
              }
            </div>
          </div>
          <div class="header-actions">
            <div class="price-display">
              <span class="price-label">Precio por número:</span>
              <span class="price-value">{{ formatPrice(rifa()?.precio_numero || 0) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen de compra -->
      @if (numerosSeleccionados().length > 0) {
        <div class="purchase-summary">
          <div class="summary-card">
            <h3>📋 Resumen de Compra</h3>
            <div class="summary-details">
              <div class="summary-item">
                <span>Números seleccionados:</span>
                <span class="highlight">{{ numerosSeleccionados().length }}</span>
              </div>
              <div class="summary-item">
                <span>Números:</span>
                <span class="numbers-list">{{ getSelectedNumbersList() }}</span>
              </div>
              <div class="summary-item total">
                <span>Total a pagar:</span>
                <span class="total-amount">{{ formatPrice(getTotalAmount()) }}</span>
              </div>
            </div>
            <button 
              class="btn btn-success purchase-btn"
              (click)="proceedToPurchase()"
              [disabled]="purchasing()">
              @if (purchasing()) {
                ⏳ Procesando...
              } @else {
                💰 Comprar Números
              }
            </button>
          </div>
        </div>
      }

      <!-- Métodos de selección -->
      <div class="selection-methods">
        <div class="methods-grid">
          <div class="method-card">
            <h3>🎯 Selección Manual</h3>
            <p>Haz clic en los números que deseas comprar</p>
            <div class="quick-actions">
              <button 
                class="btn btn-outline btn-sm"
                (click)="clearSelection()">
                🧹 Limpiar Selección
              </button>
            </div>
          </div>

          <div class="method-card">
            <h3>🎲 Selección Aleatoria</h3>
            <p>Deja que el sistema elija por ti</p>
            <div class="random-controls">
              <input 
                type="number"
                [(ngModel)]="randomCount"
                class="form-control"
                placeholder="Cantidad"
                min="1"
                max="10">
              <button 
                class="btn btn-primary btn-sm"
                (click)="selectRandomNumbers()">
                🎲 Elegir Al Azar
              </button>
            </div>
          </div>

          <div class="method-card">
            <h3>🔢 Selección por Rango</h3>
            <p>Selecciona un rango de números consecutivos</p>
            <div class="range-controls">
              <input 
                type="number"
                [(ngModel)]="rangeStart"
                class="form-control"
                placeholder="Desde"
                min="1">
              <input 
                type="number"
                [(ngModel)]="rangeEnd"
                class="form-control"
                placeholder="Hasta"
                min="1">
              <button 
                class="btn btn-secondary btn-sm"
                (click)="selectRangeNumbers()">
                📊 Seleccionar Rango
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros de números -->
      <div class="filters-section">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Mostrar solo:</label>
            <select 
              [(ngModel)]="filtroEstado"
              (ngModelChange)="loadNumeros()"
              class="form-control">
              <option value="">Todos los números</option>
              <option value="disponible">📗 Solo disponibles</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Desde número:</label>
            <input 
              type="number"
              [(ngModel)]="filtroDesde"
              (ngModelChange)="loadNumeros()"
              class="form-control"
              placeholder="1"
              min="1">
          </div>

          <div class="filter-group">
            <label>Hasta número:</label>
            <input 
              type="number"
              [(ngModel)]="filtroHasta"
              (ngModelChange)="loadNumeros()"
              class="form-control"
              placeholder="1000"
              min="1">
          </div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando números disponibles...</p>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="error-container">
          <div class="error-message">
            <h3>❌ Error</h3>
            <p>{{ error() }}</p>
            <button 
              class="btn btn-primary"
              (click)="loadNumeros()">
              🔄 Reintentar
            </button>
          </div>
        </div>
      }

      <!-- Grid de números -->
      @if (!loading() && !error() && numeros().length > 0) {
        <div class="numbers-section">
          <div class="numbers-header">
            <h2>🎫 Números Disponibles</h2>
            <div class="numbers-stats">
              <span class="stat">
                <span class="stat-label">Disponibles:</span>
                <span class="stat-value">{{ getAvailableCount() }}</span>
              </span>
              <span class="stat">
                <span class="stat-label">Seleccionados:</span>
                <span class="stat-value">{{ numerosSeleccionados().length }}</span>
              </span>
            </div>
          </div>

          <div class="numbers-grid">
            @for (numero of numeros(); track numero.id) {
              <div 
                class="number-card"
                [class]="getNumberCardClass(numero)"
                (click)="toggleNumberSelection(numero)"
                [title]="getNumberTooltip(numero)">
                
                <div class="number-header">
                  <span class="number-value">{{ numero.numero }}</span>
                  <span class="number-status">
                    {{ getStatusIcon(numero.estado) }}
                  </span>
                </div>

                @if (numero.estado !== 'disponible') {
                  <div class="number-info">
                    @if (numero.estado === 'vendido') {
                      <div class="sold-info">
                        <small>Vendido</small>
                        @if (numero.fecha_venta) {
                          <small>{{ formatDate(numero.fecha_venta) }}</small>
                        }
                      </div>
                    }
                    @if (numero.estado === 'reservado') {
                      <div class="reserved-info">
                        <small>Reservado</small>
                      </div>
                    }
                  </div>
                }

                @if (isNumberSelected(numero.numero)) {
                  <div class="selection-indicator">
                    ✓ Seleccionado
                  </div>
                }
              </div>
            }
          </div>

          <!-- Paginación -->
          @if (pagination() && pagination().totalPages > 1) {
            <div class="pagination-container">
              <div class="pagination-info">
                Página {{ pagination().page }} de {{ pagination().totalPages }}
                ({{ pagination().total | number }} números total)
              </div>
              
              <div class="pagination-controls">
                <button 
                  class="btn btn-outline"
                  [disabled]="pagination().page <= 1"
                  (click)="cambiarPagina(pagination().page - 1)">
                  ← Anterior
                </button>
                
                @for (pageNum of getPaginationPages(); track pageNum) {
                  <button 
                    class="btn"
                    [class]="pageNum === pagination().page ? 'btn-primary' : 'btn-outline'"
                    (click)="cambiarPagina(pageNum)">
                    {{ pageNum }}
                  </button>
                }
                
                <button 
                  class="btn btn-outline"
                  [disabled]="pagination().page >= pagination().totalPages"
                  (click)="cambiarPagina(pagination().page + 1)">
                  Siguiente →
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (!loading() && !error() && numeros().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">🎫</div>
          <h3>No hay números disponibles</h3>
          <p>Esta rifa no tiene números disponibles para comprar en este momento.</p>
          <button 
            class="btn btn-primary"
            (click)="goBack()">
            ← Volver a la Rifa
          </button>
        </div>
      }
    </div>

    <!-- Modal de confirmación de compra -->
    @if (showPurchaseModal()) {
      <div class="modal-overlay" (click)="closePurchaseModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <form [formGroup]="purchaseForm" (ngSubmit)="confirmPurchase()">
            <div class="modal-header">
              <h3>💰 Confirmar Compra</h3>
              <button type="button" class="close-btn" (click)="closePurchaseModal()">✕</button>
            </div>
            
            <div class="modal-body">
              <div class="purchase-details">
                <h4>Detalles de la compra:</h4>
                <div class="detail-row">
                  <span>Números:</span>
                  <span>{{ getSelectedNumbersList() }}</span>
                </div>
                <div class="detail-row">
                  <span>Cantidad:</span>
                  <span>{{ numerosSeleccionados().length }}</span>
                </div>
                <div class="detail-row total">
                  <span>Total:</span>
                  <span>{{ formatPrice(getTotalAmount()) }}</span>
                </div>
              </div>

              <!-- Información del comprador -->
              <div class="buyer-info">
                <h4>Información del comprador:</h4>
                
                <div class="form-group">
                  <label for="nombre">Nombre *</label>
                  <input
                    id="nombre"
                    type="text"
                    formControlName="nombre"
                    class="form-control"
                    [class.error]="purchaseForm.get('nombre')?.invalid && purchaseForm.get('nombre')?.touched">
                  @if (purchaseForm.get('nombre')?.invalid && purchaseForm.get('nombre')?.touched) {
                    <div class="error-text">El nombre es requerido</div>
                  }
                </div>

                <div class="form-group">
                  <label for="apellido">Apellido *</label>
                  <input
                    id="apellido"
                    type="text"
                    formControlName="apellido"
                    class="form-control"
                    [class.error]="purchaseForm.get('apellido')?.invalid && purchaseForm.get('apellido')?.touched">
                  @if (purchaseForm.get('apellido')?.invalid && purchaseForm.get('apellido')?.touched) {
                    <div class="error-text">El apellido es requerido</div>
                  }
                </div>

                <div class="form-group">
                  <label for="telefono">Teléfono</label>
                  <input
                    id="telefono"
                    type="tel"
                    formControlName="telefono"
                    class="form-control"
                    placeholder="+54 9 11 1234-5678">
                </div>

                <div class="form-group">
                  <label for="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="form-control"
                    placeholder="correo@ejemplo.com">
                </div>
              </div>

              <!-- Método de pago -->
              <div class="payment-method">
                <h4>Método de pago:</h4>
                <div class="payment-options">
                  <label class="payment-option">
                    <input 
                      type="radio" 
                      formControlName="metodo_pago" 
                      value="efectivo">
                    <span class="option-content">
                      <span class="option-icon">💵</span>
                      <span class="option-text">Efectivo</span>
                    </span>
                  </label>
                  
                  <label class="payment-option">
                    <input 
                      type="radio" 
                      formControlName="metodo_pago" 
                      value="transferencia">
                    <span class="option-content">
                      <span class="option-icon">🏦</span>
                      <span class="option-text">Transferencia</span>
                    </span>
                  </label>
                  
                  <label class="payment-option">
                    <input 
                      type="radio" 
                      formControlName="metodo_pago" 
                      value="tarjeta">
                    <span class="option-content">
                      <span class="option-icon">💳</span>
                      <span class="option-text">Tarjeta</span>
                    </span>
                  </label>
                  
                  <label class="payment-option">
                    <input 
                      type="radio" 
                      formControlName="metodo_pago" 
                      value="mercadopago">
                    <span class="option-content">
                      <span class="option-icon">📱</span>
                      <span class="option-text">MercadoPago</span>
                    </span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label for="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  formControlName="observaciones"
                  class="form-control"
                  rows="3"
                  placeholder="Notas adicionales (opcional)"></textarea>
              </div>
            </div>
            
            <div class="modal-footer">
              <button 
                type="button"
                class="btn btn-outline"
                (click)="closePurchaseModal()">
                Cancelar
              </button>
              <button 
                type="submit"
                class="btn btn-success"
                [disabled]="!purchaseForm.valid || purchasing()">
                @if (purchasing()) {
                  ⏳ Procesando Compra...
                } @else {
                  💰 Confirmar Compra
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .buy-numbers-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      margin-bottom: 24px;
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .header-title h1 {
        margin: 0;
        color: #1f2937;
      }
      
      .header-title p {
        margin: 4px 0 0 0;
        color: #6b7280;
      }
      
      .price-display {
        background: #f0f9ff;
        padding: 12px 20px;
        border-radius: 8px;
        border: 2px solid #0284c7;
        
        .price-label {
          font-size: 14px;
          color: #0369a1;
          margin-right: 8px;
        }
        
        .price-value {
          font-size: 18px;
          font-weight: 700;
          color: #0284c7;
        }
      }
    }

    .purchase-summary {
      margin-bottom: 24px;
      
      .summary-card {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        
        h3 {
          margin: 0 0 16px 0;
          font-size: 20px;
        }
        
        .summary-details {
          margin-bottom: 20px;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          &.total {
            font-size: 18px;
            font-weight: 700;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            padding-top: 12px;
            margin-top: 12px;
          }
        }
        
        .numbers-list {
          font-family: monospace;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 4px;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .purchase-btn {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          font-weight: 600;
          background: white;
          color: #059669;
          border: none;
          
          &:hover:not(:disabled) {
            background: #f9fafb;
            transform: translateY(-1px);
          }
        }
      }
    }

    .selection-methods {
      margin-bottom: 24px;
      
      .methods-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
      }
      
      .method-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        
        h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 16px;
        }
        
        p {
          margin: 0 0 16px 0;
          color: #6b7280;
          font-size: 14px;
        }
        
        .quick-actions,
        .random-controls,
        .range-controls {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .random-controls input,
        .range-controls input {
          flex: 1;
          min-width: 80px;
        }
      }
    }

    .filters-section {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
      
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        
        label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
      }
    }

    .numbers-section {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      
      .numbers-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 16px;
        
        h2 {
          margin: 0;
          color: #1f2937;
        }
        
        .numbers-stats {
          display: flex;
          gap: 20px;
          
          .stat {
            display: flex;
            flex-direction: column;
            text-align: center;
            
            .stat-label {
              font-size: 12px;
              color: #6b7280;
            }
            
            .stat-value {
              font-size: 18px;
              font-weight: 700;
              color: #1f2937;
            }
          }
        }
      }
    }

    .numbers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .number-card {
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      position: relative;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      &.disponible {
        border-color: #10b981;
        background: #f0fdf4;
        
        &:hover {
          background: #dcfce7;
        }
        
        &.selected {
          background: #10b981;
          color: white;
          border-color: #059669;
        }
      }
      
      &.vendido {
        border-color: #ef4444;
        background: #fef2f2;
        cursor: not-allowed;
        opacity: 0.7;
      }
      
      &.reservado {
        border-color: #f59e0b;
        background: #fffbeb;
        cursor: not-allowed;
        opacity: 0.7;
      }
      
      .number-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .number-value {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .number-status {
          font-size: 16px;
        }
      }
      
      .number-info {
        font-size: 11px;
        color: #6b7280;
        
        .sold-info,
        .reserved-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
      }
      
      .selection-indicator {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #10b981;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
      }
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      flex-wrap: wrap;
      gap: 16px;
      
      .pagination-info {
        color: #6b7280;
        font-size: 14px;
      }
      
      .pagination-controls {
        display: flex;
        gap: 8px;
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      
      .empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }
      
      h3 {
        color: #1f2937;
        margin-bottom: 8px;
      }
      
      p {
        color: #6b7280;
        margin-bottom: 24px;
      }
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      min-width: 500px;
      max-width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
        
        h3 {
          margin: 0;
          color: #1f2937;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6b7280;
          
          &:hover {
            color: #374151;
          }
        }
      }
      
      .modal-body {
        padding: 24px;
      }
      
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 20px 24px;
        border-top: 1px solid #e5e7eb;
      }
    }

    .purchase-details {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 12px 0;
        color: #1f2937;
      }
      
      .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        
        &.total {
          font-weight: 700;
          font-size: 16px;
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          margin-top: 8px;
        }
      }
    }

    .buyer-info {
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 16px 0;
        color: #1f2937;
      }
    }

    .payment-method {
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 16px 0;
        color: #1f2937;
      }
      
      .payment-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
      }
      
      .payment-option {
        display: flex;
        cursor: pointer;
        
        input[type="radio"] {
          display: none;
        }
        
        .option-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.2s;
          width: 100%;
          
          .option-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          
          .option-text {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
          }
        }
        
        input[type="radio"]:checked + .option-content {
          border-color: #10b981;
          background: #f0fdf4;
          
          .option-text {
            color: #059669;
            font-weight: 600;
          }
        }
      }
    }

    .form-group {
      margin-bottom: 16px;
      
      label {
        display: block;
        font-weight: 600;
        color: #374151;
        font-size: 14px;
        margin-bottom: 6px;
      }
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      
      &:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
      
      &.error {
        border-color: #dc2626;
        
        &:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
      }
    }

    .error-text {
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      &.btn-sm {
        padding: 6px 12px;
        font-size: 13px;
      }
    }

    .btn-primary { 
      background: #10b981; 
      color: white;
      &:hover:not(:disabled) { background: #059669; }
    }
    
    .btn-secondary { 
      background: #6b7280; 
      color: white;
      &:hover:not(:disabled) { background: #374151; }
    }
    
    .btn-success { 
      background: #10b981; 
      color: white;
      &:hover:not(:disabled) { background: #059669; }
    }
    
    .btn-outline { 
      background: transparent; 
      border: 1px solid #d1d5db; 
      color: #374151;
      &:hover:not(:disabled) { background: #f9fafb; }
    }

    .loading-container, .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      flex-direction: column;
      gap: 16px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #10b981;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      text-align: center;
      
      h3 {
        color: #dc2626;
        margin-bottom: 8px;
      }
    }

    @media (max-width: 768px) {
      .buy-numbers-container {
        padding: 12px;
      }
      
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }
      
      .header-left {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .methods-grid {
        grid-template-columns: 1fr;
      }
      
      .filters-grid {
        grid-template-columns: 1fr;
      }
      
      .numbers-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      }
      
      .number-card {
        padding: 8px;
        
        .number-header .number-value {
          font-size: 16px;
        }
      }
      
      .pagination-container {
        flex-direction: column;
        text-align: center;
      }
      
      .modal-content {
        min-width: auto;
        width: 100%;
      }
      
      .payment-options {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class BuyNumbersComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Signals
  readonly rifa = signal<any>(null);
  readonly numeros = signal<any[]>([]);
  readonly loading = signal<boolean>(true);
  readonly purchasing = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly pagination = signal<any>(null);
  readonly showPurchaseModal = signal<boolean>(false);

  // Números seleccionados (solo números, no objetos completos)
  readonly numerosSeleccionados = signal<number[]>([]);

  private rifaId: number = 0;

  // Filtros
  filtroEstado = 'disponible';
  filtroDesde: number | null = null;
  filtroHasta: number | null = null;
  currentPage = 1;

  // Métodos de selección
  randomCount = 1;
  rangeStart: number | null = null;
  rangeEnd: number | null = null;

  // Formulario de compra
  purchaseForm: FormGroup;

  // Computed properties
  readonly getAvailableCount = computed(() => 
    this.numeros().filter(n => n.estado === 'disponible').length
  );

  constructor() {
    this.purchaseForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      telefono: [''],
      email: ['', [Validators.email]],
      metodo_pago: ['efectivo', Validators.required],
      observaciones: ['']
    });
  }

  ngOnInit() {
    // Obtener ID de la rifa de la ruta
    this.route.params.subscribe(params => {
      this.rifaId = +params['id'];
      if (this.rifaId) {
        this.loadRifa();
        this.loadNumeros();
        this.initializeUserData();
      } else {
        this.error.set('ID de rifa inválido');
        this.loading.set(false);
      }
    });
  }

  /**
   * Cargar datos de la rifa
   */
  private loadRifa(): void {
    this.rifasService.getRifa(this.rifaId).subscribe({
      next: (response) => {
        const rifaData = response.data || response;
        this.rifa.set(rifaData);
        console.log('📦 Rifa cargada para compra:', rifaData);
      },
      error: (error) => {
        console.error('❌ Error cargando rifa:', error);
        this.error.set('Error al cargar la información de la rifa');
      }
    });
  }

  /**
   * Cargar números disponibles
   */
  loadNumeros(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = {
      estado: this.filtroEstado,
      page: this.currentPage,
      limit: 100,
      ...(this.filtroDesde && { desde: this.filtroDesde }),
      ...(this.filtroHasta && { hasta: this.filtroHasta })
    };

    console.log('📡 Cargando números con filtros:', params);

    this.rifasService.getRifaNumbers(this.rifaId, params).subscribe({
      next: (response) => {
        console.log('📦 Números cargados:', response);
        
        const numerosData = response?.data?.numeros || response?.numeros || response?.data || [];
        this.numeros.set(Array.isArray(numerosData) ? numerosData : []);
        this.pagination.set(response?.pagination || null);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando números:', error);
        this.error.set(error?.error?.message || 'Error al cargar los números');
        this.numeros.set([]);
        this.loading.set(false);
      }
    });
  }

  /**
   * Inicializar datos del usuario en el formulario
   */
  private initializeUserData(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.purchaseForm.patchValue({
        nombre: currentUser.name?.split(' ')[0] || '',
        apellido: currentUser.name?.split(' ').slice(1).join(' ') || '',
        email: currentUser.email || ''
      });
    }
  }

  /**
   * Alternar selección de número
   */
  toggleNumberSelection(numero: any): void {
    if (numero.estado !== 'disponible') return;

    const numeroValue = numero.numero;
    const currentSelection = this.numerosSeleccionados();
    
    if (currentSelection.includes(numeroValue)) {
      // Deseleccionar
      this.numerosSeleccionados.set(
        currentSelection.filter(n => n !== numeroValue)
      );
    } else {
      // Seleccionar
      this.numerosSeleccionados.set([...currentSelection, numeroValue]);
    }
    
    console.log('📋 Números seleccionados:', this.numerosSeleccionados());
  }

  /**
   * Verificar si un número está seleccionado
   */
  isNumberSelected(numero: number): boolean {
    return this.numerosSeleccionados().includes(numero);
  }

  /**
   * Limpiar selección
   */
  clearSelection(): void {
    this.numerosSeleccionados.set([]);
  }

  /**
   * Seleccionar números al azar
   */
  selectRandomNumbers(): void {
    if (!this.randomCount || this.randomCount < 1) return;

    const numerosDisponibles = this.numeros()
      .filter(n => n.estado === 'disponible')
      .map(n => n.numero);

    if (numerosDisponibles.length === 0) {
      alert('No hay números disponibles para seleccionar');
      return;
    }

    const cantidad = Math.min(this.randomCount, numerosDisponibles.length);
    const shuffled = [...numerosDisponibles].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, cantidad);

    this.numerosSeleccionados.set([...this.numerosSeleccionados(), ...selected]);
  }

  /**
   * Seleccionar rango de números
   */
  selectRangeNumbers(): void {
    if (!this.rangeStart || !this.rangeEnd) {
      alert('Debe especificar el rango de números');
      return;
    }

    if (this.rangeStart > this.rangeEnd) {
      alert('El número inicial debe ser menor al final');
      return;
    }

    const numerosDisponibles = this.numeros()
      .filter(n => n.estado === 'disponible' && 
                   n.numero >= this.rangeStart! && 
                   n.numero <= this.rangeEnd!)
      .map(n => n.numero);

    if (numerosDisponibles.length === 0) {
      alert('No hay números disponibles en ese rango');
      return;
    }

    this.numerosSeleccionados.set([...this.numerosSeleccionados(), ...numerosDisponibles]);
  }

  /**
   * Proceder a la compra
   */
  proceedToPurchase(): void {
    if (this.numerosSeleccionados().length === 0) {
      alert('Debe seleccionar al menos un número');
      return;
    }

    this.showPurchaseModal.set(true);
  }

  /**
   * Cerrar modal de compra
   */
  closePurchaseModal(): void {
    this.showPurchaseModal.set(false);
  }

  /**
   * Confirmar compra
   */
  confirmPurchase(): void {
    if (this.purchaseForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.purchasing.set(true);

    const formData = this.purchaseForm.value;
    const purchaseData = {
      numeros: this.numerosSeleccionados(),
      comprador_info: {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        email: formData.email
      },
      metodo_pago: formData.metodo_pago,
      observaciones: formData.observaciones
    };

    console.log('💰 Realizando compra:', purchaseData);

    this.rifasService.comprarNumeros(this.rifaId, purchaseData).subscribe({
      next: (response) => {
        console.log('✅ Compra exitosa:', response);
        this.purchasing.set(false);
        this.showPurchaseModal.set(false);
        
        // Mostrar mensaje de éxito
        alert(`✅ ¡Compra exitosa!\n\nNúmeros comprados: ${response.data.numeros_comprados.join(', ')}\nTotal pagado: ${this.formatPrice(response.data.total_pagado)}`);
        
        // Limpiar selección y recargar números
        this.clearSelection();
        this.loadNumeros();
        
        // Opcionalmente, redirigir a "Mis números"
        // this.router.navigate(['/mis-numeros']);
      },
      error: (error) => {
        console.error('❌ Error en la compra:', error);
        this.purchasing.set(false);
        
        const errorMessage = error?.error?.message || error.message || 'Error desconocido';
        alert('❌ Error en la compra: ' + errorMessage);
      }
    });
  }

  /**
   * Marcar todos los campos como tocados
   */
  private markFormGroupTouched(): void {
    Object.keys(this.purchaseForm.controls).forEach(key => {
      this.purchaseForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Cambiar página
   */
  cambiarPagina(page: number): void {
    this.currentPage = page;
    this.loadNumeros();
  }

  /**
   * Obtener páginas para paginación
   */
  getPaginationPages(): number[] {
    const pagination = this.pagination();
    if (!pagination) return [];
    
    const pages: number[] = [];
    const current = pagination.page;
    const total = pagination.totalPages || pagination.pages;
    
    // Mostrar máximo 5 páginas
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Obtener total de la compra
   */
  getTotalAmount(): number {
    const precio = this.rifa()?.precio_numero || 0;
    return this.numerosSeleccionados().length * precio;
  }

  /**
   * Obtener lista de números seleccionados como string
   */
  getSelectedNumbersList(): string {
    const numeros = this.numerosSeleccionados().sort((a, b) => a - b);
    
    if (numeros.length <= 5) {
      return numeros.join(', ');
    } else {
      return `${numeros.slice(0, 3).join(', ')}, ... y ${numeros.length - 3} más`;
    }
  }

  /**
   * Obtener clase CSS del número
   */
  getNumberCardClass(numero: any): string {
    let classes = [numero.estado];
    
    if (numero.estado === 'disponible' && this.isNumberSelected(numero.numero)) {
      classes.push('selected');
    }
    
    return classes.join(' ');
  }

  /**
   * Obtener tooltip del número
   */
  getNumberTooltip(numero: any): string {
    switch (numero.estado) {
      case 'disponible':
        return `Número ${numero.numero} - Disponible para compra`;
      case 'vendido':
        return `Número ${numero.numero} - Vendido${numero.fecha_venta ? ' el ' + this.formatDate(numero.fecha_venta) : ''}`;
      case 'reservado':
        return `Número ${numero.numero} - Reservado`;
      default:
        return `Número ${numero.numero}`;
    }
  }

  /**
   * Obtener icono del estado
   */
  getStatusIcon(estado: string): string {
    const icons: { [key: string]: string } = {
      'disponible': '✅',
      'reservado': '⏳',
      'vendido': '💰'
    };
    return icons[estado] || '❓';
  }

  /**
   * Volver atrás
   */
  goBack(): void {
    this.router.navigate(['/rifas', this.rifaId]);
  }

  /**
   * Formatear precio
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }

  /**
   * Formatear fecha
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'No definida';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }
}