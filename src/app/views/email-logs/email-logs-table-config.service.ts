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
	protected translationPrefix = 'email_logs';

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
			showMenu: true,
			pagination: {
				enabled: true,
				serverSide: true,
				page: 0,
				totalPages: 20,
				size: 20
			}
		};

		this.tableConfigSubject = new BehaviorSubject<TableConfig>(tableConfig);
	}

	private getTableColumns(): TableColumnConfig[] {
		return [
			{
				key: 'sentAt',
				header: `${this.translationPrefix}.sent_at`,
				sortable: true,
				visible: true,
				templateType: TemplateType.Date,
				minWidth: '150px'
			},
			{
				key: 'emailAddress',
				header: `${this.translationPrefix}.email_address`,
				sortable: true,
				visible: true,
				templateType: TemplateType.Text,
				minWidth: '200px'
			},
			{
				key: 'subject',
				header: `${this.translationPrefix}.subject`,
				sortable: true,
				visible: true,
				templateType: TemplateType.Text,
				minWidth: '250px'
			},
			{
				key: 'emailType',
				header: `${this.translationPrefix}.email_type`,
				sortable: true,
				visible: true,
				templateType: TemplateType.Text
			},
			{
				key: 'status',
				header: `${this.translationPrefix}.status`,
				sortable: true,
				visible: true,
				templateType: TemplateType.Text,
				class: 'status-cell'
			},
			{
				key: 'iccid',
				header: `${this.translationPrefix}.iccid`,
				sortable: true,
				visible: true,
				templateType: TemplateType.Text,
				minWidth: '180px'
			},
			{
				key: 'deliveredAt',
				header: `${this.translationPrefix}.delivered_at`,
				sortable: true,
				visible: true,
				templateType: TemplateType.Date,
				minWidth: '150px'
			},
			{
				key: 'openedAt',
				header: `${this.translationPrefix}.opened_at`,
				sortable: true,
				visible: true,
				templateType: TemplateType.Date,
				minWidth: '150px'
			},
			{
				key: 'errorMessage',
				header: `${this.translationPrefix}.error_message`,
				sortable: false,
				visible: true,
				templateType: TemplateType.Text,
				minWidth: '200px'
			}
		];
	}

	loadData(params: EmailLogFilterParams): Observable<EmailLogResponse> {
		let httpParams = new HttpParams()
			.set('page', (params.page || 0).toString())
			.set('size', (params.size || 20).toString());

		if (params.iccid) {
			httpParams = httpParams.set('iccid', params.iccid);
		}

		if (params.sort && params.sort.length > 0) {
			params.sort.forEach(sortItem => {
				httpParams = httpParams.append('sort', sortItem);
			});
		}

		return this.http.get<EmailLogResponse>(`/api/v1/email-logs/${params.accountId}`, {params: httpParams});
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
