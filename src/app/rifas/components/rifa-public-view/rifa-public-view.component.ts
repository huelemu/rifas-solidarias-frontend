// src/app/rifas/components/rifa-public-view/rifa-public-view.component.ts

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RifasService } from '../../services/rifas.service';
import { RifasPublicService } from '../../../services/rifas-public.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ImageUrlHelper } from '../../../shared/utils/image-url.helper';

interface NumeroPublico {
  id: number;
  numero: number;
  estado: 'disponible' | 'reservado' | 'vendido';
  qr_code: string;
  precio_venta: number;
  tiene_vendedor?: boolean;
}

@Component({
  selector: 'app-rifa-public-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rifa-public-view.component.html',
  styleUrls: ['./rifa-public-view.component.scss']
})
export class RifaPublicViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly rifasService = inject(RifasService);
  private readonly rifasPublicService = inject(RifasPublicService);
  private readonly authService = inject(AuthService);

  readonly ImageUrlHelper = ImageUrlHelper;

  // Signals
  readonly rifa = signal<any>(null);
  readonly numeros = signal<NumeroPublico[]>([]);
  readonly numerosConVendedor = signal<number[]>([]);
  readonly loading = signal(true);
  readonly loadingNumeros = signal(false);
  readonly error = signal<string | null>(null);
  readonly mostrarNumerosFlag = signal(true);
  readonly mostrarSoloDisponibles = signal(true);
  readonly mostrandoTodos = signal(false);

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
      this.cargarNumerosConVendedor(rifaId);
      this.cargarNumerosDisponibles(1);
    });
  }

  cargarRifaPublica(rifaId: number): void {
    this.loading.set(true);
    this.error.set(null);

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

  cargarNumerosConVendedor(rifaId: number): void {
    this.rifasPublicService.getNumerosConVendedor(rifaId).subscribe({
      next: (response) => {
        const ids = response.data || [];
        this.numerosConVendedor.set(ids);
        console.log('✅ Números con vendedor:', ids.length);
      },
      error: (err) => {
        console.error('❌ Error cargando vendedores:', err);
        this.numerosConVendedor.set([]);
      }
    });
  }

  // ✅ NUEVO: Cargar solo números DISPONIBLES con vendedor (RÁPIDO)
  cargarNumerosDisponibles(pagina: number = 1, aleatorios: boolean = false): void {
    this.loadingNumeros.set(true);
    const rifaId = this.rifa()?.id;

    if (!rifaId) {
      this.loadingNumeros.set(false);
      return;
    }

    console.log('⚡ Cargando números disponibles...');

    this.rifasPublicService.getNumerosDisponibles(rifaId, 100, aleatorios).subscribe({
      next: (response: any) => {
        console.log('✅ Números disponibles recibidos:', response);
        
        const numerosData = response.data?.numeros || [];
        
        const numerosConVendedor = numerosData.map((n: any) => ({
          ...n,
          tiene_vendedor: true
        }));

        this.numeros.set(numerosConVendedor);
        this.mostrandoTodos.set(false);
        this.loadingNumeros.set(false);
        
        console.log(`✅ ${numerosConVendedor.length} de ${response.data?.total || 0} disponibles`);
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.loadingNumeros.set(false);
      }
    });
  }

  // ✅ MODIFICADO: Cargar TODOS los números (opción secundaria)
  cargarTodosLosNumeros(pagina: number = 1): void {
    this.loadingNumeros.set(true);
    const rifaId = this.rifa()?.id;

    if (!rifaId) return;

    console.log('🔍 Cargando TODOS los números...');

    const params = {
      estado: this.filtroEstado === 'todos' ? undefined : this.filtroEstado,
      page: pagina,
      limit: 100
    };

    this.rifasService.getPublicNumbers(rifaId, params).subscribe({
      next: (response: any) => {
        console.log('✅ Todos los números cargados:', response);
        
        const numerosData = response.data?.numeros || [];
        
        const numerosConVendedor = numerosData.map((n: any) => ({
          ...n,
          tiene_vendedor: this.tieneVendedor(n.id)
        }));

        this.numeros.set(numerosConVendedor);
        this.mostrandoTodos.set(true);
        
        if (response.pagination) {
          this.paginaActual.set(response.pagination.page || 1);
          this.totalPaginas.set(response.pagination.totalPages || 1);
        }

        this.loadingNumeros.set(false);
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.loadingNumeros.set(false);
      }
    });
  }

  // ✅ NUEVO: Toggle entre modos de visualización
  toggleModoVisualizacion(): void {
    if (this.mostrandoTodos()) {
      this.cargarNumerosDisponibles(1);
    } else {
      this.cargarTodosLosNumeros(1);
    }
  }

  // ✅ NUEVO: Mostrar números aleatorios
  mostrarNumerosAleatorios(): void {
    this.cargarNumerosDisponibles(1, true);
  }

  tieneVendedor(numeroId: number): boolean {
    return this.numerosConVendedor().includes(numeroId);
  }

  verNumerosDisponibles(): void {
    if (this.numeros().length === 0) {
      this.cargarNumerosDisponibles();
    }
    this.mostrarNumerosFlag.set(true);
  }

  ocultarNumeros(): void {
    this.mostrarNumerosFlag.set(false);
  }

  cargarNumeros(pagina: number = 1): void {
    if (this.mostrandoTodos()) {
      this.cargarTodosLosNumeros(pagina);
    } else {
      this.cargarNumerosDisponibles(pagina);
    }
  }

  aplicarFiltros(): void {
    this.cargarNumeros(1);
  }

  cambiarPagina(pagina: number): void {
    this.cargarNumeros(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  seleccionarNumero(numero: NumeroPublico): void {
    const rifaId = this.rifa()?.id;
    
    if (!numero.tiene_vendedor) {
      alert('⚠️ Este número aún no tiene un vendedor asignado. Por favor, intenta más tarde.');
      return;
    }

    if (numero.estado === 'vendido') {
      alert('❌ Este número ya fue vendido.');
      return;
    }

    console.log('📱 Navegando a número:', numero.numero);
    this.router.navigate(['/public/rifas', rifaId, 'numero', numero.numero]);
  }

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

  irAComprar(): void {
    if (!this.estaAutenticado()) {
      this.irALogin();
      return;
    }
    this.router.navigate(['/rifas', this.rifa()?.id, 'comprar']);
  }

  irALogin(): void {
    const returnUrl = this.router.url;
    this.router.navigate(['/login'], {
      queryParams: { returnUrl }
    });
  }

  compartirWhatsApp(): void {
    const url = window.location.href;
    const logoUrl = this.rifa()?.imagen_url;
    const imagenCompleta = logoUrl ? 
      (logoUrl.startsWith('http') ? logoUrl : `${window.location.origin}${logoUrl}`) : '';
    
    const nombre = this.rifa()?.nombre || '';
    const precio = this.rifa()?.precio_numero || 0;
    const disponibles = this.rifa()?.numeros_disponibles || 0;
    const total = this.rifa()?.cantidad_numeros || 0;
    const fechaSorteo = this.rifa()?.fecha_sorteo ? 
      new Date(this.rifa()?.fecha_sorteo).toLocaleDateString('es-AR') : 
      'A confirmar';
    
    const vendedor = this.authService.currentUser();
    
    let mensaje = `🎟️ *${nombre}*\n\n`;
    mensaje += `💰 Precio: $${precio.toLocaleString('es-AR')}\n`;
    mensaje += `📊 Disponibles: ${disponibles} de ${total}\n`;
    mensaje += `🎯 Cuando?: ${fechaSorteo}\n\n`;
    mensaje += `👉 ${url}`;
    
    if (vendedor && (vendedor as any).alias_mp) {
      mensaje += `\n💳 Alias: ${(vendedor as any).alias_mp}`;
    }
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
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