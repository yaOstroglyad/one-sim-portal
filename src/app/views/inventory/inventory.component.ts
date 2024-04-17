import { ChangeDetectorRef, Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HeaderConfig, TableConfig, TableFilterFieldType } from '../../shared';
import { TranslateService } from '@ngx-translate/core';
import { Resource } from '../../shared/model/resource';
import { InventoryDataService } from './inventory-data.service';
import { InventoryTableService } from './inventory-table.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component';
import { SetupResourceComponent } from './setup-resource/setup-resource.component';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<Resource[]>;
  public headerConfig: HeaderConfig = {};

  constructor(private cdr: ChangeDetectorRef,
              private tableService: InventoryTableService,
              private inventoryDataService: InventoryDataService,
              private dialog: MatDialog,
              public translateService: TranslateService,
  ) {
    this.initHeaderConfig();
  }

  ngOnInit(): void {
    this.inventoryDataService.list().subscribe(data => {
      this.tableService.updateTableData(data);
      this.tableConfig$ = this.tableService.getTableConfig();
      this.dataList$ = this.tableService.dataList$;
      this.cdr.detectChanges();
    });
  }

  private initHeaderConfig(): void {
    this.headerConfig = {
      name: {type: TableFilterFieldType.Text, placeholder: 'Filter by name'},
    };
  }

  applyFilter(filterValues: any): void {
    this.tableService.applyFilter(filterValues);
    this.dataList$ = this.tableService.dataList$;
  }

  onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableService.updateColumnVisibility(selectedColumns);
  }
  openSelectionDialog() {
    const selectionDialogRef = this.dialog.open(SetupResourceComponent, {
      width: '600px',
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

}
