import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HeaderConfig, TableConfig, TableFilterFieldType } from '../../shared';
import { Resource } from '../../shared/model/resource';
import { InventoryDataService } from './inventory-data.service';
import { InventoryTableService } from './inventory-table.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component';
import { SetupResourceComponent } from './setup-resource/setup-resource.component';
import { takeUntil } from 'rxjs/operators';
import { MoveResourceComponent } from './move-resource/move-resource.component';
import { SessionStorageService } from 'ngx-webstorage';

@Component({
	selector: 'app-inventory',
	templateUrl: './inventory.component.html',
	styleUrls: ['./inventory.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent implements OnInit, OnDestroy {
  public unsubscribe$: Subject<void> = new Subject<void>();
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<Resource[]>;
	public headerConfig: HeaderConfig = {};
	public moveResult = {
		isActive: false,
		"movedSims": 0,
		"availableSims": 0
	}
	public isAdmin: boolean;

	constructor(private cdr: ChangeDetectorRef,
							private tableService: InventoryTableService,
							private inventoryDataService: InventoryDataService,
							private dialog: MatDialog,
							private $sessionStorage: SessionStorageService,
	) {
		this.initHeaderConfig();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	ngOnInit(): void {
		this.inventoryDataService.list({ page: 0, size: 10 })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
			this.tableService.updateTableData(data.content);
			this.tableService.updateConfigData(data?.totalPages || 20);
			this.tableConfig$ = this.tableService.getTableConfig();
			this.dataList$ = this.tableService.dataList$;
			this.isAdmin = this.$sessionStorage.retrieve('isAdmin');
			this.cdr.detectChanges();
		});
	}

	private initHeaderConfig(): void {
		this.headerConfig = {
			value: {type: TableFilterFieldType.Text, placeholder: 'Filter table data'}
		};
	}

	applyFilter(filterValues: any): void {
		this.tableService.applyFilter(filterValues);
		this.dataList$ = this.tableService.dataList$;
	}

	onColumnSelectionChanged(selectedColumns: Set<string>): void {
		this.tableService.updateColumnVisibility(selectedColumns);
	}

	onMoveResource() {
		const selectionDialogRef = this.dialog.open(MoveResourceComponent, {
			width: '600px'
		});

		selectionDialogRef.afterClosed().subscribe(selectionResult => {
			if(selectionResult) {
				this.moveResult = {
					...selectionResult,
					isActive: true
				}
				this.onPageChange({ page: 0, size: 10 })
				setTimeout(() => {
					this.moveResult.isActive = false;
				}, 5000)
			}
		});
	}

	openSelectionDialog() {
		const selectionDialogRef = this.dialog.open(SetupResourceComponent, {
			width: '600px'
		});

		selectionDialogRef.afterClosed().subscribe(selectionResult => {
			if (selectionResult) {
				this.openUpload(selectionResult);
			}
		});
	}

	openUpload(selectionResult: any) {
		const uploadDialogRef = this.dialog.open(UploadDialogComponent, {
			width: '600px',
			data: {
				...selectionResult
			}
		});

		uploadDialogRef.afterClosed().subscribe(result => {
			// Обработка результата второго диалогового окна
		});
	}

	onPageChange({ page, size }): void {
		this.inventoryDataService.list({ page, size })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
			this.tableService.updateTableData(data.content);
		});
	}
}
