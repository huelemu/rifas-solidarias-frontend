// ====================================
// src/app/components/detalle-rifa/detalle-rifa.component.ts
// ====================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RifaService } from '../../services/rifa.service';
import { AuthService } from '../../services/auth.service';
import { Rifa, NumeroRifa } from '../../interfaces/rifa.interface';

@Component({
  selector: 'app-detalle-rifa',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detalle-rifa-container" *ngIf="rifa">
      <!-- Header -->
      <div class="header-section">
        <button (click)="volver()" class="btn-volver">
          <i class="fas fa-arrow-left"></i>
          Volver
        </button>
        
        <div class="header-content">
          <div class="rifa-imagen">
            <img 
              [src]="rifa.imagen_url || '/assets/images/rifa-default.jpg'" 
              [alt]="rifa.titulo"
              (error)="onImageError($event)">
            <div class="estado-badge" [class]="'estado-' + rifa.estado">
              {{ rifa.estado | uppercase }}
            </div>
          </div>
          
          <div class="rifa-info">
            <h1>{{ rifa.titulo }}</h1>
            <p class="institucion">{{ rifa.institucion_nombre }}</p>
            <p class="descripcion">{{ rifa.descripcion }}</p>
            
            <div class="fechas-importantes">
              <div class="fecha-item">
                <i class="fas fa-calendar-start"></i>
                <span>Inicio: {{ rifa.fecha_inicio | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="fecha-item">
                <i class="fas fa-calendar-times"></i>
                <span>Fin ventas: {{ rifa.fecha_fin | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="fecha-item destacada">
                <i class="fas fa-trophy"></i>
                <span>Sorteo: {{ rifa.fecha_sorteo | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas principales -->
      <div class="estadisticas-principales">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-content">
            <h3>${{ rifa.precio_numero }}</h3>
            <p>Precio por número</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-ticket-alt"></i>
          </div>
          <div class="stat-content">
            <h3>{{ getNumeroDisponibles() }}</h3>
            <p>Números disponibles</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="stat-content">
            <h3>{{ getPorcentajeVendido() }}%</h3>
            <p>Vendido</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{ getDiasRestantes() }}</h3>
            <p>{{ getDiasRestantes() === 1 ? 'día restante' : 'días restantes' }}</p>
          </div>
        </div>
      </div>

      <!-- Progreso de ventas -->
      <div class="progreso-ventas">
        <h3>Progreso de ventas</h3>
        <div class="progreso-info">
          <span>{{ getVendidos() }} de {{ rifa.total_numeros }} números vendidos</span>
          <span>{{ getRecaudado() }} / ${{ getTotalPotencial() }}</span>
        </div>
        <div class="barra-progreso">
          <div 
            class="progreso-fill" 
            [style.width.%]="getPorcentajeVendido()">
          </div>
        </div>
      </div>

      <!-- Vista previa de números (sample) -->
      <div class="