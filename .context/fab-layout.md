# HLD — Global FAB & Flyout Layout (Angular Standalone + Signals)

> **Статус:** Реализовано
> **Обновлено:** 2025-10-24

Глобальный FAB (Floating Action Button) + универсальная flyout панель для приложения. Standalone components + Signals + CDK Overlay.

---

## Обзор

**Цель:** Единый глобальный кружок (FAB), видимый на всех страницах приложения. Клик открывает универсальную панель (flyout) поверх текущего UI. Панель динамически подставляет разные фичи (первая - Support Chat).

**Ключевые возможности:**
- Глобальная доступность независимо от маршрута
- Панель через CDK Overlay поверх любого экрана
- Динамическая загрузка фичей через lazy `import()`
- Управление видимостью по ролям через AuthService
- Route-specific buttons с автоматическим cleanup
- Standalone components + Signals архитектура

---

## Архитектура

### Ключевые компоненты

```
┌─────────────────────────────────────┐
│        AppComponent                 │
│  ┌────────────────────────────┐    │
│  │   GlobalFabComponent       │    │  ← FAB кнопка
│  │   (всегда видима)          │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
           ↓ (клик)
┌─────────────────────────────────────┐
│    CDK Overlay (z-index: 1000)      │
│  ┌────────────────────────────┐    │
│  │  FlyoutLayoutComponent     │    │  ← Overlay панель
│  │  ┌──────────────────────┐  │    │
│  │  │  Dynamic Content     │  │    │  ← Lazy-loaded feature
│  │  │  (Portal)            │  │    │
│  │  └──────────────────────┘  │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Сервисы

**1. GlobalFlyoutService**
- Управление состоянием панели (открыта/закрыта)
- CDK Overlay lifecycle
- Signal-based state: `isOpen`, `activeFeatureKey`

**2. FeatureRegistryService**
- Реестр доступных фич
- Lazy loading компонентов
- Резолвинг компонентов по ключу

**3. FabConfigService**
- Конфигурация FAB кнопок
- Динамическое добавление/удаление кнопок
- Route-specific buttons

**4. AuthService** (существующий)
- Проверка ролей пользователя
- Фильтрация доступных фич/кнопок

---

## Регистрация Фич и Кнопок

### Подход через DI Tokens

Используем современный Angular подход с injection tokens и `provideAppInitializer`.

```typescript
// main.ts - Глобальные фичи/кнопки
bootstrapApplication(AppComponent, {
  providers: [
    provideFabLayout(),  // Инициализация системы

    // Глобальная кнопка - видна везде
    provideFabButton({
      id: 'support-chat',
      label: 'Чаты',
      icon: 'chat',
      order: 10,
      // roles не указаны = видна всем
      hasMenu: false,
      action: 'component',
      target: 'support-chat'
    }),

    // Глобальная фича
    provideFeature({
      meta: {
        key: 'support-chat',
        title: 'Support Chat',
        icon: '💬',
        order: 10
        // roles не указаны = доступна всем
      },
      load: () => import('./app/features/support-chat/support-chat.shell.component')
        .then(m => m.SupportChatShellComponent)
    })
  ]
});
```

### Route-Specific Buttons

```typescript
// customers.routes.ts - Кнопки для конкретного маршрута
export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    component: CustomersComponent,
    providers: [
      // Кнопка видна ТОЛЬКО на /customers
      provideFabButton({
        id: 'create-customer',
        label: 'Создать',
        icon: 'plus',
        order: 20,
        roles: ['admin'],  // Только админы
        action: 'route',
        target: '/customers/create'
      })
    ]
  }
];
```

**Автоматический cleanup:** При уходе с маршрута кнопки автоматически удаляются через `DestroyRef`.

---

## Проверка Permissions

### Интеграция с AuthService

Используем существующую систему ролей через `AuthService`:

```typescript
// feature-provider.ts
const authService = inject(AuthService);
const requiredRoles = button.roles;
const allowed = !requiredRoles || requiredRoles.length === 0
  || requiredRoles.some(role => authService.hasPermission(role));
```

**Логика:**
- Если `roles` не указаны или пустой массив → доступно всем
- Если указаны роли → проверяем наличие хотя бы одной через `AuthService.hasPermission()`
- Синхронная проверка (роли уже загружены в памяти)

**Примеры:**
```typescript
// Видно всем
provideFabButton({ id: 'chat', ... })  // roles не указаны

// Только админам
provideFabButton({ id: 'admin-panel', roles: ['admin'], ... })

// Админам и саппорту
provideFabButton({ id: 'tickets', roles: ['admin', 'support'], ... })
```

---

## Модели

### FabButtonConfig

```typescript
interface FabButtonConfig {
  id: string;              // Уникальный ID
  label: string;           // Название кнопки
  icon: string;            // Иконка (CoreUI name или путь к SVG)
  order: number;           // Порядок сортировки
  roles?: string[];        // Роли для доступа (undefined = всем)
  hasMenu: boolean;        // Есть ли подменю
  menuItems?: FabMenuItem[];  // Элементы подменю
  action: 'route' | 'component' | 'callback' | 'external';
  target?: string;         // Цель действия
}
```

### FeatureEntry

```typescript
interface FeatureMeta {
  key: string;             // Уникальный ключ фичи
  title: string;           // Название
  icon?: string;           // Иконка
  roles?: string[];        // Роли для доступа
  order?: number;          // Порядок сортировки
}

interface FeatureEntry {
  meta: FeatureMeta;
  load: () => Promise<Type<unknown>>;  // Lazy loader
}
```

---

## Компоненты

### GlobalFabComponent

**Расположение:** `src/app/shared/components/fab-layout/components/global-fab/`

**Назначение:** Глобальная FAB кнопка, всегда видимая поверх контента.

**Особенности:**
- Standalone component
- OnPush change detection
- Signals для состояния
- Динамические кнопки из `FabConfigService`
- Поддержка меню (опционально)

**Условное отображение:**
```typescript
// Скрывается если нет ни одной кнопки (все отфильтровались по permissions)
readonly 
hasButtons = computed(() => {
  const config = this.configuration();
  return config?.buttons && config.buttons.length > 0;
});
```

### FlyoutLayoutComponent

**Расположение:** `src/app/shared/components/fab-layout/components/flyout-layout/`

**Назначение:** Контейнер панели с динамической загрузкой контента.

**Особенности:**
- CDK Portal для динамического контента
- Lazy loading фич
- Фокус-менеджмент (FocusTrap)
- Адаптивная ширина

---

## Сервисы - Детали Реализации

### GlobalFlyoutService

```typescript
@Injectable({ providedIn: 'root' })
export class GlobalFlyoutService {
  readonly isOpen = signal(false);
  readonly activeFeatureKey = signal<string | null>(null);

  open(featureKey?: string): void {
    if (!this.overlayRef) {
      this.createOverlay();
      this.attachFlyout();
    }
    this.isOpen.set(true);
    if (featureKey) this.activeFeatureKey.set(featureKey);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
```

### FeatureRegistryService

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureRegistryService {
  private readonly _features = signal<FeatureEntry[]>([]);
  readonly features = this._features.asReadonly();

  register(entry: FeatureEntry): void {
    // Регистрация с сортировкой по order
  }

  async resolveComponent(key: string): Promise<Type<unknown> | null> {
    const entry = this._features().find(f => f.meta.key === key);
    if (!entry) return null;
    return entry.load();  // Lazy import
  }
}
```

---

## Provider Functions (DI Tokens)

### provideFabLayout

Инициализирует систему FAB Layout.

```typescript
export function provideFabLayout(): EnvironmentProviders {
  return makeEnvironmentProviders([
    FeatureRegistryService,
    FabConfigService
  ]);
}
```

### provideFeature

Регистрирует фичу с проверкой permissions.

```typescript
export function provideFeature(entry: FeatureEntry): EnvironmentProviders {
  return makeEnvironmentProviders([
    // 1. Токен для мета-информации
    { provide: FAB_FEATURES, multi: true, useValue: entry },

    // 2. Инициализатор с проверкой permissions
    {
      provide: FAB_FEATURE_INITIALIZER,
      multi: true,
      useFactory: () => {
        const registry = inject(FeatureRegistryService);
        const authService = inject(AuthService);
        const destroyRef = inject(DestroyRef, { optional: true });

        return () => {
          // Permission check
          const allowed = !entry.meta.roles || entry.meta.roles.length === 0
            || entry.meta.roles.some(role => authService.hasPermission(role));

          if (!allowed) return;

          // Register
          registry.register(entry);

          // Auto-cleanup for routes
          if (destroyRef) {
            destroyRef.onDestroy(() => registry.unregister(entry.meta.key));
          }
        };
      }
    },

    // 3. Запуск инициализации
    provideAppInitializer(() => {
      const initializers = inject(FAB_FEATURE_INITIALIZER);
      initializers.forEach(init => init());
    })
  ]);
}
```

### provideFabButton

Аналогичная логика для кнопок.

---

## UI/UX

### Адаптив

- **Desktop:** ширина панели 560–640px
- **Tablet:** 80vw
- **Mobile:** 100vw (fullscreen)
- **Высота:** 100vh

### Фокус-менеджмент

- `cdkTrapFocus` внутри панели
- `Esc` закрывает панель
- Backdrop click закрывает панель
- Фокус возвращается на FAB при закрытии

### Анимации

- Аппаратное ускорение (`transform: translateX`)
- Длительность: 200–250ms
- Easing: ease-in-out

---

## Производительность

### Lazy Loading

Все фичи грузятся по требованию:
```typescript
load: () => import('./features/chat/chat.component')
  .then(m => m.ChatComponent)
```

### Lifecycle

- Overlay создаётся лениво при первом открытии
- Фичи загружаются при первом переключении
- Компоненты фичей пересоздаются при переключении

### Bundle Optimization

- Тяжёлые зависимости внутри фич (не в main bundle)
- Tree-shaking для неиспользуемых фич
- Preload hints для популярных фич (опционально)

---

## Тестирование

### Unit Tests

```typescript
describe('GlobalFlyoutService', () => {
  it('should open and close flyout', () => {
    service.open();
    expect(service.isOpen()).toBe(true);

    service.close();
    expect(service.isOpen()).toBe(false);
  });
});

describe('FeatureRegistryService', () => {
  it('should register and resolve features', async () => {
    registry.register(mockFeature);
    const cmp = await registry.resolveComponent('test-key');
    expect(cmp).toBeDefined();
  });
});
```

### Integration Tests

- FAB видим на всех маршрутах
- Клик открывает панель
- Backdrop/Esc закрывают панель
- Lazy loading фич работает
- Permissions фильтруют кнопки/фичи

---

## Файловая Структура

```
src/app/shared/components/fab-layout/
├── components/
│   ├── global-fab/
│   │   ├── global-fab.component.ts
│   │   ├── global-fab.component.html
│   │   └── global-fab.component.scss
│   └── flyout-layout/
│       ├── flyout-layout.component.ts
│       ├── flyout-layout.component.html
│       └── flyout-layout.component.scss
├── services/
│   ├── global-flyout.service.ts
│   ├── feature-registry.service.ts
│   └── fab-config.service.ts
├── models/
│   └── fab-layout.model.ts
├── providers/
│   └── feature-provider.ts
└── index.ts
```

---

## Пример Использования

### В AppComponent

```typescript
@Component({
  selector: 'app-root',
  template: `
    <router-outlet />
    <app-global-fab />  <!-- Всегда видима -->
    <app-flyout-layout />  <!-- Overlay, управляется сервисом -->
  `,
  standalone: true,
  imports: [RouterOutlet, GlobalFabComponent, FlyoutLayoutComponent]
})
export class AppComponent {}
```

### В main.ts

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideFabLayout(),

    provideFabButton({ id: 'chat', ... }),
    provideFeature({ meta: { 
			key: 'chat', ... 
      }, 
      load: '' })
  ]
});
```

### В Route

```typescript
{
  path: 'admin',
  providers: [
    provideFabButton({
      id: 'admin-tools',
      roles: ['admin'],
      ...
    })
  ]
}
```

---

## Миграция и Обновления

### Добавление новой фичи

1. Создать standalone компонент
2. Зарегистрировать через `provideFeature` в main.ts или route
3. Опционально добавить кнопку через `provideFabButton`

### Изменение permissions

Обновить массив `roles` в конфигурации кнопки/фичи.

---

## Ограничения и Будущие Улучшения

**Текущие ограничения:**
- Нет drag & drop для FAB
- Нет resize панели
- Нет floating режима
- Нет кэширования компонентов фичи

**Планы:**
- [ ] Перетаскиваемый FAB с сохранением позиции
- [ ] Resize панели с snap-точками
- [ ] Floating режим панели
- [ ] Кэширование ComponentRef для быстрого переключения

---

## Acceptance Criteria

✅ FAB всегда видим поверх всех страниц
✅ Клик по FAB открывает панель
✅ Esc и backdrop click закрывают панель
✅ Панель через CDK Overlay с правильным z-index
✅ Фичи грузятся лениво через import()
✅ Permissions проверяются через AuthService
✅ Route-specific кнопки автоматически cleanup
✅ Фокус возвращается на FAB при закрытии
✅ FAB скрывается если нет доступных кнопок

---

**Последнее обновление:** 2025-10-24
**Версия:** 1.0 (Реализовано)
