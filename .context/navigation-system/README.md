# Navigation System - One Sim Portal

## Overview

The navigation system in One Sim Portal is built on a multi-level architecture using Angular Router, CoreUI components, and a custom layout system. The main principle is protected routes with role-based access and adaptive UI.

## Navigation Architecture

### 🏗️ Main Structure

```
Navigation System
├── App Routing Module          # Main application routing
├── Default Layout Container    # Main layout with sidebar/header/footer
├── Navigation Configuration    # Menu configuration (_nav.ts)
├── Authorization Guards        # Route protection (AuthGuardService)
└── Supporting Services        # VisualService, LanguageService, etc.
```

## Navigation System Components

### 1. **App Routing Module** (`src/app/app-routing.module.ts`)

#### Purpose
Main application routing module defining core routes and entry points.

#### Key Routes
```typescript
const routes: Routes = [
  {
    path: 'home',                              // Основное приложение
    loadChildren: () => import('./containers/default-layout/default-layout.module'),
    canActivate: mapToCanActivate([AuthGuardService])  // Защищено guard'ом
  },
  {
    path: 'login',                             // Страница входа
    loadChildren: () => import('./views/pages/login/login.module')
  },
  {
    path: 'register',                          // Регистрация
    loadChildren: () => import('./views/pages/register/register.module')
  },
  // Error pages: 404, 403, 500
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: '/404' }          // Fallback для 404
];
```

#### Особенности
- **Lazy Loading**: все модули загружаются по требованию
- **Guard Protection**: основное приложение защищено `AuthGuardService`
- **Error Handling**: специальные страницы для ошибок
- **Default Redirect**: неавторизованные пользователи перенаправляются на login

### 2. **Default Layout Container** (`src/app/containers/default-layout/`)

#### Файловая структура
```
default-layout/
├── default-layout.component.ts        # Основной layout компонент
├── default-layout.component.html      # HTML шаблон layout'а
├── default-layout.component.scss      # Стили layout'а
├── default-layout-routing.module.ts   # Роутинг внутри layout'а
├── default-layout.module.ts           # Модуль layout'а
├── _nav.ts                           # Конфигурация навигационного меню
├── default-header/                   # Компонент header'а
├── default-footer/                   # Компонент footer'а
└── sidebar-skeleton/                 # Skeleton loader для sidebar'а
```

### 3. **Default Layout Component** (`default-layout.component.ts`)

#### Назначение
Главный контейнер приложения, управляющий layout'ом, sidebar'ом, брендингом и навигацией.

#### Основные возможности
```typescript
export class DefaultLayoutComponent implements OnInit, OnDestroy {
  // Внедрение сервисов
  authService = inject(AuthService);           // Авторизация
  translateService = inject(TranslateService); // Локализация
  visualService = inject(VisualService);       // Визуальная конфигурация
  cdr = inject(ChangeDetectorRef);            // Change detection

  // Состояние компонента
  public translatedNavItems: INavData[];      // Переведенные пункты меню
  public brandFull$ = new BehaviorSubject<BrandFull | null>(null); // Брендинг
  public brandFull: BrandFull;                // Логотип (полный)
  public brandNarrow: BrandNarrow;            // Логотип (узкий)
}
```

#### Ключевые методы
- **`filterAndTranslateNavItems()`** - фильтрация меню по правам доступа и перевод
- **`updateBranding()`** - обновление брендинга на основе конфигурации
- **`processNavItems()`** - рекурсивная обработка пунктов меню с проверкой прав

### 4. **Navigation Configuration** (`_nav.ts`)

#### Назначение
Декларативная конфигурация всех пунктов меню с указанием прав доступа.

#### Структура конфигурации
```typescript
export const navItems: any[] = [
  {
    name: 'nav.companies',              // Ключ для перевода
    url: 'companies',                   // URL маршрута
    iconComponent: {name: 'cil-industry'}, // CoreUI иконка
    permissions: [ADMIN_PERMISSION]     // Требуемые права
  },
  {
    name: 'nav.customers',
    url: 'customers',
    iconComponent: {name: 'cil-group'},
    permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION]
  },
  // ... остальные пункты меню
  {
    name: 'nav.settings',
    url: '/home/settings',
    iconComponent: {name: 'cil-settings'},
    children: [                         // Подменю
      {
        name: 'nav.general',
        url: '/home/settings/general'
      },
      // ... подпункты
    ]
  }
];
```

#### Типы разрешений
- **`ADMIN_PERMISSION`** - полный доступ администратора
- **`CUSTOMER_PERMISSION`** - доступ клиента
- **`SUPPORT_PERMISSION`** - доступ службы поддержки

### 5. **Default Layout Routing** (`default-layout-routing.module.ts`)

#### Назначение
Внутренний роутинг для основного приложения с lazy loading модулей.

#### Маршруты приложения
```typescript
const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'customers' }, // Главная страница
      
      // Feature modules
      { path: 'providers', loadChildren: () => import('../../views/providers/providers.module') },
      { path: 'products', loadChildren: () => import('../../views/products/products.module') },
      { path: 'inventory', loadChildren: () => import('../../views/inventory/inventory.module') },
      { path: 'customers', loadChildren: () => import('../../views/customers/customers.module') },
      { path: 'orders', loadChildren: () => import('../../views/orders/orders.module') },
      { path: 'email-logs', loadComponent: () => import('../../views/email-logs/email-logs.component').then(m => m.EmailLogsComponent) },
      { path: 'users', loadChildren: () => import('../../views/users/users.module') },
      
      // Standalone components
      { 
        path: 'companies', 
        loadComponent: () => import('../../views/companies/companies.component').then(m => m.CompaniesComponent)
      },
      
      // Settings module
      { path: 'settings', loadChildren: () => import('../../views/settings/settings-routing') }
    ]
  }
];
```

## Supporting Components

### 6. **Default Header Component** (`default-header/`)

#### Назначение
Верхняя панель приложения с функциями пользователя и настроек.

#### Основные функции
```typescript
export class DefaultHeaderComponent extends HeaderComponent {
  @Input() sidebarId: string = "sidebar";  // ID связанного sidebar'а

  constructor(
    private languageService: LanguageService,  // Смена языка
    private loginService: LoginService         // Выход из системы
  ) {}

  changeLang(lang: string) {                  // Переключение языка
    this.languageService.setLanguage(lang);
  }

  logout(): void {                            // Выход пользователя
    this.loginService.logout();
  }
}
```

### 7. **Default Footer Component** (`default-footer/`)

#### Назначение
Нижняя панель приложения (в настоящее время минимальная).

```typescript
export class DefaultFooterComponent extends FooterComponent {
  // Расширяет базовый FooterComponent от CoreUI
}
```

### 8. **Sidebar Skeleton Component** (`sidebar-skeleton/`)

#### Назначение
Loading state для sidebar'а во время загрузки конфигурации брендинга.

```typescript
export class SidebarSkeletonComponent {
  @Input() itemsCount: number = 8;  // Количество skeleton элементов
}
```

## Supporting Services

### 9. **AuthGuardService** (`src/app/shared/auth/auth-guard.service.ts`)

#### Назначение
Защита маршрутов от неавторизованного доступа.

#### Основная логика
```typescript
export class AuthGuardService implements CanActivate, CanActivateChild {
  constructor(
    private auth: AuthService,     // Сервис авторизации
    private router: Router         // Навигация
  ) {}

  private isAuthenticated(): Observable<boolean> {
    return this.auth.checkAndRefreshToken().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['login']);  // Редирект на login
          return false;
        }
        return true;
      }),
      catchError(() => {
        this.router.navigate(['login']);
        return [false];
      })
    );
  }

  public canActivate(): Observable<boolean> {
    return this.isAuthenticated();
  }

  public canActivateChild(): Observable<boolean> {
    return this.isAuthenticated();
  }
}
```

### 10. **VisualService** (referenced)

#### Назначение
Управление визуальной конфигурацией приложения (брендинг, темы, логотипы).

#### Интеграция с Navigation
- Загружает конфигурацию брендинга для sidebar'а
- Обновляет логотипы и визуальные элементы
- Поддерживает реактивные обновления через Observable streams

### 11. **LanguageService** (referenced)

#### Назначение
Управление локализацией и переводами в приложении.

#### Интеграция с Navigation
- Переводит названия пунктов меню
- Реагирует на смену языка в header'е
- Обновляет весь интерфейс при смене локали

## Workflow навигации

### 🚀 **Инициализация приложения**

1. **Запуск роутинга** - App Routing Module определяет маршрут
2. **Проверка авторизации** - AuthGuardService проверяет токен
3. **Загрузка Layout** - Default Layout Module загружается lazy
4. **Инициализация Layout** - Default Layout Component начинает работу
5. **Загрузка конфигурации** - Брендинг и переводы загружаются
6. **Рендер Navigation** - Sidebar с меню отображается
7. **Feature Loading** - Конкретная страница загружается в router-outlet

### 🔐 **Процесс авторизации навигации**

1. **Проверка токена** - AuthGuardService валидирует JWT
2. **Загрузка прав** - AuthService определяет permissions пользователя
3. **Фильтрация меню** - Только доступные пункты отображаются
4. **Динамическое обновление** - Меню реагирует на изменения прав

### 🌐 **Локализация навигации**

1. **Определение языка** - LanguageService получает текущую локаль
2. **Перевод пунктов** - Все названия меню переводятся
3. **Реактивность** - При смене языка меню обновляется автоматически

## Преимущества архитектуры

### ✅ **Безопасность**
- Все маршруты защищены guard'ами
- Меню фильтруется по правам доступа
- Автоматическая проверка токенов

### ✅ **Производительность**
- Lazy loading всех модулей
- OnPush change detection
- Skeleton states для улучшения UX

### ✅ **Гибкость**
- Декларативная конфигурация меню
- Поддержка многоуровневого меню
- Динамическое брендирование

### ✅ **Поддерживаемость**
- Четкое разделение ответственности
- Переиспользуемые компоненты
- Centralized конфигурация

### ✅ **UX/UI**
- Адаптивный дизайн
- Skeleton loading states
- Smooth transitions
- Консистентная навигация 