# CLAUDE-MOCK.md

This file provides guidance to Claude Code specifically for the mock-server development.

> 🚨 **REMINDER**: Always use ABSOLUTE paths: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/mock-server/...` 
> Never use relative paths - they will fail!

## Mock Server Architecture Rules

### Documentation and Comments Language Rule

**ALL documentation, README files, code comments, and commit messages MUST be written in English.**
- This includes inline comments, JSDoc/TSDoc comments, README files, and any other documentation
- Variable names, function names, and code identifiers should also use English

### Domain-Based Organization

**MANDATORY**: All mock server modules MUST follow domain-based folder structure:

```
src/domains/{domain}/
├── {domain}.controller.ts  # Request handlers
├── {domain}.service.ts     # Business logic  
└── {domain}.ts             # Domain-specific types and interfaces
```

### File Naming Convention

1. **Controllers**: `{domain}.controller.ts`
   - Example: `users.controller.ts`, `products.controller.ts`
   - Must extend `BaseController`
   - Must implement `registerRoutes(app: Application): void`

2. **Services**: `{domain}.service.ts`
   - Example: `users.service.ts`, `products.service.ts`
   - Contains all business logic for the domain
   - Handles data operations and file I/O

3. **Types**: `{domain}.ts` (singular form)
   - Example: `user.ts`, `product.ts`, `order.ts`
   - Contains all domain-specific interfaces and types
   - Use descriptive interface names: `GetUsersParams`, `CreateUserRequest`

### Type Organization Rules

#### Domain-Specific Types
Place in `src/domains/{domain}/{domain}.ts`:
- Models (e.g., `User`, `Product`)
- Request/Response DTOs (e.g., `GetUsersParams`, `CreateUserRequest`)
- Domain-specific data structures (e.g., `UsersListData`, `VerifyEmailData`)

#### Shared Types
Place in `src/types/index.ts`:
- Cross-domain interfaces used by multiple domains
- Base framework types (e.g., `MockRequest`, `Controller`, `PaginatedResponse<T>`)
- Error classes (e.g., `ServiceError`)

#### Shared Classes
Place in `src/shared/`:
- Base classes used across domains (e.g., `BaseController`)
- Common utilities and helpers
- Abstract classes and interfaces

### Import Conventions

```typescript
// Domain types (same folder)
import { User, GetUsersParams } from './user';

// Shared types (cross-domain)
import { PaginatedResponse, MockRequest, ServiceError } from '../../types';

// Shared classes
import { BaseController } from '../../shared/base.controller';

// External dependencies
import { Request, Response, Application } from 'express';
```

### Controller Implementation Rules

1. **Extend BaseController**: All controllers MUST extend `BaseController`
2. **Use arrow functions**: All route handlers MUST be arrow functions for proper `this` binding
3. **Error handling**: Always use `this.handleError()` from base controller
4. **Response formatting**: Always use `this.successResponse()` from base controller
5. **Parameter validation**: Use `this.validateRequiredParams()` for required params
6. **Request logging**: Use `this.logRequest()` for all endpoints

### Service Implementation Rules

1. **Public methods only**: All service methods called by controllers MUST be public
2. **Typed parameters**: All method parameters MUST have explicit types
3. **Error handling**: Throw `ServiceError` for all errors
4. **File operations**: Use private `readJsonFile<T>()` helper for data loading
5. **Data path**: Use relative path to `../../../data/{domain}/` for data files

### Data Organization

```
data/{domain}/
├── list.json         # Main entity list with pagination
├── create-response.json # Response templates
└── {action}.json     # Specific action data
```

### Example Implementation

```typescript
// src/domains/products/product.ts
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

export interface GetProductsParams {
  page?: string;
  size?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

// src/domains/products/products.service.ts
import { PaginatedResponse, ServiceError } from '../../types';
import { Product, GetProductsParams } from './product';

export class ProductsService {
  private dataPath = path.join(__dirname, '../../../data/products');

  public getProducts(params: GetProductsParams): PaginatedResponse<Product> {
    // Implementation
  }
}

// src/domains/products/products.controller.ts
import { BaseController } from '../../shared/base.controller';
import { ProductsService } from './products.service';
import { Product, GetProductsParams } from './product';

export class ProductsController extends BaseController {
  private productsService: ProductsService;

  constructor() {
    super('ProductsController');
    this.productsService = new ProductsService();
  }

  private getProducts = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', '/api/v1/products', req.query);
      const result = this.productsService.getProducts(req.query);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(res, error, 'Failed to load products');
    }
  }

  public registerRoutes(app: Application): void {
    app.get('/api/v1/products', this.getProducts);
  }
}
```

### Development Workflow

1. **Create domain folder**: `mkdir src/domains/{domain}`
2. **Create types file**: Define all domain interfaces
3. **Create service**: Implement business logic
4. **Create controller**: Handle HTTP requests  
5. **Register controller**: Add to `server.ts` controllers array
6. **Add mock data**: Create JSON files in `data/{domain}/`
7. **Update registry**: Add endpoints to `registry.json`

### Testing Guidelines

- Each domain should be testable independently
- Mock data should be realistic and represent actual API responses
- Use TypeScript interfaces that match real API contracts
- Test error scenarios with `mock_error` parameter

### Performance Guidelines

- Use `readJsonFile<T>()` helper for type-safe file reading
- Implement pagination for large datasets
- Use query parameters for filtering and sorting
- Minimize file I/O operations per request

---

This architecture ensures clean separation of concerns, easy testing, and scalability as the mock server grows to support more domains.