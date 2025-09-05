# Mock Server for OneSim Portal

## Architecture

The mock server is built with TypeScript using a **domain-driven modular architecture**:

```
mock-server/
├── src/                     # TypeScript source code
│   ├── server.ts           # Main server entry point
│   ├── domains/            # Domain-based modules
│   │   └── users/          # Users domain
│   │       ├── users.controller.ts # Users request handler
│   │       ├── users.service.ts    # Users business logic
│   │       └── user.ts             # User domain types
│   ├── shared/             # Shared classes and utilities
│   │   └── base.controller.ts # Abstract base controller
│   ├── middleware/         # Express middleware
│   │   ├── index.ts        # Middleware exports
│   │   ├── logging.middleware.ts # Request logging
│   │   ├── delay.middleware.ts   # Network delay simulation
│   │   └── error.middleware.ts   # Error handling
│   ├── types/              # Shared type definitions
│   │   └── index.ts        # Cross-domain interfaces
│   └── config/             # Configuration
│       └── server.config.ts # Server settings
├── dist/                   # Compiled JavaScript output
├── data/                   # Mock JSON data
│   └── users/
│       ├── list.json       # Users data
│       └── verify-email.json # Email verification data
├── CLAUDE-MOCK.md          # Development rules and guidelines
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── registry.json           # Mocked services registry
└── proxy.conf.mock.js      # Angular proxy configuration
```

## Development Guidelines

📋 **For detailed development rules and conventions, see [CLAUDE-MOCK.md](./CLAUDE-MOCK.md)**

This includes:
- Domain-based folder organization rules
- File naming conventions
- Type organization guidelines  
- Import conventions
- Controller and Service implementation patterns
- Performance and testing guidelines

## Quick Start

### 1. Install Dependencies
```bash
cd mock-server
npm install
```

### 2. Development
```bash
npm run dev          # Development with hot-reload
npm run dev:watch    # Watch TypeScript compilation
```

### 3. Production
```bash
npm run build        # Build TypeScript to dist/
npm start           # Run compiled server
```

### 4. With Angular
```bash
npm run start:mock   # Start mock + Angular with proxy
```

## Available Endpoints

### Users Domain

**GET /api/v1/users/query/all**
- Paginated users with filtering
- Parameters: `page`, `size`, `sort`, `username`, `email`, `accountType`

**POST /api/v1/users/command/create?accountId={id}**
- Create new user
- Requires: `accountId` in query, user data in body

**GET /api/v1/users/query/verify-user?email={email}**
- Verify email existence
- Returns: `{ isExist: boolean }`

## Special Features

### Network Simulation
```bash
# Add 2 second delay
curl "localhost:3001/api/v1/users/query/all?mock_delay=2000"

# Simulate 500 error
curl "localhost:3001/api/v1/users/query/all?mock_error=500"
```

## Adding New Domains

### 1. Create Domain Structure
```bash
mkdir src/domains/products
touch src/domains/products/products.controller.ts
touch src/domains/products/products.service.ts  
touch src/domains/products/product.ts
```

### 2. Define Types
```typescript
// src/domains/products/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface GetProductsParams {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}
```

### 3. Create Service
```typescript
// src/domains/products/products.service.ts
import { PaginatedResponse, ServiceError } from '../../types';
import { Product, GetProductsParams } from './product';

export class ProductsService {
  public getProducts(params: GetProductsParams): PaginatedResponse<Product> {
    // Implementation
  }
}
```

### 4. Register in server.ts
```typescript
import { ProductsController } from './domains/products/products.controller';

const controllers: Controller[] = [
  new UsersController(),
  new ProductsController()
];
```

### 5. Add Mock Data
Create `data/products/list.json`

### 6. Update Registry
Add endpoint to `registry.json`

> 💡 **For complete implementation examples and detailed conventions, see [CLAUDE-MOCK.md](./CLAUDE-MOCK.md)**

## Development Benefits

- **Type Safety**: Compile-time error checking
- **Domain Isolation**: Clear separation of concerns
- **Consistent Structure**: Every domain follows same pattern
- **Easy Testing**: Each domain can be tested independently
- **Scalability**: Easy to add new domains without affecting existing ones
- **IDE Support**: Full IntelliSense and refactoring capabilities