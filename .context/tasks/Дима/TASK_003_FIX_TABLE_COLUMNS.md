# Task 003: Исправление отображения данных в колонках таблицы

## Цель задачи
Найти и исправить проблемы с отображением данных в колонках GenericTableComponent, где данные не показываются корректно.

## Предварительный анализ

### Возможные причины проблем:
1. Несоответствие ключей колонок и полей в данных
2. Неправильная конфигурация типов колонок
3. Отсутствие обработки вложенных объектов
4. Проблемы с форматированием специальных типов данных

## Этапы выполнения

### Этап 1: Диагностика проблемы

#### 1.1 Проверить GenericTableComponent
Файл: `src/app/shared/components/generic-table/generic-table.component.ts`

```typescript
// Найти метод, который отвечает за получение значения из объекта
getCellValue(row: any, column: TableColumn): any {
  // Проверить логику получения значения
  // Возможно проблема с вложенными полями типа 'user.name'
}
```

#### 1.2 Проверить конфигурацию колонок
В `users-table.service.ts` проверить:
```typescript
private getColumns(): TableColumn[] {
  return [
    {
      key: 'username',        // Это поле должно существовать в данных
      label: 'Username',
      type: 'text'           // Тип должен быть правильным
    },
    // ...
  ];
}
```

#### 1.3 Проверить структуру данных
Открыть Network вкладку в DevTools и посмотреть реальную структуру ответа от API:
```json
{
  "content": [
    {
      "username": "john.doe",    // Проверить точные имена полей
      "firstName": "John",
      // ...
    }
  ]
}
```

### Этап 2: Исправление GenericTableComponent

#### 2.1 Добавить поддержку вложенных полей
```typescript
// generic-table.component.ts
getCellValue(row: any, column: TableColumn): any {
  // Поддержка точечной нотации для вложенных объектов
  const keys = column.key.split('.');
  let value = row;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return null; // или дефолтное значение
    }
  }
  
  return value;
}
```

#### 2.2 Добавить обработку разных типов данных
```typescript
formatCellValue(value: any, column: TableColumn): string {
  if (value === null || value === undefined) {
    return '-'; // Показать прочерк для пустых значений
  }

  switch (column.type) {
    case 'date':
      return this.formatDate(value);
    case 'currency':
      return this.formatCurrency(value);
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'badge':
      return this.getBadgeText(value, column.badgeConfig);
    default:
      return String(value);
  }
}

private formatDate(value: any): string {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString();
}

private formatCurrency(value: number): string {
  if (typeof value !== 'number') return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}
```

#### 2.3 Обновить шаблон
```html
<!-- generic-table.component.html -->
<td *ngFor="let column of config.columns">
  <ng-container [ngSwitch]="column.type">
    <!-- Для badge типа -->
    <span *ngSwitchCase="'badge'" 
          [class]="getBadgeClass(getCellValue(row, column), column)">
      {{ formatCellValue(getCellValue(row, column), column) }}
    </span>
    
    <!-- Для ссылок -->
    <a *ngSwitchCase="'link'" 
       [routerLink]="getRouterLink(row, column)">
      {{ formatCellValue(getCellValue(row, column), column) }}
    </a>
    
    <!-- Для обычного текста -->
    <span *ngSwitchDefault>
      {{ formatCellValue(getCellValue(row, column), column) }}
    </span>
  </ng-container>
</td>
```

### Этап 3: Исправление конфигураций таблиц

#### 3.1 Проверить все table services
Найти все файлы с конфигурацией таблиц:
```bash
find src -name "*-table.service.ts" -type f
```

#### 3.2 Стандартизировать конфигурации
Создать интерфейс для конфигурации:
```typescript
// src/app/shared/model/table.model.ts
export interface TableColumn {
  key: string;              // Путь к данным (поддержка 'user.name')
  label: string;            // Заголовок колонки
  type: ColumnType;         // Тип данных
  sortable?: boolean;       // Можно ли сортировать
  filterable?: boolean;     // Можно ли фильтровать
  width?: string;          // Ширина колонки
  align?: 'left' | 'center' | 'right';
  format?: string;         // Формат для дат и чисел
  badgeConfig?: BadgeConfig; // Конфигурация для badges
  linkConfig?: LinkConfig;   // Конфигурация для ссылок
}

export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'boolean' 
  | 'badge' 
  | 'link' 
  | 'currency'
  | 'custom';

export interface BadgeConfig {
  [value: string]: {
    class: string;
    text?: string;
  };
}
```

#### 3.3 Пример исправленной конфигурации
```typescript
// users-table.service.ts
private getColumns(): TableColumn[] {
  return [
    {
      key: 'username',
      label: 'Username',
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      key: 'email',
      label: 'Email',
      type: 'link',
      linkConfig: {
        type: 'mailto',
        prefix: 'mailto:'
      }
    },
    {
      key: 'accountType',
      label: 'Account Type',
      type: 'badge',
      badgeConfig: {
        'PRIVATE': { 
          class: 'badge badge-info', 
          text: 'Private' 
        },
        'CORPORATE': { 
          class: 'badge badge-success', 
          text: 'Corporate' 
        }
      }
    },
    {
      key: 'createdAt',
      label: 'Created',
      type: 'date',
      format: 'short',
      sortable: true
    },
    {
      key: 'account.balance',  // Вложенное поле
      label: 'Balance',
      type: 'currency',
      align: 'right'
    }
  ];
}
```

### Этап 4: Тестирование исправлений

#### 4.1 Создать тестовые данные
В mock-server добавить разнообразные данные для проверки:
```json
{
  "content": [
    {
      "username": "test.user",
      "email": "test@example.com",
      "accountType": "PRIVATE",
      "createdAt": "2024-01-15T10:30:00Z",
      "account": {
        "balance": 1500.50
      },
      "status": null,  // Проверка null значений
      "description": "" // Проверка пустых строк
    }
  ]
}
```

#### 4.2 Проверить все типы колонок
- [ ] Текстовые поля отображаются
- [ ] Даты форматируются корректно
- [ ] Badges имеют правильные стили
- [ ] Null/undefined показываются как "-"
- [ ] Вложенные поля доступны
- [ ] Числа форматируются правильно

## Критерии приемки

### Основные
- [ ] Все данные отображаются в таблице
- [ ] Нет пустых колонок там, где должны быть данные
- [ ] Null/undefined значения обрабатываются корректно
- [ ] Вложенные объекты поддерживаются

### Дополнительные
- [ ] Добавлена поддержка новых типов колонок
- [ ] Улучшено форматирование данных
- [ ] Код переиспользуемый и расширяемый

## Отладочные инструменты

### 1. Добавить логирование
```typescript
getCellValue(row: any, column: TableColumn): any {
  console.log('Getting value for column:', column.key, 'from row:', row);
  // ... остальной код
}
```

### 2. Добавить отладочную колонку
```typescript
{
  key: '_debug',
  label: 'Debug',
  type: 'custom',
  customTemplate: (row) => JSON.stringify(row, null, 2)
}
```

### 3. Chrome DevTools
- Использовать точки останова в getCellValue
- Проверить значения в консоли
- Анализировать Network запросы

## Частые проблемы

1. **Проблема**: Колонка показывает `[object Object]`
   **Решение**: Нужно обращаться к конкретному полю объекта или добавить форматирование

2. **Проблема**: Даты показываются как timestamp
   **Решение**: Добавить форматирование дат в formatCellValue

3. **Проблема**: Boolean показывается как true/false
   **Решение**: Преобразовать в читаемый текст (Yes/No, Active/Inactive)

## Результат
После выполнения всех этапов, все таблицы в приложении должны корректно отображать данные во всех колонках.