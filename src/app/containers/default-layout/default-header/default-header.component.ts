import { Component, Input } from '@angular/core';

import { HeaderComponent } from '@coreui/angular';
import { LanguageService } from '../../../shared';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
})
export class DefaultHeaderComponent extends HeaderComponent {

  @Input() sidebarId: string = "sidebar";

  constructor(private languageService: LanguageService) {
    super();
  }

  changeLang(lang: string) {
    this.languageService.setLanguage(lang);
  }
}
