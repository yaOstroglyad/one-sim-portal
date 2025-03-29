import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BadgeModule, ButtonModule, DropdownModule } from '@coreui/angular';
import { PaymentGatewayTableConfigService } from './payment-gateway-table-config.service';
import { BehaviorSubject, switchMap, combineLatest, Observable, Subject, takeUntil, of } from 'rxjs';
import { PaymentGatewayService } from './payment-gateway.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditPaymentGatewayComponent } from './edit-payment-gateway/edit-payment-gateway.component';
import { PaymentStrategy } from 'src/app/shared/model/payment-strategies';
import { GenericTableModule } from 'src/app/shared/components/generic-table/generic-table.module';
import { ADMIN_PERMISSION, AuthService, TableConfig } from 'src/app/shared';

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
		DropdownModule,
		MatDialogModule
	],
	providers: [
		PaymentGatewayTableConfigService,
		PaymentGatewayService
	]
})
export class PaymentGatewayTableComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('isActiveFlag') isActiveFlagTemplate: TemplateRef<any>;
	@ViewChild('isPrimaryFlag') isPrimaryFlagTemplate: TemplateRef<any>;
	private unsubscribe$ = new Subject<void>();
	public isAdmin: boolean;
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<any[]>;
	public strategyTypes$: Observable<string[]>;

	constructor(
		private cdr: ChangeDetectorRef,
		private tableService: PaymentGatewayTableConfigService,
		private paymentGatewayService: PaymentGatewayService,
		private authService: AuthService,
		private dialog: MatDialog
	) {
		this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
		this.tableConfig$ = new BehaviorSubject<TableConfig>({
			columns: [],
			showMenu: true,
			pagination: {
				enabled: true,
				serverSide: true
			}
		});
	}

	ngOnInit(): void {
		this.loadPaymentGateways();
	}

	ngAfterViewInit(): void {
		if (this.isActiveFlagTemplate && this.isPrimaryFlagTemplate) {
			this.tableService.isActiveFlagTemplate = this.isActiveFlagTemplate;
			this.tableService.isPrimaryFlagTemplate = this.isPrimaryFlagTemplate;
			this.cdr.detectChanges();
		}
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	private loadPaymentGateways(): void {
		this.paymentGatewayService.list()
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(data => {
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
	}

	public edit(item: PaymentStrategy): void {
		const dialogRef = this.dialog.open(EditPaymentGatewayComponent, {
			width: '650px',
			data: item
		});

		dialogRef.afterClosed()
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(() => {
				setTimeout(() => {
					this.loadPaymentGateways();
				}, 3000);
			});
	}
} 