import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';
import { AuthService } from './shared';
import { Subject } from 'rxjs';
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
		private $localStorage: LocalStorageService,
		private $sessionStorage: SessionStorageService,
		private authService: AuthService,
	) {
		this.iconSetService.icons = { ...iconSubset };
	}

	ngOnInit(): void {
		this.initializeApp();
		this.subscribeToRouterEvents();
		this.subscribeToViewConfigChanges();
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

	private subscribeToRouterEvents(): void {
		this.router.events
			.pipe(
				filter(event => event instanceof NavigationEnd),
				takeUntil(this.unsubscribe$)
			)
			.subscribe(() => {
				window.scrollTo(0, 0);
			});
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
}
