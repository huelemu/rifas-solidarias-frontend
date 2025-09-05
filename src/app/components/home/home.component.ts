// src/app/components/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  connectionStatus = 'Verificando...';
  dbInfo: any = null;
  error = '';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.testConnection();
  }

  testConnection(): void {
    this.apiService.testConnection().subscribe({
      next: (response) => {
        this.connectionStatus = '✅ Conectado';
        this.dbInfo = response;
      },
      error: (error) => {
        this.connectionStatus = '❌ Error de conexión';
        this.error = error;
        console.error('Error de conexión:', error);
      }
    });
  }
}