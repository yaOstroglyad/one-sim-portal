import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableConfig } from '../../../shared/model/table-column-config.interface';
import { PaymentGatewayTableComponent } from './payment-gateway-table/payment-gateway-table.component';
import { CommonModule } from '@angular/common';
import { HeaderModule } from 'src/app/shared';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DropdownModule } from '@coreui/angular';

@Component({
  selector: 'app-payment-gateway',
  templateUrl: './payment-gateway.component.html',
  styleUrls: ['./payment-gateway.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HeaderModule,
    PaymentGatewayTableComponent,
    TranslateModule,
    ButtonModule,
    DropdownModule
  ]
})
export class PaymentGatewayComponent implements OnInit {
  public tableConfig$: BehaviorSubject<TableConfig>;
  public strategyTypes$ = new BehaviorSubject<string[]>(['PayPal', 'Stripe']); // или получать из сервиса

  constructor() {
    this.tableConfig$ = new BehaviorSubject<TableConfig>({
      columns: [],
      showMenu: true,
      pagination: {
        enabled: true,
        serverSide: true
      }
    });
  }

  ngOnInit(): void {
    // Инициализация конфигурации таблицы
  }

  edit(item: any): void {
    console.log('Edit item:', item);
    // Логика редактирования
  }
} 