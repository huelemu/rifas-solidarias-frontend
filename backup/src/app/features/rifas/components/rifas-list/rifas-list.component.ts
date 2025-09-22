import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RifasService, Rifa } from '../../services/rifas.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-rifas-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './rifas-list.component.html',
  styleUrls: ['./rifas-list.component.scss']
})
export class RifasListComponent implements OnInit {
  rifas: Rifa[] = [];
  loading = true;

  constructor(private rifasService: RifasService) {}

  ngOnInit(): void {
    this.loadRifas();
  }

  loadRifas(): void {
    this.rifasService.getRifasActivas().subscribe({
      next: (rifas) => {
        this.rifas = rifas;
        this.loading = false;
        console.log('🎲 Rifas cargadas:', rifas);
      },
      error: (error) => {
        console.error('❌ Error cargando rifas:', error);
        this.loading = false;
      }
    });
  }

  getProgressPercentage(rifa: Rifa): number {
    if (rifa.numeros_totales === 0) return 0;
    return (rifa.numeros_vendidos / rifa.numeros_totales) * 100;
  }
}