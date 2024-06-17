import { Component, OnInit } from '@angular/core';
import { menuItemToPermission, navItems } from './_nav';
import { TranslateService } from '@ngx-translate/core';
import { INavData } from '@coreui/angular';
import { SessionStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss']
})
export class DefaultLayoutComponent implements OnInit {
  public translatedNavItems: INavData[];
  public brandFull = {
    src: 'assets/img/brand/1e-sim.png',
    width: 79,
    height: 77,
    alt: 'esim'
  };
  public brandNarrow = {
    src: 'assets/img/brand/1e-sim.png',
    width: 46,
    height: 46,
    alt: 'esim'
  };

  constructor(
    private translateService: TranslateService,
    private $sessionStorage: SessionStorageService
  ) {}

  ngOnInit(): void {
    this.filterAndTranslateNavItems();
  }

  private isAdmin(): boolean {
    return this.$sessionStorage.retrieve('isAdmin');
  }

  private filterNavItems(items: INavData[]): INavData[] {
    return items.filter(item => {
      const permission = menuItemToPermission[item.name];
      if (!permission) {
        return false;
      }
      if (permission.includes('all')) {
        return true;
      }
      if (permission.includes('admin') && this.isAdmin()) {
        return true;
      }
      return false;
    });
  }

  private filterAndTranslateNavItems(): void {
    const filteredNavItems = this.filterNavItems(navItems);
    this.translatedNavItems = filteredNavItems.map(item => ({
      ...item,
      name: this.translateService.instant(item.name)
    }));
  }
}
