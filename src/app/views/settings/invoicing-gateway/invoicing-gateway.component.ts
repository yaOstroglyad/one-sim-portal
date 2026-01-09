import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BadgeModule, ButtonModule, DropdownModule } from '@coreui/angular';
import { InvoicingGatewayConfigService } from './invoicing-gateway-config.service';
import { BehaviorSubject, switchMap, combineLatest, Observable, Subject, takeUntil, of } from 'rxjs';
import { InvoicesService } from './invoices.service';
import { EditInvoicesComponent } from './edit-invoices/edit-invoices.component';
import { InvoicingMethod } from '@shared/models/payment';
import { GenericTableComponent } from 'src/app/shared/components/generic-table/generic-table.component';
import { ADMIN_PERMISSION, AuthService, TableConfig, Account, AccountContextService } from 'src/app/shared';
import { GenericRightPanelComponent, PanelAction } from 'src/app/shared/components/generic-right-panel/generic-right-panel.component';

@Component({
    standalone: true,
    selector: 'app-invoicing-gateway',
    templateUrl: './invoicing-gateway.component.html',
    styleUrls: ['./invoicing-gateway.component.scss'],
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
        EditInvoicesComponent
    ],
    providers: [
        InvoicingGatewayConfigService,
        InvoicesService
    ]
})
export class InvoicingGatewayComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('isActiveFlag') isActiveFlagTemplate: TemplateRef<any>;
	@ViewChild('invoiceFormRef', { static: false }) invoiceFormRef?: EditInvoicesComponent;
	private unsubscribe$ = new Subject<void>();
	private readonly accountContext = inject(AccountContextService);
	public isAdmin: boolean;
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<any[]>;
	public strategyTypes$: Observable<string[]>;

	// Right panel properties
	public isPanelOpen: boolean = false;
	public selectedInvoice: InvoicingMethod | null = null;
	public panelMode: 'create' | 'edit' = 'create';
	public panelTitle: string = '';
	public panelActions: PanelAction[] = [];

	constructor(
		private cdr: ChangeDetectorRef,
		private tableService: InvoicingGatewayConfigService,
		private invoicesService: InvoicesService,
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
				this.loadInvoicingMethods(account.id);
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
			this.loadInvoicingMethods();
		} else {
			// Initialize strategyTypes$ for admin to show create button
			this.strategyTypes$ = this.invoicesService.getInvoicingStrategyTypes();
		}
	}

	ngAfterViewInit(): void {
		if (this.isActiveFlagTemplate) {
			this.tableService.isActiveFlagTemplate = this.isActiveFlagTemplate;
			
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

	private loadInvoicingMethods(accountId?: string): void {
		this.invoicesService.list(accountId)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(data => {
				this.tableService.updateTableData(data);
				this.tableConfig$ = this.tableService.getTableConfig();
				this.dataList$ = this.tableService.dataList$;
			});

		this.strategyTypes$ = combineLatest([
			this.invoicesService.list(accountId),
			this.invoicesService.getInvoicingStrategyTypes()
		]).pipe(
			switchMap(([metadata, types]) => {
				const filteredTypes = types.filter(type =>
					!metadata.some(meta => meta.name === type)
				);
				return of(filteredTypes);
			})
		);
	}

	public openPanel(item: InvoicingMethod | null, mode: 'create' | 'edit' = 'edit'): void {
		this.selectedInvoice = item;
		this.panelMode = mode;
		
		if (mode === 'create') {
			this.panelTitle = 'invoicingGateway.createNew';
			this.selectedInvoice = { 
				name: item?.name || '',
				invoicingStrategy: item?.name || '',
				invoicingParameters: {}
			};
		} else {
			this.panelTitle = 'editInvoicingGateway.title';
		}
		
		this.isPanelOpen = true;
		this.cdr.markForCheck();
	}

	public onPanelClose(): void {
		this.isPanelOpen = false;
		this.selectedInvoice = null;
		this.cdr.markForCheck();
	}

	public onInvoiceSaved(): void {
		this.onPanelClose();
		setTimeout(() => {
			this.loadInvoicingMethods(this.selectedAccount?.id);
		}, 1000);
	}

	public edit(item: InvoicingMethod): void {
		this.openPanel(item, 'edit');
	}

	public onToggleStatus(): void {
		if (this.selectedInvoice?.id) {
			const status = {
				id: this.selectedInvoice.id,
				active: !this.selectedInvoice.isActive
			};
			
			this.invoicesService.updateStatus(status).subscribe(() => {
				if (this.selectedInvoice) {
					this.selectedInvoice.isActive = !this.selectedInvoice.isActive;
					this.cdr.markForCheck();
				}
			});
		}
	}
}