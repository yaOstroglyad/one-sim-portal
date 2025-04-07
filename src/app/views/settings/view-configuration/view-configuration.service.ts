import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface ViewConfiguration {
  id: string;
  applicationType: 'portal' | 'retail';
  domains: string[];
  viewConfig: any;
}

@Injectable({
  providedIn: 'root'
})
export class ViewConfigurationService {
  private readonly API_URL = `api/view-configuration`;

  constructor(private http: HttpClient) {}

  getViewConfigByApplicationType(type: 'portal' | 'retail'): Observable<ViewConfiguration> {
    // TODO: Заменить на реальный API-запрос
    // return this.http.get<ViewConfiguration>(`${this.API_URL}/get-view-config-by-application-type/${type}`);

    // Мок данных
    return of({
      id: '123e4567-e89b-12d3-a456-426614174000',
      applicationType: type,
      domains: ['example.com', 'test.com'],
      viewConfig: type === 'portal'
        ? {
            // Конфигурация для портала
            primaryColor: '#f89c2e',
            secondaryColor: '#fef6f0',
            logoUrl: 'assets/img/brand/1esim-logo.png',
            faviconUrl: 'assets/img/brand/1esim-logo-small.png',
          }
        : {
            // Конфигурация для retail
            logoUrl: 'assets/img/brand/1esim-logo.png',
            buttonColor: '#f89c2e',
            headlineText: 'Welcome to Our Retail Portal',
            faviconUrl: 'assets/img/brand/1esim-logo-small.png'
          }
    });
  }
}
