import { inject, Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
	ADMIN_PERMISSION,
	AuthService,
	SPECIAL_PERMISSION,
	TableConfig,
	TableConfigAbstractService,
	TemplateType
} from 'src/app/shared';
import { CompanyProduct } from '../../models';

@Injectable()
export class CompanyProductsTableService extends TableConfigAbstractService<CompanyProduct> {
	private authService = inject(AuthService);
	private isSpecial = this.authService.hasPermission(SPECIAL_PERMISSION);
	private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

	// Template references
	public priceTemplate: TemplateRef<any>;
	public statusTemplate: TemplateRef<any>;

	public originalDataSubject = new BehaviorSubject<CompanyProduct[]>([]);
	public dataList$: Observable<CompanyProduct[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		pagination: {
			enabled: true,
			serverSide: true
		},
		translatePrefix: 'productConstructor.companyProducts.',
		showCheckboxes: false,
		showEditButton: false,
		showAddButton: this.isAdmin || this.isSpecial,
		showMenu: true,
		columns: [
			{
				visible: true,
				key: 'company.name',
				header: 'company',
				templateType: TemplateType.Text,
				sortable: true,
				minWidth: '180px'
			},
			{
				visible: true,
				key: 'name',
				header: 'productName',
				templateType: TemplateType.Text,
				sortable: true,
				minWidth: '200px'
			},
			{
				visible: true,
				key: 'serviceCoverage.name',
				header: 'coverage',
				templateType: TemplateType.Text,
				sortable: true,
				minWidth: '150px'
			},
			{
				visible: true,
				key: 'price',
				header: 'price',
				templateType: TemplateType.Custom,
				customTemplate: () => this.priceTemplate,
				sortable: true,
				minWidth: '100px',
				class: 'text-end'
			},
			{
				visible: true,
				key: 'currency',
				header: 'currency',
				templateType: TemplateType.Text,
				sortable: false,
				minWidth: '80px',
				class: 'text-center'
			},
			{
				visible: true,
				key: 'active',
				header: 'status',
				templateType: TemplateType.Custom,
				customTemplate: () => this.statusTemplate,
				sortable: true,
				minWidth: '100px',
				class: 'text-center'
			}
		]
	});

	constructor() {
		super();
	}

	public updateTableData(data: CompanyProduct[]): void {
		this.originalDataSubject.next(data);
	}

	public setTemplates(priceTemplate: TemplateRef<any>, statusTemplate: TemplateRef<any>): void {
		this.priceTemplate = priceTemplate;
		this.statusTemplate = statusTemplate;
		// Re-emit the current config to trigger update with new templates
		this.tableConfigSubject.next(this.tableConfigSubject.value);
	}
}
