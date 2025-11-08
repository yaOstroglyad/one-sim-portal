# Navigation System - Краткая сводка

## 🎯 Суть системы
Многоуровневая система навигации с ролевым доступом, построенная на Angular Router + CoreUI с динамическим брендингом и локализацией.

## 📁 Ключевые файлы
```
src/app/
├── app-routing.module.ts                    # Главный роутинг
└── containers/default-layout/
    ├── default-layout.component.ts          # Основной layout
    ├── default-layout-routing.module.ts     # Внутренний роутинг
    ├── _nav.ts                             # Конфигурация меню
    ├── default-header/                     # Header компонент
    ├── default-footer/                     # Footer компонент
    └── sidebar-skeleton/                   # Loading state
```

## ⚡ Быстрый обзор компонентов

| Компонент | Назначение | Ключевые функции |
|-----------|------------|------------------|
| **App Routing** | Главная точка входа | Lazy loading, Guard protection, Error handling |
| **Default Layout** | Основной контейнер | Sidebar управление, Брендинг, Переводы |
| **Navigation Config** | Конфигурация меню | Декларативное меню, Права доступа, Иконки |
| **Header** | Верхняя панель | Смена языка, Выход из системы |
| **AuthGuard** | Защита роутов | JWT проверка, Редиректы |
| **Sidebar Skeleton** | Loading UI | UX во время загрузки |

## 🔒 Система прав доступа

### Типы пользователей
- **ADMIN_PERMISSION** - полный доступ ко всем разделам
- **CUSTOMER_PERMISSION** - доступ к клиентским функциям  
- **SUPPORT_PERMISSION** - доступ для службы поддержки

### Защищенные разделы
```typescript
{
  name: 'nav.companies',
  permissions: [ADMIN_PERMISSION]           // Только админы
},
{
  name: 'nav.customers', 
  permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION]  // Все
},
{
  name: 'nav.users',
  permissions: [ADMIN_PERMISSION]           // Только админы
}
```

## 🏗️ Архитектурные решения

### ✅ **Lazy Loading Strategy**
```typescript
// Все модули загружаются по требованию
{
  path: 'customers',
  loadChildren: () => import('../../views/customers/customers.module')
},
{
  path: 'companies', 
  loadComponent: () => import('../../views/companies/companies.component')
}
```

### ✅ **Guard Protection**
```typescript
{
  path: 'home',
  loadChildren: () => import('./containers/default-layout/default-layout.module'),
  canActivate: mapToCanActivate([AuthGuardService])  // Защита всего приложения
}
```

### ✅ **Декларативная конфигурация**
```typescript
// Вся навигация описана в одном файле _nav.ts
export const navItems: any[] = [
  {
    name: 'nav.companies',              // Ключ перевода
    url: 'companies',                   // URL
    iconComponent: {name: 'cil-industry'}, // Иконка
    permissions: [ADMIN_PERMISSION]     // Права
  }
  // ...
];
```

## 🔄 Workflow запуска

1. **🚀 Старт** → App Routing проверяет маршрут
2. **🛡️ AuthGuard** → Проверка JWT токена  
3. **📱 Layout Load** → Default Layout Module загружается
4. **🔧 Service Init** → AuthService, VisualService, TranslateService
5. **📋 Menu Filter** → Фильтрация по правам доступа
6. **🌍 Translation** → Перевод пунктов меню
7. **🎨 Branding** → Загрузка логотипов и брендинга
8. **✨ Render** → Отображение готового интерфейса

## 🎨 UI/UX особенности

### **Responsive Design**
- Sidebar складывается на мобильных устройствах
- Adaptive menu для разных размеров экрана

### **Loading States**  
- Sidebar Skeleton во время загрузки брендинга
- Smooth transitions между состояниями

### **Dynamic Branding**
- Логотипы загружаются через VisualService
- Поддержка полного и узкого логотипа
- Реактивные обновления брендинга

## 🌐 Поддержка локализации

### **Переводы навигации**
```typescript
// Все названия меню поддерживают переводы
name: 'nav.companies'     → "Companies" / "Компании"
name: 'nav.customers'     → "Customers" / "Клиенты" 
name: 'nav.settings'      → "Settings" / "Настройки"
```

### **Реактивность**
- При смене языка в header'е меню обновляется автоматически
- TranslateService интегрирован с change detection

## 🔧  Техническая интеграция

### **Сервисы**
```typescript
// Injection в Default Layout Component
authService = inject(AuthService);           // Авторизация + права
translateService = inject(TranslateService); // Переводы
visualService = inject(VisualService);       // Брендинг + темы
```

### **Change Detection**
```typescript
changeDetection: ChangeDetectionStrategy.OnPush  // Оптимизация производительности
```

### **Memory Management**
```typescript
private unsubscribe$ = new Subject<void>();     // Правильная отписка от Observable
```

## 💡 Преимущества системы

| Преимущество | Описание |
|--------------|----------|
| **🔒 Безопасность** | Guard protection + ролевая фильтрация меню |
| **⚡ Производительность** | Lazy loading + OnPush + Skeleton states |
| **🔧 Гибкость** | Декларативная конфигурация + многоуровневое меню |
| **🌍 Локализация** | Полная поддержка переводов + реактивность |
| **🎨 Брендинг** | Динамическое обновление логотипов и тем |
| **📱 UX** | Adaptive design + smooth transitions |

## 🚀 Быстрый старт для разработчиков

### Добавить новый пункт меню:
```typescript
// 1. Добавить в _nav.ts
{
  name: 'nav.emailLogs',           // ✅ Пример: Email Logs
  url: 'email-logs', 
  iconComponent: {name: 'cil-envelope-closed'},
  permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
}

// 2. Добавить роут в default-layout-routing.module.ts
{
  path: 'email-logs',
  loadComponent: () => import('../../views/email-logs/email-logs.component').then(m => m.EmailLogsComponent)
}

// 3. Добавить перевод в i18n файлы
"nav.emailLogs": "Email Logs" // ✅ Уже добавлено
"email_logs": { "title": "Email Logs", ... } // ✅ Переводы компонента
```

### Изменить права доступа:
```typescript
// Просто обновить permissions в _nav.ts
permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
``` 