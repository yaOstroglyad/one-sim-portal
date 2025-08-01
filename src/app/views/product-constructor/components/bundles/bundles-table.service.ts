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
import { MobileBundle } from '../../models';

@Injectable()
export class BundlesTableService extends TableConfigAbstractService<MobileBundle> {
	private authService = inject(AuthService);
	private isSpecial = this.authService.hasPermission(SPECIAL_PERMISSION);
	private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

	public originalDataSubject = new BehaviorSubject<MobileBundle[]>([]);
	public dataList$: Observable<MobileBundle[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		pagination: {
			enabled: false,
			serverSide: false
		},
		translatePrefix: 'productConstructor.bundles.',
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
				header: 'name',
				templateType: TemplateType.Text,
				sortable: true,
				minWidth: '150px'
			},
			{
				visible: true, 
				key: 'usageUnitsDisplay', 
				header: 'usageUnits',
				templateType: TemplateType.Text,
				sortable: false,
				minWidth: '200px'
			},
			{
				visible: true, 
				key: 'dataTotal', 
				header: 'dataTotal',
				templateType: TemplateType.Text,
				sortable: true,
				minWidth: '120px',
				class: 'text-center'
			}
		]
	});

	constructor() {
		super();
	}

	public updateTableData(data: MobileBundle[]): void {
		this.originalDataSubject.next(data);
	}
}