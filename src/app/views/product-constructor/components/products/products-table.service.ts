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
import { Product } from '../../models';

@Injectable()
export class ProductsTableService extends TableConfigAbstractService<Product> {
	private authService = inject(AuthService);
	private isSpecial = this.authService.hasPermission(SPECIAL_PERMISSION);
	private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

	// Template references
	public statusTemplate: TemplateRef<any>;
	public validityTemplate: TemplateRef<any>;

	public originalDataSubject = new BehaviorSubject<Product[]>([]);
	public dataList$: Observable<Product[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		pagination: {
			enabled: true,
			serverSide: true
		},
		translatePrefix: 'productConstructor.products.',
		showCheckboxes: false,
		showEditButton: false,
		showAddButton: this.isAdmin || this.isSpecial,
		showMenu: true,
		columns: [
			{
				visible: false,
				key: 'id',
				header: 'id'
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
				key: 'bundle.name',
				header: 'bundle',
				templateType: TemplateType.Text,
				sortable: true,
				minWidth: '180px'
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
				key: 'validityPeriod',
				header: 'validity',
				templateType: TemplateType.Custom,
				customTemplate: () => this.validityTemplate,
				sortable: false,
				minWidth: '120px',
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

	public updateTableData(data: Product[]): void {
		this.originalDataSubject.next(data);
	}

	public setTemplates(statusTemplate: TemplateRef<any>, validityTemplate: TemplateRef<any>): void {
		this.statusTemplate = statusTemplate;
		this.validityTemplate = validityTemplate;
		// Re-emit the current config to trigger update with new templates
		this.tableConfigSubject.next(this.tableConfigSubject.value);
	}
}
