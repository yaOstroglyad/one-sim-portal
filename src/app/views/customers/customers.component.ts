import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  CustomersDataService,
  HeaderConfig,
  TableConfig,
  TableFilterFieldType
} from '../../shared';
import { CustomersTableService } from './customers-table.service';
import { TranslateService } from '@ngx-translate/core';
import { Customer } from '../../shared/model/customer';
import { EditCustomerComponent } from './edit-customer/edit-customer.component';
import { MatDialog } from '@angular/material/dialog';

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
              public translateService: TranslateService,
              private dialog: MatDialog
  ) {
    this.initheaderConfig();
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.customersDataService.list().subscribe(data => {
      this.tableService.updateTableData(data);
      this.tableConfig$ = this.tableService.getTableConfig();
      this.dataList$ = this.tableService.dataList$;
      this.cdr.detectChanges();
    });
  }

  createCustomer(): void {
    const dialogRef = this.dialog.open(EditCustomerComponent, {
      width: '650px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customersDataService.create(result).subscribe(() => {
          this.loadCustomers();
        });
      }
    });
  }

  editCustomer(customer: Customer): void {
    const dialogRef = this.dialog.open(EditCustomerComponent, {
      width: '650px',
      data: customer
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customersDataService.update(result.id, result).subscribe(() => {
          this.loadCustomers();
        });
      }
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
