import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ViewMode = 'card' | 'list';

@Injectable({
  providedIn: 'root'
})
export class ViewPreferenceService {
  private readonly STORAGE_KEY = 'rifas_view_mode';
  private viewModeSubject: BehaviorSubject<ViewMode>;

  constructor() {
    // Cargar preferencia guardada o usar 'card' por defecto
    const savedMode = this.getStoredViewMode();
    this.viewModeSubject = new BehaviorSubject<ViewMode>(savedMode);
  }

  /**
   * Obtiene el modo de vista actual como Observable
   */
  getViewMode$(): Observable<ViewMode> {
    return this.viewModeSubject.asObservable();
  }

  /**
   * Obtiene el modo de vista actual (valor sincrónico)
   */
  getCurrentViewMode(): ViewMode {
    return this.viewModeSubject.value;
  }

  /**
   * Cambia el modo de vista y lo persiste en localStorage
   */
  setViewMode(mode: ViewMode): void {
    this.viewModeSubject.next(mode);
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  /**
   * Alterna entre tarjetas y lista
   */
  toggleViewMode(): void {
    const newMode = this.viewModeSubject.value === 'card' ? 'list' : 'card';
    this.setViewMode(newMode);
  }

  /**
   * Lee la preferencia guardada en localStorage
   */
  private getStoredViewMode(): ViewMode {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return (stored === 'list' || stored === 'card') ? stored : 'card';
  }
}