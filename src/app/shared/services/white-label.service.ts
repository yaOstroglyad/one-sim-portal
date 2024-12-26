import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserViewConfig } from '../model/userViewConfig';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { JwtHelperService } from '../auth';
import { hexRgb, rgbToHsl } from '../utils/rgb-hex-convertor';
import { BrandFull } from '../model/brandFull';
import { BrandNarrow } from '../model/brandNarrow';

export const anexConfig: UserViewConfig = {
  primaryColor: '#0072ce',
  language: 'en',
  height: 47,
  logoName: 'anex.png'
};

export const defaultConfig: UserViewConfig = {
  primaryColor: '#f9a743',
  language: 'en',
  logoName: '1esim-logo.png',
  logoNameSmall: '1esim-logo-small.png'
};

@Injectable({ providedIn: 'root' })
export class WhiteLabelService {
  public currentBrandFull: BrandFull = {
    src: 'assets/img/brand/1esim-logo.png',
    height: 47,
    alt: 'onesim'
  };

  public currentBrandNarrow: BrandNarrow = {
    src: 'assets/img/brand/1esim-logo-small.png',
    width: 35,
    alt: 'onesim'
  };

  public $viewConfig: BehaviorSubject<UserViewConfig> = new BehaviorSubject<UserViewConfig>(defaultConfig);

  constructor(
    private jwtHelper: JwtHelperService,
    private $SessionStorageService: SessionStorageService,
    private $LocalStorageService: LocalStorageService
  ) {}

  public initViewBasedOnCurrentUser(): void {
    let token = this.$LocalStorageService.retrieve('authenticationToken') ||
      this.$SessionStorageService.retrieve('authenticationToken');

    const savedConfig = this.loadConfigFromStorage();
    if (savedConfig) {
      this.$viewConfig.next(savedConfig);
    } else {
      this.updateViewConfig(token);
    }
  }

  public updateViewConfig(token: string): void {
    if (this.jwtHelper.isToken(token)) {
      const jwtToken = this.jwtHelper.decodeToken(token);
      const newConfig: UserViewConfig = this.isAnexCustomer(jwtToken)
        ? anexConfig
        : {
          primaryColor: jwtToken?.primaryColor || defaultConfig.primaryColor,
          language: jwtToken?.language || defaultConfig.language,
          logoName: jwtToken?.logoName || defaultConfig.logoName,
          logoNameSmall: jwtToken?.logoNameSmall || defaultConfig.logoNameSmall,
          height: jwtToken?.height || defaultConfig.height
        };

      this.$viewConfig.next(newConfig);
      this.saveConfigToStorage(newConfig);
    }
  }

  private saveConfigToStorage(config: UserViewConfig): void {
    this.$LocalStorageService.store('viewConfig', JSON.stringify(config));
  }

  private loadConfigFromStorage(): UserViewConfig | null {
    const config = this.$LocalStorageService.retrieve('viewConfig');
    return config ? JSON.parse(config) : null;
  }

  public updateDocumentViewBasedConfig(config: UserViewConfig): void {
    const rgbConfig = hexRgb(config.primaryColor);
    const [hue, saturation, lightness] = rgbToHsl(rgbConfig.red, rgbConfig.green, rgbConfig.blue);

    document.documentElement.style.setProperty('--os-color-primary', config.primaryColor);
    document.documentElement.style.setProperty('--os-color-primary-rgb', `${rgbConfig.red}, ${rgbConfig.green}, ${rgbConfig.blue}`);
    document.documentElement.style.setProperty('--os-color-primary-h', `${hue}`);
    document.documentElement.style.setProperty('--os-color-primary-s', `${saturation}%`);
    document.documentElement.style.setProperty('--os-color-primary-l', `${lightness}%`);
  }

  public updateBrandFull(): BrandFull {
    const config = this.loadConfigFromStorage() || defaultConfig;
    this.currentBrandFull.height = config.height || this.currentBrandFull.height;
    this.currentBrandFull.src = `assets/img/brand/${config.logoName}`;
    this.currentBrandFull.alt = config.logoName;
    return this.currentBrandFull;
  }

  public updateBrandNarrow(): BrandNarrow {
    const config = this.loadConfigFromStorage() || defaultConfig;
    const selectedLogo = config.logoNameSmall || config.logoName;

    if (selectedLogo) {
      this.currentBrandNarrow.src = `assets/img/brand/${selectedLogo}`;
      this.currentBrandNarrow.alt = selectedLogo;
    } else {
      console.warn('No logoName or logoNameSmall found in storage');
    }

    return this.currentBrandNarrow;
  }

  //TODO remove hardcode when white label will be done
  private isAnexCustomer(data: any): boolean {
    if (data && data.email) {
      const email: string = data.email;
      return email === 'anex@mail.com' || email === 'sergey.tepkeev@anextour.com'
    }
    return false;
  }
}

