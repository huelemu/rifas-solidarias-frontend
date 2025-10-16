// src/app/vendedor/components/mis-ventas/mis-ventas.component.ts

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

interface RifaVendedor {
  id: number;
  nombre: string;
  imagen_url: string;
  numeros_asignados: number;
  numeros_vendidos: number;
  estado: string;
}

@Component({
  selector: 'app-mis-ventas',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <div class="container">
      <h1>💰 Mis Ventas</h1>
      <p class="subtitle">Rifas donde tengo números asignados</p>

      <div class="rifas-grid">
        @for (rifa of rifas(); track rifa.id) {
          <div class="rifa-card" [routerLink]="['/vendedor/rifas', rifa.id, 'numeros']">
            <img [src]="rifa.imagen_url || '/assets/rifa-default.jpg'" [alt]="rifa.nombre">
            
            <div class="rifa-info">
              <h3>{{ rifa.nombre }}</h3>
              
              <div class="stats">
                <div class="stat">
                  <span class="label">Asignados:</span>
                  <span class="value">{{ rifa.numeros_asignados }}</span>
                </div>
                <div class="stat vendidos">
                  <span class="label">Vendidos:</span>
                  <span class="value">{{ rifa.numeros_vendidos }}</span>
                </div>
              </div>

              <div class="progress-bar">
                <div class="progress" 
                     [style.width.%]="(rifa.numeros_vendidos / rifa.numeros_asignados) * 100">
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>No tienes rifas asignadas</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #6c757d;
      margin-bottom: 2rem;
    }

    .rifas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .rifa-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.15);
      }

      img {
        width: 100%;
        height: 180px;
        object-fit: cover;
      }
    }

    .rifa-info {
      padding: 1.5rem;

      h3 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
      }
    }

    .stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;

      .stat {
        display: flex;
        flex-direction: column;

        .label {
          font-size: 0.85rem;
          color: #6c757d;
        }

        .value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #667eea;
        }

        &.vendidos .value {
          color: #27ae60;
        }
      }
    }

    .progress-bar {
      height: 8px;
      background: #e9ecef;
      border-radius: 10px;
      overflow: hidden;

      .progress {
        height: 100%;
        background: linear-gradient(90deg, #27ae60, #2ecc71);
        transition: width 0.3s;
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }
  `]
})
export class MisVentasComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  rifas = signal<RifaVendedor[]>([]);

  ngOnInit() {
    this.cargarRifas();
  }

  cargarRifas() {
    this.http.get<any>('http://localhost:3100/rifas/vendedor/mis-rifas').subscribe({
      next: (response) => {
        this.rifas.set(response.data || []);
      },
      error: (err) => console.error('Error:', err)
    });
  }
}