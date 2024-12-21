import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HeaderConfig, TableConfig, TableFilterFieldType } from '../../shared';
import { Resource } from '../../shared/model/resource';
import { InventoryDataService } from './inventory-data.service';
import { InventoryTableService } from './inventory-table.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component';
import { SetupResourceComponent } from './setup-resource/setup-resource.component';
import { MoveResourceComponent } from './move-resource/move-resource.component';
import { SessionStorageService } from 'ngx-webstorage';
import { takeUntil } from 'rxjs/operators';

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
		movedSims: 0,
		availableSims: 0
	};
	public isAdmin: boolean;

	private filterValue: string | null = null;

	constructor(
		private cdr: ChangeDetectorRef,
		private tableService: InventoryTableService,
		private inventoryDataService: InventoryDataService,
		private dialog: MatDialog,
		private $sessionStorage: SessionStorageService
	) {
		this.initHeaderConfig();
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	ngOnInit(): void {
		this.loadData({page: 0, size: 10});
		this.isAdmin = this.$sessionStorage.retrieve('isAdmin');
	}

	private initHeaderConfig(): void {
		this.headerConfig = {
			value: {type: TableFilterFieldType.Text, placeholder: 'Filter table data'}
		};
	}


	private loadData(params: { page: number; size: number; searchIccid?: string }): void {
		this.inventoryDataService.list(params)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(data => {
				this.tableService.updateConfigData(data?.totalPages || 20);
				this.tableConfig$ = this.tableService.getTableConfig();
				this.dataList$ = of(data.content);
				this.cdr.detectChanges();
			});
	}

	applyFilter({value}: { value: string }): void {
		this.filterValue = value || null;

		this.loadData({
			page: 0,
			size: 10,
			...(this.filterValue ? {searchIccid: this.filterValue} : {})
		});
	}

	onPageChange({page, size}: { page: number; size: number }): void {
		this.loadData({
			page,
			size,
			...(this.filterValue ? {searchIccid: this.filterValue} : {})
		});
	}

	onColumnSelectionChanged(selectedColumns: Set<string>): void {
		this.tableService.updateColumnVisibility(selectedColumns);
	}

	onMoveResource(): void {
		const selectionDialogRef = this.dialog.open(MoveResourceComponent, {
			width: '600px'
		});

		selectionDialogRef.afterClosed()
			.pipe(
				takeUntil(this.unsubscribe$)
			).subscribe(selectionResult => {
			if (selectionResult) {
				this.moveResult = {
					...selectionResult,
					isActive: true
				};
				this.onPageChange({page: 0, size: 10});
				setTimeout(() => {
					this.moveResult.isActive = false;
				}, 5000);
			}
		});
	}

	openSelectionDialog(): void {
		const selectionDialogRef = this.dialog.open(SetupResourceComponent, {
			width: '600px'
		});

		selectionDialogRef.afterClosed()
			.pipe(
				takeUntil(this.unsubscribe$)
			).subscribe(selectionResult => {
			if (selectionResult) {
				this.openUpload(selectionResult);
			}
		});
	}

	openUpload(selectionResult: any): void {
		const uploadDialogRef = this.dialog.open(UploadDialogComponent, {
			width: '600px',
			data: {...selectionResult}
		});

		uploadDialogRef.afterClosed()
			.pipe(
				takeUntil(this.unsubscribe$)
			).subscribe();
	}
}
