import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-title-section">
      <div class="page-title-content">
        <h1>
          <span class="title-icon">{{ icon }}</span>
          {{ title }}
        </h1>
        <p *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./page-title.component.scss']
})
export class PageTitleComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '📄';
}