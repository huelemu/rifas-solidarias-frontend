// ====================================
// src/app/components/mis-rifas/mis-rifas.component.ts
// ====================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mis-rifas',
  templateUrl: './mis-rifas.component.html',
  styleUrls: ['./mis-rifas.component.css']
})
export class MisRifasComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    console.log('🎫 Componente Mis Rifas iniciado');
  }
}
