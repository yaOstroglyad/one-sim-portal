# HLD — Global FAB & Flyout Layout (Angular standalone + Signals)

> Область: только пункты **1) Глобальный кружок + flyout-лейаут** и **2) Лейаут, который пушит разный контент**. Цель — детализировать архитектуру для последующей реализации на **новом Angular** (standalone components + signals), без завязки на роутер.

---

## 0. Контекст и цели

**Кратко:** нужен единый глобальный «кружок» (FAB), видимый на всех маршрутах приложения, по клику на который открывается универсальная панель (**flyout layout**) поверх текущего UI. Панель не зависит от текущего маршрута и умеет динамически подставлять разные фичи (первой будет Support Chat).

**Основные цели:**

* Глобальная доступность FAB/лейаута независимо от роутера.
* Панель на CDK Overlay поверх любого экрана.
* Контейнер с левой колонкой (навигация по фичам) и зоной контента.
* Динамическая загрузка фичей через lazy `import()` и CDK Portal.
* Управление видимостью фич по ролям/пермишенам.
* Архитектура без жестких связей между контейнером и фичами.

**Не цели:**

* Реализация бэкенда/транспорта чата.
* Детализация всех будущих фичей.

---

## 1. Архитектура (верхний уровень)

### 1.1. Ключевые сущности

* **GlobalFabComponent** — кружок (FAB), standalone, всегда видим поверх контента.
* **FlyoutLayoutComponent** — контейнер-панель (дровер/панель), standalone, создаётся/монтируется по требованию через **CDK Overlay** и внутри размещает контент.
* **GlobalFlyoutService** — сервис управления состоянием лейаута (signals), централизует: `isOpen`, `activeFeatureKey`, `open/close/toggle`.
* **FeatureRegistryService** — реестр фич (signals): хранит **мета** (key/title/icon/roles) и **ленивый loader** компонента. Умеет выдавать `ComponentType`/`ComponentPortal` для произвольной фичи.
* **AuthService** (или адаптер к существующему auth) — даёт текущего пользователя/роли; конвертируем в сигнал.

### 1.2. Топология

* `AppComponent` провайдит `GlobalFlyoutService` и **однократно** рендерит `GlobalFabComponent` (через `*cdkPortal` или просто в дереве). FAB кликом вызывает `GlobalFlyoutService.open()`.
* При `open()` сервис лениво создаёт `OverlayRef` и монтирует `FlyoutLayoutComponent` через `ComponentPortal`.
* `FlyoutLayoutComponent` сам рисует шапку, левую колонку (список фич), справа — **контентная область** (`CdkPortalOutlet` или динамический `createComponent`). Выбор фичи переключает контент **без размонтирования** всего лейаута.

### 1.3. Зависимости и пакеты

* `@angular/cdk/overlay`, `@angular/cdk/portal`, `@angular/cdk/a11y` (FocusTrap), `@angular/cdk/layout` (media queries).
* Standalone компоненты, Signals (`signal`, `computed`, `effect`).
* Без модулей (или только для совместимости, но не обязательно).

---

## 2. Состояние и сигналы

### 2.1. Состояние лейаута (GlobalFlyoutService)

```ts
@Injectable({ providedIn: 'root' })
export class GlobalFlyoutService {
  // UI state
  readonly isOpen = signal(false);
  readonly activeFeatureKey = signal<string | null>(null);
  readonly params = signal<unknown | null>(null);

  // overlay instance (лениво)
  private overlayRef?: OverlayRef;

  constructor(
    private overlay: Overlay,
    private injector: Injector
  ) {}

  open(featureKey?: string, params?: unknown) {
    if (!this.overlayRef) {
      this.overlayRef = this.createOverlay();
      this.attachFlyout();
    }
    this.isOpen.set(true);
    if (featureKey) this.activeFeatureKey.set(featureKey);
    if (params !== undefined) this.params.set(params);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen() ? this.close() : this.open();
  }

  private createOverlay(): OverlayRef {
    const positionStrategy = this.overlay.position().global().right('0').top('0');
    const scrollStrategy = this.overlay.scrollStrategies.block();
    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'flyout-backdrop',
      panelClass: 'flyout-panel',
      positionStrategy,
      scrollStrategy,
      disposeOnNavigation: false,
    });
  }

  private attachFlyout() {
    const portal = new ComponentPortal(FlyoutLayoutComponent, null, this.injector);
    this.overlayRef!.attach(portal);
    this.overlayRef!.backdropClick().subscribe(() => this.close());
    // ESC close — через FlyoutLayoutComponent (FocusTrap + keydown handler)
  }
}
```

### 2.2. Реестр фич (FeatureRegistryService)

```ts
export type FeatureMeta = {
  key: string;
  title: string;
  icon?: string;
  roles?: string[]; // если пусто — доступно всем
  order?: number;
};

export type FeatureEntry = {
  meta: FeatureMeta;
  load: () => Promise<Type<unknown>>; // lazy loader standalone-компонента
};

@Injectable({ providedIn: 'root' })
export class FeatureRegistryService {
  private readonly _features = signal<FeatureEntry[]>([]);
  readonly features = this._features.asReadonly();

  register(entry: FeatureEntry) {
    const exists = this._features().some(f => f.meta.key === entry.meta.key);
    if (!exists) this._features.update(list => [...list, entry].sort(sortByOrder));
  }

  async resolveComponent(key: string): Promise<Type<unknown> | null> {
    const entry = this._features().find(f => f.meta.key === key);
    if (!entry) return null;
    return entry.load();
  }
}

function sortByOrder(a: FeatureEntry, b: FeatureEntry) {
  return (a.meta.order ?? 0) - (b.meta.order ?? 0);
}
```

### 2.3. Доступность фич по ролям (computed)

```ts
// Внутри FlyoutLayoutComponent
readonly user = toSignal(this.auth.user$); // если уже есть user$
readonly availableFeatures = computed(() => {
  const u = this.user();
  const roles = new Set(u?.roles ?? []);
  return this.registry.features().filter(f => {
    const required = f.meta.roles;
    return !required || required.some(r => roles.has(r));
  });
});
```

---

## 3. Компоненты (standalone)

### 3.1. GlobalFabComponent

**Назначение:** всегда видимый кружок. Может иметь бейдж, подсказку, короткое меню быстрых действий.

Ключевые моменты:

* Размещается в `AppComponent` (или через отдельный `Overlay` при bootstrap, но проще в дереве DOM).
* Клик — `flyout.open()`; длинное нажатие — опционально открыть меню.
* На мобильных — поднимать FAB над системной панелью/таббаром.

Скетч шаблона:

```html
<button class="fab" (click)="open()" aria-label="Open panel">
  ●
</button>
```

```ts
@Component({
  standalone: true,
  selector: 'app-global-fab',
  templateUrl: './global-fab.html',
  styleUrls: ['./global-fab.scss'],
})
export class GlobalFabComponent {
  constructor(private flyout: GlobalFlyoutService) {}
  open() { this.flyout.open(); }
}
```

### 3.2. FlyoutLayoutComponent

**Назначение:** контейнер панели. Слева — список фич (на первом этапе может быть скрыт, если всего один пункт), справа — динамический контент. Управляет фокусом и клавиатурой.

Ключевые моменты:

* **Фокус-менеджмент:** при открытии фокус в панель, `Esc` — закрыть, `Tab` — фокус внутри (FocusTrap).
* **Адаптив:** ширина 480–720px (desktop), на мобильных — fullscreen.
* **Контент:** динамически создаётся через `createComponent` (v17+) или `CdkPortalOutlet`.

Шаблон (эскиз):

```html
<div class="flyout" cdkTrapFocus (keydown.escape)="close()">
  <aside class="flyout__nav" *ngIf="availableFeatures().length > 1">
    <button *ngFor="let f of availableFeatures()"
            (click)="select(f.meta.key)"
            [class.active]="activeKey() === f.meta.key">
      <i class="icon" *ngIf="f.meta.icon"></i>
      {{ f.meta.title }}
    </button>
  </aside>

  <main class="flyout__content">
    <ng-container #host></ng-container>
  </main>
</div>
```

```ts
@Component({
  standalone: true,
  selector: 'app-flyout-layout',
  templateUrl: './flyout-layout.html',
  styleUrls: ['./flyout-layout.scss'],
  imports: [NgIf, NgFor, CdkTrapFocus],
})
export class FlyoutLayoutComponent implements OnInit, OnDestroy {
  private viewRef?: ComponentRef<unknown>;

  readonly activeKey = this.flyout.activeFeatureKey;
  readonly isOpen = this.flyout.isOpen;

  readonly user = toSignal(this.auth.user$);
  readonly availableFeatures = computed(() => /* как выше */);

  @ViewChild('host', { read: ViewContainerRef, static: true }) host!: ViewContainerRef;

  constructor(
    private flyout: GlobalFlyoutService,
    private registry: FeatureRegistryService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Реакция на смену activeFeatureKey
    effect(async () => {
      const key = this.activeKey();
      if (!key) return;
      await this.loadFeature(key);
    });

    // Если нет ключа — выбрать первую доступную фичу
    effect(() => {
      if (!this.activeKey() && this.availableFeatures().length) {
        this.select(this.availableFeatures()[0].meta.key);
      }
    });
  }

  async loadFeature(key: string) {
    // Очистить предыдущий компонент
    this.host.clear();
    this.viewRef?.destroy();

    const cmp = await this.registry.resolveComponent(key);
    if (!cmp) return;

    this.viewRef = this.host.createComponent(cmp);
    // опционально: передать параметры/DI токены
  }

  select(key: string) { this.flyout.activeFeatureKey.set(key); }
  close() { this.flyout.close(); }

  ngOnDestroy() { this.viewRef?.destroy(); }
}
```

---

## 4. Регистрация фич и ленивые загрузчики

### 4.1. API регистрации

```ts
export function provideFeature(entry: FeatureEntry): Provider {
  return {
    provide: FEATURE_REGISTRY_MULTI,
    multi: true,
    useValue: entry,
  };
}

export const FEATURE_REGISTRY_MULTI = new InjectionToken<FeatureEntry>('FEATURE_REGISTRY_MULTI');
```

В `AppConfig` (или корневом провайдинге) собираем мульти-провайдеры и регистрируем их в `FeatureRegistryService` при старте приложения:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    // ...
    { provide: APP_INITIALIZER, multi: true, useFactory: initFeatures, deps: [Injector] },
  ]
};

function initFeatures(injector: Injector) {
  return () => {
    const entries = injector.get(FEATURE_REGISTRY_MULTI, []);
    const registry = injector.get(FeatureRegistryService);
    entries.forEach(e => registry.register(e));
  };
}
```

### 4.2. Пример регистрации (Support Chat как первая фича)

```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideFeature({
      meta: { key: 'support-chat', title: 'Support Chat', icon: 'chat', order: 10 },
      load: () => import('./features/support-chat/support-chat.shell').then(m => m.SupportChatShellComponent)
    }),
  ]
});
```

> Любая новая фича добавляется аналогично, без правок в `FlyoutLayoutComponent`.

---

## 5. UI/UX, A11y и адаптив

* **Ширина:** desktop 560–640px (по умолчанию), tablet 80vw, mobile 100vw, высота 100vh. Переиспользуем CSS variables.
* **Фокус-ловушка:** `cdkTrapFocus` + возврат фокуса на FAB при закрытии.
* **Клавиатура:** `Esc` закрыть, `Ctrl/Cmd+K` — открыть (опционально), `Alt+ArrowUp/Down` — навигация по фичам.
* **Анимации:** аппаратно ускоренные трансформации (`translateX`), 200–250ms.
* **Backdrops:** кликом по backdrop — закрыть; игнорируем клики по контенту (stopPropagation).
* **Drag & Drop:**

    * **FAB перетаскиваемый** (`cdkDrag`) в пределах экрана; сохраняем позицию в `localStorage` отдельно для брейкпоинтов (mobile/tablet/desktop).
    * **Панель перетаскиваемая** за заголовок (titlebar) при режиме *floating* (`cdkDrag`), с прилипаниями к краям (snap zones: 16px). По умолчанию закреплена справа (docked-right).
* **Resize по горизонтали:**

    * Ручки слева/справа (`role="separator" aria-orientation="vertical"`) для изменения ширины; min/max: 420–960px, snap-точки: 480 / 560 / 640 / 720 / 840 / 960.
    * Двойной клик по ручке — переключение между **стандартной шириной** и **расширенным режимом** (максимальная ширина для текущего брейкпоинта).

---

## 6. Производительность и жизненный цикл

* Фичи грузятся **лениво** по первому обращению (`import()`).
* Сохраняем последний активный ключ в `sessionStorage` (опционально), восстанавливаем при открытии.
* **Кэш ширины/позиции:** сохраняем `width`, `dockedState` и координаты *floating*-режима в `localStorage` per breakpoints.
* **Throttling**: движение курсора при ресайзе/драге — через `requestAnimationFrame`/throttle (16ms).
* Уничтожение компонента фичи при переключении ключа (простая стратегия). Альтернатива — кэшировать `ComponentRef` в `Map<key, ComponentRef>` для моментального возврата (следить за памятью).
* Вынести тяжёлые зависимости (emoji/markdown) внутрь фичи, а не в общий бандл.

---

## 7. Ошибки, защита и телеметрия

* **Ошибки загрузки фичи:** показывать статус (skeleton + retry).
* **Права доступа:** если фича недоступна по ролям — не показывать; если активный ключ стал недоступен, переключиться на первую доступную фичу.
* **Логи/метрики:** событие открытия/закрытия, время первой отрисовки фичи, ошибки загрузки, CLS/INP метрики (опционально).

---

## 8. Тестирование

* **Юнит:**

    * GlobalFlyoutService: сигналы, последовательность open/close, lazy overlay attach.
    * FeatureRegistryService: регистрация/resolve/сортировка.
    * FlyoutLayoutComponent: фокус-ловушка, обработка Esc, переключение фич (моки loaders).
    * **Resize/Drag:** функции ограничения вьюпорта, снаппинг к брейкпоинтам, сохранение состояния.
* **Интеграционные (ComponentTestHarness или Playwright):**

    * FAB виден в любом роуте, открывает панель.
    * Навигация по фичам, ленивые загрузки.
    * Backdrop/Esc закрывают панель и возвращают фокус на FAB.
    * **Проверка перетаскивания FAB/панели** + восстановление позиции после перезагрузки.
    * **Проверка ресайза** по ручкам и снаппинга к контрольным ширинам.

---

## 9. Пошаговый план внедрения (для данного HLD)

1. **Infra:** внедрить CDK Overlay/Portal, добавить стили `flyout-backdrop`/`flyout-panel`.
2. **State:** написать `GlobalFlyoutService` c signals, открыть/закрыть/переключить.
3. **Host:** добавить `GlobalFabComponent` в `AppComponent` и связать с сервисом.
4. **Container:** реализовать `FlyoutLayoutComponent` с FocusTrap и динамическим хостом.
5. **Registry:** реализовать `FeatureRegistryService` + мульти-провайдер `provideFeature` + `APP_INITIALIZER`.
6. **Auth:** интегрировать `AuthService` → `availableFeatures` (computed).
7. **First feature:** зарегистрировать `support-chat` (заглушка standalone).
8. **Tests & polish:** UX мелочи, анимации, ошибки, адаптив.

---

## 10. Acceptance Criteria

* FAB всегда видим поверх любых страниц и **может быть перетащен** пользователем в пределах экрана; позиция сохраняется per breakpoint.
* Клик по FAB открывает панель, `Esc` и клик по backdrop — закрывают; возврат фокуса на FAB.
* Панель рендерится через CDK Overlay, по умолчанию **задокана справа**, корректная ширина на разных брейкпоинтах.
* В панели отображается список доступных фич, отфильтрованный по ролям.
* Переключение фич меняет контентную область без перезагрузки страницы.
* Фичи грузятся лениво через `import()` и создаются как standalone компоненты.
* **Панель можно перетаскивать** в режиме *floating*; предусмотрены **snap-зоны** к левому/правому краю.
* **Горизонтальный ресайз** с ручек слева/справа; min/max и **snap-точки** работают; **двойной клик** по ручке — переключение стандарт/расширенный режим.
* Фокус при открытии внутри панели, при закрытии — возвращается на FAB.

---

## 11. Риски и смягчение

* **Фрагментация стилей/слоёв:** изолировать панель отдельным корневым контейнером с собственной темой/z-index.
* **Утечки памяти при кэшировании компонентов:** по умолчанию не кэшировать; если кэшировать — добавить LRU и dispose.
* **Конфликты скролла/порталов:** использовать `scrollStrategies.block()` и убедиться, что фон не прокручивается.
* **Сложные зависимости фичи:** строго держать их внутри lazy-бандлов.
* **Доступность ресайза/драга:** у ручек `role="separator"`, поддержать клавиши `ArrowLeft/Right` (±16px) с модификаторами `Shift` (±64px); у draggable-заголовка — доступный альтернативный control (кнопка «Сбросить позицию»).

---

## 13. Drag & Drop и Resize — детализация реализации

### 13.1. Перетаскиваемый FAB

* Шаблон: `<button cdkDrag cdkDragBoundary="body" cdkDragLockAxis="x|y" ...>`
* Сигналы: `fabPos = signal<{x:number,y:number}>()`; при `cdkDragMoved` обновлять; при `cdkDragEnded` — класть в `localStorage`.
* Ограничения: держать FAB внутри вьюпорта (margin 8px), учитывать `safe-area-inset` на iOS.

### 13.2. Режимы панели: docked vs floating

* `dockedState = signal<'right'|'left'|'floating'>('right')`.
* Кнопки в хедере: «Открепить»/«Прикрепить слева/справа».
* При `floating` активируем `cdkDrag` на контейнере; позиция сохраняется (`panelPos` сигнал) и восстанавливается при открытии.
* Snap: если `x < 16px` → `left`, если `viewportWidth - (x+width) < 16px` → `right` (с предложением закрепить).

### 13.3. Ресайз по горизонтали

* Ручки: `<div class="resize-handle left" role="separator" tabindex="0">` и аналогично `right`.
* Сигналы: `width = signal<number>(600)`, `min=420`, `max=960`, `snaps=[480,560,640,720,840,960]`.
* Алгоритм: при `pointerdown` — захватываем; на `pointermove` — вычисляем новую ширину (знак зависит от ручки), ограничиваем `min/max`, снапим при близости `< 12px`.
* Клавиатура: `ArrowLeft/Right` изменяют ширину; `Enter` на ручке — «переключить стандарт/расширенный».
* Двойной клик: toggle `width` между `defaultWidth` и `maxForBreakpoint`.

### 13.4. Persist & responsive

* Ключи в `localStorage`: `flyout.width.desktop`, `flyout.width.tablet`, `flyout.fabPos.mobile`, `flyout.dockedState.*`.
* Слежение за брейкпоинтами через `BreakpointObserver` (CDK) → сигнал текущего брейкпоинта.

### 13.5. Псевдокод сигналов

```ts
const bp = signal<'mobile'|'tablet'|'desktop'>('desktop');
const widthMap = signal<Record<string, number>>({ desktop: 600, tablet: 0.8*vw, mobile: vw });
const width = computed(() => widthMap()[bp()]);

function setWidth(px: number) {
  const clamped = clamp(px, min, max);
  widthMap.update(m => ({ ...m, [bp()]: snap(clamped, snaps) }));
  saveLocal('flyout.width.'+bp(), clamped);
}
```

### 13.6. Стили и слой

* Высокий `z-index` поверх приложений, но ниже глобальных модалок (если есть). Предусмотреть CSS var `--flyout-z: 1050`.
* Курсор для ручек: `ew-resize`; визуальная зона ≥ 12px для удобства.

### 13.7. Телееметрия UX

* Считать: частота использования drag/resize, популярные ширины, доля *floating*.
* Ограничить объём логов, не собирать координаты, если это чувствительно.
