import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HeaderConfig, ProvidersDataService, TableConfig, TableFilterFieldType } from '../../shared';
import { Provider } from '../../shared/model/provider';
import { ProvidersTableService } from './providers-table.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersComponent implements OnInit {
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<Provider[]>;
  public headerConfig: HeaderConfig = {};

  constructor(private cdr: ChangeDetectorRef,
              private tableService: ProvidersTableService,
              private providersDataService: ProvidersDataService,
              public translateService: TranslateService
  ) {
    this.initheaderConfig();
  }

  ngOnInit(): void {
    this.providersDataService.list().subscribe(data => {
      this.tableService.updateTableData(data);
      this.tableConfig$ = this.tableService.getTableConfig();
      this.dataList$ = this.tableService.dataList$;
      this.cdr.detectChanges();
    });
  }

  private initheaderConfig(): void {
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
}
