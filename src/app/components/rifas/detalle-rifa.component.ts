// src/app/components/rifas/detalle-rifa.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RifaService, Rifa, NumeroRifa } from '../../services/rifa.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-detalle-rifa',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './detalle-rifa.component.html',
  styleUrls: ['./detalle-rifa.component.css']
})
export class DetalleRifaComponent implements OnInit {
  rifa?: Rifa;
  cargando = false;
  error = '';
  mensaje = '';
  tipoMensaje: 'success' | 'danger' | 'info' = 'info';
  
  // Compra
  cantidadAComprar = 1;
  comprando = false;
  mostrarSelectorNumeros = false;

  constructor(
    private rifaService: RifaService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarRifa(id);
    } else {
      this.error = 'ID de rifa no válido';
    }
  }

  cargarRifa(id?: number) {
    const rifaId = id || Number(this.route.snapshot.paramMap.get('id'));
    if (!rifaId) return;

    this.cargando = true;
    this.error = '';

    this.rifaService.obtenerRifaPorId(rifaId).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.rifa = response.data;
        } else {
          this.error = response.message || 'Error al cargar la rifa';
        }
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al cargar rifa:', error);
        this.error = 'Error al cargar la rifa';
      }
    });
  }

  // Métodos de compra
comprarAleatorio() {
  if (!this.rifa?.id || this.cantidadAComprar <= 0) return;
  
  this.comprando = true;
  const numeros = Array.from({length: this.cantidadAComprar}, (_, i) => i + 1);
  this.realizarCompra(numeros);
}

  realizarCompra(numeros: number[]) {
  if (!this.rifa?.id) return;

  this.rifaService.comprarNumeros(this.rifa.id, numeros).subscribe({
    next: (response) => {
      this.comprando = false;
      if (response.success) {
        this.mostrarMensaje('¡Compra realizada exitosamente!', 'success');
        this.cantidadAComprar = 1;
        this.cargarRifa();
      } else {
        this.mostrarMensaje(response.message || 'Error en la compra', 'danger');
      }
    },
    error: (error) => {
      this.comprando = false;
      console.error('Error en compra:', error);
      this.mostrarMensaje('Error al procesar la compra', 'danger');
    }
  });
}



  toggleSelectorNumeros() {
    this.mostrarSelectorNumeros = !this.mostrarSelectorNumeros;
  }

  // Métodos de utilidad
  getMaximosNumerosDisponibles(): number {
    if (!this.rifa) return 1;
    const disponibles = (this.rifa.total_numeros || 0) - (this.rifa.numeros_vendidos || 0);
    return Math.min(10, disponibles);
  }

  getPorcentajeVendido(): number {
    if (!this.rifa) return 0;
    const total = this.rifa.total_numeros || this.rifa.cantidad_numeros || 0;
    const vendidos = this.rifa.numeros_vendidos || 0;
    return total > 0 ? Math.round((vendidos / total) * 100) : 0;
  }

  getRecaudado(): number {
    if (!this.rifa) return 0;
    const vendidos = this.rifa.numeros_vendidos || 0;
    return vendidos * this.rifa.precio_numero;
  }

  getPotencialTotal(): number {
    if (!this.rifa) return 0;
    const total = this.rifa.total_numeros || this.rifa.cantidad_numeros || 0;
    return total * this.rifa.precio_numero;
  }

  // Métodos de permisos
  puedeEditarRifa(): boolean {
    const usuario = this.authService.getCurrentUser();
    if (!usuario || !this.rifa) return false;

    return usuario.rol === 'admin_global' || 
           (usuario.rol === 'admin_institucion' && usuario.institucion_id === this.rifa.institucion_id) ||
           usuario.id === this.rifa.creado_por;
  }

  puedeComprar(): boolean {
    return this.estaLogueado() && this.rifa?.estado === 'activa';
  }

  estaLogueado(): boolean {
    return this.authService.isAuthenticated();
  }

  // Métodos de formato
  formatearPrecio(valor: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  formatearFechaCompleta(fecha: string): string {
    return new Date(fecha).toLocaleString('es-AR');
  }

  getEstadoTexto(estado: string): string {
    const estados: Record<string, string> = {
      'activa': '✅ Activa',
      'finalizada': '🏁 Finalizada', 
      'cancelada': '❌ Cancelada',
      'borrador': '📝 Borrador'
    };
    return estados[estado] || estado;
  }

  volver() {
    this.router.navigate(['/rifas']);
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'danger' | 'info') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }
}