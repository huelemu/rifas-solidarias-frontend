// src/app/vendedor/components/mis-ventas/mis-ventas.component.ts

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
//import { environment } from '../../../../environments/environment';

interface RifaVendedor {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen_url?: string;
  estado: string;
  fecha_sorteo?: string;
  numeros_asignados: number;
  numeros_vendidos: number;
  total_recaudado?: number;
  precio_numero?: number;
}

@Component({
  selector: 'app-mis-ventas',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './mis-ventas.component.html',
  styleUrls: ['./mis-ventas.component.scss']
})
export class MisVentasComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  rifas = signal<RifaVendedor[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Detección de API
  private readonly apiUrl = this.getApiUrl();

  private getApiUrl(): string {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3100';
    } else {
      return 'https://apirifas.huelemu.com.ar';
    }
  }

  ngOnInit() {
    this.cargarRifas();
  }

  cargarRifas() {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<any>(`${this.apiUrl}/rifas/vendedor/mis-rifas`).subscribe({
      next: (response) => {
        console.log('📥 Rifas del vendedor:', response);
        this.rifas.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error cargando rifas:', err);
        this.error.set('Error al cargar las rifas');
        this.loading.set(false);
      }
    });
  }

  calcularPorcentaje(rifa: RifaVendedor): number {
    if (rifa.numeros_asignados === 0) return 0;
    return Math.round((rifa.numeros_vendidos / rifa.numeros_asignados) * 100);
  }

  verBoletos(rifaId: number) {
    this.router.navigate(['/rifas', rifaId, 'boletos']);
  }

  getImagenUrl(imagen_url?: string): string {
    if (!imagen_url) return '/assets/rifa-default.jpg';
    if (imagen_url.startsWith('http')) return imagen_url;
    return `${this.apiUrl}${imagen_url}`;
  }
}