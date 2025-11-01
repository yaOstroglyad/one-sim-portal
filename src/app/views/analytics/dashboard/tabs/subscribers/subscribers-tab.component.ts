import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SubscriberAnalytics, DashboardError } from '../../models/dashboard.types';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { CardComponent } from '../../../../../shared';
import { MetricCardComponent } from '../../../../../shared';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { OsBarChartComponent } from '../../../../../shared';
import { OsLineChartComponent } from '../../../../../shared';

@Component({
	standalone: true,
	selector: 'app-subscribers-tab',
	imports: [
		CommonModule,
		TranslateModule,
		MetricCardComponent,
		LoadingIndicatorComponent,
		ErrorDisplayComponent,
		CardComponent,
		OsBarChartComponent,
		OsLineChartComponent
	],
	templateUrl: './subscribers-tab.component.html',
	styleUrls: ['./subscribers-tab.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscribersTabComponent implements OnInit {
	private readonly dashboardService = inject(DashboardDataService);
	private readonly cdr = inject(ChangeDetectorRef);

	data: SubscriberAnalytics | null = null;
	loading = false;
	error: DashboardError | null = null;

	constructor() {
		// React to period and accountId changes using effect
		effect(() => {
			const period = this.dashboardService.period(); // Track signal changes
			const accountId = this.dashboardService.accountId(); // Track accountId changes

			// Only load data if accountId is set (required for API calls)
			if (accountId) {
				// Schedule data load on next tick to avoid effect issues
				setTimeout(() => this.loadData(), 0);
			}
		});
	}

	ngOnInit(): void {
		// Initial data load is handled by effect
	}

	private loadData(): void {
		this.loading = true;
		this.error = null;
		this.cdr.markForCheck();

		this.dashboardService.getSubscriberAnalytics()
			.subscribe({
				next: (response) => {
					this.loading = false;
					if (response.status === 'success') {
						this.data = response.data;
						this.error = null;
					} else {
						this.error = {
							code: 'FETCH_ERROR',
							message: response.message || 'Failed to load subscriber analytics',
							timestamp: new Date()
						};
					}
					this.cdr.markForCheck();
				},
				error: (err) => {
					this.loading = false;
					this.error = {
						code: 'NETWORK_ERROR',
						message: err.message || 'An error occurred while loading subscriber analytics',
						timestamp: new Date()
					};
					this.cdr.markForCheck();
				}
			});
	}

	onRetry(): void {
		this.loadData();
	}
}
