import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';
import { AuthService, LanguageService } from './shared';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { WhiteLabelService } from './shared/services/white-label.service';
import { takeUntil, filter } from 'rxjs/operators';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';

@Component({
	selector: 'app-root',
	template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>();
	title = 'One eSim';

	constructor(
		private router: Router,
		private titleService: Title,
		private iconSetService: IconSetService,
		private whiteLabelService: WhiteLabelService,
		private languageService: LanguageService,
		private $localStorage: LocalStorageService,
		private $sessionStorage: SessionStorageService,
		private authService: AuthService,
		private translateService: TranslateService
	) {}

	ngOnInit(): void {
		this.initializeApp();
		this.setupRouterEvents();
		// this.subscribeToViewConfigChanges();
		this.subscribeToLanguageChanges();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	private initializeApp(): void {
		const loginResponse = this.$sessionStorage.retrieve('loginResponse') || this.$localStorage.retrieve('loginResponse');
		if (loginResponse) {
			this.authService.scheduleTokenRefresh(loginResponse);
		}

		this.titleService.setTitle(this.title);
		this.iconSetService.icons = { ...iconSubset };
		this.whiteLabelService.initViewBasedOnCurrentUser();
	}

	private setupRouterEvents(): void {
		this.router.events
			.pipe(
				takeUntil(this.unsubscribe$),
				filter(event => event instanceof NavigationEnd)
			)
			.subscribe();
	}

	private subscribeToViewConfigChanges(): void {
		// this.whiteLabelService.$viewConfig
		// 	.pipe(takeUntil(this.unsubscribe$))
		// 	.subscribe((config: UserViewConfig) => {
		// 		console.log('config', config);
		// 		this.whiteLabelService.updateStoreDate(config);
		// 		this.whiteLabelService.updateDocumentViewBasedConfig(config);
		//
		// 		const language = this.$localStorage.retrieve('language') || config.language;
		// 		this.setLanguage(language);
		// 	});
	}

	private subscribeToLanguageChanges(): void {
		this.languageService.currentLang$.subscribe(lang => {
			console.log('Language changed to:', lang);
		});
	}

	private setLanguage(lang: string): void {
		this.languageService.setLanguage(lang);
	}

	private updateHtmlLangAndDir(lang: string): void {
		const htmlTag = document.documentElement;
		htmlTag.setAttribute('lang', lang);
		htmlTag.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
	}
}
