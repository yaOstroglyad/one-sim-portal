import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, take } from 'rxjs';
import { TableConfig } from './table-column-config.interface';

@Component({
	selector: 'generic-table',
	templateUrl: './generic-table.component.html',
	styleUrls: ['./generic-table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent {
	@Input() config$: Observable<TableConfig>;
	@Input() data$: Observable<any[]>;
  @Output() selectedItemsChange = new EventEmitter<any>;
  @Output() toggleAction = new EventEmitter<any>;

	public selectedItems = new Set<any>();
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
}
