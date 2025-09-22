// ====================================
// src/app/components/comprar-numeros/comprar-numeros.component.ts
// ====================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-comprar-numeros',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './comprar-numeros.component.html',
  styleUrls: ['./comprar-numeros.component.css' ]
})

export class ComprarNumerosComponent implements OnInit {
  rifaId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.rifaId = this.route.snapshot.paramMap.get('id');
    console.log('🎟️ Componente Comprar Números - Rifa ID:', this.rifaId);
  }
}