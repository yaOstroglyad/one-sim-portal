import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { menuItemToPermission, navItems } from './_nav';
import { TranslateService } from '@ngx-translate/core';
import { INavData } from '@coreui/angular';
import { SessionStorageService } from 'ngx-webstorage';
import { WhiteLabelService } from '../../shared/services/white-label.service';
import { BrandFull } from '../../shared/model/brandFull';
import { BrandNarrow } from '../../shared/model/brandNarrow';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-default-layout',
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
    private whiteLabelService: WhiteLabelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.filterAndTranslateNavItems();
    this.whiteLabelService.$viewConfig.subscribe(config => {
      this.brandFull = this.whiteLabelService.updateBrandFull();
      this.brandNarrow = this.whiteLabelService.updateBrandNarrow();
      this.whiteLabelService.updateDocumentViewBasedConfig(config);
      this.cdr.detectChanges();
    });
  }

  private isAdmin(): boolean {
    return this.$sessionStorage.retrieve('isAdmin');
  }

  private filterNavItems(items: INavData[]): INavData[] {
    return items.filter(item => {
      const permission = menuItemToPermission[item.name];
      return permission && (permission.includes('all') || (permission.includes('admin') && this.isAdmin()));
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
