import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewPreferenceService, ViewMode } from '../../services/view-preference.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-toggle.component.html',
  styleUrls: ['./view-toggle.component.scss']
})
export class ViewToggleComponent {
  viewMode$: Observable<ViewMode>;

  constructor(private viewPreferenceService: ViewPreferenceService) {
    this.viewMode$ = this.viewPreferenceService.getViewMode$();
  }

  /**
   * Cambia entre vista de tarjetas y lista
   */
  toggleView(): void {
    this.viewPreferenceService.toggleViewMode();
  }

  /**
   * Establece un modo específico
   */
  setView(mode: ViewMode): void {
    this.viewPreferenceService.setViewMode(mode);
  }
}