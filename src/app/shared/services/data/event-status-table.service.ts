import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  TableConfig,
  TableConfigAbstractService,
  TemplateType,
  SubscriberStatusEvent
} from '@shared';

// Сервис для конфигурации таблицы статусов событий.
// Хранит TemplateRef для кастомных колонок (таймстамп и статус),
// которые будут использованы GenericTable при рендере строк.
@Injectable({ providedIn: 'root' })
export class EventStatusTableService extends TableConfigAbstractService<SubscriberStatusEvent> {
  eventTimestampTemplate!: TemplateRef<{ $implicit: SubscriberStatusEvent }>;
  statusTemplate!: TemplateRef<{ $implicit: SubscriberStatusEvent }>;
// Конфигурация таблицы для GenericTable.
// Описывает колонки, их заголовки и поведение.
// Для колонок с нестандартным отображением используются кастомные шаблоны,
// которые будут подставлены при рендере строк.

  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    translatePrefix: 'eventStatus.',
    showCheckboxes: false,
    showAddButton: false,
    showEditButton: false,
    showMenu: false,
    pagination: { enabled: false, serverSide: false },
    columns: [
      {
        visible: true,
        key: 'eventTimestamp',
        header: 'timeStamp',
        templateType: TemplateType.Custom,
        customTemplate: () => this.eventTimestampTemplate
      },
      { visible: true, key: 'notificationPoint', header: 'notificationPoint' },
      {
        visible: true,
        key: 'status',
        header: 'status',
        templateType: TemplateType.Custom,
        customTemplate: () => this.statusTemplate
      }
    ]
  });

  constructor() {
    super();
  }

  updateTableData(data: SubscriberStatusEvent[]): void {
    this.originalDataSubject.next(data);
  }

  setTemplates(tpls: {
    eventTimestamp: TemplateRef<{ $implicit: SubscriberStatusEvent }>;
    status: TemplateRef<{ $implicit: SubscriberStatusEvent }>;
  }): void {
    this.eventTimestampTemplate = tpls.eventTimestamp;
    this.statusTemplate = tpls.status;
    this.tableConfigSubject.next({ ...this.tableConfigSubject.value });
  }
}
