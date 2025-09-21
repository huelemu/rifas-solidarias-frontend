// ====================================
// src/app/components/rifas-activas/rifas-activas.component.ts
// ====================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rifas-activas',
  templateUrl: './rifas-activas.component.html',
  styleUrls: ['./rifas-activas.component.css']
})
export class RifasActivasComponent implements OnInit {
  rifasEjemplo = [
    {
      id: 1,
      titulo: 'Rifa Solidaria - Fundación Esperanza',
      descripcion: 'Ayuda a construir un hogar para familias necesitadas. Participa y contribuye a una causa noble.',
      precio: 500,
      disponibles: 850
    },
    {
      id: 2,
      titulo: 'Rifa Benéfica - Hospital Infantil',
      descripcion: 'Equipamiento médico para la sala de pediatría. Tu participación salva vidas.',
      precio: 300,
      disponibles: 420
    }
  ];

  ngOnInit() {
    console.log('🎟️ Componente Rifas Activas iniciado');
    // TODO: Conectar con RifaService cuando esté listo
  }
}