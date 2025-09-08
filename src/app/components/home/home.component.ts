// src/app/components/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface DatabaseInfo {
  base_datos: string;
  version: string;
  total_tablas: number;
  total_usuarios: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  connectionStatus = 'Verificando conexión...';
  dbInfo: DatabaseInfo | null = null;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.testConnection();
  }

  testConnection() {
    this.connectionStatus = 'Verificando conexión...';
    this.error = '';
    this.dbInfo = null;

    this.http.get<any>('http://localhost:3100/api/test-db').subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.connectionStatus = '✅ Conexión exitosa al backend';
          this.dbInfo = {
            base_datos: response.database || 'rifas_solidarias',
            version: response.version || 'MariaDB',
            total_tablas: response.tables?.length || 0,
            total_usuarios: response.total_usuarios || 0
          };
        } else {
          this.connectionStatus = '❌ Error en la respuesta del servidor';
          this.error = response.message || 'Error desconocido';
        }
      },
      error: (error) => {
        console.error('Error de conexión:', error);
        this.connectionStatus = '❌ Error de conexión al backend';
        this.error = `No se pudo conectar al servidor backend en http://localhost:3100. 
                     Verifica que el servidor esté ejecutándose.`;
      }
    });
  }
}