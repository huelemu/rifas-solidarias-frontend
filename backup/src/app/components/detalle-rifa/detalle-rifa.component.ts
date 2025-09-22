// ====================================
// src/app/components/detalle-rifa/detalle-rifa.component.ts
// ====================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalle-rifa',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-rifa.component.html', 
  styleUrls: ['./detalle-rifa.component.css']
})
export class DetalleRifaComponent implements OnInit {
  rifaId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.rifaId = this.route.snapshot.paramMap.get('id');
    console.log('📋 Componente Detalle Rifa - ID:', this.rifaId);
  }
}