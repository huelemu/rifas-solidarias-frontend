// src/app/app.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastComponent],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
      <app-toast /> 
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      width: 100%;
    }
    
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})


export class AppComponent {
  title = 'rifas-app';
}