# Task 004: Создание API для Customer Users в Mock Server

## Цель задачи
Создать отдельные API endpoints для модуля customer-users в mock-server, отличающиеся от обычных users endpoints.

## Предварительные требования
- Выполнена TASK_002 (модуль customer-users создан)
- Понимание структуры mock-server
- Модуль customer-users использует временные endpoints

## Описание
Customer Users должны иметь собственные API endpoints для:
- Получения списка пользователей конкретного customer
- Создания пользователя с привязкой к customer
- Управления правами доступа в рамках customer

## Этапы выполнения

### Этап 1: Создание структуры данных

#### 1.1 Создать данные для customer-users
```bash
# Создать папку для customer-users данных
mock-server/data/customer-users/
├── list.json                    # Список пользователей по customers
├── create-response.json         # Шаблон ответа при создании
├── customers.json              # Список доступных customers
└── permissions.json            # Права доступа по customer
```

#### 1.2 Структура customer-users data
**mock-server/data/customer-users/list.json:**
```json
{
  "CUSTOMER_001": {
    "content": [
      {
        "id": "CU_001",
        "username": "customer1.admin",
        "customerId": "CUSTOMER_001",
        "customerName": "TechCorp Inc",
        "accountId": "ACC-CUST-001",
        "accountType": "CORPORATE",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@techcorp.com",
        "role": "CUSTOMER_ADMIN",
        "permissions": ["READ", "WRITE", "DELETE"],
        "status": "ACTIVE",
        "createdAt": "2024-01-15T10:30:00Z",
        "lastLogin": "2024-01-20T09:15:00Z"
      },
      {
        "id": "CU_002",
        "username": "customer1.user1",
        "customerId": "CUSTOMER_001",
        "customerName": "TechCorp Inc",
        "accountId": "ACC-CUST-002",
        "accountType": "CORPORATE",
        "firstName": "John",
        "lastName": "Developer",
        "email": "john.dev@techcorp.com",
        "role": "CUSTOMER_USER",
        "permissions": ["READ"],
        "status": "ACTIVE",
        "createdAt": "2024-01-16T14:20:00Z",
        "lastLogin": "2024-01-21T08:45:00Z"
      }
    ],
    "totalElements": 15,
    "totalPages": 2,
    "number": 0,
    "size": 20
  },
  "CUSTOMER_002": {
    "content": [
      {
        "id": "CU_003",
        "username": "customer2.admin",
        "customerId": "CUSTOMER_002",
        "customerName": "GlobalSoft Ltd",
        "accountId": "ACC-CUST-003",
        "accountType": "CORPORATE",
        "firstName": "Sarah",
        "lastName": "Manager",
        "email": "sarah.m@globalsoft.com",
        "role": "CUSTOMER_ADMIN",
        "permissions": ["READ", "WRITE"],
        "status": "ACTIVE",
        "createdAt": "2024-01-10T11:00:00Z",
        "lastLogin": "2024-01-21T07:30:00Z"
      }
    ],
    "totalElements": 8,
    "totalPages": 1,
    "number": 0,
    "size": 20
  }
}
```

#### 1.3 Список customers
**mock-server/data/customer-users/customers.json:**
```json
{
  "customers": [
    {
      "id": "CUSTOMER_001",
      "name": "TechCorp Inc",
      "type": "ENTERPRISE",
      "status": "ACTIVE",
      "usersCount": 15,
      "createdAt": "2023-12-01T00:00:00Z"
    },
    {
      "id": "CUSTOMER_002", 
      "name": "GlobalSoft Ltd",
      "type": "BUSINESS",
      "status": "ACTIVE",
      "usersCount": 8,
      "createdAt": "2023-12-15T00:00:00Z"
    },
    {
      "id": "CUSTOMER_003",
      "name": "StartupXYZ",
      "type": "STARTUP",
      "status": "PENDING",
      "usersCount": 3,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Этап 2: Добавление API endpoints в server.js

#### 2.1 Добавить imports и helpers
```javascript
// mock-server/server.js
// Добавить в начало файла после существующих импортов

// Helper для работы с customer users
function getCustomerUsers(customerId, page = 0, size = 20, filters = {}) {
  const allCustomersData = readJsonFile(path.join(__dirname, 'data/customer-users/list.json'));
  
  if (!allCustomersData[customerId]) {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: page,
      size: size
    };
  }

  let customerData = allCustomersData[customerId];
  let filteredContent = [...customerData.content];

  // Применить фильтры
  if (filters.role) {
    filteredContent = filteredContent.filter(user => user.role === filters.role);
  }
  
  if (filters.status) {
    filteredContent = filteredContent.filter(user => user.status === filters.status);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredContent = filteredContent.filter(user => 
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm)
    );
  }

  // Пагинация
  const start = page * size;
  const end = start + size;
  const paginatedContent = filteredContent.slice(start, end);

  return {
    content: paginatedContent,
    totalElements: filteredContent.length,
    totalPages: Math.ceil(filteredContent.length / size),
    number: page,
    size: size,
    first: page === 0,
    last: page >= Math.ceil(filteredContent.length / size) - 1,
    numberOfElements: paginatedContent.length,
    empty: paginatedContent.length === 0
  };
}
```

#### 2.2 Добавить endpoints
```javascript
// Добавить после существующих users endpoints

// ==================== CUSTOMER USERS ENDPOINTS ====================

// Получить список всех customers
app.get('/api/v1/customer-users/customers', (req, res) => {
  const customersData = readJsonFile(path.join(__dirname, 'data/customer-users/customers.json'));
  
  if (!customersData) {
    return res.status(500).json({ error: 'Failed to load customers data' });
  }
  
  res.json(customersData);
});

// Получить пользователей конкретного customer
app.get('/api/v1/customer-users/:customerId/users', (req, res) => {
  const customerId = req.params.customerId;
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 20;
  
  const filters = {
    role: req.query.role,
    status: req.query.status,
    search: req.query.search
  };

  const result = getCustomerUsers(customerId, page, size, filters);
  
  console.log(`[MOCK] Customer ${customerId} users: ${result.content.length} items`);
  res.json(result);
});

// Создать пользователя для customer
app.post('/api/v1/customer-users/:customerId/users', (req, res) => {
  const customerId = req.params.customerId;
  const userData = req.body;
  
  // Получить информацию о customer
  const customersData = readJsonFile(path.join(__dirname, 'data/customer-users/customers.json'));
  const customer = customersData?.customers?.find(c => c.id === customerId);
  
  if (!customer) {
    return res.status(404).json({ 
      error: 'Customer not found',
      customerId: customerId 
    });
  }

  // Создать пользователя с привязкой к customer
  const newUser = {
    id: `CU_${Date.now()}`,
    ...userData,
    customerId: customerId,
    customerName: customer.name,
    role: userData.role || 'CUSTOMER_USER',
    permissions: userData.permissions || ['READ'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastLogin: null
  };

  console.log('[MOCK] Created customer user:', newUser);
  
  res.status(201).json(newUser);
});

// Получить конкретного пользователя customer
app.get('/api/v1/customer-users/:customerId/users/:userId', (req, res) => {
  const customerId = req.params.customerId;
  const userId = req.params.userId;
  
  const allCustomersData = readJsonFile(path.join(__dirname, 'data/customer-users/list.json'));
  const customerData = allCustomersData?.[customerId];
  
  if (!customerData) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const user = customerData.content.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// Обновить пользователя customer
app.put('/api/v1/customer-users/:customerId/users/:userId', (req, res) => {
  const customerId = req.params.customerId;
  const userId = req.params.userId;
  const updateData = req.body;
  
  // В реальном приложении здесь был бы поиск и обновление в БД
  const updatedUser = {
    id: userId,
    customerId: customerId,
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  console.log('[MOCK] Updated customer user:', updatedUser);
  
  res.json(updatedUser);
});

// Удалить пользователя customer
app.delete('/api/v1/customer-users/:customerId/users/:userId', (req, res) => {
  const customerId = req.params.customerId;
  const userId = req.params.userId;
  
  console.log(`[MOCK] Deleted customer user: ${userId} from customer: ${customerId}`);
  
  res.json({ 
    message: 'User deleted successfully',
    userId: userId,
    customerId: customerId 
  });
});

// Получить статистику по customer
app.get('/api/v1/customer-users/:customerId/stats', (req, res) => {
  const customerId = req.params.customerId;
  const customerData = getCustomerUsers(customerId, 0, 1000); // Получить всех
  
  const stats = {
    totalUsers: customerData.totalElements,
    activeUsers: customerData.content.filter(u => u.status === 'ACTIVE').length,
    adminUsers: customerData.content.filter(u => u.role === 'CUSTOMER_ADMIN').length,
    regularUsers: customerData.content.filter(u => u.role === 'CUSTOMER_USER').length,
    recentLogins: customerData.content.filter(u => {
      if (!u.lastLogin) return false;
      const lastLogin = new Date(u.lastLogin);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastLogin > dayAgo;
    }).length
  };

  res.json(stats);
});
```

### Этап 3: Обновление registry.json

#### 3.1 Добавить новые endpoints
```json
{
  "services": {
    "UsersDataService": {
      "mocked": true,
      "endpoints": ["list", "paginatedUsers", "createUser", "verifyEmail"]
    },
    "CustomerUsersDataService": {
      "mocked": true,
      "endpoints": ["getCustomers", "getCustomerUsers", "createCustomerUser", "getStats"]
    }
  },
  "endpoints": [
    {
      "path": "/api/v1/users/query/all",
      "method": "GET",
      "service": "UsersDataService",
      "handler": "users/list"
    },
    {
      "path": "/api/v1/customer-users/customers",
      "method": "GET",
      "service": "CustomerUsersDataService",
      "handler": "customer-users/customers"
    },
    {
      "path": "/api/v1/customer-users/*/users",
      "method": "GET",
      "service": "CustomerUsersDataService",
      "handler": "customer-users/list"
    },
    {
      "path": "/api/v1/customer-users/*/users",
      "method": "POST",
      "service": "CustomerUsersDataService",
      "handler": "customer-users/create"
    }
  ]
}
```

### Этап 4: Обновление Angular сервиса

#### 4.1 Обновить CustomerUsersDataService
```typescript
// customer-users-data.service.ts
export class CustomerUsersDataService {
  constructor(public http: HttpClient) {}

  // Получить список customers
  getCustomers(): Observable<any> {
    return this.http.get<any>('/api/v1/customer-users/customers');
  }

  // Получить пользователей customer
  getCustomerUsers(customerId: string, params?: any): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', params?.page || '0')
      .set('size', params?.size || '20');

    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<any>(`/api/v1/customer-users/${customerId}/users`, { 
      params: httpParams 
    });
  }

  // Создать пользователя customer
  createCustomerUser(customerId: string, user: any): Observable<any> {
    return this.http.post<any>(`/api/v1/customer-users/${customerId}/users`, user);
  }

  // Получить статистику
  getCustomerStats(customerId: string): Observable<any> {
    return this.http.get<any>(`/api/v1/customer-users/${customerId}/stats`);
  }
}
```

### Этап 5: Тестирование API

#### 5.1 Добавить логирование в mock-server
```javascript
// Обновить логирование в server.js
app.use((req, res, next) => {
  console.log(`[MOCK] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[MOCK] Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});
```

#### 5.2 Протестировать endpoints
```bash
# Запустить mock-server
cd mock-server
npm start

# В другом терминале тестировать API:

# Получить customers
curl http://localhost:3001/api/v1/customer-users/customers

# Получить пользователей customer
curl "http://localhost:3001/api/v1/customer-users/CUSTOMER_001/users?page=0&size=10"

# Создать пользователя
curl -X POST http://localhost:3001/api/v1/customer-users/CUSTOMER_001/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new.user",
    "firstName": "New",
    "lastName": "User",
    "email": "new.user@techcorp.com",
    "role": "CUSTOMER_USER"
  }'
```

## Критерии приемки

### API Endpoints
- [ ] GET /api/v1/customer-users/customers - возвращает список customers
- [ ] GET /api/v1/customer-users/:customerId/users - возвращает пользователей customer
- [ ] POST /api/v1/customer-users/:customerId/users - создает пользователя
- [ ] GET /api/v1/customer-users/:customerId/stats - возвращает статистику

### Функциональность
- [ ] Поддержка пагинации
- [ ] Поддержка фильтрации по role и status
- [ ] Поиск по username, email, имени
- [ ] Валидация customerId
- [ ] Корректная обработка ошибок

### Интеграция
- [ ] Angular сервис обновлен
- [ ] Registry.json содержит новые endpoints
- [ ] Proxy корректно перенаправляет запросы

## Дополнительные возможности

1. **Роли и права доступа**
   - CUSTOMER_ADMIN - полный доступ к users customer
   - CUSTOMER_USER - ограниченный доступ

2. **Статистика и метрики**
   - Количество активных пользователей
   - Последние входы в систему
   - Распределение по ролям

3. **Bulk операции**
   - Массовое создание пользователей
   - Массовое изменение статуса

## Следующие шаги
После выполнения этой задачи API готово для интеграции с реальным бэкендом.