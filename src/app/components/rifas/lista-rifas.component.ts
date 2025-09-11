// src/app/components/rifas/lista-rifas.component.ts - ACTUALIZADA
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RifaService, Rifa } from '../../services/rifa.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-lista-rifas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './lista-rifas.component.html',
  styleUrls: ['./lista-rifas.component.css']
})
export class ListaRifasComponent implements OnInit {
  rifas: Rifa[] = [];
  rifasFiltradas: Rifa[] = [];
  instituciones: any[] = [];
  
  // Filtros
  filtroEstado: string = '';
  filtroInstitucion: string = '';
  
  // Estados
  cargando: boolean = false;
  error: string = '';

  constructor(
    private rifaService: RifaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarRifas();
    this.cargarInstituciones();
  }

  cargarRifas() {
    this.cargando = true;
    this.error = '';

    this.rifaService.obtenerRifas().subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.rifas = response.data;
          this.aplicarFiltros();
        } else {
          this.error = response.message || 'Error al cargar rifas';
        }
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al cargar rifas:', error);
        this.error = 'Error de conexión. Verifica que el servidor esté funcionando.';
      }
    });
  }

  cargarInstituciones() {
    // Implementar carga de instituciones para filtros
    // this.institucionService.obtenerInstituciones().subscribe(...)
  }

  aplicarFiltros() {
    this.rifasFiltradas = this.rifas.filter(rifa => {
      const cumpleEstado = !this.filtroEstado || rifa.estado === this.filtroEstado;
      const cumpleInstitucion = !this.filtroInstitucion || rifa.institucion_id?.toString() === this.filtroInstitucion;
      
      return cumpleEstado && cumpleInstitucion;
    });
  }

  limpiarFiltros() {
    this.filtroEstado = '';
    this.filtroInstitucion = '';
    this.aplicarFiltros();
  }

  // Métodos de utilidad
  truncarTexto(texto: string, limite: number): string {
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
  }

  formatearPrecio(valor: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR');
  }

  getPorcentajeVendido(rifa: Rifa): number {
    const total = rifa.total_numeros || rifa.cantidad_numeros || 0;
    const vendidos = rifa.numeros_vendidos || 0;
    return total > 0 ? Math.round((vendidos / total) * 100) : 0;
  }

  getNumerosdisponibles(rifa: Rifa): number {
    const total = rifa.total_numeros || rifa.cantidad_numeros || 0;
    const vendidos = rifa.numeros_vendidos || 0;
    return total - vendidos;
  }

  esFechaUrgente(fecha: string): boolean {
    const fechaFin = new Date(fecha);
    const hoy = new Date();
    const diferenciaDias = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
    return diferenciaDias <= 7 && diferenciaDias >= 0;
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

  // Métodos de permisos
  puedeCrearRifas(): boolean {
    const usuario = this.authService.getCurrentUser();
    if (!usuario) return false;
    
    return ['admin_global', 'admin_institucion', 'vendedor'].includes(usuario.rol);
  }

  puedeEditarRifa(rifa: Rifa): boolean {
    const usuario = this.authService.getCurrentUser();
    if (!usuario) return false;

    return usuario.rol === 'admin_global' || 
           (usuario.rol === 'admin_institucion' && usuario.institucion_id === rifa.institucion_id) ||
           usuario.id === rifa.creado_por;
  }
}