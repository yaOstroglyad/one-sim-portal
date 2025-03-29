import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenericTableModule } from '../../../../shared/components/generic-table/generic-table.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BadgeModule, ButtonModule, DropdownModule } from '@coreui/angular';
import { PaymentGatewayTableConfigService } from './payment-gateway-table-config.service';
import { BehaviorSubject, switchMap, combineLatest, Observable, Subject, takeUntil, of } from 'rxjs';
import { ADMIN_PERMISSION, AuthService, TableConfig } from '../../../../shared';
import { PaymentGatewayService } from './payment-gateway.service';
import { MatDialog } from '@angular/material/dialog';
import { EditPaymentGatewayComponent } from './edit-payment-gateway/edit-payment-gateway.component';
import { PaymentStrategy } from 'src/app/shared/model/payment-strategies';

@Component({
	selector: 'app-payment-gateway-table',
	templateUrl: './payment-gateway-table.component.html',
	styleUrls: ['./payment-gateway-table.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		GenericTableModule,
		TranslateModule,
		MatIconModule,
		MatButtonModule,
		MatMenuModule,
		MatFormFieldModule,
		BadgeModule,
		ButtonModule,
		DropdownModule
	]
})
export class PaymentGatewayTableComponent implements OnInit, OnDestroy {
	@ViewChild('isActiveFlag') isActiveFlagTemplate: TemplateRef<any>;
	@ViewChild('isPrimaryFlag') isPrimaryFlagTemplate: TemplateRef<any>;
	private unsubscribe$ = new Subject<void>();
	public isAdmin: boolean;
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<any[]>;
	public strategyTypes$: Observable<any>;


	constructor(private cdr: ChangeDetectorRef,
							private tableService: PaymentGatewayTableConfigService,
							private paymentGatewayService: PaymentGatewayService,
							private authService: AuthService,
							private dialog: MatDialog
	) {
		this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
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

	public edit(item: PaymentStrategy): void {
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
} 