# Примеры использования Email Logs Component

## Базовое использование

### Импорт в роутинге
```typescript
// app.routes.ts
import { EmailLogsComponent } from './views/email-logs';

export const routes: Routes = [
  {
    path: 'email-logs',
    component: EmailLogsComponent,
    title: 'Email Logs'
  }
];
```

### Использование в модуле
```typescript
// feature.module.ts
import { EmailLogsComponent } from './views/email-logs';

@NgModule({
  imports: [
    EmailLogsComponent // Standalone компонент
  ]
})
export class FeatureModule {}
```

## Интеграция в существующий компонент

### Простое встраивание
```typescript
// dashboard.component.ts
import { Component } from '@angular/core';
import { EmailLogsComponent } from './views/email-logs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [EmailLogsComponent],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      
      <!-- Email Logs Section -->
      <section class="email-logs-section">
        <app-email-logs></app-email-logs>
      </section>
    </div>
  `
})
export class DashboardComponent {}
```

### Использование в табах
```typescript
// reports.component.ts
import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { EmailLogsComponent } from './views/email-logs';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [MatTabsModule, EmailLogsComponent],
  template: `
    <mat-tab-group>
      <mat-tab label="Orders">
        <app-orders-table></app-orders-table>
      </mat-tab>
      
      <mat-tab label="Email Logs">
        <app-email-logs></app-email-logs>
      </mat-tab>
      
      <mat-tab label="Usage Statistics">
        <app-usage-stats></app-usage-stats>
      </mat-tab>
    </mat-tab-group>
  `
})
export class ReportsComponent {}
```

## Сценарии использования

### Сценарий 1: Администратор
```typescript
// Администратор видит:
// 1. Account Selector для выбора аккаунта
// 2. ICCID фильтр
// 3. Полную таблицу email логов выбранного аккаунта

// Пример авторизации админа
const adminUser = {
  preferred_username: 'admin',
  email: 'admin@example.com',
  accountId: 'admin-account-123'
};

// AuthService.hasPermission(ADMIN_PERMISSION) возвращает true
// Компонент показывает account-selector
```

### Сценарий 2: Обычный пользователь
```typescript
// Обычный пользователь видит:
// 1. Скрытый Account Selector (автоматически его аккаунт)
// 2. ICCID фильтр
// 3. Таблицу email логов только своего аккаунта

// Пример обычного пользователя
const regularUser = {
  preferred_username: 'user@company.com',
  email: 'user@company.com',
  accountId: 'company-account-456'
};

// AuthService.hasPermission(ADMIN_PERMISSION) возвращает false
// Компонент автоматически использует accountId из loggedUser
```

## Интеграция с переводами

### Добавление переводов
```json
// assets/i18n/en.json
{
  "email_logs": {
    "title": "Email Logs",
    "filter_by_iccid": "Filter by ICCID",
    "iccid_placeholder": "Enter ICCID to filter",
    "sent_at": "Sent At",
    "email_address": "Email Address",
    "subject": "Subject",
    "email_type": "Email Type",
    "status": "Status",
    "iccid": "ICCID",
    "delivered_at": "Delivered At",
    "opened_at": "Opened At",
    "error_message": "Error Message"
  }
}
```

```json
// assets/i18n/ru.json
{
  "email_logs": {
    "title": "Логи Email",
    "filter_by_iccid": "Фильтр по ICCID",
    "iccid_placeholder": "Введите ICCID для фильтрации",
    "sent_at": "Отправлено",
    "email_address": "Email адрес",
    "subject": "Тема",
    "email_type": "Тип email",
    "status": "Статус",
    "iccid": "ICCID",
    "delivered_at": "Доставлено",
    "opened_at": "Открыто",
    "error_message": "Сообщение об ошибке"
  }
}
```

## Кастомизация стилей

### Переопределение стилей
```scss
// email-logs-custom.component.scss
app-email-logs {
  .email-logs-container {
    padding: 30px;
    background: #f5f5f5;
    border-radius: 8px;
  }
  
  .header-section h2 {
    color: #2196f3;
    font-size: 24px;
  }
  
  .filters-section {
    background: white;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .account-selector {
    min-width: 300px;
  }
}
```

### Темная тема
```scss
// dark-theme.scss
[data-theme="dark"] {
  app-email-logs {
    .email-logs-container {
      background: #1e1e1e;
      color: #ffffff;
    }
    
    .header-section h2 {
      color: #64b5f6;
    }
    
    .filters-section {
      background: #2d2d2d;
    }
  }
}
```

## Интеграция с Guard'ами

### Проверка доступа
```typescript
// email-logs.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmailLogsGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.authService.loggedUser;
    
    if (!user || !user.accountId) {
      this.router.navigate(['/login']);
      return false;
    }
    
    return true;
  }
}
```

### Использование в роутах
```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'email-logs',
    component: EmailLogsComponent,
    canActivate: [EmailLogsGuard],
    title: 'Email Logs'
  }
];
```

## Интеграция с NgRx (опционально)

### Selector для email логов
```typescript
// email-logs.selectors.ts
import { createSelector } from '@ngrx/store';

export const selectEmailLogsState = (state: AppState) => state.emailLogs;

export const selectEmailLogs = createSelector(
  selectEmailLogsState,
  state => state.logs
);

export const selectEmailLogsLoading = createSelector(
  selectEmailLogsState,
  state => state.loading
);
```

### Использование с NgRx
```typescript
// email-logs-ngrx.component.ts
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { EmailLogsComponent } from './views/email-logs';
import { loadEmailLogs } from './store/email-logs.actions';

@Component({
  selector: 'app-email-logs-page',
  standalone: true,
  imports: [EmailLogsComponent],
  template: `
    <app-email-logs></app-email-logs>
  `
})
export class EmailLogsPageComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(loadEmailLogs());
  }
}
```

## Тестирование

### Unit тесты
```typescript
// email-logs.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailLogsComponent } from './email-logs.component';
import { AuthService } from '../../auth/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('EmailLogsComponent', () => {
  let component: EmailLogsComponent;
  let fixture: ComponentFixture<EmailLogsComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['hasPermission'], {
      loggedUser: { accountId: 'test-account' }
    });

    await TestBed.configureTestingModule({
      imports: [EmailLogsComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailLogsComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show account selector for admin', () => {
    authService.hasPermission.and.returnValue(true);
    component.ngOnInit();
    
    expect(component.isAdmin).toBe(true);
  });
});
``` 