// src/app/rifas/components/rifa-public-view/rifa-public-view.component.ts
// ✅ ACTUALIZAR MÉTODO comprarNumero PARA PRE-SELECCIONAR

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';

interface NumeroPublico {
  numero: number;
  estado: 'disponible' | 'reservado' | 'vendido';
  qr_code: string;
  precio_venta: number;
}

@Component({
  selector: 'app-rifa-public-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rifa-public-view.component.html',
  styleUrls: ['./rifa-public-view.component.scss']
})
export class RifaPublicViewComponent implements OnInit {
seleccionarNumero(_t126: NumeroPublico) {
throw new Error('Method not implemented.');
}
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly authService = inject(AuthService);

  readonly ImageUrlHelper = ImageUrlHelper;

  // Signals
  readonly rifa = signal<any>(null);
  readonly numeros = signal<NumeroPublico[]>([]);
  readonly loading = signal(true);
  readonly loadingNumeros = signal(false);
  readonly error = signal<string | null>(null);
  readonly mostrarNumerosFlag = signal(false);

  // Filtros
  filtroEstado = 'todos';
  buscarNumero: number | null = null;

  // Paginación
  readonly paginaActual = signal(1);
  readonly totalPaginas = signal(1);

  // Computed
  readonly numerosFiltrados = computed(() => {
    let resultado = this.numeros();

    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(n => n.estado === this.filtroEstado);
    }

    if (this.buscarNumero) {
      resultado = resultado.filter(n => n.numero === this.buscarNumero);
    }

    return resultado.sort((a, b) => a.numero - b.numero);
  });

ngOnInit(): void {
    this.route.params.subscribe((params) => {
      // ✅ IMPORTANTE: Obtener el ID correctamente
      const rifaIdParam = params['id'] || params['rifaId'];
      
      if (!rifaIdParam) {
        console.error('❌ No se proporcionó ID de rifa en la URL');
        this.error.set('ID de rifa inválido');
        return;
      }

      const rifaId = parseInt(rifaIdParam, 10);

      if (isNaN(rifaId) || rifaId <= 0) {
        console.error('❌ ID de rifa inválido:', rifaIdParam);
        this.error.set('ID de rifa inválido');
        return;
      }

      console.log('✅ Cargando rifa pública:', rifaId);
      this.cargarRifaPublica(rifaId);
    });
  }

  cargarRifaPublica(rifaId: number): void {
    this.loading.set(true);
    this.error.set(null);

    console.log('📡 Cargando rifa pública:', rifaId);

    this.rifasService.getPublicRifa(rifaId).subscribe({
      next: (response: any) => {
        console.log('✅ Rifa pública cargada:', response);
        this.rifa.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error cargando rifa pública:', err);
        this.error.set('No se pudo cargar la información de la rifa');
        this.loading.set(false);
      }
    });
  }

  verNumerosDisponibles(): void {
    if (this.numeros().length === 0) {
      this.cargarNumeros();
    }
    this.mostrarNumerosFlag.set(true);
  }

  ocultarNumeros(): void {
    this.mostrarNumerosFlag.set(false);
  }

  cargarNumeros(pagina: number = 1): void {
    this.loadingNumeros.set(true);
    const rifaId = this.rifa()?.id;

    if (!rifaId) return;

    const params = {
      estado: this.filtroEstado === 'todos' ? undefined : this.filtroEstado,
      page: pagina,
      limit: 100
    };

    this.rifasService.getPublicNumbers(rifaId, params).subscribe({
      next: (response: any) => {
        console.log('✅ Números públicos cargados:', response);
        this.numeros.set(response.data?.numeros || []);
        this.paginaActual.set(response.pagination?.page || 1);
        this.totalPaginas.set(response.pagination?.totalPages || 1);
        this.loadingNumeros.set(false);
      },
      error: (err) => {
        console.error('❌ Error cargando números:', err);
        this.loadingNumeros.set(false);
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarNumeros(1);
  }

  cambiarPagina(pagina: number): void {
    this.cargarNumeros(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * ✅ MEJORADO: Comprar número específico con pre-selección
   */
  comprarNumero(numero: any): void {
    if (numero.estado !== 'disponible') {
      alert('⚠️ Este número no está disponible para compra');
      return;
    }

    if (!this.estaAutenticado()) {
      if (confirm('🔐 Necesitas iniciar sesión para comprar números.\n¿Deseas ir al login?')) {
        this.irALogin();
      }
      return;
    }

    // ✅ Redirigir a compra con el número pre-seleccionado
    this.router.navigate(['/rifas', this.rifa()?.id, 'comprar'], {
      queryParams: { numero: numero.numero }
    });
  }

  getPorcentajeVendido(): number {
    const total = this.rifa()?.cantidad_numeros || 0;
    const vendidos = this.rifa()?.numeros_vendidos || 0;
    return total > 0 ? Math.round((vendidos / total) * 100) : 0;
  }

  getEstadoNombre(estado: string): string {
    const nombres: any = {
      'disponible': 'Disponible',
      'reservado': 'Reservado',
      'vendido': 'Vendido'
    };
    return nombres[estado] || estado;
  }

  getLogoUrl(): string | null {
    return ImageUrlHelper.getLogoUrl(this.rifa()?.institucion_logo);
  }

  getRifaImageUrl(): string | null {
    return ImageUrlHelper.getRifaImageUrl(this.rifa()?.imagen_url);
  }

  getLogoPlaceholder(): string {
    const nombre = this.rifa()?.institucion_nombre || this.rifa()?.nombre || 'R';
    return nombre.charAt(0).toUpperCase();
  }

  estaAutenticado(): boolean {
    return this.authService.isAuthenticated();
  }

  puedeComprar(): boolean {
    if (!this.estaAutenticado()) return false;
    const usuario = this.authService.currentUser();
    return usuario?.role === 'comprador' || usuario?.role === 'vendedor';
  }

  /**
   * ✅ MEJORADO: Ir a comprar con returnUrl
   */
  irAComprar(): void {
    if (!this.estaAutenticado()) {
      this.irALogin();
      return;
    }
    this.router.navigate(['/rifas', this.rifa()?.id, 'comprar']);
  }

  /**
   * ✅ MEJORADO: Login con returnUrl
   */
  irALogin(): void {
    const returnUrl = this.router.url;
    this.router.navigate(['/login'], {
      queryParams: { returnUrl }
    });
  }

  // Métodos de compartir
  compartirWhatsApp(): void {
    const url = window.location.href;
    const texto = `¡Mira esta rifa! ${this.rifa()?.nombre} - Precio: $${this.rifa()?.precio_numero}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(texto + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
  }

  compartirFacebook(): void {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  }

  copiarLink(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('✅ Link copiado al portapapeles');
    }).catch(() => {
      alert('❌ No se pudo copiar el link');
    });
  }
}