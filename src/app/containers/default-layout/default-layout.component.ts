import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { navItems } from './_nav';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { INavData } from '@coreui/angular';
import { VisualConfig, VisualService } from '../../shared';
import { BrandFull } from '../../shared/model/brandFull';
import { BrandNarrow } from '../../shared/model/brandNarrow';
import { Subject, takeUntil, BehaviorSubject, skip } from 'rxjs';
import { AuthService } from '../../shared';
import { isToggleActive } from '../../shared/services/feature-toggle';

@Component({
	selector: 'app-default-layout',
	templateUrl: './default-layout.component.html',
	styleUrls: ['./default-layout.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {
	authService = inject(AuthService);
	translateService = inject(TranslateService);
	visualService = inject(VisualService);
	cdr = inject(ChangeDetectorRef);

	private unsubscribe$ = new Subject<void>();
	public translatedNavItems: INavData[];
	public brandFull$ = new BehaviorSubject<BrandFull | null>(null);
	public brandFull: BrandFull;
	public brandNarrow: BrandNarrow;

	ngOnDestroy(): void {
		this.brandFull$.complete();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	ngOnInit(): void {
		this.filterAndTranslateNavItems();

		this.visualService.loadVisualConfig().subscribe();

		this.visualService.getThemeConfig$()
			.pipe(
				skip(1),
				takeUntil(this.unsubscribe$)
			)
			.subscribe(config => {
				this.updateBranding(config);
			});

		this.translateService.onLangChange
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe((event: LangChangeEvent) => {
				this.filterAndTranslateNavItems();
				this.cdr.markForCheck();
			});
	}

	/**
	 * Обновляет брендинг компонента на основе текущих значений в сервисе
	 */
	private updateBranding(config: VisualConfig): void {
		this.brandFull = {
			src: config.logoUrl,
			height: config.height || 47,
			alt: 'logo'
		};

		this.brandNarrow = {
			src: config.faviconUrl,
			width: 35,
			alt: 'logo'
		};

		this.brandFull$.next({ ...this.brandFull });
	}

	private filterAndTranslateNavItems(): void {
		this.translatedNavItems = this.processNavItems(navItems);
	}

	private processNavItems(items: any): INavData[] {
		return items
			.map(item => {
				if (item.permissions && !item.permissions.some(p => this.authService.hasPermission(p))) {
					return null;
				}

				if (item.featureToggle && !isToggleActive(item.featureToggle)) {
					return null;
				}

				const newItem: INavData = {
					...item,
					name: item.name ? this.translateService.instant(item.name) : undefined,
					children: item.children ? this.processNavItems(item.children) : undefined
				};

				if (newItem.children?.length === 0) {
					delete newItem.children;
				}

				return newItem;
			})
			.filter(Boolean);
	}
}
