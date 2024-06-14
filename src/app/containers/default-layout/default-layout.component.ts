import { Component, OnInit } from '@angular/core';

import { navItems } from './_nav';
import { TranslateService } from '@ngx-translate/core';
import { INavData } from '@coreui/angular';

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
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.translateNavItems();
  }

  private translateNavItems(): void {
    this.translatedNavItems = navItems.map(item => ({
      ...item,
      name: this.translateService.instant(item.name)
    }));
  }
}
