import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="header-gradient">
        <div class="header-content">
          <div class="header-left">
            <h1>
              <span class="header-icon">{{ icon }}</span>
              {{ title }}
            </h1>
            <p>{{ subtitle }}</p>
          </div>
          <div class="header-actions">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
      
      <!-- Stats section (opcional) -->
      <div *ngIf="showStats" class="header-stats">
        <ng-content select="[stats]"></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '📄';
  @Input() showStats: boolean = false;
}