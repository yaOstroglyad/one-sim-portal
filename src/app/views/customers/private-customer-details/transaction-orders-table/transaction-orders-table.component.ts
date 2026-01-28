import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  DestroyRef
} from '@angular/core';
import { AsyncPipe, DecimalPipe  } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subscriber,
  TransactionOrder,
  TransactionDataService,
  Customer,
  EmptyStateComponent,
  TableConfig
} from '@shared';
import { TransactionOrdersTableService } from '@shared/services/data/transaction-orders-table.service';
import { GenericTableComponent } from '@shared/components/generic-table/generic-table.component';

@Component({
  standalone: true,
  selector: 'app-transaction-orders-table',
  templateUrl: './transaction-orders-table.component.html',
  styleUrls: ['./transaction-orders-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, DecimalPipe, EmptyStateComponent, TranslateModule, GenericTableComponent],
  providers: [TransactionOrdersTableService] 
})

export class TransactionOrdersTableComponent implements OnInit, AfterViewInit {
  private transactionDataService = inject(TransactionDataService);
  private tableService = inject(TransactionOrdersTableService);
  private destroyRef = inject(DestroyRef);

  @Input() subscriber!: Subscriber;
  @Input() customer!: Partial<Customer>;

  transactionsView$!: Observable<TransactionOrder[]>;

  tableConfig$: Observable<TableConfig> = this.tableService.tableConfigSubject.asObservable();
  dataList$ = this.tableService.dataList$;


  @ViewChild('productPriceTpl', { static: false })
  productPriceTpl!: TemplateRef<any>;

  ngOnInit(): void {
    this.transactionsView$ = this.transactionDataService.getTransactions(
      this.customer.id!,
      this.subscriber.id!
      
    );
    

    this.transactionsView$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(transactions => {
        this.tableService.updateTableData(transactions ?? []);
      });
  }

ngAfterViewInit(): void {
  this.tableService.setProductPriceTemplate(this.productPriceTpl);
}
}
