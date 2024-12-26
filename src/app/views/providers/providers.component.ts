import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HeaderConfig, ProvidersDataService, TableConfig, TableFilterFieldType } from '../../shared';
import { Provider } from '../../shared/model/provider';
import { ProvidersTableService } from './providers-table.service';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersComponent implements OnInit, OnDestroy {
  public unsubscribe$: Subject<void> = new Subject<void>();
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<Provider[]>;
  public headerConfig: HeaderConfig = {};

  constructor(private cdr: ChangeDetectorRef,
              private tableService: ProvidersTableService,
              private providersDataService: ProvidersDataService,
              private translate: TranslateService
  ) {
    this.initHeaderConfig();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.providersDataService.list()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
      this.tableService.updateTableData(data);
      this.tableConfig$ = this.tableService.getTableConfig();
      this.dataList$ = this.tableService.dataList$;
      this.cdr.detectChanges();
    });
  }

  private initHeaderConfig(): void {
    this.headerConfig = {
      value: { type: TableFilterFieldType.Text, placeholder: this.translate.instant('common.table.filterPlaceholder') }
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
