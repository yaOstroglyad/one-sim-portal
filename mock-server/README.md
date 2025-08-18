# Mock Server для OneSim Portal

## Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск в режиме моков
```bash
npm run start:mock
```

Это запустит:
- Mock server на порту 3001
- Angular приложение с перенаправлением на mock server для помеченных сервисов

## Как это работает

### 1. Декораторы в Angular
```typescript
@MockedService({
  endpoints: ['list', 'paginatedUsers', 'createUser', 'verifyEmail']
})
export class UsersDataService { ... }
```

### 2. Динамический прокси
Файл `proxy.conf.js` автоматически определяет, какие запросы направить на mock server на основе `registry.json`.

### 3. JSON данные
Все мок-данные хранятся в `/mock-server/data/`:
- `users/list.json` - список пользователей с пагинацией
- `users/create-response.json` - шаблон ответа для создания
- `users/verify-email.json` - проверка email

## Команды

- `npm run start:mock` - запуск с моками
- `npm run mock-server` - запуск только mock сервера
- `npm run mock-server:dev` - запуск mock сервера с nodemon

## Возможности

### Эмуляция задержек
```
GET /api/v1/users/query/all?mock_delay=2000
```

### Эмуляция ошибок
```
GET /api/v1/users/query/all?mock_error=500
```

### Фильтрация и пагинация
```
GET /api/v1/users/query/all?page=0&size=10&username=john
```

## Добавление новых endpoints

1. Добавьте endpoint в `registry.json`
2. Создайте соответствующий JSON файл в `data/`
3. Добавьте обработчик в `server.js`

## Структура данных

### Пагинированный ответ
```json
{
  "content": [...],
  "totalElements": 150,
  "totalPages": 8,
  "number": 0,
  "size": 20
}
```

### Пользователь
```json
{
  "username": "john.doe",
  "accountId": "ACC001",
  "accountType": "CORPORATE",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```