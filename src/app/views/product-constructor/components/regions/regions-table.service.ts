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
import { RegionSummary } from '../../models';

@Injectable()
export class RegionsTableService extends TableConfigAbstractService<RegionSummary> {
	private authService = inject(AuthService);
	private isSpecial = this.authService.hasPermission(SPECIAL_PERMISSION);
	private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

	public originalDataSubject = new BehaviorSubject<RegionSummary[]>([]);
	public dataList$: Observable<RegionSummary[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		pagination: {
			enabled: false,
			serverSide: false
		},
		translatePrefix: 'productConstructor.regions.',
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
				key: 'countryCount', 
				header: 'countryCount',
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

	public updateTableData(data: RegionSummary[]): void {
		this.originalDataSubject.next(data);
	}
}