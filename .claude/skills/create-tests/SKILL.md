---
name: create-tests
description: Creates unit tests for Angular components and services. Use when asked to create tests, add tests, write spec, unit tests, test component, or cover with tests.
allowed-tools: Write, Read, Glob, Grep, Edit
---

# Create Angular Unit Tests (Vitest)

Create unit tests for Angular components/services following One-Sim-Portal project standards.

> **Test Framework:** Vitest 4 with `@angular/build:unit-test` builder
> **NOT Jest** — use `vi.fn()`, `vi.spyOn()`, NOT `jest.fn()`
>
> **Rules Reference:** Testing rules are defined in `constitution.md` Section XV.
> This skill provides the **procedure** and **templates** for writing tests.

## Test Framework

| Item | Value |
|------|-------|
| Framework | **Vitest 4** (not Jest) |
| Builder | `@angular/build:unit-test` |
| Environment | jsdom (default) or Browser Mode (Playwright) |
| Mock functions | `vi.fn()`, `vi.spyOn()` |
| Config | `vitest.config.ts`, `vitest.setup.ts` |

```bash
# Run tests
npm test                           # jsdom (fast)
npm test -- --browsers=chromium    # Browser Mode (real browser)
npm run test:watch                 # Watch mode
npm run test:ui                    # Vitest UI
```

## Reference Examples

| Component | Location |
|-----------|----------|
| **GenericTableComponent** | `src/app/shared/components/generic-table/generic-table.component.spec.ts` |
| **UserListComponent** | `src/app/views/users/components/user-list/user-list.component.spec.ts` |

## Procedure

1. **Read the component/service** to understand its structure
2. **Identify dependencies** that need mocking
3. **Create test file** (`*.spec.ts`) in the same directory
4. **Use `configureTestBed` helper** from `@shared/utils/testing`
5. **Follow AAA pattern** in each test (Arrange-Act-Assert)
6. **Test all public methods and outputs**
7. **Run tests** to verify: `npm test -- src/app/path/to/component.spec.ts`

## Component Test Template

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { MyComponent } from './my.component';
import { configureTestBed } from '@shared/utils/testing';
import { MyService } from '../../services';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  // Mock services
  let mockService: Partial<MyService>;

  // Mock data
  const mockData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ];

  beforeEach(async () => {
    // Arrange - Create mocks
    mockService = {
      getData: vi.fn().mockReturnValue(of(mockData)),
      saveData: vi.fn().mockReturnValue(of(undefined))
    };

    await configureTestBed({
      imports: [MyComponent],
      providers: [
        { provide: MyService, useValue: mockService }
      ]
    });

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have default signal values', () => {
      // Assert
      expect(component.isLoading()).toBe(false);
      expect(component.dataList()).toEqual([]);
    });

    it('should load data on init', async () => {
      // Act
      component.ngOnInit();
      await fixture.whenStable();

      // Assert
      expect(mockService.getData).toHaveBeenCalled();
      expect(component.dataList()).toEqual(mockData);
    });
  });

  describe('user actions', () => {
    it('should save data and show notification', async () => {
      // Arrange
      component.dataList.set(mockData);

      // Act
      component.onSave();
      await fixture.whenStable();

      // Assert
      expect(mockService.saveData).toHaveBeenCalledWith(mockData);
    });
  });
});
```

## Service Test Template

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MyService
      ]
    });

    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getData', () => {
    it('should fetch data from API', async () => {
      // Arrange
      const mockResponse = [{ id: 1, name: 'Item 1' }];

      // Act
      const resultPromise = firstValueFrom(service.getData());
      const req = httpMock.expectOne('/api/data');
      req.flush(mockResponse);

      // Assert
      const result = await resultPromise;
      expect(req.request.method).toBe('GET');
      expect(result).toEqual(mockResponse);
    });
  });
});
```

## Key Patterns

### AAA Pattern (REQUIRED)

Every test must follow Arrange-Act-Assert with comments:

```typescript
it('should update selection', () => {
  // Arrange
  const item = mockData[0];

  // Act
  component.selectItem(item);

  // Assert
  expect(component.selectedItem()).toEqual(item);
});
```

### Async Testing (Zoneless)

**DO NOT use `fakeAsync()` or `tick()`** - project is zoneless.

```typescript
// ✅ CORRECT - async/await with whenStable
it('should load data', async () => {
  component.ngOnInit();
  await fixture.whenStable();

  expect(component.data()).toBeDefined();
});

// ✅ CORRECT - firstValueFrom for observables
it('should emit values', async () => {
  const value = await firstValueFrom(component.data$);
  expect(value).toEqual(expected);
});

// ❌ FORBIDDEN - fakeAsync (requires zone.js)
it('should load data', fakeAsync(() => {
  component.ngOnInit();
  tick();
  expect(component.data()).toBeDefined();
}));
```

### Mocking with vi.fn()

```typescript
import { vi } from 'vitest';

// ✅ CORRECT - vi.fn() for mocks
const mockService = {
  save: vi.fn().mockReturnValue(of({})),
  load: vi.fn().mockReturnValue(of([]))
};

// ✅ CORRECT - Typed mock
let mockService: Partial<MyService>;
mockService = {
  getData: vi.fn().mockReturnValue(of(mockData))
};

// ✅ CORRECT - Spy on output
const saveSpy = vi.spyOn(component.saveEvent, 'emit');
component.onSave();
expect(saveSpy).toHaveBeenCalledWith(expectedData);
```

## Mocking Architecture (CRITICAL)

Vitest has **three levels of mocking** that work at different stages:

```
┌─────────────────────────────────────────────────────────────┐
│  1. MODULE ALIASES (Build Time - vitest.config.ts)          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  • Replaces entire npm packages BEFORE loading        │  │
│  │  • For packages that CRASH on import (Node.js APIs)   │  │
│  │  → src/testing/mocks/*.mock.ts                        │  │
│  │  Example: qrcode → uses pngjs → util.inherits (crash) │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  2. GLOBAL MOCKS (Runtime - vitest.setup.ts)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  • Patches globalThis/window AFTER modules load       │  │
│  │  • For browser APIs missing in jsdom                  │  │
│  │  Example: ResizeObserver, IntersectionObserver        │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  3. TEST MOCKS (Test Time - *.spec.ts)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  • vi.fn(), vi.spyOn(), TestBed providers             │  │
│  │  • For services and dependencies in specific tests    │  │
│  │  Example: CustomerService, HttpClient                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### When to Use Each Level

| Problem | Solution | Location |
|---------|----------|----------|
| npm package uses Node.js APIs (crashes on import) | Module alias | `vitest.config.ts` + `src/testing/mocks/` |
| Browser API missing in jsdom (crashes at runtime) | Global mock | `vitest.setup.ts` |
| Service/dependency mock for test | TestBed provider | `*.spec.ts` |
| Spy on method calls | `vi.spyOn()` | `*.spec.ts` |

### Adding a Module Alias Mock

If a package crashes on import with errors like `util.inherits is not a function`:

1. Create mock file: `src/testing/mocks/{package}.mock.ts`
2. Add alias to `vitest.config.ts`:
   ```typescript
   alias: {
     '{package}': path.resolve(__dirname, 'src/testing/mocks/{package}.mock.ts')
   }
   ```

### Adding a Global Mock

If code fails at runtime with `ReferenceError: X is not defined`:

1. Add to `vitest.setup.ts`:
   ```typescript
   globalThis.X = class MockX { /* ... */ };
   ```

### Helper Functions

Reduce duplication with helpers:

```typescript
// Helper to initialize component with data
function initializeComponent(config = mockConfig, data = mockData): void {
  component.config$ = of(config);
  component.data$ = of(data);
  component.ngOnChanges({
    config$: new SimpleChange(null, component.config$, true),
    data$: new SimpleChange(null, component.data$, true)
  });
}

it('should process data', async () => {
  initializeComponent();
  const vm = await firstValueFrom(component.viewModel$);
  expect(vm.data).toEqual(mockData);
});
```

## Test Organization

Structure tests by feature area:

```typescript
describe('MyComponent', () => {
  // Setup
  beforeEach(async () => { /* ... */ });

  it('should create', () => { /* ... */ });

  describe('initialization', () => {
    it('should have default values', () => { /* ... */ });
    it('should load data on init', async () => { /* ... */ });
  });

  describe('user actions', () => {
    it('should handle save', async () => { /* ... */ });
    it('should handle delete', async () => { /* ... */ });
  });

  describe('validation', () => {
    it('should validate required fields', () => { /* ... */ });
  });
});
```

## Initialization Order Test (List Components)

For list components, add a test verifying initialization order with explanatory comment:

```typescript
/**
 * CRITICAL: Table config must be initialized BEFORE data loading completes.
 *
 * Why this order matters:
 * 1. The template binds to tableConfig$ immediately on render
 * 2. If tableConfig$ is undefined, generic-table cannot initialize
 * 3. Data loading is async (HTTP) - config must exist before it completes
 * 4. Wrong order causes infinite loading state (config undefined when data arrives)
 *
 * Correct order: initTableConfig() → loadData()
 * Wrong order:   loadData() → tableConfig$ set in subscribe (too late!)
 */
it('should initialize tableConfig$ synchronously in ngOnInit (before async data loads)', () => {
  // Act - call ngOnInit but do NOT await async operations
  component.ngOnInit();

  // Assert - tableConfig$ must be defined IMMEDIATELY (synchronously)
  // If this fails, it means tableConfig$ is set inside async callback (wrong!)
  expect(component.tableConfig$).toBeDefined();
  expect(component.tableConfig$.getValue()).toBeDefined();
});
```

**Reference:** `src/app/views/users/components/user-list/user-list.component.spec.ts`

## Quick Checklist

Before finishing, verify against `constitution.md`:
- [ ] Uses `configureTestBed` helper
- [ ] All dependencies are mocked (no real API calls)
- [ ] Uses `vi.fn()` and `vi.spyOn()` for mocks/spies
- [ ] AAA pattern with comments in each test
- [ ] `async/await` + `whenStable()` for async (NOT fakeAsync)
- [ ] `firstValueFrom()` for observable testing
- [ ] Tests organized by describe blocks
- [ ] All public methods have test coverage
- [ ] **List components:** initialization order test with documentation
- [ ] **Module crashes on import?** → Add alias in `vitest.config.ts`
- [ ] **Browser API missing?** → Add global mock in `vitest.setup.ts`
