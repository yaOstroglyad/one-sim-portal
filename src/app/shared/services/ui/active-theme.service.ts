import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-webstorage';

import { hexToRgb, rgbToHsl } from '../../utils';
import {
  APPLICATION_TYPES,
  DEFAULT_PORTAL_CONFIG,
  WhitelabelConfigService,
  WhitelabelViewConfig
} from '../data';

export interface ActiveThemeConfig {
  primaryColor: string;
  secondaryColor?: string;
  language?: string;
  logoUrl?: string;
  faviconUrl?: string;
  height?: number;
  [key: string]: any;
}

const DEFAULT_ACTIVE_THEME: ActiveThemeConfig = {
  primaryColor: DEFAULT_PORTAL_CONFIG.primaryColor,
  secondaryColor: DEFAULT_PORTAL_CONFIG.secondaryColor,
  logoUrl: DEFAULT_PORTAL_CONFIG.logoUrl,
  faviconUrl: DEFAULT_PORTAL_CONFIG.faviconUrl,
  height: DEFAULT_PORTAL_CONFIG.height,
  language: 'en'
};

@Injectable({ providedIn: 'root' })
export class ActiveThemeService {
  private readonly whitelabelConfigService = inject(WhitelabelConfigService);
  private readonly localStorageService = inject(LocalStorageService);

  private readonly themeConfig$ = new BehaviorSubject<ActiveThemeConfig>(DEFAULT_ACTIVE_THEME);

  /**
   * Load theme configuration for current user from API
   * Uses WhitelabelConfigService to fetch data
   */
  load(): Observable<ActiveThemeConfig> {
    return this.whitelabelConfigService
      .getByApplicationType(APPLICATION_TYPES.ADMIN_PORTAL)
      .pipe(
        map(config => this.mapToActiveTheme(config.viewConfig)),
        tap(theme => this.apply(theme)),
        catchError(error => {
          console.error('Error loading theme config:', error);
          this.apply(DEFAULT_ACTIVE_THEME);
          return of(DEFAULT_ACTIVE_THEME);
        })
      );
  }

  /**
   * Apply theme configuration to the UI
   * Updates CSS variables, favicon, and localStorage
   */
  apply(config: ActiveThemeConfig): void {
    this.updateCssVariables(config);

    if (config.faviconUrl) {
      this.updateFavicon(config.faviconUrl);
    }

    this.localStorageService.store('viewConfig', config);
    this.themeConfig$.next({ ...config });
  }

  /**
   * Get observable of current theme configuration
   */
  getConfig$(): Observable<ActiveThemeConfig> {
    return this.themeConfig$.asObservable();
  }

  /**
   * Get current theme configuration synchronously
   */
  getCurrentConfig(): ActiveThemeConfig {
    return this.themeConfig$.value;
  }

  private mapToActiveTheme(viewConfig: WhitelabelViewConfig): ActiveThemeConfig {
    return {
      primaryColor: viewConfig.primaryColor || DEFAULT_ACTIVE_THEME.primaryColor,
      secondaryColor: viewConfig.secondaryColor || DEFAULT_ACTIVE_THEME.secondaryColor,
      language: DEFAULT_ACTIVE_THEME.language,
      logoUrl: viewConfig.logoUrl || DEFAULT_ACTIVE_THEME.logoUrl,
      faviconUrl: viewConfig.faviconUrl || DEFAULT_ACTIVE_THEME.faviconUrl,
      height: viewConfig.height || DEFAULT_ACTIVE_THEME.height
    };
  }

  private updateCssVariables(config: ActiveThemeConfig): void {
    if (config.primaryColor) {
      const rgbConfig = hexToRgb(config.primaryColor);
      const [hue, saturation, lightness] = rgbToHsl(rgbConfig.red, rgbConfig.green, rgbConfig.blue);

      document.documentElement.style.setProperty('--os-color-primary', config.primaryColor);
      document.documentElement.style.setProperty('--os-color-primary-rgb', `${rgbConfig.red}, ${rgbConfig.green}, ${rgbConfig.blue}`);
      document.documentElement.style.setProperty('--os-color-primary-h', `${hue}`);
      document.documentElement.style.setProperty('--os-color-primary-s', `${saturation}%`);
      document.documentElement.style.setProperty('--os-color-primary-l', `${lightness}%`);
    }

    if (config.secondaryColor) {
      document.documentElement.style.setProperty('--os-color-secondary', config.secondaryColor);
    }
  }

  private updateFavicon(faviconUrl: string): void {
    if (!faviconUrl) return;

    let link: HTMLLinkElement = document.querySelector('link[rel*="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;
  }
}
