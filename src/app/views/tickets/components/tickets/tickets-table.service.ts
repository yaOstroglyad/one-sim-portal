import { inject, Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
	ADMIN_PERMISSION,
	AuthService,
	SUPPORT_PERMISSION,
	TableConfig,
	TableConfigAbstractService,
	TemplateType
} from 'src/app/shared';
import { Ticket } from '../../models';

@Injectable()
export class TicketsTableService extends TableConfigAbstractService<Ticket> {
	private authService = inject(AuthService);
	private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
	private isSupport = this.authService.hasPermission(SUPPORT_PERMISSION);

	// Template references
	public statusTemplate: TemplateRef<any>;
	public priorityTemplate: TemplateRef<any>;
	public categoryTemplate: TemplateRef<any>;
	public assigneeTemplate: TemplateRef<any>;

	public originalDataSubject = new BehaviorSubject<Ticket[]>([]);
	public dataList$: Observable<Ticket[]> = this.originalDataSubject.asObservable();
	public tableConfigSubject = new BehaviorSubject<TableConfig>({
		pagination: {
			enabled: true,
			serverSide: true
		},
		translatePrefix: 'tickets.',
		showCheckboxes: false,
		showEditButton: false,
		showAddButton: true, // All users can create tickets
		showMenu: true,
		columns: [
			{
				visible: false,
				key: 'id',
				header: 'id'
			},
			{
				visible: true,
				key: 'ticketNumber',
				header: 'ticketNumber',
				templateType: TemplateType.Text,
				sortable: false,
				minWidth: '120px',
				class: 'font-weight-bold'
			},
			{
				visible: true,
				key: 'subject',
				header: 'subject',
				templateType: TemplateType.Text,
				sortable: false,
				minWidth: '250px'
			},
			{
				visible: true,
				key: 'status',
				header: 'status',
				templateType: TemplateType.Custom,
				customTemplate: () => this.statusTemplate,
				sortable: false,
				minWidth: '120px',
				class: 'text-center'
			},
			{
				visible: true,
				key: 'priority',
				header: 'priority',
				templateType: TemplateType.Custom,
				customTemplate: () => this.priorityTemplate,
				sortable: false,
				minWidth: '100px',
				class: 'text-center'
			},
			{
				visible: true,
				key: 'category',
				header: 'category',
				templateType: TemplateType.Custom,
				customTemplate: () => this.categoryTemplate,
				sortable: false,
				minWidth: '150px'
			},
			{
				visible: true,
				key: 'assignedToName',
				header: 'assignedTo',
				templateType: TemplateType.Custom,
				customTemplate: () => this.assigneeTemplate,
				sortable: false,
				minWidth: '150px'
			},
			{
				visible: true,
				key: 'createdByName',
				header: 'createdBy',
				templateType: TemplateType.Text,
				sortable: false,
				minWidth: '150px'
			},
			{
				visible: true,
				key: 'createdAt',
				header: 'createdAt',
				templateType: TemplateType.Date,
				sortable: false,
				minWidth: '140px'
			},
			{
				visible: this.isAdmin || this.isSupport,
				key: 'companyName',
				header: 'company',
				templateType: TemplateType.Text,
				sortable: false,
				minWidth: '180px'
			},
			{
				visible: true,
				key: 'commentsCount',
				header: 'comments',
				templateType: TemplateType.Text,
				sortable: false,
				minWidth: '80px',
				class: 'text-center'
			},
			{
				visible: true,
				key: 'attachmentsCount',
				header: 'attachments',
				templateType: TemplateType.Text,
				sortable: false,
				minWidth: '100px',
				class: 'text-center'
			}
		]
	});

	constructor() {
		super();
	}

	public updateTableData(data: Ticket[]): void {
		this.originalDataSubject.next(data);
	}

	public setTemplates(
		statusTemplate: TemplateRef<any>, 
		priorityTemplate: TemplateRef<any>,
		categoryTemplate: TemplateRef<any>,
		assigneeTemplate: TemplateRef<any>
	): void {
		this.statusTemplate = statusTemplate;
		this.priorityTemplate = priorityTemplate;
		this.categoryTemplate = categoryTemplate;
		this.assigneeTemplate = assigneeTemplate;
		// Re-emit the current config to trigger update with new templates
		this.tableConfigSubject.next(this.tableConfigSubject.value);
	}

	// Utility method to update column visibility
	public updateColumnVisibility(selectedColumns: Set<string>): void {
		const currentConfig = this.tableConfigSubject.value;
		const updatedColumns = currentConfig.columns.map(column => ({
			...column,
			visible: selectedColumns.has(column.key)
		}));

		this.tableConfigSubject.next({
			...currentConfig,
			columns: updatedColumns
		});
	}

	// Method to update pagination config
	public updateConfigData(totalPages: number): void {
		const currentConfig = this.tableConfigSubject.value;
		this.tableConfigSubject.next({
			...currentConfig,
			pagination: {
				...currentConfig.pagination,
				totalPages: totalPages
			}
		});
	}
}