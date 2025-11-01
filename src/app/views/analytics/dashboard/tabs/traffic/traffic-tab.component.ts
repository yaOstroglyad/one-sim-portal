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
import { TrafficAnalytics } from '../../models/traffic.types';
import { DashboardError } from '../../models/dashboard.types';

@Component({
	standalone: true,
	selector: 'app-traffic-tab',
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
	templateUrl: './traffic-tab.component.html',
	styleUrls: ['./traffic-tab.component.scss']
})
export class TrafficTabComponent implements OnInit {
	private readonly dashboardDataService = inject(DashboardDataService);
	private readonly cdr = inject(ChangeDetectorRef);

	data: TrafficAnalytics | null = null;
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

		this.dashboardDataService.getTrafficData()
			.subscribe({
				next: (response) => {
					this.data = response.data;
					this.loading = false;
					this.cdr.detectChanges();
				},
				error: (error) => {
					this.error = {
						code: error.status || error.code || 'UNKNOWN',
						message: error.message || 'Failed to load traffic data',
						details: error,
						timestamp: new Date()
					};
					this.loading = false;
				}
			});
	}

	trackByMetricId(index: number, metric: any): string {
		return metric.id;
	}
}
