import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LayoutConfig } from '../models';
import { ThemeService } from '@shared';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly STORAGE_KEY = 'layout-config';
  private readonly themeService = inject(ThemeService);

  private layoutConfig$ = new BehaviorSubject<LayoutConfig>({
    sidebarCollapsed: false,
    darkTheme: false,
    rtlDirection: false
  });

  constructor() {
    this.loadFromStorage();

    // Sync with ThemeService
    this.themeService.theme$.subscribe(theme => {
      const current = this.layoutConfig$.value;
      const isDark = theme === 'dark';
      if (current.darkTheme !== isDark) {
        this.layoutConfig$.next({ ...current, darkTheme: isDark });
      }
    });
  }

  getLayoutConfig(): Observable<LayoutConfig> {
    return this.layoutConfig$.asObservable();
  }

  toggleSidebar(): void {
    const current = this.layoutConfig$.value;
    this.updateConfig({ ...current, sidebarCollapsed: !current.sidebarCollapsed });
  }

  toggleTheme(): void {
    // Delegate to ThemeService
    this.themeService.toggleTheme();
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
        // Don't load darkTheme from here - ThemeService manages it
        this.layoutConfig$.next({
          sidebarCollapsed: config.sidebarCollapsed || false,
          darkTheme: this.themeService.isDarkTheme(),
          rtlDirection: config.rtlDirection || false
        });
        this.applyDirection(config.rtlDirection);
      } catch (e) {
        console.warn('Failed to parse stored layout config');
      }
    }
  }

  private saveToStorage(config: LayoutConfig): void {
    // Don't save darkTheme - ThemeService manages it
    const configToSave = {
      sidebarCollapsed: config.sidebarCollapsed,
      rtlDirection: config.rtlDirection
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configToSave));
  }

  private applyDirection(isRtl: boolean): void {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  }
}
