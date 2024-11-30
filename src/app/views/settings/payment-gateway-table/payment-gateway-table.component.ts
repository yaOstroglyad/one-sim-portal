import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, takeUntil } from 'rxjs/operators';
import { EditPaymentGatewayComponent } from './edit-payment-gateway/edit-payment-gateway.component';
import { PaymentGatewayTableConfigService } from './payment-gateway-table-config.service';
import { HeaderConfig, TableConfig, TableFilterFieldType } from 'src/app/shared';
import { PaymentGatewayService } from '../payment-gateway/payment-gateway.service';
import { SessionStorageService } from 'ngx-webstorage';

@Component({
	selector: 'app-payment-gateway-table',
	templateUrl: './payment-gateway-table.component.html',
	styleUrls: ['./payment-gateway-table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentGatewayTableComponent implements OnInit, OnDestroy {
	@ViewChild('isActiveFlag') isActiveFlagTemplate: TemplateRef<any>;
	@ViewChild('isPrimaryFlag') isPrimaryFlagTemplate: TemplateRef<any>;
	private unsubscribe$ = new Subject<void>();
	public isAdmin: boolean;
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<any[]>;
	public headerConfig: HeaderConfig = {};
	public strategyTypes$: Observable<any>;


	constructor(private cdr: ChangeDetectorRef,
							private tableService: PaymentGatewayTableConfigService,
							private paymentGatewayService: PaymentGatewayService,
							private $sessionStorage: SessionStorageService,
							private dialog: MatDialog
	) {
		this.initHeaderConfig();
		this.isAdmin = this.getAdmin();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	ngOnInit(): void {
		this.loadPaymentGateways();
	}

	private loadPaymentGateways(): void {
		this.paymentGatewayService.list()
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(data => {
				this.tableService.isActiveFlagTemplate = this.isActiveFlagTemplate;
				this.tableService.isPrimaryFlagTemplate = this.isPrimaryFlagTemplate;
				this.tableService.updateTableData(data);
				this.tableConfig$ = this.tableService.getTableConfig();
				this.dataList$ = this.tableService.dataList$;
			});

		this.strategyTypes$ = combineLatest([
			this.paymentGatewayService.list(),
			this.paymentGatewayService.getPaymentStrategyTypes()
		]).pipe(
			switchMap(([metadata, types]) => {
				const filteredTypes = types.filter(type =>
					!metadata.some(meta => meta.name === type)
				);

				return of(filteredTypes);
			})
		);

		this.cdr.detectChanges();
	}

	private initHeaderConfig(): void {
		this.headerConfig = {
			value: {type: TableFilterFieldType.Text, placeholder: 'Filter table data'}
		};
	}

	public edit(item: any): void {
		const dialogRef = this.dialog.open(EditPaymentGatewayComponent, {
			width: '650px',
			data: item
		});

		dialogRef.afterClosed().subscribe(() => {
			//workaround - backend need time for update
			setTimeout(() => {
				this.loadPaymentGateways()
			}, 3000);
		});
	}

	public getAdmin(): boolean {
		return this.$sessionStorage.retrieve('isAdmin');
	}
}
