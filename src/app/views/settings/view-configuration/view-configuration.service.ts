import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ViewConfiguration {
  id: string;
  applicationType: "admin portal" | "retailer" | "self care";
  viewConfig: any;
  ownerAccountId?: string;
}

export interface ViewConfigCreateRequest {
  ownerAccountId?: string;
  applicationType: string;
  viewConfig: any;
}

export interface ViewConfigUpdateRequest {
  id: string;
  viewConfig: any;
}

@Injectable({
  providedIn: 'root'
})
export class ViewConfigurationService {
  private readonly API_URL = `/api/v1/whitelabel/app-view-config`;

  constructor(private http: HttpClient) {}

  /**
   * Получить конфигурацию по типу приложения и опционально по ID аккаунта владельца
   *
   * @param type Тип приложения ('admin portal', 'retailer', 'self care')
   * @param ownerAccountId Опциональный ID аккаунта владельца
   *        - Если не передан или null/undefined, бэкенд будет использовать аккаунт из токена
   *        - Если передан, бэкенд вернет конфигурацию для указанного аккаунта
   *        - Используется в основном для администраторов, которые могут управлять другими аккаунтами
   */
  getViewConfigByApplicationType(
    type: ViewConfiguration['applicationType'],
    ownerAccountId?: string
  ): Observable<ViewConfiguration> {
    let params = new HttpParams().set('type', type);
    if (ownerAccountId) {
      params = params.set('ownerAccountId', ownerAccountId);
    }

    return this.http
      .get<ViewConfiguration>(`${this.API_URL}/query/data`, { params })
      .pipe(
        map(response => {
          if (!response || !response.viewConfig || Object.keys(response.viewConfig).length === 0) {
            return this.getDefaultConfig(type);
          }
          return response;
        }),
      );
  }

  save(config: ViewConfiguration): Observable<ViewConfiguration> {
    if (!config.id) {
      return this.create({
        ownerAccountId: config.ownerAccountId,
        applicationType: config.applicationType,
        viewConfig: config.viewConfig
      });
    } else {
      return this.update({
        id: config.id,
        viewConfig: config.viewConfig
      });
    }
  }

  private create(request: ViewConfigCreateRequest): Observable<ViewConfiguration> {
    return this.http.post<ViewConfiguration>(`${this.API_URL}/command/create`, request);
  }

  private update(request: ViewConfigUpdateRequest): Observable<ViewConfiguration> {
    return this.http.patch<ViewConfiguration>(`${this.API_URL}/command/update`, request);
  }

  public getDefaultConfig(type: ViewConfiguration['applicationType']): ViewConfiguration {
    return {
      id: null,
      applicationType: type,
      viewConfig: this.getDefaultViewConfig(type)
    };
  }

  private getDefaultViewConfig(type: "admin portal" | "retailer" | "self care"): any {
    return type === "admin portal"
      ? {
          // Конфигурация для портала
          primaryColor: '#f89c2e',
          secondaryColor: '#fef6f0',
          logoUrl: 'assets/img/brand/1esim-logo.png',
          faviconUrl: 'assets/img/brand/1esim-logo-small.png',
        }
      : type === "retailer" ? {
          // Конфигурация для retailer
          primary: '#f9a743',
          'primary-hover': '#eab308',
          'border-neutral': '0, 0%, 50%',
          backdrop: '#272727cc',
          brandName: 'OnlySim',
          heroTitle: "Connect Globally with <span class='text-primary'>OnlySim eSIM</span>",
          heroSubTitle: "Stay connected worldwide with our reliable and affordable eSIM solutions.",
          logoWidth: 120,
          logoHeight: 40,
          logoUrl: 'assets/img/brand/1esim-logo.png',
          faviconUrl: 'assets/img/brand/1esim-logo-small.png',
          supportUrl: 'https://t.me/only_sim_bot'
        } : {
          // Конфигурация для self care
          logoUrl: 'assets/img/brand/1esim-logo.png',
          primaryColor: '#f89c2e',
          secondaryColor: '#fef6f0',
          headlineText: 'Welcome to Self Care Portal',
          faviconUrl: 'assets/img/brand/1esim-logo-small.png'
        };
  }
}
