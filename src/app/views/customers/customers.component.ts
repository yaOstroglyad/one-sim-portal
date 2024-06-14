import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CustomersDataService, HeaderConfig, TableConfig, TableFilterFieldType } from '../../shared';
import { CustomersTableService } from './customers-table.service';
import { TranslateService } from '@ngx-translate/core';
import { Customer } from '../../shared/model/customer';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent implements OnInit {
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<Customer[]>;
  public headerConfig: HeaderConfig = {};

  constructor(private cdr: ChangeDetectorRef,
              private tableService: CustomersTableService,
              private customersDataService: CustomersDataService,
              public translateService: TranslateService
  ) {
    this.initheaderConfig();
  }

  ngOnInit(): void {
    this.customersDataService.list().subscribe(data => {
      this.tableService.updateTableData(data);
      this.tableConfig$ = this.tableService.getTableConfig();
      this.dataList$ = this.tableService.dataList$;
      this.cdr.detectChanges();
    });
  }

  private initheaderConfig(): void {
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
}
