import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const APPLICATION_TYPES = {
  ADMIN_PORTAL: 'ADMIN_PORTAL',
  RETAILER: 'RETAILER',
  SELF_CARE: 'SELF_CARE'
} as const;

export type ApplicationType = typeof APPLICATION_TYPES[keyof typeof APPLICATION_TYPES];

export interface WhitelabelConfig {
  id: string;
  applicationType: ApplicationType;
  viewConfig: WhitelabelViewConfig;
  ownerAccountId?: string;
}

export interface WhitelabelViewConfig {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  height?: number;
  [key: string]: any;
}

export interface WhitelabelConfigCreateRequest {
  ownerAccountId?: string;
  applicationType: string;
  viewConfig: WhitelabelViewConfig;
}

export interface WhitelabelConfigUpdateRequest {
  id: string;
  viewConfig: WhitelabelViewConfig;
}

export const DEFAULT_PORTAL_CONFIG: WhitelabelViewConfig = {
  primaryColor: '#f89c2e',
  secondaryColor: '#fef6f0',
  logoUrl: 'assets/img/brand/1esim-logo.png',
  faviconUrl: 'assets/img/brand/1esim-logo-small.png',
  height: 47
};

export const DEFAULT_RETAILER_CONFIG: WhitelabelViewConfig = {
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
};

export const DEFAULT_SELF_CARE_CONFIG: WhitelabelViewConfig = {
  logoUrl: 'assets/img/brand/1esim-logo.png',
  primaryColor: '#f89c2e',
  secondaryColor: '#fef6f0',
  headlineText: 'Welcome to Self Care Portal',
  faviconUrl: 'assets/img/brand/1esim-logo-small.png'
};

@Injectable({
  providedIn: 'root'
})
export class WhitelabelConfigService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = '/api/v1/whitelabel/app-view-config';

  /**
   * Get configuration by application type and optionally by owner account ID
   *
   * @param type Application type (ADMIN_PORTAL, RETAILER, SELF_CARE)
   * @param ownerAccountId Optional owner account ID
   *        - If not provided, backend uses account from token
   *        - If provided, backend returns config for specified account
   *        - Used mainly for administrators who can manage other accounts
   */
  getByApplicationType(
    type: ApplicationType,
    ownerAccountId?: string
  ): Observable<WhitelabelConfig> {
    let params = new HttpParams().set('type', type);
    if (ownerAccountId) {
      params = params.set('ownerAccountId', ownerAccountId);
    }

    return this.http
      .get<WhitelabelConfig>(`${this.API_URL}/query/data`, { params })
      .pipe(
        map(response => {
          if (!response?.viewConfig || Object.keys(response.viewConfig).length === 0) {
            return this.getDefaultConfig(type);
          }
          return response;
        }),
      );
  }

  save(config: WhitelabelConfig): Observable<WhitelabelConfig> {
    if (!config.id) {
      return this.create({
        ownerAccountId: config.ownerAccountId,
        applicationType: config.applicationType,
        viewConfig: config.viewConfig
      });
    }
    return this.update({
      id: config.id,
      viewConfig: config.viewConfig
    });
  }

  getDefaultConfig(type: ApplicationType): WhitelabelConfig {
    return {
      id: null,
      applicationType: type,
      viewConfig: this.getDefaultViewConfig(type)
    };
  }

  private create(request: WhitelabelConfigCreateRequest): Observable<WhitelabelConfig> {
    return this.http.post<WhitelabelConfig>(`${this.API_URL}/command/create`, request);
  }

  private update(request: WhitelabelConfigUpdateRequest): Observable<WhitelabelConfig> {
    return this.http.patch<WhitelabelConfig>(`${this.API_URL}/command/update`, request);
  }

  private getDefaultViewConfig(type: ApplicationType): WhitelabelViewConfig {
    switch (type) {
      case APPLICATION_TYPES.ADMIN_PORTAL:
        return { ...DEFAULT_PORTAL_CONFIG };
      case APPLICATION_TYPES.RETAILER:
        return { ...DEFAULT_RETAILER_CONFIG };
      case APPLICATION_TYPES.SELF_CARE:
        return { ...DEFAULT_SELF_CARE_CONFIG };
      default:
        return { ...DEFAULT_PORTAL_CONFIG };
    }
  }
}
