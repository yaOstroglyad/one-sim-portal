import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { hexRgb, rgbToHsl } from '../utils';
import { LocalStorageService } from 'ngx-webstorage';

export interface VisualConfig {
  primaryColor: string;
  secondaryColor?: string;
  language?: string;
  logoUrl?: string;
  faviconUrl?: string;
  height?: number;
  [key: string]: any;
}

export const defaultVisualConfig: VisualConfig = {
  primaryColor: '#f89c2e',
  secondaryColor: '#fef6f0',
  language: 'en',
  logoUrl: 'assets/img/brand/1esim-logo.png',
  faviconUrl: 'assets/img/brand/1esim-logo-small.png',
  height: 47
};

@Injectable({ providedIn: 'root' })
export class VisualService {
  private themeConfig$ = new BehaviorSubject<VisualConfig>(defaultVisualConfig);
  private apiUrl = '/api/v1/whitelabel/app-view-config/query/data?type=admin+portal';

  constructor(
    private http: HttpClient,
    private $localStorageService: LocalStorageService
  ) {}

  /**
   * Загружает визуальные настройки с API
   */
  loadVisualConfig(): Observable<VisualConfig> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(response => {
        if (response && response.viewConfig) {
          const viewConfig = response.viewConfig;
          this.applyVisualConfig({
            primaryColor: viewConfig.primaryColor || defaultVisualConfig.primaryColor,
            secondaryColor: viewConfig.secondaryColor || defaultVisualConfig.secondaryColor,
            language: viewConfig.language || defaultVisualConfig.language,
            logoUrl: viewConfig.logoUrl || viewConfig.logoName || defaultVisualConfig.logoUrl,
            faviconUrl: viewConfig.faviconUrl || viewConfig.logoNameSmall || defaultVisualConfig.faviconUrl,
            height: viewConfig.height || defaultVisualConfig.height
          });
        } else {
          this.applyVisualConfig(defaultVisualConfig);
        }
      }),
      catchError(error => {
        console.error('Ошибка при загрузке визуальных настроек:', error);
        this.applyVisualConfig(defaultVisualConfig);
        return of(defaultVisualConfig);
      })
    );
  }

  /**
   * Применяет визуальные настройки
   */
  applyVisualConfig(config: VisualConfig): void {
    this.updateCssVariables(config);

    if (config.faviconUrl) {
      this.updateFavicon(config.faviconUrl);
    }

    this.$localStorageService.store('viewConfig', config);

    this.themeConfig$.next({...config});
  }

  /**
   * Обновляет CSS-переменные на основе конфигурации
   */
  private updateCssVariables(config: VisualConfig): void {
    if (config.primaryColor) {
      const rgbConfig = hexRgb(config.primaryColor);
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

  /**
   * Обновляет фавикон страницы
   */
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

  /**
   * Возвращает Observable с текущей конфигурацией
   */
  getThemeConfig$(): Observable<VisualConfig> {
    return this.themeConfig$.asObservable();
  }

  /**
   * Возвращает текущую конфигурацию
   */
  getCurrentConfig(): VisualConfig {
    return this.themeConfig$.value;
  }
}
