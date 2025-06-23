# Feature Toggle Service

## Описание

Feature Toggle Service предоставляет централизованный механизм управления функциональными флагами (feature toggles) в приложении. Сервис позволяет динамически включать и выключать функциональность без необходимости перезапуска приложения.

## Архитектура

### Основные компоненты

1. **FeatureToggleService** (`src/app/shared/services/feature-toggle.service.ts`)
   - Основной сервис для работы с feature toggles
   - Загружает и кеширует состояние флагов
   - Автоматически обновляет флаги каждые 5 минут
   - Предоставляет синхронный и асинхронный API

2. **Интерфейсы** (`src/app/shared/model/feature-toggle.interface.ts`)
   - `FeatureToggle` - модель флага
   - `FeatureToggleResponse` - ответ от API
   - `FeatureToggleService` - интерфейс сервиса

3. **InjectionToken и хелперы** (`src/app/shared/services/feature-toggle.token.ts`)
   - `FEATURE_TOGGLES_SERVICE` - токен для dependency injection
   - `isToggleActive()` - функция для проверки флага без DI
   - `isToggleActive$()` - реактивная версия
   - `getFeatureToggles()` - получение списка всех флагов

## Использование

### Способ 1: Через вспомогательные функции (рекомендуется)

```typescript
import { Component } from '@angular/core';
import { isToggleActive, isToggleActive$ } from '@shared/services/feature-toggle.token';

@Component({
  selector: 'app-example',
  template: `
    <div *ngIf="showNewUI">
      <!-- Новый UI -->
    </div>
    <div *ngIf="showBulkOperations$ | async">
      <!-- Bulk operations -->
    </div>
  `
})
export class ExampleComponent {
  showNewUI = isToggleActive('new-ui');
  showBulkOperations$ = isToggleActive$('bulk-operations');

  onAction() {
    if (isToggleActive('advanced-search')) {
      // Выполнить расширенный поиск
    }
  }
}
```

### Способ 2: Через dependency injection

```typescript
import { Component, Inject } from '@angular/core';
import { FEATURE_TOGGLES_SERVICE } from '@shared/services/feature-toggle.token';

@Component({
  selector: 'app-example',
  template: `...`
})
export class ExampleComponent {
  constructor(
    @Inject(FEATURE_TOGGLES_SERVICE) private featureToggleService: any
  ) {}

  ngOnInit() {
    const isEnabled = this.featureToggleService.isToggleActive('new-ui');
    
    // Подписка на изменения
    this.featureToggleService.isToggleActive$('new-ui').subscribe(enabled => {
      console.log('New UI enabled:', enabled);
    });
  }
}
```

### Способ 3: Через сервис напрямую

```typescript
import { Component } from '@angular/core';
import { FeatureToggleService } from '@shared/services/feature-toggle.service';

@Component({
  selector: 'app-example',
  template: `...`
})
export class ExampleComponent {
  constructor(private featureToggleService: FeatureToggleService) {}

  ngOnInit() {
    // Синхронная проверка
    if (this.featureToggleService.isToggleActive('test')) {
      // Функция включена
    }

    // Асинхронная проверка
    this.featureToggleService.isToggleActive$('test').subscribe(enabled => {
      // Реагировать на изменения
    });

    // Принудительное обновление
    this.featureToggleService.refresh().subscribe();
  }
}
```

## Mock данные

В текущей реализации используются mock данные. Предустановленные флаги:

- `new-ui` - Новый дизайн интерфейса (включен)
- `advanced-search` - Расширенный поиск (выключен)
- `bulk-operations` - Массовые операции (включен)
- `email-notifications` - Email уведомления (включен)
- `test` - Тестовый флаг (включен)

### Изменение mock данных для тестирования

```typescript
// Только для разработки!
constructor(private featureToggleService: FeatureToggleService) {
  // Включить флаг
  this.featureToggleService.setToggle('my-feature', true);
  
  // Выключить флаг
  this.featureToggleService.setToggle('my-feature', false);
}
```

## Интеграция с бэкендом

Для подключения к реальному API необходимо:

1. Раскомментировать строку в методе `fetchFeatureToggles()`:
   ```typescript
   return this.http.get<FeatureToggleResponse>('/api/v1/feature-toggles');
   ```

2. Закомментировать или удалить mock реализацию

3. Убедиться, что бэкенд возвращает данные в формате:
   ```json
   {
     "toggles": [
       {
         "key": "feature-key",
         "enabled": true,
         "description": "Feature description",
         "createdAt": "2023-01-01T00:00:00Z",
         "updatedAt": "2023-01-01T00:00:00Z"
       }
     ],
     "timestamp": "2023-01-01T00:00:00Z"
   }
   ```

## Производительность

- Флаги кешируются в памяти через `BehaviorSubject`
- Автоматическое обновление каждые 5 минут
- Синхронный доступ к закешированным данным
- Минимальное влияние на производительность приложения

## Рекомендации

1. **Именование флагов**: используйте kebab-case (например, `new-payment-flow`)
2. **Группировка**: префиксы для связанных флагов (`payment-new-ui`, `payment-advanced-options`)
3. **Документирование**: всегда добавляйте описание при создании нового флага
4. **Очистка**: удаляйте неиспользуемые флаги из кода и базы данных

## Примеры использования в шаблонах

### Условное отображение

```html
<!-- Структурная директива -->
<div *ngIf="isToggleActive('new-ui')">
  Новый интерфейс
</div>

<!-- С async pipe -->
<div *ngIf="isToggleActive$('new-ui') | async">
  Новый интерфейс (реактивный)
</div>
```

### Условные классы

```html
<div [class.new-design]="isToggleActive('new-ui')"
     [class.advanced]="isToggleActive('advanced-mode')">
  Контент
</div>
```

### Отключение элементов

```html
<button [disabled]="!isToggleActive('bulk-operations')">
  Массовая операция
</button>
```

## Тестирование

При написании тестов можно мокировать сервис:

```typescript
const mockFeatureToggleService = {
  isToggleActive: (key: string) => key === 'test-feature',
  isToggleActive$: (key: string) => of(key === 'test-feature'),
  featureToggles: new Set(['test-feature'])
};

TestBed.configureTestingModule({
  providers: [
    {
      provide: FEATURE_TOGGLES_SERVICE,
      useValue: mockFeatureToggleService
    }
  ]
});
```