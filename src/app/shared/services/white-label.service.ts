import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserViewConfig } from '../model/userViewConfig';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { JwtHelperService } from '../auth';
import { hexRgb, rgbToHsl } from './rgb-hex-convertor';
import { BrandFull } from '../model/brandFull';
import { BrandNarrow } from '../model/brandNarrow';

export const anexConfig: UserViewConfig = {
  primaryColor: '#0072ce',
  language: 'en',
  logoName: 'anex.png'
};

export const defaultConfig: UserViewConfig = {
  primaryColor: '#f9a743',
  language: 'en',
  logoName: '1esim-logo.png'
};

@Injectable({providedIn: 'root'})
export class WhiteLabelService {
  public defaultBrandFull: BrandFull = {
    src: 'assets/img/brand/1esim-logo.png',
    height: 47,
    alt: 'esim'
  };
  public defaultBrandNarrow: BrandNarrow = {
    src: 'assets/img/brand/1esim-logo.png',
    width: 47,
    alt: 'esim'
  };

  public $viewConfig: BehaviorSubject<UserViewConfig> = new BehaviorSubject<UserViewConfig>(defaultConfig);

  constructor(private jwtHelper: JwtHelperService,
              private $SessionStorageService: SessionStorageService,
              private $LocalStorageService: LocalStorageService) {}


  public initViewBasedOnCurrentUser(): void {
    let token = this.$LocalStorageService.retrieve('authenticationToken');
    if (!token) {
      token = this.$SessionStorageService.retrieve('authenticationToken');
    }

    this.updateViewConfig(token);
  }

  public updateViewConfig(token: any): void {
    if (this.jwtHelper.isToken(token)) {
      const jwtToken = this.jwtHelper.decodeToken(token);

      //Remove hardcode when white label BE will be done
      if (this.isAnexCustomer(jwtToken)) {
        this.$viewConfig.next(anexConfig);
      } else {
        this.$viewConfig.next({
          primaryColor: jwtToken?.primaryColor || defaultConfig.primaryColor,
          language: jwtToken?.language || defaultConfig.language,
          logoName: jwtToken?.logoName || defaultConfig.logoName
        });
      }
    }
  }

  public updateStoreDate(config: UserViewConfig): void {
    this.$LocalStorageService.store('primaryColor', config.primaryColor);
    this.$LocalStorageService.store('logoName', config.logoName);
  }

  public updateDocumentViewBasedConfig(config: UserViewConfig): void {
    const rgbConfig = hexRgb(config.primaryColor);
    const [hue, saturation, lightness] = rgbToHsl(rgbConfig.red, rgbConfig.green, rgbConfig.blue);

    document.documentElement.style.setProperty('--sc-color-primary', config.primaryColor);
    document.documentElement.style.setProperty('--sc-color-primary-rgb', `${rgbConfig.red}, ${rgbConfig.green}, ${rgbConfig.blue}`);
    document.documentElement.style.setProperty('--sc-color-primary-h', `${hue}`);
    document.documentElement.style.setProperty('--sc-color-primary-s', `${saturation}%`);
    document.documentElement.style.setProperty('--sc-color-primary-l', `${lightness}%`);
  }

  public updateBrandFull(): BrandFull {
    const logoName = this.$LocalStorageService.retrieve('logoName');
    this.defaultBrandFull.src = `assets/img/brand/` + logoName;
    this.defaultBrandFull.alt = logoName;
    return this.defaultBrandFull;
  }

  public updateBrandNarrow(): BrandNarrow {
    const logoName = this.$LocalStorageService.retrieve('logoName');
    this.defaultBrandNarrow.src = `assets/img/brand/` + logoName;
    this.defaultBrandNarrow.alt = logoName;
    return this.defaultBrandNarrow;
  }

  private isAnexCustomer(data: any): boolean {
    if (data && data.email) {
      const email: string = data.email;
      return email === 'anex@mail.com'
    }
    return false;
  }
}
