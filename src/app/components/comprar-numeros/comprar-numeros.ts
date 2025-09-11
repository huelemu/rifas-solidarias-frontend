// src/app/components/comprar-numeros/comprar-numeros.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RifaService } from '../../services/rifa.service';
import { AuthService } from '../../services/auth.service';
import { Rifa, NumeroRifa } from '../../interfaces/rifa.interface';

@Component({
  selector: 'app-comprar-numeros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="comprar-numeros-container">
      <!-- Header con información de la rifa -->
      <div class="rifa-header" *ngIf="rifa">
        <h2>{{ rifa.titulo }}</h2>
        <div class="rifa-info">
          <div class="info-item">
            <strong>Precio por número:</strong> ${{ rifa.precio_numero }}
          </div>
          <div class="info-item">
            <strong>Números disponibles:</strong> {{ numerosDisponibles.length }} / {{ rifa.total_numeros }}
          </div>
          <div class="info-item">
            <strong>Fecha de sorteo:</strong> {{ rifa.fecha_sorteo | date:'dd/MM/yyyy' }}
          </div>
        </div>
      </div>

      <!-- Métodos de selección -->
      <div class="seleccion-metodos">
        <h3>¿Cómo quieres elegir tus números?</h3>
        <div class="metodos-buttons">
          <button 
            [class.active]="metodoSeleccion === 'manual'"
            (click)="cambiarMetodo('manual')"
            class="metodo-btn">
            <i class="fas fa-hand-pointer"></i>
            Elegir manualmente
          </button>
          <button 
            [class.active]="metodoSeleccion === 'aleatorio'"
            (click)="cambiarMetodo('aleatorio')"
            class="metodo-btn">
            <i class="fas fa-random"></i>
            Selección aleatoria
          </button>
          <button 
            [class.active]="metodoSeleccion === 'rango'"
            (click)="cambiarMetodo('rango')"
            class="metodo-btn">
            <i class="fas fa-list-ol"></i>
            Rango de números
          </button>
        </div>
      </div>

      <!-- Selección manual -->
      <div *ngIf="metodoSeleccion === 'manual'" class="seleccion-manual">
        <h4>Selecciona los números que deseas comprar:</h4>
        <div class="numeros-grid">
          <div 
            *ngFor="let numero of todosLosNumeros" 
            [class]="getNumeroClass(numero)"
            (click)="toggleNumero(numero)"
            class="numero-item">
            {{ numero.numero }}
            <span *ngIf="numero.estado === 'vendido'" class="vendido-icon">✓</span>
          </div>
        </div>
      </div>

      <!-- Selección aleatoria -->
      <div *ngIf="metodoSeleccion === 'aleatorio'" class="seleccion-aleatoria">
        <h4>¿Cuántos números quieres comprar?</h4>
        <div class="cantidad-container">
          <input 
            type="number" 
            [(ngModel)]="cantidadAleatoria" 
            [max]="numerosDisponibles.length"
            min="1"
            class="cantidad-input">
          <button (click)="seleccionarAleatorio()" class="btn-aleatorio">
            Generar números aleatorios
          </button>
        </div>
        <div *ngIf="numerosSeleccionados.length > 0" class="numeros-aleatorios">
          <h5>Números seleccionados:</h5>
          <div class="numeros-seleccionados-lista">
            <span *ngFor="let num of numerosSeleccionados" class="numero-seleccionado">
              {{ num }}
              <button (click)="removerNumero(num)" class="remove-btn">×</button>
            </span>
          </div>
        </div>
      </div>

      <!-- Selección por rango -->
      <div *ngIf="metodoSeleccion === 'rango'" class="seleccion-rango">
        <h4>Selecciona un rango de números:</h4>
        <div class="rango-inputs">
          <div class="input-group">
            <label>Desde:</label>
            <input 
              type="number" 
              [(ngModel)]="rangoDesde" 
              [min]="1"
              [max]="rifa?.total_numeros"
              class="rango-input">
          </div>
          <div class="input-group">
            <label>Hasta:</label>
            <input 
              type="number" 
              [(ngModel)]="rangoHasta" 
              [min]="rangoDesde || 1"
              [max]="rifa?.total_numeros"
              class="rango-input">
          </div>
          <button (click)="seleccionarRango()" class="btn-rango">
            Seleccionar rango
          </button>
        </div>
        <div *ngIf="rangoError" class="error-message">
          {{ rangoError }}
        </div>
      </div>

      <!-- Resumen de compra -->
      <div *ngIf="numerosSeleccionados.length > 0" class="resumen-compra">
        <h4>Resumen de tu compra:</h4>
        <div class="resumen-details">
          <div class="resumen-item">
            <span>Números seleccionados:</span>
            <span>{{ numerosSeleccionados.length }}</span>
          </div>
          <div class="resumen-item">
            <span>Precio por número:</span>
            <span>${{ rifa?.precio_numero }}</span>
          </div>
          <div class="resumen-item total">
            <span><strong>Total a pagar:</strong></span>
            <span><strong>${{ calcularTotal() }}</strong></span>
          </div>
        </div>
        
        <div class="numeros-resumen">
          <h5>Números: {{ numerosSeleccionados.join(', ') }}</h5>
        </div>

        <div class="acciones-compra">
          <button (click)="limpiarSeleccion()" class="btn-limpiar">
            Limpiar selección
          </button>
          <button 
            (click)="confirmarCompra()" 
            [disabled]="procesandoCompra"
            class="btn-comprar">
            <span *ngIf="procesandoCompra">Procesando...</span>
            <span *ngIf="!procesandoCompra">Confirmar compra</span>
          </button>
        </div>
      </div>

      <!-- Mensaje de estado -->
      <div *ngIf="mensaje" [class]="'mensaje ' + tipoMensaje">
        {{ mensaje }}
      </div>

      <!-- Loading state -->
      <div *ngIf="cargando" class="loading">
        <div class="spinner"></div>
        <p>Cargando números de la rifa...</p>
      </div>
    </div>
  `,
  styles: [`
    .comprar-numeros-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .rifa-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 30px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .rifa-header h2 {
      margin: 0 0 20px 0;
      font-size: 2.5em;
      font-weight: 300;
    }

    .rifa-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .info-item {
      background: rgba(255,255,255,0.1);
      padding: 15px;
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }

    .seleccion-metodos {
      margin-bottom: 30px;
    }

    .seleccion-metodos h3 {
      color: #333;
      margin-bottom: 20px;
      font-size: 1.8em;
    }

    .metodos-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .metodo-btn {
      padding: 20px;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1.1em;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .metodo-btn:hover {
      border-color: #667eea;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
    }

    .metodo-btn.active {
      border-color: #667eea;
      background: #667eea;
      color: white;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
    }

    .numeros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 8px;
      max-height: 400px;
      overflow-y: auto;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      background: #fafafa;
    }

    .numero-item {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      position: relative;
      transition: all 0.2s ease;
      font-size: 1.1em;
    }

    .numero-item.disponible {
      background: #e8f5e8;
      border: 2px solid #4caf50;
      color: #2e7d32;
    }

    .numero-item.disponible:hover {
      background: #4caf50;
      color: white;
      transform: scale(1.05);
    }

    .numero-item.seleccionado {
      background: #667eea;
      color: white;
      border: 2px solid #5a67d8;
      transform: scale(1.05);
    }

    .numero-item.vendido {
      background: #ffebee;
      border: 2px solid #f44336;
      color: #c62828;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .vendido-icon {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #f44336;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .seleccion-aleatoria, .seleccion-rango {
      background: white;
      padding: 25px;
      border-radius: 10px;
      border: 1px solid #e0e0e0;
      margin-bottom: 20px;
    }

    .cantidad-container {
      display: flex;
      gap: 15px;
      align-items: center;
      margin: 20px 0;
    }

    .cantidad-input {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1.1em;
      width: 120px;
    }

    .btn-aleatorio, .btn-rango {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1em;
      transition: background 0.3s ease;
    }

    .btn-aleatorio:hover, .btn-rango:hover {
      background: #5a67d8;
    }

    .rango-inputs {
      display: flex;
      gap: 20px;
      align-items: end;
      margin: 20px 0;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .input-group label {
      font-weight: 600;
      color: #555;
    }

    .rango-input {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1.1em;
      width: 120px;
    }

    .numeros-seleccionados-lista {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .numero-seleccionado {
      background: #667eea;
      color: white;
      padding: 8px 12px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }

    .remove-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2em;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-btn:hover {
      background: rgba(255,255,255,0.2);
    }

    .resumen-compra {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 25px;
      border-radius: 15px;
      margin-top: 30px;
      border: 2px solid #667eea;
    }

    .resumen-details {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin: 15px 0;
    }

    .resumen-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .resumen-item.total {
      border-bottom: none;
      font-size: 1.2em;
      margin-top: 10px;
      padding-top: 15px;
      border-top: 2px solid #667eea;
    }

    .numeros-resumen {
      background: white;
      padding: 15px;
      border-radius: 10px;
      margin: 15px 0;
      word-break: break-all;
    }

    .acciones-compra {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .btn-limpiar {
      padding: 15px 30px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1em;
      transition: background 0.3s ease;
    }

    .btn-limpiar:hover {
      background: #d32f2f;
    }

    .btn-comprar {
      padding: 15px 40px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.2em;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-comprar:hover:not(:disabled) {
      background: #45a049;
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(76, 175, 80, 0.3);
    }

    .btn-comprar:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }

    .mensaje {
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      font-weight: 600;
    }

    .mensaje.success {
      background: #e8f5e8;
      color: #2e7d32;
      border: 1px solid #4caf50;
    }

    .mensaje.error {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #f44336;
    }

    .mensaje.info {
      background: #e3f2fd;
      color: #1565c0;
      border: 1px solid #2196f3;
    }

    .error-message {
      color: #f44336;
      font-weight: 600;
      margin-top: 10px;
    }

    .loading {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .comprar-numeros-container {
        padding: 10px;
      }

      .rifa-header h2 {
        font-size: 2em;
      }

      .metodos-buttons {
        grid-template-columns: 1fr;
      }

      .numeros-grid {
        grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
        gap: 6px;
      }

      .numero-item {
        width: 50px;
        height: 50px;
        font-size: 1em;
      }

      .rango-inputs {
        flex-direction: column;
        align-items: stretch;
      }

      .acciones-compra {
        flex-direction: column;
      }
    }
  `]
})
export class ComprarNumerosComponent implements OnInit {
  @Input() rifaId!: number;
  
  rifa: Rifa | null = null;
  todosLosNumeros: NumeroRifa[] = [];
  numerosDisponibles: NumeroRifa[] = [];
  numerosSeleccionados: number[] = [];
  
  metodoSeleccion: 'manual' | 'aleatorio' | 'rango' = 'manual';
  cantidadAleatoria: number = 1;
  rangoDesde: number = 1;
  rangoHasta: number = 1;
  rangoError: string = '';
  
  cargando: boolean = false;
  procesandoCompra: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | 'info' = 'info';

  constructor(
    private rifaService: RifaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarDatosRifa();
  }

  cargarDatosRifa() {
    this.cargando = true;
    this.mensaje = '';

    // Cargar información de la rifa
    this.rifaService.obtenerRifaPorId(this.rifaId).subscribe({
      next: (response) => {
        if (response.success) {
          this.rifa = response.data;
          this.cargarNumerosRifa();
        } else {
          this.mostrarMensaje('Error al cargar la rifa: ' + response.message, 'error');
          this.cargando = false;
        }
      },
      error: (error) => {
        this.mostrarMensaje('Error al cargar la rifa', 'error');
        this.cargando = false;
      }
    });
  }

  cargarNumerosRifa() {
    this.rifaService.obtenerNumerosRifa(this.rifaId).subscribe({
      next: (response) => {
        if (response.success) {
          this.todosLosNumeros = response.data;
          this.numerosDisponibles = response.data.filter(n => n.estado === 'disponible');
          this.cargando = false;
        } else {
          this.mostrarMensaje('Error al cargar números: ' + response.message, 'error');
          this.cargando = false;
        }
      },
      error: (error) => {
        this.mostrarMensaje('Error al cargar números de la rifa', 'error');
        this.cargando = false;
      }
    });
  }

  cambiarMetodo(metodo: 'manual' | 'aleatorio' | 'rango') {
    this.metodoSeleccion = metodo;
    this.limpiarSeleccion();
    this.rangoError = '';
  }

  getNumeroClass(numero: NumeroRifa): string {
    if (numero.estado === 'vendido') return 'numero-item vendido';
    if (this.numerosSeleccionados.includes(numero.numero)) return 'numero-item seleccionado';
    return 'numero-item disponible';
  }

  toggleNumero(numero: NumeroRifa) {
    if (numero.estado !== 'disponible') return;

    const index = this.numerosSeleccionados.indexOf(numero.numero);
    if (index > -1) {
      this.numerosSeleccionados.splice(index, 1);
    } else {
      this.numerosSeleccionados.push(numero.numero);
    }
    
    this.numerosSeleccionados.sort((a, b) => a - b);
  }

  seleccionarAleatorio() {
    if (this.cantidadAleatoria > this.numerosDisponibles.length) {
      this.mostrarMensaje('No hay suficientes números disponibles', 'error');
      return;
    }

    const disponibles = this.numerosDisponibles.map(n => n.numero);
    const seleccionados = [];
    
    while (seleccionados.length < this.cantidadAleatoria) {
      const randomIndex = Math.floor(Math.random() * disponibles.length);
      const numero = disponibles[randomIndex];
      
      if (!seleccionados.includes(numero)) {
        seleccionados.push(numero);
      }
    }
    
    this.numerosSeleccionados = seleccionados.sort((a, b) => a - b);
    this.mostrarMensaje(`${this.cantidadAleatoria} números seleccionados aleatoriamente`, 'success');
  }

  seleccionarRango() {
    this.rangoError = '';
    
    if (this.rangoDesde > this.rangoHasta) {
      this.rangoError = 'El número inicial no puede ser mayor al final';
      return;
    }

    if (this.rangoDesde < 1 || this.rangoHasta > (this.rifa?.total_numeros || 0)) {
      this.rangoError = `Los números deben estar entre 1 y ${this.rifa?.total_numeros}`;
      return;
    }

    const numerosEnRango = [];
    for (let i = this.rangoDesde; i <= this.rangoHasta; i++) {
      const numero = this.todosLosNumeros.find(n => n.numero === i);
      if (numero && numero.estado === 'disponible') {
        numerosEnRango.push(i);
      }
    }

    if (numerosEnRango.length === 0) {
      this.rangoError = 'No hay números disponibles en ese rango';
      return;
    }

    this.numerosSeleccionados = numerosEnRango;
    this.mostrarMensaje(`${numerosEnRango.length} números seleccionados del rango ${this.rangoDesde}-${this.rangoHasta}`, 'success');
  }

  removerNumero(numero: number) {
    const index = this.numerosSeleccionados.indexOf(numero);
    if (index > -1) {
      this.numerosSeleccionados.splice(index, 1);
    }
  }

  limpiarSeleccion() {
    this.numerosSeleccionados = [];
    this.mensaje = '';
  }

  calcularTotal(): number {
    return this.numerosSeleccionados.length * (this.rifa?.precio_numero || 0);
  }

  confirmarCompra() {
    if (!this.authService.isLoggedIn()) {
      this.mostrarMensaje('Debes iniciar sesión para comprar números', 'error');
      return;
    }

    if (this.numerosSeleccionados.length === 0) {
      this.mostrarMensaje('Debes seleccionar al menos un número', 'error');
      return;
    }

    this.procesandoCompra = true;
    this.mensaje = '';

    this.rifaService.comprarNumeros(this.rifaId, this.numerosSeleccionados).subscribe({
      next: (response) => {
        if (response.success) {
          this.mostrarMensaje(`¡Compra exitosa! Has adquirido ${response.data.cantidad} números por $${response.data.total_pagado}`, 'success');
          this.limpiarSeleccion();
          this.cargarNumerosRifa(); // Recargar para actualizar estados
        } else {
          this.mostrarMensaje('Error en la compra: ' + response.message, 'error');
        }
        this.procesandoCompra = false;
      },
      error: (error) => {
        this.mostrarMensaje('Error al procesar la compra', 'error');
        this.procesandoCompra = false;
      }
    });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error' | 'info') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    
    // Auto-ocultar mensajes después de 5 segundos
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }
}