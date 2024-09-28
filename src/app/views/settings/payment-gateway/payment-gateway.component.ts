import { ChangeDetectorRef, Component } from '@angular/core';
import { PaymentGatewayService } from './payment-gateway.service';
import { forkJoin, combineLatest } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { PaymentGatewayUtilsService } from './payment-gateway.utils.service';
import { PgComponentConfig } from '../../../shared/model/payment-strategies';
import { SessionStorageService } from 'ngx-webstorage';

@Component({
	selector: 'app-payment-gateway',
	templateUrl: './payment-gateway.component.html',
	styleUrls: ['./payment-gateway.component.scss']
})
export class PaymentGatewayComponent {
	pgComponentConfigs: PgComponentConfig[];
	isAdmin: boolean;

	constructor(
		private paymentGatewayService: PaymentGatewayService,
		private paymentGatewayUtilsService: PaymentGatewayUtilsService,
		private $sessionStorage: SessionStorageService,
		private cd: ChangeDetectorRef
	) {
		this.isAdmin = this.getAdmin();
		combineLatest([
			this.paymentGatewayService.list(),
			this.paymentGatewayService.getPaymentStrategyTypes()
		]).pipe(
			switchMap(([metadata, types]) => {
				if (!types || types.length === 0) {
					console.error('No types found');
				}

				const requests = types.map(type => {
					const strategyMetadata = metadata.find(meta => meta.paymentStrategy === type);

					return forkJoin({
						fields: this.paymentGatewayService.getFieldsByStrategyType(type)
					}).pipe(
						map(({ fields }) => {
							const paymentMethodParameters = strategyMetadata ? strategyMetadata.paymentMethodParameters : {};

							return {
								id: strategyMetadata?.id,
								type,
								config: this.paymentGatewayUtilsService.generateForm(fields, paymentMethodParameters)
							};
						})
					);
				});

				return forkJoin(requests);
			}),
			map((pgComponentConfigs: PgComponentConfig[]) => {
				this.pgComponentConfigs = pgComponentConfigs;
				this.cd.detectChanges();
			})
		).subscribe();
	}

	public getAdmin(): boolean {
		return this.$sessionStorage.retrieve('isAdmin');
	}
}
