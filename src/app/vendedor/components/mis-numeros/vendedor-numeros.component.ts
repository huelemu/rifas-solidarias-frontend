// src/app/vendedor/components/vendedor-numeros/vendedor-numeros.component.ts

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../../rifas/services/rifas.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

interface NumeroVendedor {
  id: number;
  numero: number;
  qr_code: string;
  estado: 'disponible' | 'vendido';
  comprador_nombre?: string;
  comprador_apellido?: string;
  comprador_telefono?: string;
  comprador_email?: string;
  fecha_venta?: string;
  metodo_pago?: string;
  fecha_asignacion: string;
}

@Component({
  selector: 'app-vendedor-numeros',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './vendedor-numeros.component.html',
  styleUrls: ['./vendedor-numeros.component.scss']
})
export class VendedorNumerosComponent implements OnInit {
  private rifasService = inject(RifasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals
  numeros = signal<NumeroVendedor[]>([]);
  rifa = signal<any>(null);
  loading = signal(false);
  
  // Modal venta
  numeroSeleccionado = signal<NumeroVendedor | null>(null);
  mostrarModalVenta = signal(false);
  
  // Formulario venta
  datosComprador = {
    nombre: '',
    apellido: '',
    telefono: '',
    email: ''
  };

  // Vista: lista o grilla
  vistaActual = signal<'grilla' | 'lista'>('grilla');
  
  // Filtros
  filtroEstado = 'todos';
  buscarNumero: string = '';

  // Computed
  disponibles = computed(() => 
    this.numeros().filter(n => n.estado === 'disponible').length
  );
  
  vendidos = computed(() => 
    this.numeros().filter(n => n.estado === 'vendido').length
  );

  porcentajeVendido = computed(() => {
    const total = this.numeros().length;
    return total > 0 ? Math.round((this.vendidos() / total) * 100) : 0;
  });

  numerosFiltrados = computed(() => {
    let resultado = this.numeros();
    
    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(n => n.estado === this.filtroEstado);
    }
    
    if (this.buscarNumero) {
      const busqueda = this.buscarNumero.toLowerCase();
      resultado = resultado.filter(n => 
        n.numero.toString().includes(busqueda) ||
        n.comprador_nombre?.toLowerCase().includes(busqueda) ||
        n.comprador_telefono?.includes(busqueda)
      );
    }
    
    return resultado.sort((a, b) => a.numero - b.numero);
  });
  authService: any;

  ngOnInit() {
    const rifaId = +this.route.snapshot.params['rifaId'];
    this.cargarNumeros(rifaId);
  }

  cargarNumeros(rifaId: number) {
    this.loading.set(true);
    this.rifasService.obtenerNumerosVendedor(rifaId).subscribe({
      next: (response) => {
        this.rifa.set(response.data.rifa);
        this.numeros.set(response.data.numeros);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        alert('Error al cargar números: ' + (err.error?.message || 'Error desconocido'));
        this.loading.set(false);
      }
    });
  }

  // ===== ACCIONES =====
  
  abrirModalVenta(numero: NumeroVendedor) {
    this.numeroSeleccionado.set(numero);
    this.mostrarModalVenta.set(true);
  }

  cerrarModal() {
    this.numeroSeleccionado.set(null);
    this.mostrarModalVenta.set(false);
    this.datosComprador = { nombre: '', apellido: '', telefono: '', email: '' };
  }

  confirmarVenta() {
    const numero = this.numeroSeleccionado();
    if (!numero) return;

    this.loading.set(true);
    const rifaId = this.rifa()!.id;

    this.rifasService.venderNumeroVendedor(rifaId, numero.numero, {
      comprador_nombre: this.datosComprador.nombre,
      comprador_apellido: this.datosComprador.apellido,
      comprador_telefono: this.datosComprador.telefono,
      comprador_email: this.datosComprador.email
    }).subscribe({
      next: () => {
        alert('✅ Entrada vendida exitosamente');
        this.cerrarModal();
        this.cargarNumeros(rifaId);
      },
      error: (err) => {
        alert('❌ Error: ' + (err.error?.message || 'Error desconocido'));
        this.loading.set(false);
      }
    });
  }

compartirWhatsApp(numero: NumeroVendedor) {
  const rifaId = this.rifa()?.id;
  const rifaNombre = this.rifa()?.nombre || 'Rifa';
  const rifaPrecio = this.rifa()?.precio_numero || 0;
  const fechaSorteo = this.rifa()?.fecha_sorteo ? 
    new Date(this.rifa()?.fecha_sorteo).toLocaleDateString('es-AR') : 
    'A confirmar';
  
  // ✅ Obtener datos del vendedor
  const vendedor = this.authService.currentUser();
  
  const mensaje = 
    `🎟️ *${rifaNombre}*\n\n` +
    `#${numero.numero}\n` +
    `💰 Precio: $${rifaPrecio.toLocaleString('es-AR')}\n` +
    `🎯 Cuando?: ${fechaSorteo}\n\n` +
    `Ver tk: ${window.location.origin}/public/rifas/${rifaId}/numero/${numero.numero}\n\n` +
    `¡Reservala ahora! 🎫`;
  
  // ✅ AGREGAR ALIAS MP SI EXISTE
  let mensajeFinal = mensaje;
  if (vendedor && (vendedor as any).alias_mp) {
    mensajeFinal += `\n💳 Alias: ${(vendedor as any).alias_mp}`;
  }
  
  const url = `https://wa.me/?text=${encodeURIComponent(mensajeFinal)}`;
  window.open(url, '_blank');
}

  compartirInstagram(numero: NumeroVendedor) {
    // Generar imagen del número para Instagram Stories
    alert('Función de compartir en Instagram próximamente');
  }

  verQR(numero: NumeroVendedor) {
    // Modal con QR grande
    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    modal.innerHTML = `
      <div class="qr-modal-content">
        <h3>Entrada #${numero.numero}</h3>
        <img src="${numero.qr_code}" alt="QR ${numero.numero}">
        <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  descargarQR(numero: NumeroVendedor) {
    const link = document.createElement('a');
    link.href = numero.qr_code;
    link.download = `entrada-${numero.numero}.png`;
    link.click();
  }

  cambiarVista(vista: 'grilla' | 'lista') {
    this.vistaActual.set(vista);
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}