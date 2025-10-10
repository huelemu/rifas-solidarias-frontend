// src/app/rifas/components/numero-publico/numero-publico.component.ts

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper'; // ✅ IMPORTAR


@Component({
  selector: 'app-numero-publico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="numero-publico-container">
      
      <div *ngIf="loading()" class="loading">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>

      <div *ngIf="!loading() && rifa()" class="content">
        
        <!-- HEADER -->
        <div class="header">
          <img 
              *ngIf="getRifaImageUrl()" 
              [src]="getRifaImageUrl()!" 
              class="rifa-imagen">
          <h1>{{ rifa()?.nombre }}</h1>
          <p class="descripcion">{{ rifa()?.descripcion }}</p>
        </div>

        <!-- NÚMERO DESTACADO -->
        <div class="numero-destacado">
          <div class="numero-label">Número</div>
          <div class="numero-value">{{ numeroSeleccionado() }}</div>
          <div class="precio">$ {{ rifa()?.precio_numero | number:'1.2-2' }}</div>
        </div>

        <!-- ESTADO -->
        <div class="estado-info" [ngClass]="numero()?.estado">
          <span class="icono">
            {{ numero()?.estado === 'disponible' ? '✅' : 
               numero()?.estado === 'reservado' ? '⏰' : '❌' }}
          </span>
          <span class="texto">
            {{ numero()?.estado === 'disponible' ? 'Disponible' : 
               numero()?.estado === 'reservado' ? 'Reservado' : 'Ya Vendido' }}
          </span>
        </div>

        <!-- ACCIÓN -->
        <button 
          *ngIf="numero()?.estado === 'disponible'"
          class="btn-comprar"
          (click)="comprar()">
          🛒 Comprar este Número
        </button>

        <button 
          *ngIf="numero()?.estado !== 'disponible'"
          class="btn-ver-otros"
          (click)="verOtrosNumeros()">
          👀 Ver Números Disponibles
        </button>

      </div>

    </div>
  `,
  styles: [`
    .numero-publico-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .content {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }

    .header {
      margin-bottom: 2rem;
    }

    .rifa-imagen {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 1rem;
    }

    h1 {
      margin: 0 0 0.5rem 0;
      color: #2c3e50;
      font-size: 1.8rem;
    }

    .descripcion {
      color: #7f8c8d;
      margin: 0;
    }

    .numero-destacado {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 16px;
      margin-bottom: 2rem;
    }

    .numero-label {
      font-size: 0.9rem;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .numero-value {
      font-size: 4rem;
      font-weight: bold;
      margin: 0.5rem 0;
    }

    .precio {
      font-size: 1.8rem;
      font-weight: 600;
    }

    .estado-info {
      padding: 1rem 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1.2rem;
      font-weight: 600;

      &.disponible {
        background: #d4edda;
        color: #155724;
      }

      &.reservado {
        background: #fff3cd;
        color: #856404;
      }

      &.vendido {
        background: #f8d7da;
        color: #721c24;
      }
    }

    .icono {
      font-size: 1.5rem;
    }

    .btn-comprar, .btn-ver-otros {
      width: 100%;
      padding: 1rem 2rem;
      font-size: 1.2rem;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-comprar {
      background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
      color: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(39, 174, 96, 0.4);
      }
    }

    .btn-ver-otros {
      background: #6c757d;
      color: white;

      &:hover {
        background: #5a6268;
      }
    }

    .loading {
      text-align: center;
      color: white;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255,255,255,0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class NumeroPublicoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);

  readonly rifa = signal<any>(null);
  readonly numero = signal<any>(null);
  readonly numeroSeleccionado = signal<number>(0);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const rifaId = +params['rifaId'];
      const numero = +params['numero'];
      
      this.numeroSeleccionado.set(numero);
      this.cargarDatos(rifaId, numero);
    });
  }

  cargarDatos(rifaId: number, numeroId: number): void {
    // Cargar rifa
    this.rifasService.getRifaById(rifaId).subscribe({
      next: (response) => {
        this.rifa.set(response.data || response);
      }
    });

    // Cargar número específico
    this.rifasService.getNumeros(rifaId, { 
      desde: numeroId, 
      hasta: numeroId 
    }).subscribe({
      next: (response) => {
        const numeros = response.data || [];
        this.numero.set(numeros[0]);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getRifaImageUrl(): string | null {
    return ImageUrlHelper.getRifaImageUrl(this.rifa()?.imagen_url);
  }

  comprar(): void {
    const rifaId = this.rifa()?.id;
    const numero = this.numeroSeleccionado();
    this.router.navigate(['/rifas', rifaId, 'comprar'], {
      queryParams: { numero }
    });
  }

  verOtrosNumeros(): void {
    const rifaId = this.rifa()?.id;
    this.router.navigate(['/rifas', rifaId, 'comprar']);
  }
}