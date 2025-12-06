# Feature Specification: CacheHub (Data Cache)

**Feature Branch**: `005-data-cache`
**Created**: 2025-12-03
**Status**: Implemented
**Input**: Intelligent caching system for API responses with automatic TTL management

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cache API Responses (Priority: P1)

As a developer, I want to cache API responses without manual management so that repeated calls are instant.

**Why this priority**: Core purpose of CacheHub - eliminates redundant API calls.

**Independent Test**: Can be tested by calling same endpoint twice and verifying second is instant.

**Acceptance Scenarios**:

1. **Given** I call an endpoint, **When** it's not cached, **Then** HTTP request is made
2. **Given** data is cached, **When** I call same endpoint, **Then** cached data returns instantly
3. **Given** cache key is unique, **When** I call with different params, **Then** separate cache entries

---

### User Story 2 - Automatic TTL by Data Type (Priority: P1)

As a developer, I want automatic TTL based on data type so that I don't manage expiration manually.

**Why this priority**: Developer experience - reduces configuration burden.

**Independent Test**: Can be tested by setting DataType and verifying expiration timing.

**Acceptance Scenarios**:

1. **Given** I use DataType.STATIC, **When** data is cached, **Then** TTL is 24 hours
2. **Given** I use DataType.BUSINESS, **When** data is cached, **Then** TTL is 5 minutes
3. **Given** I specify custom TTL, **When** data is cached, **Then** custom TTL is used

---

### User Story 3 - Invalidate Cache on Mutations (Priority: P1)

As a developer, I want to invalidate cache on mutations so that users see fresh data.

**Why this priority**: Data consistency - stale data after updates is unacceptable.

**Independent Test**: Can be tested by mutating data and verifying cache is cleared.

**Acceptance Scenarios**:

1. **Given** I update an entity, **When** I invalidate pattern, **Then** matching caches are cleared
2. **Given** I delete an entity, **When** I call invalidatePattern, **Then** list cache is refreshed
3. **Given** I create an entity, **When** user navigates to list, **Then** new entity appears

---

### User Story 4 - Instant Tab Switching (Priority: P1)

As a user, I want instant tab switching without loading spinners so that navigation is smooth.

**Why this priority**: User experience - perceived performance is critical.

**Independent Test**: Can be tested by switching between cached tabs and measuring time.

**Acceptance Scenarios**:

1. **Given** I viewed Customers tab, **When** I switch to Orders and back, **Then** Customers loads instantly
2. **Given** dashboard tabs are cached, **When** I switch tabs, **Then** no loading indicator shows

---

### User Story 5 - Memory Safety (Priority: P2)

As a system, I want LRU eviction so that memory usage stays bounded.

**Why this priority**: System stability - prevents memory leaks in long sessions.

**Independent Test**: Can be tested by exceeding max entries and verifying oldest evicted.

**Acceptance Scenarios**:

1. **Given** cache reaches max entries, **When** new entry added, **Then** oldest entry evicted
2. **Given** cache has expired entries, **When** cleanup runs, **Then** expired entries removed

---

### Edge Cases

- What if factory function throws? → Error propagates, no caching of error
- How to handle race conditions with multiple subscriptions? → Share single request
- What if cache key collision? → Namespace isolation prevents collisions

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cache API responses with unique keys
- **FR-002**: System MUST return cached data instantly on cache hit
- **FR-003**: System MUST execute factory function only on cache miss
- **FR-004**: System MUST support namespace isolation
- **FR-005**: System MUST auto-expire entries based on DataType TTL
- **FR-006**: System MUST support pattern-based invalidation
- **FR-007**: System MUST handle multiple subscriptions without duplicate requests
- **FR-008**: System MUST support synchronous value access
- **FR-009**: System MUST implement LRU eviction for memory safety
- **FR-010**: System MUST support custom TTL override

### Key Entities

- **CacheEntry**: Cached value with key, data, expiration, metadata
- **DataType**: TTL category (STATIC, REFERENCE, BUSINESS, USER, VOLATILE, TRANSIENT)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cache lookup in O(1) time
- **SC-002**: Dashboard tab switching: 0ms (was 1.5s)
- **SC-003**: List → detail → list navigation: 0ms (was 800ms)
- **SC-004**: Memory usage stays under configured limit

---

## Technical Implementation

### Data Types and TTL

| DataType | TTL | Use Case |
|----------|-----|----------|
| STATIC | 24 hours | Countries, currencies, config |
| REFERENCE | 1 hour | Categories, product types |
| BUSINESS | 5 minutes | Products, orders, customers |
| USER | 30 minutes | Profile, preferences |
| VOLATILE | 1 minute | Metrics, dashboard stats |
| TRANSIENT | 30 seconds | Real-time data |

### API Reference

```typescript
// Core method
cacheHub.get<T>(
  key: string,
  factory: () => Observable<T>,
  options?: { dataType?: DataType; ttl?: number },
  namespace?: string
): Observable<T>

// Cache management
cacheHub.update<T>(key: string, updater: (current: T) => T): void
cacheHub.invalidate(key: string): void
cacheHub.invalidatePattern(pattern: string): void
cacheHub.getValue<T>(key: string): T | undefined
cacheHub.has(key: string): boolean
cacheHub.clear(): void
```

### File Structure

```
src/app/shared/services/cache-hub/
├── cache-hub.service.ts
├── cache-hub.model.ts
├── data-type.enum.ts
└── index.ts
```

### Usage Example

```typescript
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly cacheHub = inject(CacheHubService);

  getCustomers(): Observable<Customer[]> {
    return this.cacheHub.get(
      'customers:all',
      () => this.http.get<Customer[]>('/api/customers'),
      { dataType: DataType.BUSINESS }
    );
  }

  updateCustomer(customer: Customer): Observable<Customer> {
    return this.http.put(`/api/customers/${customer.id}`, customer).pipe(
      tap(() => this.cacheHub.invalidatePattern('default:customers:'))
    );
  }
}
```

### Best Practices

1. **Use descriptive cache keys**: `customer-orders-2024` not `data`
2. **Include namespace in invalidation**: `'default:resource:'` not `'resource:'`
3. **Choose appropriate data types**: Don't cache volatile data for hours
4. **Invalidate related data**: When updating, clear dependent caches
5. **Clear cache on logout**: `cacheHub.clear()`

---

**Specification Version:** 1.0.0 | **Last Updated:** 2025-12-03
