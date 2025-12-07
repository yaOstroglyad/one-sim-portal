# Миграция transaction-orders-table на GenericTable

## Цель
Заменить кастомную MatTable на `GenericTableComponent` для унификации UI.

---

## Текущее состояние

- 11 колонок: type, status, productName, productPrice, paymentMethod, createdAt, createdBy, updatedAt, updatedBy, externalTransactionId, triggerType
- Данные: `TransactionDataService.getTransactions(customerId, subscriberId)`
- Есть Empty State
- Нет пагинации/сортировки

---

## Задачи

### 1. Изучить примеры GenericTable в проекте

Посмотри как реализованы:
- `src/app/views/users/components/user-list/` — компонент с GenericTable
- `src/app/views/users/services/users-table.service.ts` — TableService с конфигурацией колонок
- `src/app/shared/components/generic-table/` — сам компонент (для понимания API)

Обрати внимание на:
- Как создаётся `TableConfig` с колонками
- Как используется `translatePrefix` для заголовков
- Как передаются `config$` и `data$` в компонент
- Как работает `TemplateType` для разных типов данных (Date, Text, Custom)

---

### 2. Создать TableService

Создай `transaction-orders-table.service.ts` по аналогии с `users-table.service.ts`:
- Extend от `TableConfigAbstractService<TransactionOrder>`
- Настрой колонки согласно текущим `displayedColumns`
- `translatePrefix: 'transactionOrdersTable.'`
- Пагинация не нужна (`enabled: false`)
- Меню и кнопки не нужны

**Особенность:** колонка `productPrice` отображает `price + currency` — подумай как это реализовать (custom template или вычисляемое поле).

---

### 3. Обновить компонент

- Добавить `TransactionOrdersTableService` в providers
- Заменить прямое использование `transactionsView$` на работу через TableService
- Убрать `MatTableModule` из imports
- Добавить `GenericTableComponent`
- Обработать loading и empty state

---

### 4. Обновить шаблон

- Заменить `<table mat-table>` на `<generic-table>`
- Использовать новый синтаксис `@if` / `@for` вместо `*ngIf`
- Сохранить EmptyState компонент

---

### 5. Очистить

- Удалить неиспользуемые импорты (MatTableModule, DatePipe если не нужен)
- Упростить стили (GenericTable имеет свои)

---

## Чек-лист

- [ ] TableService создан и настроен
- [ ] Компонент использует GenericTableComponent
- [ ] Колонка productPrice корректно отображает price + currency
- [ ] Даты форматируются правильно
- [ ] Empty State работает
- [ ] Loading состояние работает
- [ ] Нет ошибок в консоли
- [ ] Визуально таблица выглядит как другие GenericTable в проекте

---

## Полезные файлы для изучения

| Файл | Что смотреть |
|------|--------------|
| `src/app/views/users/services/users-table.service.ts` | Структура TableService, конфигурация колонок |
| `src/app/views/users/components/user-list/user-list.component.ts` | Как подключается GenericTable |
| `src/app/views/users/components/user-list/user-list.component.html` | Как используется в шаблоне |
| `src/app/shared/models/ui/table-config.model.ts` | Интерфейс TableConfig |
| `src/app/shared/components/generic-table/generic-table.component.ts` | API компонента (inputs/outputs) |
