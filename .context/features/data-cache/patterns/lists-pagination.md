# Lists & Pagination

Smart caching strategies for paginated lists and data tables.

## Problem

Large data tables with pagination making repeated API calls:
- Same page requested multiple times
- Search/filter combinations recreate data
- Slow navigation between pages
- Poor user experience with loading delays

## Solution

Cache pages individually with smart key generation and pre-fetch adjacent pages.

## Basic Page Caching

### Service Implementation
```typescript
@Injectable()
@CacheNamespace('customers')
export class CustomerService {
  constructor(
    private hub: CacheHubService,
    private api: ApiService
  ) {}

  getCustomers(params: CustomerListParams): Observable<PagedResult<Customer>> {
    const cacheKey = this.buildCacheKey(params);
    
    return this.hub.fetch(cacheKey, this.api.getCustomers(params)).pipe(
      tap(result => {
        // Prefetch adjacent pages for smooth navigation
        this.prefetchAdjacentPages(params, result.totalPages);
      })
    );
  }

  private buildCacheKey(params: CustomerListParams): string {
    const { page, size, search, status, sortBy, sortDir } = params;
    
    // Create deterministic cache key from all parameters
    const keyParts = [
      `page-${page}`,
      `size-${size}`,
      search ? `search-${btoa(search)}` : '',
      status ? `status-${status}` : '',
      sortBy ? `sort-${sortBy}-${sortDir}` : ''
    ].filter(part => part.length > 0);
    
    return keyParts.join('_');
  }

  private prefetchAdjacentPages(params: CustomerListParams, totalPages: number): void {
    const currentPage = params.page;
    const pagesToPrefetch: number[] = [];
    
    // Prefetch next page
    if (currentPage < totalPages) {
      pagesToPrefetch.push(currentPage + 1);
    }
    
    // Prefetch previous page
    if (currentPage > 1) {
      pagesToPrefetch.push(currentPage - 1);
    }
    
    // Prefetch in background
    pagesToPrefetch.forEach(page => {
      const prefetchParams = { ...params, page };
      const prefetchKey = this.buildCacheKey(prefetchParams);
      
      // Only prefetch if not already cached
      if (!this.hub.has(prefetchKey)) {
        setTimeout(() => {
          this.hub.fetch(prefetchKey, this.api.getCustomers(prefetchParams))
            .subscribe(); // Subscribe to trigger the request
        }, 100);
      }
    });
  }
}
```

## Component Integration

### Table Component
```typescript
@Component({
  selector: 'app-customer-list',
  template: `
    <div class="table-controls">
      <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Search customers...">
      <select [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <app-generic-table
      [data$]="customers$"
      [config]="tableConfig"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)">
    </app-generic-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerListComponent implements OnInit {
  customers$: Observable<PagedResult<Customer>>;
  
  // Current filters and pagination
  currentParams: CustomerListParams = {
    page: 1,
    size: 20,
    search: '',
    status: '',
    sortBy: 'name',
    sortDir: 'asc'
  };

  searchTerm = '';
  statusFilter = '';
  tableConfig = this.buildTableConfig();

  constructor(
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  onSearch(): void {
    // Debounce search input
    this.currentParams = {
      ...this.currentParams,
      search: this.searchTerm,
      page: 1 // Reset to first page
    };
    this.loadCustomers();
  }

  onFilterChange(): void {
    this.currentParams = {
      ...this.currentParams,
      status: this.statusFilter,
      page: 1
    };
    this.loadCustomers();
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, page };
    this.loadCustomers();
  }

  onSortChange(sort: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentParams = {
      ...this.currentParams,
      sortBy: sort.column,
      sortDir: sort.direction,
      page: 1
    };
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.customers$ = this.customerService.getCustomers(this.currentParams);
    this.cdr.markForCheck();
  }
}
```

## Advanced: Infinite Scroll

### Infinite Scroll Service
```typescript
@Injectable()
@CacheNamespace('infinite')
export class InfiniteScrollService {
  constructor(private hub: CacheHubService) {}

  loadInfiniteData<T>(
    baseKey: string,
    fetchFn: (page: number) => Observable<PagedResult<T>>,
    page: number = 1
  ): Observable<T[]> {
    const pageKey = `${baseKey}-page-${page}`;
    
    return this.hub.fetch(pageKey, fetchFn(page)).pipe(
      switchMap(pageResult => {
        if (page === 1) {
          // First page - return items directly
          return of(pageResult.items);
        } else {
          // Subsequent pages - combine with previous data
          const previousKey = `${baseKey}-accumulated-${page - 1}`;
          const previousData = this.hub.getValue<T[]>(previousKey) || [];
          const combinedData = [...previousData, ...pageResult.items];
          
          // Cache accumulated data
          const accumulatedKey = `${baseKey}-accumulated-${page}`;
          this.hub.set(accumulatedKey, combinedData);
          
          return of(combinedData);
        }
      })
    );
  }

  resetInfiniteCache(baseKey: string): void {
    // Clear all pages and accumulated data
    this.hub.invalidate(new RegExp(`^${baseKey}-`));
  }
}
```

### Infinite Scroll Component
```typescript
@Component({
  selector: 'app-infinite-list',
  template: `
    <div class="infinite-container" #scrollContainer>
      <div *ngFor="let item of items$ | async; trackBy: trackByFn" class="list-item">
        {{ item.name }}
      </div>
      
      <div *ngIf="loading$ | async" class="loading">
        Loading more...
      </div>
    </div>
  `
})
export class InfiniteListComponent implements OnInit {
  items$: Observable<Customer[]>;
  loading$ = new BehaviorSubject<boolean>(false);
  
  private currentPage = 1;
  private hasMorePages = true;

  @ViewChild('scrollContainer') scrollContainer: ElementRef;

  constructor(
    private infiniteService: InfiniteScrollService,
    private api: ApiService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.loadPage(1);
    this.setupScrollListener();
  }

  private loadPage(page: number): void {
    if (!this.hasMorePages) return;

    this.loading$.next(true);
    
    this.items$ = this.infiniteService.loadInfiniteData(
      'customers',
      (p) => this.api.getCustomers({ page: p, size: 20 }),
      page
    ).pipe(
      tap((items) => {
        this.currentPage = page;
        this.loading$.next(false);
        
        // Check if we have more pages (simplified)
        this.hasMorePages = items.length === page * 20;
      })
    );
  }

  private setupScrollListener(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    fromEvent(this.scrollContainer.nativeElement, 'scroll').pipe(
      debounceTime(100),
      filter(() => this.isNearBottom()),
      filter(() => !this.loading$.value && this.hasMorePages)
    ).subscribe(() => {
      this.loadPage(this.currentPage + 1);
    });
  }

  private isNearBottom(): boolean {
    const element = this.scrollContainer.nativeElement;
    return element.scrollTop + element.clientHeight >= element.scrollHeight - 100;
  }

  trackByFn(index: number, item: Customer): string {
    return item.id;
  }
}
```

## Search with Debouncing

### Search Service
```typescript
@Injectable()
@CacheNamespace('search')
export class SearchService {
  private searchSubject = new Subject<string>();
  
  constructor(private hub: CacheHubService, private api: ApiService) {
    this.setupSearchStream();
  }

  search(query: string): Observable<SearchResult[]> {
    this.searchSubject.next(query);
    
    // Return cached results immediately if available
    const cacheKey = `query-${btoa(query.toLowerCase())}`;
    return this.hub.fetch(cacheKey, of([])); // Will be updated by search stream
  }

  private setupSearchStream(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(query => query.length >= 2),
      switchMap(query => {
        const cacheKey = `query-${btoa(query.toLowerCase())}`;
        
        return this.hub.get(
          cacheKey,
          () => this.api.search(query),
          { ttl: 2 * 60 * 1000 } // 2 minutes for search results
        );
      })
    ).subscribe();
  }
}
```

## Performance Optimization

### Virtual Scrolling Cache
```typescript
@Injectable()
export class VirtualScrollCacheService {
  private itemHeight = 50; // Fixed item height
  private visibleItems = 20; // Items visible at once

  constructor(private hub: CacheHubService) {}

  getVirtualData<T>(
    totalItems: number,
    startIndex: number,
    fetchFn: (start: number, count: number) => Observable<T[]>
  ): Observable<T[]> {
    const endIndex = Math.min(startIndex + this.visibleItems, totalItems);
    const pageSize = 100; // Fetch larger chunks
    
    // Calculate which "chunk" we need
    const chunkStart = Math.floor(startIndex / pageSize) * pageSize;
    const chunkKey = `chunk-${chunkStart}-${pageSize}`;
    
    return this.hub.fetch(chunkKey, fetchFn(chunkStart, pageSize)).pipe(
      map(chunk => {
        // Extract visible portion from chunk
        const relativeStart = startIndex - chunkStart;
        const relativeEnd = endIndex - chunkStart;
        return chunk.slice(relativeStart, relativeEnd);
      })
    );
  }
}
```

## Cache Invalidation Strategies

### Smart Invalidation
```typescript
@Injectable()
export class ListCacheManager {
  constructor(private hub: CacheHubService) {}

  // Invalidate all pages when data changes
  invalidateListCache(listType: string): void {
    this.hub.invalidate(new RegExp(`^${listType}:page-`));
  }

  // Invalidate specific filters only
  invalidateFilteredCache(listType: string, filters: any): void {
    const filterStr = this.serializeFilters(filters);
    this.hub.invalidate(new RegExp(`${listType}:.*${filterStr}`));
  }

  // Optimize: Update specific page instead of invalidating
  updateItemInPages<T>(
    listType: string,
    itemId: string,
    updatedItem: T,
    idField: keyof T = 'id' as keyof T
  ): void {
    const pageKeys = this.hub.keys(new RegExp(`^${listType}:page-`));
    
    pageKeys.forEach(key => {
      this.hub.update<PagedResult<T>>(key, result => {
        const updatedItems = result.items.map(item =>
          item[idField] === itemId ? updatedItem : item
        );
        return { ...result, items: updatedItems };
      });
    });
  }

  private serializeFilters(filters: any): string {
    return btoa(JSON.stringify(filters)).replace(/[^a-zA-Z0-9]/g, '');
  }
}
```

## Best Practices

### ✅ DO

1. **Use consistent cache keys**
   ```typescript
   // Include all parameters that affect the result
   buildCacheKey({ page, size, search, filters }): string
   ```

2. **Prefetch intelligently**
   ```typescript
   // Only prefetch adjacent pages, not all pages
   prefetchAdjacentPages(currentPage, totalPages)
   ```

3. **Handle cache invalidation**
   ```typescript
   // Clear related caches when data changes
   this.cacheManager.invalidateListCache('customers');
   ```

4. **Use appropriate TTL for lists**
   ```typescript
   // Lists change more frequently than reference data
   { ttl: 5 * 60 * 1000 } // 5 minutes
   ```

### ❌ DON'T

1. **Don't cache entire datasets**
   ```typescript
   // Wrong - loads all data at once
   getAllCustomers(): Observable<Customer[]>
   ```

2. **Don't use random keys**
   ```typescript
   // Wrong - prevents cache hits
   `page-${Math.random()}`
   ```

3. **Don't ignore filter parameters**
   ```typescript
   // Wrong - same key for different filters
   this.hub.fetch('customers', this.api.getCustomers(filters));
   ```

## Common Issues

### Stale List Data
**Problem:** List shows old data after item creation
**Solution:** Invalidate list cache after mutations

### Memory Usage with Large Lists
**Problem:** Too many cached pages
**Solution:** Implement cache size limits and LRU eviction

### Search Performance
**Problem:** Search API called on every keystroke
**Solution:** Debounce search and cache results

## Next Steps

- **[Master-Detail Navigation](./master-detail.md)** - Cache coordination between list and detail views
- **[Real-time Updates](./real-time.md)** - Sync live data with cached lists
- **[Forms Integration](./forms.md)** - Cache form data and validation state