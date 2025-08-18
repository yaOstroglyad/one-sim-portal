# Task 002: Создание модуля Customer Users

## Цель задачи
Создать новый модуль `customer-users` на основе существующего модуля `users`, адаптировав его под работу с пользователями конкретного customer (заказчика).

## Предварительные требования
- Выполнена TASK_001 (понимание структуры модуля users)
- Проект запускается локально
- Понимание Angular модулей и роутинга

## Описание функциональности
Customer Users - это пользователи, привязанные к конкретному customer (заказчику). В отличие от обычных users, они:
- Отображаются с фильтрацией по customerId
- Имеют дополнительное поле customerId
- Могут создаваться только в контексте выбранного customer

## Этапы выполнения

### Этап 1: Создание структуры модуля

#### 1.1 Создать папку и файлы
```bash
# Создать структуру папок
src/app/views/customer-users/
├── create-customer-user/
│   ├── create-customer-user.component.ts
│   ├── create-customer-user.component.html
│   ├── create-customer-user.component.scss
│   └── create-customer-user.component.spec.ts
├── customer-users-data.service.ts
├── customer-users-table.service.ts
├── customer-users.component.ts
├── customer-users.component.html
├── customer-users.component.scss
├── customer-users.component.spec.ts
├── customer-users.module.ts
└── customer-users-routing.module.ts
```

#### 1.2 Базовая структура модуля
**customer-users.module.ts:**
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CustomerUsersRoutingModule } from './customer-users-routing.module';
import { CustomerUsersComponent } from './customer-users.component';
import { CreateCustomerUserComponent } from './create-customer-user/create-customer-user.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    CustomerUsersComponent,
    CreateCustomerUserComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomerUsersRoutingModule,
    SharedModule
  ]
})
export class CustomerUsersModule { }
```

#### 1.3 Настройка роутинга
**customer-users-routing.module.ts:**
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerUsersComponent } from './customer-users.component';
import { CreateCustomerUserComponent } from './create-customer-user/create-customer-user.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerUsersComponent,
    data: {
      title: 'Customer Users'
    }
  },
  {
    path: 'create/:customerId',
    component: CreateCustomerUserComponent,
    data: {
      title: 'Create Customer User'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerUsersRoutingModule { }
```

### Этап 2: Адаптация сервисов

#### 2.1 Data Service
**customer-users-data.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DataService, User } from '../../shared';
import { MockedService } from '../../shared/decorators/mock.decorator';

@Injectable({
  providedIn: 'root'
})
@MockedService({
  endpoints: ['list', 'paginatedUsers', 'createUser', 'verifyEmail']
})
export class CustomerUsersDataService extends DataService<User> {
  constructor(public http: HttpClient) {
    super(http, '/api/v1/users');
  }

  // На первом этапе используем те же API endpoints
  getCustomerUsers(customerId: string, params?: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('customerId', customerId)
      .set('page', params?.page || '0')
      .set('size', params?.size || '20');

    // Временно используем тот же endpoint с фильтрацией
    return this.http.get<any>('/api/v1/users/query/all', { 
      params: httpParams 
    }).pipe(
      catchError(() => {
        console.warn('Error loading customer users, returning empty data');
        return of({
          totalElements: 0,
          totalPages: 0,
          content: []
        });
      })
    );
  }

  createCustomerUser(customerId: string, user: User): Observable<User> {
    // Добавляем customerId к пользователю
    const customerUser = { ...user, customerId };
    return this.http.post<User>(
      `/api/v1/users/command/create?accountId=${user.accountId}&customerId=${customerId}`, 
      customerUser
    );
  }
}
```

#### 2.2 Table Service
**customer-users-table.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TableColumn, TableConfig } from '../../shared/model/table.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerUsersTableService {
  constructor(private router: Router) {}

  getTableConfig(customerId: string): TableConfig {
    return {
      columns: this.getColumns(),
      actions: this.getActions(customerId),
      filters: this.getFilters(),
      pagination: {
        enabled: true,
        pageSize: 20,
        pageSizeOptions: [10, 20, 50, 100]
      }
    };
  }

  private getColumns(): TableColumn[] {
    return [
      {
        key: 'username',
        label: 'Username',
        sortable: true,
        type: 'text'
      },
      {
        key: 'firstName',
        label: 'First Name',
        sortable: true,
        type: 'text'
      },
      {
        key: 'lastName',
        label: 'Last Name',
        sortable: true,
        type: 'text'
      },
      {
        key: 'email',
        label: 'Email',
        sortable: true,
        type: 'text'
      },
      {
        key: 'accountType',
        label: 'Account Type',
        sortable: true,
        type: 'badge',
        badgeConfig: {
          PRIVATE: { class: 'badge-info', text: 'Private' },
          CORPORATE: { class: 'badge-success', text: 'Corporate' }
        }
      },
      {
        key: 'status',
        label: 'Status',
        sortable: false,
        type: 'badge',
        badgeConfig: {
          ACTIVE: { class: 'badge-success', text: 'Active' },
          INACTIVE: { class: 'badge-danger', text: 'Inactive' }
        }
      }
    ];
  }

  private getActions(customerId: string) {
    return {
      create: {
        label: 'Create Customer User',
        icon: 'cil-user-plus',
        handler: () => {
          this.router.navigate(['/customer-users/create', customerId]);
        }
      },
      edit: {
        label: 'Edit',
        icon: 'cil-pencil',
        handler: (user: any) => {
          this.router.navigate(['/customer-users/edit', user.id]);
        }
      },
      delete: {
        label: 'Delete',
        icon: 'cil-trash',
        handler: (user: any) => {
          // Implement delete logic
          console.log('Delete user:', user);
        }
      }
    };
  }

  private getFilters() {
    return [
      {
        key: 'accountType',
        label: 'Account Type',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'PRIVATE', label: 'Private' },
          { value: 'CORPORATE', label: 'Corporate' }
        ]
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: '', label: 'All' },
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' }
        ]
      }
    ];
  }
}
```

### Этап 3: Создание компонентов

#### 3.1 Главный компонент списка
**customer-users.component.ts:**
```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerUsersDataService } from './customer-users-data.service';
import { CustomerUsersTableService } from './customer-users-table.service';

@Component({
  selector: 'app-customer-users',
  templateUrl: './customer-users.component.html',
  styleUrls: ['./customer-users.component.scss']
})
export class CustomerUsersComponent implements OnInit {
  customerId: string;
  tableConfig: any;
  data: any[] = [];
  loading = false;
  totalElements = 0;
  
  currentPage = 0;
  pageSize = 20;
  filters: any = {};

  constructor(
    private route: ActivatedRoute,
    private dataService: CustomerUsersDataService,
    private tableService: CustomerUsersTableService
  ) {}

  ngOnInit(): void {
    // Получить customerId из route params или query params
    this.route.params.subscribe(params => {
      this.customerId = params['customerId'] || 'default-customer-id';
      this.tableConfig = this.tableService.getTableConfig(this.customerId);
      this.loadData();
    });
  }

  loadData(): void {
    this.loading = true;
    const params = {
      page: this.currentPage,
      size: this.pageSize,
      ...this.filters
    };

    this.dataService.getCustomerUsers(this.customerId, params).subscribe({
      next: (response) => {
        this.data = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customer users:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onFilterChange(filters: any): void {
    this.filters = filters;
    this.currentPage = 0;
    this.loadData();
  }

  onAction(event: any): void {
    const { action, item } = event;
    const handler = this.tableConfig.actions[action]?.handler;
    if (handler) {
      handler(item);
    }
  }
}
```

#### 3.2 Шаблон списка
**customer-users.component.html:**
```html
<div class="animated fadeIn">
  <div class="card">
    <div class="card-header">
      <i class="fa fa-users"></i> Customer Users
      <div class="card-header-actions">
        <button 
          type="button" 
          class="btn btn-sm btn-primary"
          (click)="tableConfig.actions.create.handler()">
          <i class="fa fa-plus"></i> Create User
        </button>
      </div>
    </div>
    <div class="card-body">
      <!-- Использование GenericTableComponent -->
      <app-generic-table
        [config]="tableConfig"
        [data]="data"
        [loading]="loading"
        [totalElements]="totalElements"
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        (pageChange)="onPageChange($event)"
        (filterChange)="onFilterChange($event)"
        (action)="onAction($event)">
      </app-generic-table>
    </div>
  </div>
</div>
```

### Этап 4: Регистрация модуля

#### 4.1 Добавить в основной роутинг
В файле `app-routing.module.ts` добавить:
```typescript
{
  path: 'customer-users',
  loadChildren: () => import('./views/customer-users/customer-users.module')
    .then(m => m.CustomerUsersModule),
  canActivate: [AuthGuard]
}
```

#### 4.2 Добавить в навигацию (опционально)
Если нужно добавить в боковое меню, обновить конфигурацию навигации.

## Критерии приемки

### Этап 1-2
- [ ] Создана полная структура модуля
- [ ] Все файлы на месте
- [ ] Сервисы наследуются/используют правильные базовые классы
- [ ] Модуль импортирует необходимые зависимости

### Этап 3
- [ ] Компонент отображает список пользователей
- [ ] Работает пагинация
- [ ] Работают фильтры
- [ ] Кнопка создания ведет на форму

### Этап 4
- [ ] Модуль доступен по маршруту /customer-users
- [ ] Нет ошибок компиляции
- [ ] Интерфейс отображается корректно

## Проверка работы

1. Запустить проект с mock-сервером:
   ```bash
   npm run start:mock
   ```

2. Перейти на `http://localhost:4200/#/customer-users`

3. Проверить:
   - Отображается список пользователей
   - Работает пагинация
   - Кнопка "Create User" активна

## Частые ошибки и решения

1. **Ошибка: Cannot find module**
   - Проверить правильность путей импорта
   - Проверить, что все файлы созданы

2. **Ошибка: No provider for Service**
   - Убедиться, что сервис имеет @Injectable()
   - Проверить providedIn: 'root'

3. **Пустая таблица**
   - Проверить network вкладку в DevTools
   - Убедиться, что mock-сервер запущен

## Следующие шаги
После выполнения этой задачи, можно будет:
- Реализовать форму создания (CreateCustomerUserComponent)
- Добавить собственные API endpoints
- Настроить валидацию под специфику customer users