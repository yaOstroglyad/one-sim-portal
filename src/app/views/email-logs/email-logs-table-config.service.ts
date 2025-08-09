import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import {
	TableConfigAbstractService,
	TableColumnConfig,
	TableConfig,
	TemplateType,
	EmailLog,
	EmailLogResponse,
	EmailLogFilterParams
} from '../../shared';

@Injectable()
export class EmailLogsTableConfigService extends TableConfigAbstractService<EmailLog> {
	protected translationPrefix = 'email_logs.';

	constructor(private http: HttpClient) {
		super();
		this.initializeTableConfig();
	}

	private initializeTableConfig(): void {
		const tableConfig: TableConfig = {
			columns: this.getTableColumns(),
			translatePrefix: this.translationPrefix,
			showCheckboxes: false,
			showEditButton: false,
			showAddButton: false,
			showMenu: false,
			pagination: {
				enabled: true,
				serverSide: true,
				page: 0,
				totalPages: 20,
				size: 10
			}
		};

		this.tableConfigSubject = new BehaviorSubject<TableConfig>(tableConfig);
	}

	private getTableColumns(): TableColumnConfig[] {
		return [
			{
				key: 'createdAt',
				header: 'created_at',
				sortable: true,
				visible: true,
				templateType: TemplateType.Date,
				minWidth: '150px'
			},
			{
				key: 'email',
				header: 'email_address',
				sortable: true,
				visible: true,
				templateType: TemplateType.Text,
				minWidth: '200px'
			},
			{
				key: 'type',
				header: 'email_type',
				sortable: true,
				visible: true,
				templateType: TemplateType.Text,
				minWidth: '150px'
			},
			{
				key: 'status',
				header: 'status',
				sortable: true,
				visible: true,
				templateType: TemplateType.Text,
				class: 'status-cell',
				minWidth: '100px'
			},
			{
				key: 'iccids',
				header: 'iccids',
				sortable: true,
				visible: true,
				templateType: TemplateType.Text,
				minWidth: '180px'
			},
			{
				key: 'messageId',
				header: 'message_id',
				sortable: true,
				visible: true,
				templateType: TemplateType.Text,
				minWidth: '150px'
			},
			{
				key: 'metadata',
				header: 'metadata_status',
				sortable: false,
				visible: true,
				templateType: TemplateType.Text,
				minWidth: '120px'
			}
		];
	}

	loadData(params: EmailLogFilterParams): Observable<EmailLogResponse> {
		
		let httpParams = new HttpParams()
			.set('page', (params.page || 0).toString())
			.set('size', (params.size || 10).toString());

		if (params.iccid) {
			httpParams = httpParams.set('iccid', params.iccid);
		}

		if (params.email) {
			httpParams = httpParams.set('email', params.email);
		}

		if (params.dateFrom) {
			httpParams = httpParams.set('dateFrom', params.dateFrom);
		}

		if (params.dateTo) {
			httpParams = httpParams.set('dateTo', params.dateTo);
		}

		if (params.sort && params.sort.length > 0) {
			params.sort.forEach(sortItem => {
				httpParams = httpParams.append('sort', sortItem);
			});
		}

		const finalUrl = `/api/v1/email-logs/${params.accountId}`;

		return this.http.get<EmailLogResponse>(finalUrl, {params: httpParams});
	}

	getTableConfig(): BehaviorSubject<TableConfig> {
		return this.tableConfigSubject;
	}

	updateConfigData(totalPages: number): void {
		const currentConfig = this.tableConfigSubject.value;
		this.tableConfigSubject.next({
			...currentConfig,
			pagination: {
				...currentConfig.pagination,
				totalPages
			}
		});
	}

	updateColumnVisibility(selectedColumns: Set<string>): void {
		const currentConfig = this.tableConfigSubject.value;
		const updatedColumns = currentConfig.columns.map(col => ({
			...col,
			visible: selectedColumns.has(col.header)
		}));

		this.tableConfigSubject.next({
			...currentConfig,
			columns: updatedColumns
		});
	}
}
