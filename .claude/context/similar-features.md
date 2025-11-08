# Similar Features & Code Examples

> **Context Tags:** `@learn-patterns` `@extending`
> **Read when:** Building something similar to existing features
> **Last Updated:** 2025-11-15

## 🎯 Purpose

Find **real code examples** of similar implementations to use as reference.

---

## 📋 Data Management Features

### Customer List (Generic Table + CRUD)

**Location:** `/src/app/views/customers/`

**Pattern:** List view + detail view + create/edit forms

**Key Files:**
- `customers.component.ts` - List with GenericTable
- `CustomersDataService` - CRUD operations with caching
- Customer models in `/shared/models/business/`

**Use as reference for:**
- Building other list views (Orders, Products, etc.)
- Server-side pagination/filtering patterns
- CRUD service implementation

---

### Order Management

**Location:** `/src/app/views/orders/`

**Pattern:** Complex workflows + inventory integration

**Key Files:**
- `OrdersDataService` - Order operations
- Integration with InventoryDataService

**Use as reference for:**
- Multi-step workflows
- Service-to-service communication
- Complex business logic

---

### Dashboard Analytics

**Location:** `/src/app/views/analytics/dashboard/`

**Pattern:** Tabs + Chart.js + Period filtering + forkJoin

**Key Files:**
- `dashboard.component.ts` - Tab management
- `dashboard.service.ts` - Data aggregation with forkJoin
- Various tab components (executive, subscribers, traffic, finance)

**Features:**
- BehaviorSubject for period selection
- forkJoin for combining multiple API calls
- Chart.js integration
- Responsive dashboard layouts

**Use as reference for:**
- Building analytical views
- Chart implementations
- Multi-tab interfaces with shared state
- forkJoin patterns

---

## 🔐 Authentication & Authorization

### Login Flow

**Location:** `/src/app/views/pages/login/`

**Pattern:** OAuth2 + JWT + transformAuthError

**Key Files:**
- `login.service.ts` - OAuth authentication
- `AuthService` - Token management, permissions
- `httpInspector.service.ts` - HTTP interceptor

**Features:**
- OAuth2 password grant
- JWT token storage (LocalStorage/SessionStorage)
- Automatic token refresh
- Role-based permissions

**Use as reference for:**
- Authentication flows
- HTTP interceptors
- Protected routes

---

## 📊 Form Implementations

### Dynamic Forms (FormGenerator)

**Location:** `/src/app/shared/components/form-generator/`

**Documentation:** See `README.md` in component folder

**Real Usage Examples:**
- Customer creation form
- Product configuration form

**Features:**
- JSON schema-based forms
- HTTP dependencies (fields dependent on API calls)
- FormArray support (nested dynamic fields)
- Conditional field visibility

**Use as reference for:**
- Complex form requirements
- Dynamic field generation
- Multi-step forms

---

## 🎨 UI Components

### Dashboard Cards (Card Component)

**Locations:**
- `/src/app/views/analytics/dashboard/` - KPI cards
- Various dashboard tabs

**Pattern:** Card component with variants

```typescript
<app-card variant="elevated" color="primary">
  <h3>Revenue</h3>
  <p class="amount">$12,345</p>
</app-card>
```

**Use as reference for:**
- Creating dashboard widgets
- Using Card component variants
- Displaying metrics

---

### Tables (GenericTable)

**Locations:**
- `/src/app/views/customers/` - Customer list
- `/src/app/views/orders/` - Order list
- `/src/app/views/inventory/` - Inventory list

**Pattern:** Server-side table with pagination/sorting/filtering

```typescript
tableConfig = {
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status', filterable: true }
  ],
  serverSide: true,
  pagination: true
};
```

**Use as reference for:**
- List views with server-side operations
- Table configuration patterns

---

## 🔄 Service Patterns

### Data Services (CRUD + Cache)

**Examples:**
- `CustomersDataService` - Full CRUD with caching
- `OrdersDataService` - Complex operations
- `ProductsDataService` - Catalog management

**Pattern:** See [common-patterns.md](./common-patterns.md#data-service-pattern)

**Use as reference for:**
- Creating new data services
- Cache invalidation patterns
- Error handling

---

### UI Services (State Management)

**Examples:**
- `LanguageService` - i18n state
- `ThemeService` - Theme switching
- `VisualService` - Visual customization

**Pattern:** BehaviorSubject + LocalStorage

```typescript
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly langSubject = new BehaviorSubject<string>('en');
  readonly currentLang$ = this.langSubject.asObservable();

  setLanguage(lang: string) {
    this.langSubject.next(lang);
    localStorage.setItem('language', lang);
  }
}
```

**Use as reference for:**
- App-wide state management
- User preference storage

---

## 🎯 Real Code Locations

### Find Similar Code

```bash
# Find all data services
find /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services/data -name "*.service.ts"

# Find all list components
find /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views -name "*list.component.ts"

# Find form implementations
grep -r "FormGeneratorComponent" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views
```

---

## 📚 Related Documentation

- **Common Patterns:** [./common-patterns.md](./common-patterns.md)
- **Reusable Components:** [./reusable-components.md](./reusable-components.md)
- **HTTP Errors:** [.claude/rules/02-http-errors.md](../rules/02-http-errors.md)

---

**Last Updated:** 2025-11-15
