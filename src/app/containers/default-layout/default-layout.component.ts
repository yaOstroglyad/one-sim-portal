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
import { WhiteLabelService } from '../../shared/services/white-label.service';
import { BrandFull } from '../../shared/model/brandFull';
import { BrandNarrow } from '../../shared/model/brandNarrow';
import { Subject } from 'rxjs';
import { AuthService } from '../../shared';

@Component({
	selector: 'app-default-layout',
	templateUrl: './default-layout.component.html',
	styleUrls: ['./default-layout.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {
	authService = inject(AuthService);
	translateService = inject(TranslateService);
	whiteLabelService = inject(WhiteLabelService);
	cdr = inject(ChangeDetectorRef);

	private unsubscribe$ = new Subject<void>();
	public translatedNavItems: INavData[];
	public brandFull: BrandFull;
	public brandNarrow: BrandNarrow;

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

		this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
			this.filterAndTranslateNavItems();
		});
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

				const newItem: INavData = {
					...item,
					name: item.name ? this.translateService.instant(item.name) : undefined,
					children: item.children ? this.processNavItems(item.children) : undefined
				};

				// Удаляем пустой children массив
				if (newItem.children?.length === 0) {
					delete newItem.children;
				}

				return newItem;
			})
			.filter(Boolean); // удаляет null
	}
}
