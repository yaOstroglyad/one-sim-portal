import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableConfig } from '../../../../shared/model/table-column-config.interface';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-view-configuration-table',
  templateUrl: './view-configuration-table.component.html',
  styleUrls: ['./view-configuration-table.component.scss'],
  standalone: true,
  imports: [
    GenericTableComponent,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ]
})
export class ViewConfigurationTableComponent implements OnInit {
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: BehaviorSubject<any[]>;
  public isAdmin: boolean = false;

  constructor() {
    this.tableConfig$ = new BehaviorSubject<TableConfig>({
      columns: [
        {
          header: 'viewConfiguration.name',
          field: 'name',
          visible: true
        },
        {
          header: 'viewConfiguration.isActive',
          field: 'isActive',
          visible: true,
          template: 'isActiveFlag'
        }
      ],
      showMenu: true,
      pagination: {
        enabled: true,
        serverSide: true
      }
    });
    this.dataList$ = new BehaviorSubject<any[]>([]);
  }

  ngOnInit(): void {
    // Загрузка данных
  }

  edit(item: any): void {
    // Логика редактирования
  }
} 