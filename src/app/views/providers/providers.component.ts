import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FilterConfig, TableConfig, TableFilterFieldType } from '../../shared';
import { Provider } from '../../shared/model/provider';
import { ProvidersTableService } from './providers-table.service';
import { ProvidersDataService } from './providers-data.service';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersComponent implements OnInit {
  public tableConfig$: BehaviorSubject<TableConfig>;
  public data$: Observable<Provider[]>;
  public filterConfig: FilterConfig = {
    name: {type: TableFilterFieldType.Text, placeholder: 'Filter by name'},
  };

  constructor(private cdr: ChangeDetectorRef,
              private tableService: ProvidersTableService,
              private providersDataService: ProvidersDataService
  ) {
  }

  ngOnInit(): void {
    this.providersDataService.getData().subscribe(data => {
      this.tableService.updateData(data);
      this.tableConfig$ = this.tableService.getTableConfig();
      this.data$ = this.tableService.data$;
      this.cdr.detectChanges();
    });
  }

  applyFilter(filterValues: any): void {
    this.tableService.applyFilter(filterValues);
    this.data$ = this.tableService.data$;
  }

  onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableService.updateColumnVisibility(selectedColumns);
  }

  selectedRows($event: any): void{
    console.log('$event', $event);
  }

  onActionToggle($event: any): void{
    console.log('$event', $event);
  }
}
