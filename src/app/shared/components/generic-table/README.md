# Компонент Generic Table в стиле AG-Grid

Компонент `generic-table` был обновлен для визуального сходства с AG-Grid, сохраняя при этом простоту использования оригинального компонента.

## Особенности

- Визуальный стиль, идентичный AG-Grid
- Структура DOM, аналогичная AG-Grid
- Поддержка сортировки колонок
- Чередующиеся цвета строк
- Выделение выбранной строки
- Подсветка при наведении на строку
- Панель инструментов с кнопкой добавления
- Адаптивный дизайн для мобильных устройств
- Поддержка RTL
- Индикатор загрузки
- Горизонтальный скролл для таблиц с большим количеством колонок
- Настраиваемая ширина колонок

## Использование

```typescript
// В вашем компоненте
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableConfig, TemplateType } from '../../model/table-column-config.interface';

@Component({
  selector: 'your-component',
  templateUrl: './your-component.component.html',
})
export class YourComponent implements OnInit {
  public tableConfig$ = new BehaviorSubject<TableConfig>({
    columns: [
      {
        key: 'id',
        header: 'ID',
        visible: true,
        sortable: true, // Включить сортировку
        width: '80px', // Фиксированная ширина
        minWidth: '50px' // Минимальная ширина
      },
      {
        key: 'name',
        header: 'Name',
        visible: true,
        templateType: TemplateType.Text,
        sortable: true,
        width: '200px'
      },
      {
        key: 'createdAt',
        header: 'Created',
        visible: true,
        templateType: TemplateType.Date,
        dateFormat: 'dd/MM/yyyy',
        sortable: true,
        minWidth: '120px'
      }
    ],
    translatePrefix: 'your.translation.prefix.',
    showCheckboxes: true,
    showEditButton: true,
    showAddButton: true, // Показать кнопку добавления
    pagination: {
      enabled: true,
      serverSide: true,
      totalPages: 10
    }
  });

  public tableData$ = new BehaviorSubject<any[]>([
    { id: 1, name: 'Item 1', createdAt: new Date() },
    { id: 2, name: 'Item 2', createdAt: new Date() },
    // ...
  ]);

  onSort(event: any): void {
    console.log('Sort event:', event);
    // Обработка сортировки
  }

  onPageChange(event: any): void {
    console.log('Page change:', event);
    // Обработка смены страницы
  }

  onRowClick(item: any): void {
    console.log('Row clicked:', item);
    // Обработка клика на строку
  }
  
  onAddButtonClick(): void {
    console.log('Add button clicked');
    // Обработка нажатия кнопки добавления
  }
}
```

```html
<!-- В вашем шаблоне -->
<generic-table
  [config$]="tableConfig$"
  [data$]="tableData$"
  [isRowClickable]="true"
  (sortChange)="onSort($event)"
  (pageChange)="onPageChange($event)"
  (onRowClickEvent)="onRowClick($event)"
  (addButtonClick)="onAddButtonClick()">
  <!-- Опционально: кастомный контент для панели инструментов -->
  <ng-container custom-toolbar>
    <button class="ag-grid-button">Дополнительная кнопка</button>
  </ng-container>
</generic-table>
```

## Настройка ширины колонок

Для настройки ширины колонок используйте свойства `width` и `minWidth` в конфигурации колонки:

```typescript
{
  key: 'name',
  header: 'Name',
  visible: true,
  width: '200px', // Установка фиксированной ширины
  minWidth: '100px' // Установка минимальной ширины
}
```

Значения могут быть указаны в пикселях (`px`), процентах (`%`) или других CSS единицах измерения.

Если колонок много, таблица будет иметь горизонтальный скролл.

## Настройка сортировки

Для включения сортировки колонки, добавьте `sortable: true` в конфигурацию колонки. Компонент будет эмитить событие `sortChange` при клике на заголовок колонки, которое можно обработать в родительском компоненте.

## Состояние загрузки

Компонент поддерживает индикатор загрузки, который можно активировать, установив свойство `loading`:

```typescript
@ViewChild(GenericTableComponent) table: GenericTableComponent;

loadData() {
  this.table.loading = true;
  this.dataService.fetchData().subscribe(
    data => {
      this.tableData$.next(data);
      this.table.loading = false;
    }
  );
}
```

## Стилизация

Таблица использует CSS-переменные в формате AG-Grid. Вы можете настроить внешний вид таблицы, изменяя CSS переменные в файле `_ag-grid-styles.scss` или переопределяя их в ваших компонентах.

Основные переменные:

```scss
:root {
  --ag-header-height: 42px;
  --ag-row-height: 36px;
  --ag-header-foreground-color: rgba(0, 0, 0, 0.7);
  --ag-header-background-color: #f8f8f8;
  --ag-odd-row-background-color: #f9f9f9;
  --ag-row-border-color: #e2e2e2;
  --ag-cell-horizontal-border: #e2e2e2;
  --ag-selected-row-background-color: rgba(var(--os-color-primary-rgb), 0.1);
  --ag-row-hover-color: rgba(var(--os-color-primary-rgb), 0.05);
  --ag-row-even-background-color: #ffffff;
}
``` 