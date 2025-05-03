import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { Observable, take } from 'rxjs';
import { TableConfig } from '../../model/table-column-config.interface';

@Component({
	selector: 'generic-table',
	templateUrl: './generic-table.component.html',
	styleUrls: ['./generic-table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent {
	public currentPage = 0;
	public pageSize = 10;
	//TODO need to be updated based on BE response
	public totalPages: number = 20;

	@Input() config$: Observable<TableConfig>;
	@Input() data$: Observable<any[]>;
	@Input() menu: TemplateRef<any>;
	@Input() isRowClickable: boolean = false;

	@Output() selectedItemsChange = new EventEmitter<any>;
	@Output() onRowClickEvent = new EventEmitter<any>;
	@Output() toggleAction = new EventEmitter<any>;
	@Output() pageChange = new EventEmitter<any>;
	@Output() sortChange = new EventEmitter<any>;
	@Output() addButtonClick = new EventEmitter<void>;

	public selectedItems = new Set<any>();
	public loading = false;

	public changePage(newPage: number, isServerSide: boolean): void {
		this.currentPage = newPage;
		this.pageChange.emit({ page: this.currentPage, size: this.pageSize, isServerSide });
	}

	public toggleAll(event: any): void {
		if (event.target.checked) {
			this.data$.pipe(
				take(1)
			).subscribe(data => {
				data.forEach(item => this.selectedItems.add(item));
				this.emitSelectedItems();
			});
		} else {
			this.selectedItems.clear();
			this.emitSelectedItems();
		}
	}

	private emitSelectedItems(): void {
		this.selectedItemsChange.emit(Array.from(this.selectedItems));
	}

	public toggleItemSelection(item: any, event: any): void {
		if (event.target.checked) {
			this.selectedItems.add(item);
		} else {
			this.selectedItems.delete(item);
		}
		this.emitSelectedItems();
	}

	public isSelected(item: any): boolean {
		return this.selectedItems.has(item);
	}

	public onEdit(item: any): void {
		this.toggleAction.emit(item);
	}

	onRowClick(item: any): void {
		this.onRowClickEvent.emit(item);
	}

	// Обработка сортировки колонок
	public onSortColumn(column: any): void {
		// Проверяем, поддерживает ли колонка сортировку
		if (!column.sortable) return;
		
		this.config$.pipe(take(1)).subscribe(config => {
			// Сбросить сортировку для всех колонок
			config.columns.forEach(col => {
				if (col !== column) {
					col.sortDirection = null;
				}
			});
			
			// Установить новое направление сортировки для выбранной колонки
			if (!column.sortDirection || column.sortDirection === 'desc') {
				column.sortDirection = 'asc';
			} else {
				column.sortDirection = 'desc';
			}
			
			// Эмитить событие сортировки для обработки внешними компонентами
			this.sortChange.emit({
				column: column.key,
				direction: column.sortDirection
			});
		});
	}

	public onAddButtonClick(): void {
		this.addButtonClick.emit();
	}

	// Проверка для четных/нечетных строк
	public isEven(index: number): boolean {
		return index % 2 === 0;
	}

	public isOdd(index: number): boolean {
		return index % 2 !== 0;
	}
}
