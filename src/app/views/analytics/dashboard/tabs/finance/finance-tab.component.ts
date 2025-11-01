import { Component, OnInit, ChangeDetectorRef, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '@coreui/icons-angular';

import { CardComponent } from '../../../../../shared';
import { MetricCardComponent } from '../../../../../shared';
import { LoadingIndicatorComponent } from '../../components/loading-indicator/loading-indicator.component';
import { ErrorDisplayComponent } from '../../components/error-display/error-display.component';
import { OsBarChartComponent } from '../../../../../shared';
import { OsLineChartComponent } from '../../../../../shared';

import { DashboardDataService } from '../../services/dashboard-data.service';
import { FinanceAnalytics } from '../../models/finance.types';
import { DashboardError } from '../../models/dashboard.types';

@Component({
	standalone: true,
	selector: 'app-finance-tab',
	imports: [
		CommonModule,
		TranslateModule,
		IconModule,
		CardComponent,
		MetricCardComponent,
		LoadingIndicatorComponent,
		ErrorDisplayComponent,
		OsBarChartComponent,
		OsLineChartComponent
	],
	templateUrl: './finance-tab.component.html',
	styleUrls: ['./finance-tab.component.scss']
})
export class FinanceTabComponent implements OnInit {
	private readonly dashboardDataService = inject(DashboardDataService);
	private readonly cdr = inject(ChangeDetectorRef);

	data: FinanceAnalytics | null = null;
	loading = true;
	error: DashboardError | null = null;

	constructor() {
		// React to period changes using effect
		effect(() => {
			const period = this.dashboardDataService.period(); // Track signal changes
			// Schedule data load on next tick to avoid effect issues
			setTimeout(() => this.loadData(), 0);
		});
	}

	ngOnInit(): void {
		// Initial data load is handled by effect
	}

	loadData(): void {
		this.loading = true;
		this.error = null;

		this.dashboardDataService.getFinanceData()
			.subscribe({
				next: (response) => {
					this.data = response.data;
					this.loading = false;
					this.cdr.detectChanges();
				},
				error: (error) => {
					this.error = {
						code: error.status || error.code || 'UNKNOWN',
						message: error.message || 'Failed to load finance data',
						details: error,
						timestamp: new Date()
					};
					this.loading = false;
				}
			});
	}
}
