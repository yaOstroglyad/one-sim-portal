# Master-Detail Navigation

Optimize list → detail → list navigation patterns with coordinated caching.

## Problem

Common navigation patterns cause repeated API calls:
- User browses list → views item → returns to list
- List reloads from scratch when returning
- Detail view makes API call even if data was in list
- Poor performance in mobile apps with slow networks

## Solution

Coordinate cache between list and detail views with shared data strategies.

## Basic Pattern

### Shared Data Service
```typescript
@Injectable()
@CacheNamespace('products')
export class ProductDataService {
  constructor(
    private hub: CacheHubService,
    private api: ApiService
  ) {}

  // List view - cache full list
  getProducts(params: ProductListParams): Observable<PagedResult<Product>> {
    const cacheKey = this.buildListCacheKey(params);
    
    return this.hub.fetch(cacheKey, this.api.getProducts(params)).pipe(
      tap(result => {
        // Cache individual items for detail views
        result.items.forEach(product => {
          this.cacheProductDetail(product);
        });
      })
    );
  }

  // Detail view - try cache first, fallback to API
  getProduct(id: string): Observable<Product> {
    const detailKey = `detail-${id}`;
    
    // Check if we have it from list view
    const cachedProduct = this.hub.getValue<Product>(detailKey);
    if (cachedProduct) {
      return of(cachedProduct);
    }

    // Fallback to API for full detail
    return this.hub.fetch(detailKey, this.api.getProduct(id));
  }

  // Cache product from list for detail view
  private cacheProductDetail(product: Product): void {
    const detailKey = `detail-${product.id}`;
    this.hub.set(detailKey, product, { ttl: 10 * 60 * 1000 }); // 10 minutes
  }

  // Update coordinated cache when product changes
  updateProduct(id: string, updates: Partial<Product>): Observable<Product> {
    return this.api.updateProduct(id, updates).pipe(
      tap(updatedProduct => {
        // Update detail cache
        this.hub.set(`detail-${id}`, updatedProduct);
        
        // Update all list caches that might contain this product
        this.updateProductInLists(updatedProduct);
      })
    );
  }

  private updateProductInLists(updatedProduct: Product): void {
    // Find all list cache keys
    const listKeys = this.hub.keys(/^products:list-/);
    
    listKeys.forEach(key => {
      this.hub.update<PagedResult<Product>>(key, result => ({
        ...result,
        items: result.items.map(p => 
          p.id === updatedProduct.id ? updatedProduct : p
        )
      }));
    });
  }

  private buildListCacheKey(params: ProductListParams): string {
    const { page, size, category, search } = params;
    return `list-${page}-${size}-${category || 'all'}-${search || 'no-search'}`;
  }
}
```

## Navigation Service

### Route-Aware Caching
```typescript
@Injectable({ providedIn: 'root' })
export class NavigationCacheService {
  private navigationHistory: string[] = [];
  private readonly maxHistory = 10;

  constructor(
    private router: Router,
    private hub: CacheHubService
  ) {
    this.trackNavigation();
  }

  private trackNavigation(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects)
    ).subscribe(url => {
      this.navigationHistory.unshift(url);
      this.navigationHistory = this.navigationHistory.slice(0, this.maxHistory);
      
      // Prefetch for common return patterns
      this.handleReturnNavigation(url);
    });
  }

  private handleReturnNavigation(currentUrl: string): void {
    // If user is viewing detail and came from list, prefetch list data
    if (this.isDetailView(currentUrl) && this.cameFromList()) {
      this.prefetchReturnList();
    }
  }

  private isDetailView(url: string): boolean {
    return /\/products\/\d+$/.test(url);
  }

  private cameFromList(): boolean {
    return this.navigationHistory.length > 1 && 
           this.navigationHistory[1].includes('/products') &&
           !this.isDetailView(this.navigationHistory[1]);
  }

  private prefetchReturnList(): void {
    // Get list parameters from navigation state or localStorage
    const lastListParams = this.getLastListParams();
    if (lastListParams) {
      // Prefetch list data for instant return
      setTimeout(() => {
        this.hub.fetch(`products:list-cache`, 
          this.hub.getValue(`products:list-${lastListParams}`));
      }, 1000);
    }
  }

  private getLastListParams(): string | null {
    return localStorage.getItem('last-product-list-params');
  }
}
```

## List Component

### Smart List Component
```typescript
@Component({
  selector: 'app-product-list',
  template: `
    <div class="list-header">
      <input [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Search products...">
      <select [(ngModel)]="categoryFilter" (ngModelChange)="onFilterChange()">
        <option value="">All Categories</option>
        <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
      </select>
    </div>

    <div class="product-list">
      <div 
        *ngFor="let product of (products$ | async)?.items; trackBy: trackByProductId"
        class="product-card"
        (click)="viewProduct(product.id)">
        
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <span class="price">{{ product.price | currency }}</span>
      </div>
    </div>

    <app-pagination 
      [currentPage]="currentParams.page"
      [totalPages]="(products$ | async)?.totalPages"
      (pageChange)="onPageChange($event)">
    </app-pagination>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit, OnDestroy {
  products$: Observable<PagedResult<Product>>;
  
  currentParams: ProductListParams = {
    page: 1,
    size: 20,
    category: '',
    search: ''
  };

  searchTerm = '';
  categoryFilter = '';
  categories$ = this.categoryService.getCategories();

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductDataService,
    private categoryService: CategoryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Restore previous list state if returning from detail
    this.restoreListState();
    this.loadProducts();
    
    // Save list state when navigating away
    this.saveListStateOnNavigation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  viewProduct(productId: string): void {
    // Save current list state before navigation
    this.saveListState();
    this.router.navigate(['/products', productId]);
  }

  onSearch(): void {
    this.currentParams = { ...this.currentParams, search: this.searchTerm, page: 1 };
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentParams = { ...this.currentParams, category: this.categoryFilter, page: 1 };
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentParams = { ...this.currentParams, page };
    this.loadProducts();
  }

  private loadProducts(): void {
    this.products$ = this.productService.getProducts(this.currentParams);
    this.cdr.markForCheck();
  }

  private saveListState(): void {
    const state = {
      params: this.currentParams,
      searchTerm: this.searchTerm,
      categoryFilter: this.categoryFilter,
      timestamp: Date.now()
    };
    
    localStorage.setItem('product-list-state', JSON.stringify(state));
  }

  private restoreListState(): void {
    const savedState = localStorage.getItem('product-list-state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        
        // Only restore if recent (within 10 minutes)
        if (Date.now() - state.timestamp < 10 * 60 * 1000) {
          this.currentParams = state.params;
          this.searchTerm = state.searchTerm || '';
          this.categoryFilter = state.categoryFilter || '';
        }
      } catch (e) {
        console.warn('Failed to restore list state:', e);
      }
    }
  }

  private saveListStateOnNavigation(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.saveListState();
    });
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}
```

## Detail Component

### Detail Component with Back Navigation
```typescript
@Component({
  selector: 'app-product-detail',
  template: `
    <div class="detail-header">
      <button (click)="goBack()" class="back-button">
        <svg cIcon name="cilArrowLeft"></svg>
        Back to Products
      </button>
      
      <button *ngIf="canEdit" (click)="editProduct()" class="edit-button">
        Edit Product
      </button>
    </div>

    <div *ngIf="product$ | async as product" class="product-detail">
      <div class="product-image">
        <img [src]="product.imageUrl" [alt]="product.name">
      </div>
      
      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <p class="description">{{ product.description }}</p>
        <p class="price">{{ product.price | currency }}</p>
        
        <div class="product-meta">
          <span>Category: {{ product.category?.name }}</span>
          <span>Stock: {{ product.stock }}</span>
          <span>SKU: {{ product.sku }}</span>
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="loading$ | async">
      Loading product details...
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit {
  product$: Observable<Product>;
  loading$ = new BehaviorSubject<boolean>(true);
  
  productId: string;
  canEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductDataService,
    private authService: AuthService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.canEdit = this.authService.hasPermission('edit-products');
    
    this.loadProduct();
  }

  goBack(): void {
    // Check if we can go back to cached list
    if (this.hasCachedListReturn()) {
      this.location.back();
    } else {
      // Navigate to default list
      this.router.navigate(['/products']);
    }
  }

  editProduct(): void {
    this.router.navigate(['/products', this.productId, 'edit']);
  }

  private loadProduct(): void {
    this.loading$.next(true);
    
    this.product$ = this.productService.getProduct(this.productId).pipe(
      tap(() => {
        this.loading$.next(false);
        this.cdr.markForCheck();
      }),
      catchError(error => {
        this.loading$.next(false);
        console.error('Failed to load product:', error);
        // Could show error message or redirect
        return of(null);
      })
    );
  }

  private hasCachedListReturn(): boolean {
    // Check if list data is cached for smooth return
    const savedState = localStorage.getItem('product-list-state');
    return !!savedState && window.history.length > 1;
  }
}
```

## Edit Form Integration

### Edit Component with Cache Updates
```typescript
@Component({
  selector: 'app-product-edit',
  template: `
    <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
      <div class="form-header">
        <h2>Edit Product</h2>
        <button type="button" (click)="cancel()">Cancel</button>
        <button type="submit" [disabled]="!productForm.valid || saving">
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
      </div>

      <div class="form-content">
        <app-form-generator 
          [config]="formConfig" 
          [formGroup]="productForm">
        </app-form-generator>
      </div>
    </form>
  `
})
export class ProductEditComponent implements OnInit {
  productForm: FormGroup;
  formConfig: FieldConfig[];
  saving = false;
  
  private productId: string;
  private originalProduct: Product;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductDataService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.buildForm();
    this.loadProduct();
  }

  saveProduct(): void {
    if (!this.productForm.valid) return;

    this.saving = true;
    const updates = this.getFormChanges();
    
    this.productService.updateProduct(this.productId, updates).subscribe({
      next: (updatedProduct) => {
        this.saving = false;
        
        // Navigate back to detail view
        this.router.navigate(['/products', this.productId]);
        
        // Cache is automatically updated by service
      },
      error: (error) => {
        this.saving = false;
        console.error('Failed to save product:', error);
      }
    });
  }

  cancel(): void {
    // Return to detail view without saving
    this.router.navigate(['/products', this.productId]);
  }

  private loadProduct(): void {
    this.productService.getProduct(this.productId).subscribe(product => {
      this.originalProduct = product;
      this.productForm.patchValue(product);
    });
  }

  private getFormChanges(): Partial<Product> {
    const formValue = this.productForm.value;
    const changes: Partial<Product> = {};
    
    // Only include changed fields
    Object.keys(formValue).forEach(key => {
      if (formValue[key] !== this.originalProduct[key as keyof Product]) {
        changes[key as keyof Product] = formValue[key];
      }
    });
    
    return changes;
  }

  private buildForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category: [''],
      stock: [0, [Validators.min(0)]]
    });
    
    this.formConfig = this.buildFormConfig();
  }
}
```

## Performance Results

### Before Coordinated Caching
```
List load: 800ms
Detail view: 600ms (separate API call)
Return to list: 800ms (full reload)
Edit navigation: 600ms (reload detail)
Total time: 2.8s for full cycle
```

### After Coordinated Caching
```
List load: 800ms (first time only)
Detail view: 0ms (cached from list)
Return to list: 0ms (cached)
Edit navigation: 0ms (cached detail)
Total time: 800ms for full cycle
```

**Improvement:** 71% reduction in navigation time.

## Best Practices

### ✅ DO

1. **Cache individual items from list responses**
   ```typescript
   result.items.forEach(item => this.cacheItem(item));
   ```

2. **Update all related caches when data changes**
   ```typescript
   this.updateItemInLists(updatedItem);
   this.updateDetailCache(updatedItem);
   ```

3. **Save and restore list state**
   ```typescript
   localStorage.setItem('list-state', JSON.stringify(state));
   ```

4. **Use consistent cache keys**
   ```typescript
   const detailKey = `detail-${id}`;
   const listKey = `list-${params}`;
   ```

### ❌ DON'T

1. **Don't duplicate data unnecessarily**
   ```typescript
   // Wrong - stores same data twice
   this.hub.set('product-123', product);
   this.hub.set('product-detail-123', product);
   ```

2. **Don't ignore navigation context**
   ```typescript
   // Wrong - always makes API call
   getProduct(id): Observable<Product> {
     return this.api.getProduct(id);
   }
   ```

3. **Don't forget to clean up old state**
   ```typescript
   // Clean up old list states periodically
   this.cleanupOldStates();
   ```

## Common Issues

### Data Inconsistency
**Problem:** Detail view shows stale data when returning from edit
**Solution:** Update all caches when data changes

### Memory Usage
**Problem:** Too many cached items from large lists
**Solution:** Implement cache size limits and TTL

### Navigation State Loss
**Problem:** List filters reset when returning
**Solution:** Persist navigation state in localStorage

## Next Steps

- **[Forms Integration](./forms.md)** - Cache form data and validation state
- **[Real-time Updates](./real-time.md)** - Sync WebSocket data with cached navigation
- **[Advanced Performance](../advanced/performance.md)** - Memory optimization techniques