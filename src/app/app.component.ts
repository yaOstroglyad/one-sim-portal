import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';
import { LanguageService } from './shared';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit, OnDestroy {
  private langSubscription!: Subscription;
  title = 'One Sim';

  constructor(
    private router: Router,
    private titleService: Title,
    private iconSetService: IconSetService,
    private languageService: LanguageService,
    private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.iconSetService.icons = {...iconSubset};
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
    this.langSubscription = this.languageService.getLanguage().subscribe(lang => {
      this.translateService.use(lang);
      this.updateHtmlLangAndDir(lang);
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  public updateHtmlLangAndDir(lang: string): void {
    const htmlTag = document.getElementsByTagName('html')[0];
    htmlTag.setAttribute('lang', lang);
    htmlTag.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr'); // Пример с арабским языком
  }
}
