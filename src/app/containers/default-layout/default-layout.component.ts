import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { menuItemToPermission, navItems } from './_nav';
import { TranslateService } from '@ngx-translate/core';
import { INavData } from '@coreui/angular';
import { SessionStorageService } from 'ngx-webstorage';
import { WhiteLabelService } from '../../shared/services/white-label.service';
import { BrandFull } from '../../shared/model/brandFull';
import { BrandNarrow } from '../../shared/model/brandNarrow';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public translatedNavItems: INavData[];
  public brandFull: BrandFull;
  public brandNarrow: BrandNarrow;

  constructor(
    private translateService: TranslateService,
    private $sessionStorage: SessionStorageService,
    private whiteLabelService: WhiteLabelService
  ) {
    this.brandFull = this.whiteLabelService.defaultBrandFull;
    this.brandNarrow = this.whiteLabelService.defaultBrandNarrow;
    console.log('this.brandFull', this.brandFull);
    console.log('this.brandNarrow', this.brandNarrow);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.filterAndTranslateNavItems();
    this.brandFull = this.whiteLabelService.updateBrandFull();
    this.brandNarrow = this.whiteLabelService.updateBrandNarrow();
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
