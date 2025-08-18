# Task 002: Comprehensive E2E Tests for Users Module

## Цель задачи
Создать полное покрытие E2E тестами для модуля Users, включая CRUD операции, валидацию, фильтрацию и пагинацию.

## Предварительные требования
- Выполнена задача TASK_001 (Playwright установлен)
- Проект запускается с mock-сервером
- Базовый Page Object создан

## Этапы выполнения

### Этап 1: Расширение Page Object

#### 1.1 Обновить users.page.ts
```typescript
import { Page, Locator } from '@playwright/test';

export class UsersPage {
  readonly page: Page;
  
  // Table elements
  readonly usersTable: Locator;
  readonly tableRows: Locator;
  readonly searchInput: Locator;
  readonly filterButton: Locator;
  readonly accountTypeFilter: Locator;
  
  // Pagination
  readonly nextPageButton: Locator;
  readonly prevPageButton: Locator;
  readonly pageInfo: Locator;
  
  // Actions
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly viewButton: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.usersTable = page.locator('table[data-testid="users-table"]');
    this.tableRows = this.usersTable.locator('tbody tr');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    // ... остальные локаторы
  }

  async searchUser(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async filterByAccountType(type: 'ALL' | 'PRIVATE' | 'CORPORATE') {
    await this.filterButton.click();
    await this.accountTypeFilter.selectOption(type);
    await this.page.waitForLoadState('networkidle');
  }

  async getUsersCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async editUser(username: string, newData: Partial<UserData>) {
    const row = this.tableRows.filter({ hasText: username });
    await row.locator('[data-testid="edit-button"]').click();
    // ... логика редактирования
  }

  async deleteUser(username: string) {
    const row = this.tableRows.filter({ hasText: username });
    await row.locator('[data-testid="delete-button"]').click();
    await this.page.locator('button:has-text("Confirm")').click();
  }
}
```

### Этап 2: Тесты CRUD операций

#### 2.1 Создать e2e/users/users-crud.spec.ts
```typescript
import { test, expect } from '@playwright/test';
import { UsersPage } from '../pages/users.page';

test.describe('Users CRUD Operations', () => {
  let usersPage: UsersPage;

  test.beforeEach(async ({ page }) => {
    usersPage = new UsersPage(page);
    await usersPage.goto();
  });

  test('should display users list', async () => {
    const count = await usersPage.getUsersCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should create a new user', async () => {
    const userData = {
      username: `test.user.${Date.now()}`,
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      accountType: 'PRIVATE' as const
    };

    await usersPage.createUser(userData);
    
    await expect(page.locator('text=User created successfully')).toBeVisible();
    await expect(page.locator(`td:has-text("${userData.username}")`)).toBeVisible();
  });

  test('should edit existing user', async () => {
    const username = 'john.doe';
    const newData = {
      firstName: 'John Updated',
      lastName: 'Doe Updated'
    };

    await usersPage.editUser(username, newData);
    
    await expect(page.locator('text=User updated successfully')).toBeVisible();
    await expect(page.locator(`td:has-text("${newData.firstName}")`)).toBeVisible();
  });

  test('should delete user', async () => {
    const username = 'test.user.to.delete';
    
    // Сначала создать пользователя
    await usersPage.createUser({
      username,
      firstName: 'Delete',
      lastName: 'Me',
      email: 'delete@example.com',
      accountType: 'PRIVATE'
    });

    // Затем удалить
    await usersPage.deleteUser(username);
    
    await expect(page.locator('text=User deleted successfully')).toBeVisible();
    await expect(page.locator(`td:has-text("${username}")`)).not.toBeVisible();
  });
});
```

### Этап 3: Тесты валидации

#### 3.1 Создать e2e/users/users-validation.spec.ts
```typescript
import { test, expect } from '@playwright/test';
import { UsersPage } from '../pages/users.page';

test.describe('Users Form Validation', () => {
  let usersPage: UsersPage;

  test.beforeEach(async ({ page }) => {
    usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.createButton.click();
  });

  test('should validate required fields', async () => {
    await usersPage.saveButton.click();
    
    await expect(page.locator('text=Username is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
  });

  test('should validate email format', async () => {
    await usersPage.emailInput.fill('invalid-email');
    await usersPage.saveButton.click();
    
    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('should validate unique email', async () => {
    await usersPage.usernameInput.fill('new.user');
    await usersPage.firstNameInput.fill('New');
    await usersPage.lastNameInput.fill('User');
    await usersPage.emailInput.fill('admin@onesim.com'); // Existing email
    await usersPage.accountTypeSelect.selectOption('PRIVATE');
    await usersPage.saveButton.click();
    
    await expect(page.locator('text=Email already exists')).toBeVisible();
  });

  test('should validate username format', async () => {
    await usersPage.usernameInput.fill('user with spaces');
    await usersPage.saveButton.click();
    
    await expect(page.locator('text=Username cannot contain spaces')).toBeVisible();
  });
});
```

### Этап 4: Тесты фильтрации и поиска

#### 4.1 Создать e2e/users/users-search-filter.spec.ts
```typescript
import { test, expect } from '@playwright/test';
import { UsersPage } from '../pages/users.page';

test.describe('Users Search and Filter', () => {
  let usersPage: UsersPage;

  test.beforeEach(async ({ page }) => {
    usersPage = new UsersPage(page);
    await usersPage.goto();
  });

  test('should search by username', async () => {
    await usersPage.searchUser('john');
    
    const count = await usersPage.getUsersCount();
    expect(count).toBeGreaterThan(0);
    
    // Проверить, что все результаты содержат 'john'
    const usernames = await usersPage.tableRows.locator('td:first-child').allTextContents();
    usernames.forEach(username => {
      expect(username.toLowerCase()).toContain('john');
    });
  });

  test('should search by email', async () => {
    await usersPage.searchUser('@gmail.com');
    
    const emails = await usersPage.tableRows.locator('td:nth-child(4)').allTextContents();
    emails.forEach(email => {
      expect(email).toContain('@gmail.com');
    });
  });

  test('should filter by account type', async () => {
    await usersPage.filterByAccountType('CORPORATE');
    
    const accountTypes = await usersPage.tableRows.locator('td:nth-child(5)').allTextContents();
    accountTypes.forEach(type => {
      expect(type).toBe('CORPORATE');
    });
  });

  test('should combine search and filter', async () => {
    await usersPage.filterByAccountType('PRIVATE');
    await usersPage.searchUser('maria');
    
    const count = await usersPage.getUsersCount();
    expect(count).toBe(1);
    
    await expect(page.locator('td:has-text("maria.garcia")')).toBeVisible();
    await expect(page.locator('td:has-text("PRIVATE")')).toBeVisible();
  });
});
```

### Этап 5: Тесты пагинации

#### 5.1 Создать e2e/users/users-pagination.spec.ts
```typescript
import { test, expect } from '@playwright/test';
import { UsersPage } from '../pages/users.page';

test.describe('Users Pagination', () => {
  let usersPage: UsersPage;

  test.beforeEach(async ({ page }) => {
    usersPage = new UsersPage(page);
    await usersPage.goto();
  });

  test('should navigate through pages', async () => {
    // Проверить первую страницу
    await expect(usersPage.pageInfo).toContainText('Page 1');
    
    // Перейти на следующую страницу
    await usersPage.nextPageButton.click();
    await page.waitForLoadState('networkidle');
    
    await expect(usersPage.pageInfo).toContainText('Page 2');
    await expect(usersPage.prevPageButton).toBeEnabled();
  });

  test('should change page size', async () => {
    const pageSizeSelect = page.locator('select[data-testid="page-size"]');
    
    // Изменить размер страницы на 50
    await pageSizeSelect.selectOption('50');
    await page.waitForLoadState('networkidle');
    
    const count = await usersPage.getUsersCount();
    expect(count).toBeLessThanOrEqual(50);
  });

  test('should maintain filters during pagination', async () => {
    await usersPage.filterByAccountType('CORPORATE');
    await usersPage.nextPageButton.click();
    
    // Проверить, что фильтр все еще активен
    const accountTypes = await usersPage.tableRows.locator('td:nth-child(5)').allTextContents();
    accountTypes.forEach(type => {
      expect(type).toBe('CORPORATE');
    });
  });
});
```

## Критерии приемки

### Общие критерии
- [ ] Все тесты проходят успешно
- [ ] Тесты независимы друг от друга
- [ ] Используются уникальные тестовые данные
- [ ] Правильно используются ожидания Playwright

### По этапам
- [ ] Page Object содержит все необходимые методы
- [ ] CRUD тесты покрывают все операции
- [ ] Валидация проверяет все бизнес-правила
- [ ] Поиск и фильтрация работают корректно
- [ ] Пагинация сохраняет состояние

## Структура проекта
```
e2e/
├── pages/
│   └── users.page.ts
├── users/
│   ├── users-crud.spec.ts
│   ├── users-validation.spec.ts
│   ├── users-search-filter.spec.ts
│   └── users-pagination.spec.ts
└── fixtures/
    └── test-data.ts
```

## Дополнительные задания

1. **Data-driven тесты**: Использовать fixtures для тестовых данных
2. **Скриншоты**: Добавить скриншоты критических шагов
3. **Accessibility**: Добавить тесты доступности
4. **Performance**: Измерить время загрузки страниц

## Полезные практики

1. **Селекторы**: Приоритет data-testid > role > text
2. **Ожидания**: Использовать waitForLoadState('networkidle')
3. **Retry**: Настроить retry для нестабильных тестов
4. **Параллельность**: Запускать независимые тесты параллельно

## Команды для запуска
```bash
# Запустить все тесты users
npx playwright test e2e/users

# Запустить конкретную группу
npx playwright test users-crud

# Режим отладки
npx playwright test --debug

# С видео записью
npx playwright test --video=on
```