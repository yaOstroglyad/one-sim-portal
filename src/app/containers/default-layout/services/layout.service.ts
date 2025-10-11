import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LayoutConfig } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly STORAGE_KEY = 'layout-config';

  private layoutConfig$ = new BehaviorSubject<LayoutConfig>({
    sidebarCollapsed: false,
    darkTheme: false,
    rtlDirection: false
  });

  constructor() {
    this.loadFromStorage();
  }

  getLayoutConfig(): Observable<LayoutConfig> {
    return this.layoutConfig$.asObservable();
  }

  toggleSidebar(): void {
    const current = this.layoutConfig$.value;
    this.updateConfig({ ...current, sidebarCollapsed: !current.sidebarCollapsed });
  }

  toggleTheme(): void {
    const current = this.layoutConfig$.value;
    this.updateConfig({ ...current, darkTheme: !current.darkTheme });
    this.applyTheme(current.darkTheme);
  }

  private updateConfig(config: LayoutConfig): void {
    this.layoutConfig$.next(config);
    this.saveToStorage(config);
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const config = JSON.parse(stored);
        this.layoutConfig$.next(config);
        this.applyTheme(config.darkTheme);
        this.applyDirection(config.rtlDirection);
      } catch (e) {
        console.warn('Failed to parse stored layout config');
      }
    }
  }

  private saveToStorage(config: LayoutConfig): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
  }

  private applyTheme(isDark: boolean): void {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  private applyDirection(isRtl: boolean): void {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  }
}
