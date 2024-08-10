import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import {
  HeaderConfig,
  TableConfig,
  TableFilterFieldType,
  OrdersDataService
} from '../../shared';
import { OrdersTableService } from './orders-table.service';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { Order } from '../../shared/model/order';
import { MatDialog } from '@angular/material/dialog';
import { EditOrderDescriptionComponent } from './edit-order-description/edit-order-description.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<Order[]>;
  public headerConfig: HeaderConfig = {};

  constructor(private cdr: ChangeDetectorRef,
              private tableService: OrdersTableService,
              private ordersDataService: OrdersDataService,
              private dialog: MatDialog,
  ) {
    this.initheaderConfig();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.ordersDataService.list()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
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

  public openEditDescriptionDialog(item: Order): void {
    const dialogRef = this.dialog.open(EditOrderDescriptionComponent, {
      width: '400px',
      data: item
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.unsubscribe$),
      switchMap(newDescription => {
        if (this.isDescriptionChanged(newDescription, item.description)) {
          return this.ordersDataService.updateDescription({ id: item.id, description: newDescription }).pipe(
            tap(() => this.loadOrders())
          );
        }
        return of(null);
      })
    ).subscribe();
  }

  private isDescriptionChanged(newDescription: string, description: string): boolean {
    if(newDescription) {
      return newDescription !== description;
    } else {
      return false;
    }
  }
}
