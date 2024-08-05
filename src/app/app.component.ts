import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';
import { LanguageService } from './shared';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { WhiteLabelService } from './shared/services/white-label.service';
import { takeUntil } from 'rxjs/operators';
import { UserViewConfig } from './shared/model/userViewConfig';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
	selector: 'app-root',
	template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>();
	title = 'One Sim';

	constructor(
		private router: Router,
		private titleService: Title,
		private iconSetService: IconSetService,
		private whiteLabelService: WhiteLabelService,
		private languageService: LanguageService,
		private $LocalStorageService: LocalStorageService,
		private translateService: TranslateService) {
	}

	ngOnInit(): void {
		this.titleService.setTitle(this.title);
		this.iconSetService.icons = {...iconSubset};
		this.router.events
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((evt) => {
				if (!(evt instanceof NavigationEnd)) {
					return;
				}
			});
		this.whiteLabelService.initViewBasedOnCurrentUser();

		this.whiteLabelService.$viewConfig
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((config: UserViewConfig) => {
				this.whiteLabelService.updateStoreDate(config);
				this.whiteLabelService.updateDocumentViewBasedConfig(config);

				const storedLanguage = this.$LocalStorageService.retrieve('language');
				this.translateService.use(storedLanguage ? storedLanguage : config.language);
				this.languageService.setLanguage(storedLanguage ? storedLanguage : config.language);
			});

		this.languageService.$currentLanguage
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(lang => {
				this.translateService.use(lang);
				this.updateHtmlLangAndDir(lang);
			});
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public updateHtmlLangAndDir(lang: string): void {
		const htmlTag = document.getElementsByTagName('html')[0];
		htmlTag.setAttribute('lang', lang);
		htmlTag.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
	}
}
