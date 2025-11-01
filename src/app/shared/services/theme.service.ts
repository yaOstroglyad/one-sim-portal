import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Theme type
 */
export type Theme = 'light' | 'dark';

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  theme: Theme;
  timestamp: Date;
}

/**
 * ThemeService
 *
 * Centralized theme management service for the entire application.
 * Manages dark/light theme switching and persists the selection in localStorage.
 *
 * @example
 * ```typescript
 * constructor(private themeService: ThemeService) {
 *   this.themeService.theme$.subscribe(theme => {
 *     console.log('Current theme:', theme);
 *   });
 * }
 *
 * toggleTheme() {
 *   this.themeService.toggleTheme();
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme';
  private readonly themeSubject$ = new BehaviorSubject<Theme>('light');

  /**
   * Observable that emits current theme
   */
  public readonly theme$: Observable<Theme> = this.themeSubject$.asObservable();

  constructor() {
    this.loadThemeFromStorage();
  }

  /**
   * Get current theme
   *
   * @returns Current theme ('light' or 'dark')
   */
  getCurrentTheme(): Theme {
    return this.themeSubject$.value;
  }

  /**
   * Check if current theme is dark
   *
   * @returns True if dark theme is active
   */
  isDarkTheme(): boolean {
    return this.themeSubject$.value === 'dark';
  }

  /**
   * Set theme
   *
   * @param theme - Theme to set ('light' or 'dark')
   */
  setTheme(theme: Theme): void {
    if (this.themeSubject$.value !== theme) {
      this.themeSubject$.next(theme);
      this.applyTheme(theme);
      this.saveThemeToStorage(theme);
    }
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme: Theme = this.isDarkTheme() ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Load theme from localStorage
   * If no theme is saved, defaults to 'light'
   */
  private loadThemeFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config: ThemeConfig = JSON.parse(stored);
        if (config.theme === 'dark' || config.theme === 'light') {
          this.themeSubject$.next(config.theme);
          this.applyTheme(config.theme);
        }
      }
    } catch (e) {
      console.warn('Failed to load theme from localStorage', e);
    }
  }

  /**
   * Save theme to localStorage
   *
   * @param theme - Theme to save
   */
  private saveThemeToStorage(theme: Theme): void {
    try {
      const config: ThemeConfig = {
        theme,
        timestamp: new Date()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save theme to localStorage', e);
    }
  }

  /**
   * Apply theme to DOM
   * Adds or removes 'dark' class from document root element
   *
   * @param theme - Theme to apply
   */
  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }
}
