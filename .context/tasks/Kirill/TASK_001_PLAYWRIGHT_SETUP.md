# Task 001: Playwright E2E Testing Setup

## Цель задачи
Установить и настроить Playwright для E2E тестирования модуля Users, создать базовые тесты и page objects.

## Этапы выполнения

### Этап 1: Установка и настройка Playwright

#### 1.1 Запуск проекта
```bash
# Клонировать репозиторий
git clone [repository-url]
cd one-sim-portal

# Установить зависимости
npm install

# Запустить приложение с mock-сервером
npm run start:mock
```

Приложение будет доступно по адресу: `http://localhost:4200`

#### 1.2 Установка Playwright
```bash
# Установить Playwright (выполнить из корня проекта)
npm init playwright@latest

# При установке будут заданы вопросы. Ответы:
# ✔ Do you want to use TypeScript or JavaScript? › TypeScript
# ✔ Where to put your end-to-end tests? › e2e (стереть "tests" и написать "e2e")
# ✔ Add a GitHub Actions workflow? (y/N) › y (нажать 'y' и Enter)
# ✔ Install Playwright browsers (can be done manually via 'npx playwright install')? (Y/n) › Y (просто Enter)

# Папка e2e создастся автоматически!
```

#### 1.3 Конфигурация
После установки Playwright создаст файл `playwright.config.ts` в корне проекта.
Обновить его содержимое:
```typescript
export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:4200',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run start:mock',
    port: 4200,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Этап 2: Запись сценария создания пользователя

#### 2.1 Запуск Playwright Codegen
```bash
# Убедиться, что приложение запущено (в отдельном терминале)
npm run start:mock

# В новом терминале запустить генератор кода
npx playwright codegen http://localhost:4200

# Это откроет:
# 1. Браузер Chromium с вашим приложением
# 2. Окно Playwright Inspector для записи действий
```

#### 2.2 Записать сценарий
1. Войти в систему (если требуется)
2. Перейти в раздел Users
3. Нажать кнопку "Create User" или аналогичную
4. Заполнить форму:
   - Username
   - First Name
   - Last Name
   - Email
   - Account Type
5. Сохранить пользователя
6. Проверить, что пользователь появился в списке

#### 2.3 Сохранить тест
Создать файл `e2e/users/create-user.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test('should create a new user', async ({ page }) => {
  // Вставить сгенерированный код из Playwright Codegen
  await page.goto('/');
  
  // ... записанные действия ...
  
  // Проверить успешное создание
  await expect(page.locator('text=User created successfully')).toBeVisible();
});
```

### Этап 3: Создание Page Object для Users

#### 3.1 Создать Page Object
Создать файл `e2e/pages/users.page.ts`:
```typescript
import { Page, Locator } from '@playwright/test';

export class UsersPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly usernameInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly accountTypeSelect: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.locator('button:has-text("Create")');
    this.usernameInput = page.locator('input[name="username"]');
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.emailInput = page.locator('input[name="email"]');
    this.accountTypeSelect = page.locator('select[name="accountType"]');
    this.saveButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/users');
  }

  async createUser(userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    accountType: 'PRIVATE' | 'CORPORATE';
  }) {
    await this.createButton.click();
    await this.usernameInput.fill(userData.username);
    await this.firstNameInput.fill(userData.firstName);
    await this.lastNameInput.fill(userData.lastName);
    await this.emailInput.fill(userData.email);
    await this.accountTypeSelect.selectOption(userData.accountType);
    await this.saveButton.click();
  }
}
```

#### 3.2 Рефакторинг теста
Обновить `e2e/users/create-user.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';
import { UsersPage } from '../pages/users.page';

test('should create a new user using page object', async ({ page }) => {
  const usersPage = new UsersPage(page);
  
  await usersPage.goto();
  
  await usersPage.createUser({
    username: 'test.user',
    firstName: 'Test',
    lastName: 'User',
    email: 'test.user@example.com',
    accountType: 'PRIVATE'
  });
  
  // Проверить успешное создание
  await expect(page.locator('text=User created successfully')).toBeVisible();
  await expect(page.locator('td:has-text("test.user")')).toBeVisible();
});
```

## Критерии приемки

### Этап 1
- [ ] Playwright установлен и настроен
- [ ] Конфигурация обновлена под проект
- [ ] Mock-сервер запускается автоматически при тестах

### Этап 2
- [ ] Записан полный сценарий создания пользователя
- [ ] Тест успешно проходит
- [ ] Используются правильные селекторы

### Этап 3
- [ ] Создан Page Object для страницы Users
- [ ] Все элементы вынесены в переменные класса
- [ ] Метод createUser инкапсулирует логику создания
- [ ] Тест переписан с использованием Page Object

## Структура проекта после установки
```
one-sim-portal/
├── e2e/                          # Создастся автоматически
│   ├── example.spec.ts           # Пример теста от Playwright
│   ├── pages/                    # Создать вручную для Page Objects
│   │   └── users.page.ts
│   └── users/                    # Создать вручную для тестов
│       └── create-user.spec.ts
├── playwright.config.ts          # Создастся автоматически
├── package.json                  # Обновится автоматически
└── .github/                      # Создастся если выбрали GitHub Actions
    └── workflows/
        └── playwright.yml

```

## Дополнительные рекомендации

1. **Селекторы**: Использовать data-testid атрибуты где возможно
2. **Ожидания**: Использовать встроенные auto-waiting возможности Playwright
3. **Данные**: Генерировать уникальные данные для каждого теста (например, с Date.now())
4. **Очистка**: Подумать о очистке тестовых данных после тестов
5. **Mock-сервер**: Всегда использовать `npm run start:mock` для стабильных тестов

## Полезные команды
```bash
# Запустить все тесты
npx playwright test

# Запустить конкретный тест
npx playwright test create-user.spec.ts

# Запустить в UI режиме
npx playwright test --ui

# Показать отчет
npx playwright show-report
```

## Ресурсы
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)