import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
	ADMIN_PERMISSION,
	AuthService,
	SPECIAL_PERMISSION,
	TableConfig,
	TableConfigAbstractService,
	TemplateType
} from 'src/app/shared';
import { ProviderProduct } from '../../models';

@Injectable()
export class ProviderProductsTableService extends TableConfigAbstractService<ProviderProduct> {
	private authService = inject(AuthService);
	private isSpecial = this.authService.hasPermission(SPECIAL_PERMISSION);
	private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

	public originalDataSubject = new BehaviorSubject<ProviderProduct[]>([]);
	public dataList$: Observable<ProviderProduct[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		pagination: {
			enabled: true,
			serverSide: true,
			totalPages: 20
		},
		translatePrefix: 'productConstructor.providerProducts.',
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
				key: 'serviceProvider.name', 
				header: 'serviceProvider',
				templateType: TemplateType.Text,
				sortable: true,
				minWidth: '180px'
			},
			{
				visible: true, 
				key: 'serviceCoverage.name', 
				header: 'serviceCoverage',
				templateType: TemplateType.Text,
				sortable: true,
				minWidth: '150px'
			},
			{
				visible: true, 
				key: 'serviceCoverage.type', 
				header: 'coverageType',
				templateType: TemplateType.Text,
				sortable: true,
				minWidth: '120px',
				class: 'text-center'
			},
			{
				visible: true, 
				key: 'active', 
				header: 'status',
				templateType: TemplateType.Text,
				sortable: true,
				minWidth: '100px',
				class: 'text-center'
			}
		]
	});

	constructor() {
		super();
	}

	public updateTableData(data: ProviderProduct[]): void {
		this.originalDataSubject.next(data);
	}

	public updateConfigData(totalPages: number): void {
		const currentConfig = this.tableConfigSubject.value;
		this.tableConfigSubject.next({
			...currentConfig,
			pagination: {
				...currentConfig.pagination,
				totalPages
			}
		});
	}
}