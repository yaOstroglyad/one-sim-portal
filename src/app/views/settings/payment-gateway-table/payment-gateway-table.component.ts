import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, inject, effect } from '@angular/core';
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
import { EditPaymentGatewayComponent } from './edit-payment-gateway/edit-payment-gateway.component';
import { PaymentStrategy } from '@shared/models/payment';
import { GenericTableComponent } from 'src/app/shared/components/generic-table/generic-table.component';
import { ADMIN_PERMISSION, AuthService, TableConfig, Account, AccountContextService } from 'src/app/shared';
import { GenericRightPanelComponent, PanelAction } from 'src/app/shared/components/generic-right-panel/generic-right-panel.component';

@Component({
    standalone: true,
    selector: 'app-payment-gateway-table',
    templateUrl: './payment-gateway-table.component.html',
    styleUrls: ['./payment-gateway-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        GenericTableComponent,
        TranslateModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatFormFieldModule,
        BadgeModule,
        ButtonModule,
        DropdownModule,
        GenericRightPanelComponent,
        EditPaymentGatewayComponent
    ],
    providers: [
        PaymentGatewayTableConfigService,
        PaymentGatewayService
    ]
})
export class PaymentGatewayTableComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('isActiveFlag') isActiveFlagTemplate: TemplateRef<any>;
	@ViewChild('isPrimaryFlag') isPrimaryFlagTemplate: TemplateRef<any>;
	@ViewChild('paymentGatewayFormRef', { static: false }) paymentGatewayFormRef?: EditPaymentGatewayComponent;
	private unsubscribe$ = new Subject<void>();
	private readonly accountContext = inject(AccountContextService);
	public isAdmin: boolean;
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<any[]>;
	public strategyTypes$: Observable<string[]>;

	// Right panel properties
	public isPanelOpen: boolean = false;
	public selectedPaymentGateway: PaymentStrategy | null = null;
	public panelMode: 'create' | 'edit' = 'create';
	public panelTitle: string = '';
	public panelActions: PanelAction[] = [];

	constructor(
		private cdr: ChangeDetectorRef,
		private tableService: PaymentGatewayTableConfigService,
		private paymentGatewayService: PaymentGatewayService,
		private authService: AuthService
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

		// React to account changes from global context
		effect(() => {
			const account = this.accountContext.selectedAccount();
			if (account && !account.isAdmin) {
				this.loadPaymentGateways(account.id);
			}
		});
	}

	get shouldShowContent(): boolean {
		if (!this.isAdmin) {
			return true;
		}
		const account = this.accountContext.selectedAccount();
		return account !== null && !account.isAdmin;
	}

	get selectedAccount(): Account | null {
		return this.accountContext.selectedAccount();
	}

	ngOnInit(): void {
		// Configure account context for this page
		this.accountContext.configure({
			visible: true,
			required: true
		});

		if (!this.isAdmin) {
			this.loadPaymentGateways();
		} else {
			// Initialize strategyTypes$ for admin to show create button
			this.strategyTypes$ = this.paymentGatewayService.getPaymentStrategyTypes();
		}
	}

	ngAfterViewInit(): void {
		if (this.isActiveFlagTemplate && this.isPrimaryFlagTemplate) {
			this.tableService.isActiveFlagTemplate = this.isActiveFlagTemplate;
			this.tableService.isPrimaryFlagTemplate = this.isPrimaryFlagTemplate;

			// Пересоздаем конфигурацию таблицы с новыми templates
			this.tableConfig$ = this.tableService.getTableConfig();
			this.cdr.detectChanges();
		}
	}

	ngOnDestroy(): void {
		this.accountContext.reset();
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	private loadPaymentGateways(accountId?: string): void {
		this.paymentGatewayService.list(accountId)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(data => {
				this.tableService.updateTableData(data);
				this.tableConfig$ = this.tableService.getTableConfig();
				this.dataList$ = this.tableService.dataList$;
			});

		this.strategyTypes$ = combineLatest([
			this.paymentGatewayService.list(accountId),
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

	public openPanel(item: PaymentStrategy | null, mode: 'create' | 'edit' = 'edit'): void {
		this.selectedPaymentGateway = item;
		this.panelMode = mode;

		if (mode === 'create') {
			this.panelTitle = 'paymentGateway.createNew';
			this.selectedPaymentGateway = {
				name: item?.name || '',
				paymentStrategy: item?.name || '',
				paymentMethodParameters: {},
				primary: false
			};
		} else {
			this.panelTitle = 'editPaymentGateway.title';
		}

		this.isPanelOpen = true;
		this.cdr.markForCheck();
	}

	public onPanelClose(): void {
		this.isPanelOpen = false;
		this.selectedPaymentGateway = null;
		this.cdr.markForCheck();
	}

	public onPaymentGatewaySaved(): void {
		this.onPanelClose();
		setTimeout(() => {
			this.loadPaymentGateways(this.selectedAccount?.id);
		}, 1000);
	}

	public edit(item: PaymentStrategy): void {
		this.openPanel(item, 'edit');
	}

	public onToggleStatus(): void {
		if (this.selectedPaymentGateway?.id) {
			const status = {
				id: this.selectedPaymentGateway.id,
				active: !this.selectedPaymentGateway.isActive
			};

			this.paymentGatewayService.updateStatus(status).subscribe(() => {
				if (this.selectedPaymentGateway) {
					this.selectedPaymentGateway.isActive = !this.selectedPaymentGateway.isActive;
					this.cdr.markForCheck();
				}
			});
		}
	}
}
