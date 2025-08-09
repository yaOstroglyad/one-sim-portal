import {
	Component,
	ChangeDetectionStrategy,
	Input,
	Output,
	EventEmitter,
	TemplateRef,
	OnChanges,
	SimpleChanges, ContentChild
} from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { TableColumnConfig, TableConfig } from '../../model';

@Component({
	selector: 'generic-table',
	templateUrl: './generic-table.component.html',
	styleUrls: ['./generic-table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent implements OnChanges {
	@ContentChild('[custom-toolbar]', {read: TemplateRef})
	public customToolbarTpl?: TemplateRef<any>;

	@Input() config$!: Observable<TableConfig>;
	@Input() data$!: Observable<any[]>;
	@Input() menu!: TemplateRef<any>;
	@Input() isRowClickable = false;

	@Output() selectedItemsChange = new EventEmitter<any[]>();
	@Output() onRowClickEvent = new EventEmitter<any>();
	@Output() toggleAction = new EventEmitter<any>();
	@Output() pageChange = new EventEmitter<{ page: number; size: number; isServerSide?: boolean }>();
	@Output() sortChange = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();

	public viewModel$!: Observable<{ config: TableConfig; data: any[] }>;
	public currentPage = 0;
	public pageSize = 10;
	public totalPages = 0;
	public selectedItems = new Set<any>();

	ngOnChanges(changes: SimpleChanges): void {
		if ((changes.config$ || changes.data$) && this.config$ && this.data$) {
			this.createViewModel();
		}
	}

	private createViewModel(): void {
		this.viewModel$ = combineLatest([this.config$, this.data$]).pipe(
			map(([config, data]) => {
				this.setSortDirection(config.columns);

				if (config.pagination?.totalPages != null) {
					this.totalPages = config.pagination.totalPages;
				}
				return {config, data};
			})
		);
	}

	public trackById(_: number, item: any): any {
		return item.id ?? _;
	}

	public changePage(newPage: number, isServerSide?: boolean): void {
		this.currentPage = newPage;
		this.pageChange.emit({page: this.currentPage, size: this.pageSize, isServerSide});
	}

	public onPageSizeChange(newSize: number): void {
		this.pageSize = newSize;
		this.currentPage = 0; // Reset to first page when page size changes
		this.config$.pipe(take(1)).subscribe(config => {
			const isServerSide = config.pagination?.serverSide;
			this.pageChange.emit({page: this.currentPage, size: this.pageSize, isServerSide});
		});
	}

	public toggleAll(event: any): void {
		this.data$.pipe(take(1)).subscribe(data => {
			if (event.target.checked) {
				data.forEach(item => this.selectedItems.add(item));
			} else {
				this.selectedItems.clear();
			}
			this.selectedItemsChange.emit(Array.from(this.selectedItems));
		});
	}

	public toggleItemSelection(item: any, event: any): void {
		if (event.target.checked) {
			this.selectedItems.add(item);
		} else {
			this.selectedItems.delete(item);
		}
		this.selectedItemsChange.emit(Array.from(this.selectedItems));
	}

	public isSelected(item: any): boolean {
		return this.selectedItems.has(item);
	}

	public onEdit(item: any): void {
		this.toggleAction.emit(item);
	}

	public onRowClick(item: any): void {
		this.onRowClickEvent.emit(item);
	}

	public onSortColumn(column: any): void {
		if (!column.sortable) return;
		this.config$.pipe(take(1)).subscribe(cfg => {
			cfg.columns.forEach(col => {
				if (col !== column) col.sortDirection = null;
			});
			column.sortDirection = column.sortDirection === 'asc' ? 'desc' : 'asc';
			this.sortChange.emit({column: column.key, direction: column.sortDirection});
		});
	}

	public isEven(i: number): boolean {
		return i % 2 === 0;
	}

	public isOdd(i: number): boolean {
		return !this.isEven(i);
	}

	public getMinRows(dataLength: number): number {
		// Return the actual number of rows if less than 10, otherwise return 10
		// This ensures the table shows actual size for small datasets
		// but maintains a minimum height for larger datasets
		return Math.min(dataLength || 0, 10);
	}

	private setSortDirection(columns: TableColumnConfig[]) {
		columns.forEach(column => {
			if (column?.sortable && !column.sortDirection) {
				column.sortDirection = 'asc';
			}
		})
	}
}
