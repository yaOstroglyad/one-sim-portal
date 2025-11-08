# Real-time Updates

Synchronize WebSocket data with cached content for consistent real-time experience.

## Problem

Real-time applications face cache synchronization challenges:
- WebSocket updates don't reflect in cached data
- Inconsistent state between real-time and cached views
- Cache invalidation storms during high-frequency updates
- Memory leaks from WebSocket subscriptions

## Solution

Intelligent cache synchronization with debounced updates and selective invalidation.

## Basic WebSocket Integration

### Real-time Cache Service
```typescript
@Injectable({ providedIn: 'root' })
export class RealtimeCacheService {
  private wsConnection: WebSocketSubject<any>;
  private updateQueues = new Map<string, Subject<any>>();

  constructor(
    private hub: CacheHubService,
    private webSocketService: WebSocketService
  ) {
    this.initializeWebSocket();
  }

  private initializeWebSocket(): void {
    this.wsConnection = this.webSocketService.connect();
    
    this.wsConnection.subscribe({
      next: (message) => this.handleWebSocketMessage(message),
      error: (error) => console.error('WebSocket error:', error),
      complete: () => console.log('WebSocket connection closed')
    });
  }

  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'ENTITY_UPDATED':
        this.handleEntityUpdate(message.data);
        break;
      case 'ENTITY_CREATED':
        this.handleEntityCreation(message.data);
        break;
      case 'ENTITY_DELETED':
        this.handleEntityDeletion(message.data);
        break;
      case 'BULK_UPDATE':
        this.handleBulkUpdate(message.data);
        break;
    }
  }

  // Subscribe to real-time updates for specific entity type
  subscribeToEntity(entityType: string): Observable<any> {
    if (!this.updateQueues.has(entityType)) {
      const queue = new Subject<any>();
      this.updateQueues.set(entityType, queue);
      
      // Send subscription message to server
      this.wsConnection.next({
        type: 'SUBSCRIBE',
        entityType: entityType
      });
    }
    
    return this.updateQueues.get(entityType)!.asObservable();
  }

  // Unsubscribe from entity updates
  unsubscribeFromEntity(entityType: string): void {
    const queue = this.updateQueues.get(entityType);
    if (queue) {
      queue.complete();
      this.updateQueues.delete(entityType);
      
      this.wsConnection.next({
        type: 'UNSUBSCRIBE',
        entityType: entityType
      });
    }
  }

  private handleEntityUpdate(data: EntityUpdateData): void {
    const { entityType, entityId, changes, version } = data;
    
    // Update detail cache
    const detailKey = `${entityType}:detail-${entityId}`;
    this.hub.update(detailKey, (current: any) => {
      if (current && current.version < version) {
        return { ...current, ...changes, version };
      }
      return current;
    });

    // Update list caches that contain this entity
    this.updateEntityInLists(entityType, entityId, changes, version);
    
    // Notify subscribers
    const queue = this.updateQueues.get(entityType);
    if (queue) {
      queue.next({ type: 'UPDATE', entityId, changes });
    }
  }

  private handleEntityCreation(data: EntityCreationData): void {
    const { entityType, entity } = data;
    
    // Add to detail cache
    this.hub.set(`${entityType}:detail-${entity.id}`, entity);
    
    // Add to relevant list caches (debounced to avoid spam)
    this.debouncedListUpdate(entityType, 'CREATE', entity);
    
    // Notify subscribers
    const queue = this.updateQueues.get(entityType);
    if (queue) {
      queue.next({ type: 'CREATE', entity });
    }
  }

  private handleEntityDeletion(data: EntityDeletionData): void {
    const { entityType, entityId } = data;
    
    // Remove from detail cache
    this.hub.invalidate(`${entityType}:detail-${entityId}`);
    
    // Remove from list caches
    this.removeEntityFromLists(entityType, entityId);
    
    // Notify subscribers
    const queue = this.updateQueues.get(entityType);
    if (queue) {
      queue.next({ type: 'DELETE', entityId });
    }
  }

  private updateEntityInLists(
    entityType: string, 
    entityId: string, 
    changes: any, 
    version: number
  ): void {
    const listKeys = this.hub.keys(new RegExp(`^${entityType}:list-`));
    
    listKeys.forEach(key => {
      this.hub.update<PagedResult<any>>(key, result => {
        const updatedItems = result.items.map(item => {
          if (item.id === entityId && item.version < version) {
            return { ...item, ...changes, version };
          }
          return item;
        });
        
        return { ...result, items: updatedItems };
      });
    });
  }

  private removeEntityFromLists(entityType: string, entityId: string): void {
    const listKeys = this.hub.keys(new RegExp(`^${entityType}:list-`));
    
    listKeys.forEach(key => {
      this.hub.update<PagedResult<any>>(key, result => ({
        ...result,
        items: result.items.filter(item => item.id !== entityId),
        totalCount: result.totalCount - 1
      }));
    });
  }

  // Debounced list updates to prevent spam during bulk operations
  private debouncedListUpdate = debounce((entityType: string, operation: string, data: any) => {
    if (operation === 'CREATE') {
      // Invalidate list caches to trigger refresh
      // More efficient than trying to insert into all possible list combinations
      this.hub.invalidate(new RegExp(`^${entityType}:list-`));
    }
  }, 1000);

  private handleBulkUpdate(data: BulkUpdateData): void {
    const { entityType, updates } = data;
    
    // For bulk updates, invalidate entire cache namespace
    // More efficient than updating hundreds of individual items
    this.hub.invalidate(new RegExp(`^${entityType}:`));
    
    // Notify subscribers of bulk change
    const queue = this.updateQueues.get(entityType);
    if (queue) {
      queue.next({ type: 'BULK_UPDATE', count: updates.length });
    }
  }
}
```

## Smart Service Integration

### Customer Service with Real-time
```typescript
@Injectable()
@CacheNamespace('customers')
export class CustomerService {
  constructor(
    private hub: CacheHubService,
    private api: ApiService,
    private realtime: RealtimeCacheService
  ) {
    this.setupRealtimeSync();
  }

  // Get customers with real-time updates
  getCustomers(params: CustomerListParams): Observable<PagedResult<Customer>> {
    const cacheKey = this.buildCacheKey(params);
    
    return this.hub.fetch(cacheKey, this.api.getCustomers(params)).pipe(
      // Merge with real-time updates
      switchMap(initialData => 
        merge(
          of(initialData),
          this.getRealtimeUpdates(params)
        )
      )
    );
  }

  // Get customer with real-time updates
  getCustomer(id: string): Observable<Customer> {
    const detailKey = `detail-${id}`;
    
    return this.hub.fetch(detailKey, this.api.getCustomer(id)).pipe(
      switchMap(initialCustomer => 
        merge(
          of(initialCustomer),
          this.getCustomerUpdates(id)
        )
      )
    );
  }

  // Create customer with optimistic updates
  createCustomer(customer: CustomerCreateRequest): Observable<Customer> {
    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticCustomer = { ...customer, id: tempId, status: 'creating' };
    
    // Add to cache immediately
    this.hub.set(`detail-${tempId}`, optimisticCustomer);
    this.addToListCaches(optimisticCustomer);
    
    return this.api.createCustomer(customer).pipe(
      tap(createdCustomer => {
        // Replace optimistic data with real data
        this.hub.invalidate(`detail-${tempId}`);
        this.hub.set(`detail-${createdCustomer.id}`, createdCustomer);
        this.replaceInListCaches(tempId, createdCustomer);
      }),
      catchError(error => {
        // Rollback optimistic update
        this.hub.invalidate(`detail-${tempId}`);
        this.removeFromListCaches(tempId);
        throw error;
      })
    );
  }

  private setupRealtimeSync(): void {
    // Subscribe to customer updates
    this.realtime.subscribeToEntity('customers').subscribe(update => {
      this.handleRealtimeUpdate(update);
    });
  }

  private getRealtimeUpdates(params: CustomerListParams): Observable<PagedResult<Customer>> {
    return this.realtime.subscribeToEntity('customers').pipe(
      filter(update => this.shouldUpdateList(update, params)),
      switchMap(() => {
        // Return updated cached data
        const cacheKey = this.buildCacheKey(params);
        const cachedData = this.hub.getValue<PagedResult<Customer>>(cacheKey);
        return cachedData ? of(cachedData) : EMPTY;
      })
    );
  }

  private getCustomerUpdates(customerId: string): Observable<Customer> {
    return this.realtime.subscribeToEntity('customers').pipe(
      filter(update => update.entityId === customerId),
      switchMap(() => {
        const cachedCustomer = this.hub.getValue<Customer>(`detail-${customerId}`);
        return cachedCustomer ? of(cachedCustomer) : EMPTY;
      })
    );
  }

  private shouldUpdateList(update: any, params: CustomerListParams): boolean {
    // Logic to determine if update affects current list view
    switch (update.type) {
      case 'CREATE':
        return this.matchesListFilters(update.entity, params);
      case 'UPDATE':
        return true; // Might affect sorting or filtering
      case 'DELETE':
        return true; // Item might be in current list
      case 'BULK_UPDATE':
        return true; // Safer to refresh
      default:
        return false;
    }
  }

  private matchesListFilters(customer: Customer, params: CustomerListParams): boolean {
    // Check if new customer matches current filters
    if (params.status && customer.status !== params.status) return false;
    if (params.search && !customer.name.toLowerCase().includes(params.search.toLowerCase())) return false;
    if (params.companyId && customer.companyId !== params.companyId) return false;
    
    return true;
  }

  private addToListCaches(customer: Customer): void {
    // Add to all matching list caches
    const listKeys = this.hub.keys(/^customers:list-/);
    
    listKeys.forEach(key => {
      this.hub.update<PagedResult<Customer>>(key, result => {
        // Only add if it matches the list filters
        const cacheParams = this.parseCacheKey(key);
        if (this.matchesListFilters(customer, cacheParams)) {
          return {
            ...result,
            items: [customer, ...result.items],
            totalCount: result.totalCount + 1
          };
        }
        return result;
      });
    });
  }

  private replaceInListCaches(tempId: string, realCustomer: Customer): void {
    const listKeys = this.hub.keys(/^customers:list-/);
    
    listKeys.forEach(key => {
      this.hub.update<PagedResult<Customer>>(key, result => ({
        ...result,
        items: result.items.map(customer => 
          customer.id === tempId ? realCustomer : customer
        )
      }));
    });
  }

  private removeFromListCaches(customerId: string): void {
    const listKeys = this.hub.keys(/^customers:list-/);
    
    listKeys.forEach(key => {
      this.hub.update<PagedResult<Customer>>(key, result => ({
        ...result,
        items: result.items.filter(customer => customer.id !== customerId),
        totalCount: result.totalCount - 1
      }));
    });
  }
}
```

## Component Integration

### Real-time Dashboard Component
```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Live Dashboard</h1>
        <div class="connection-status" [class]="connectionStatus">
          <svg cIcon [name]="getStatusIcon()"></svg>
          {{ getStatusText() }}
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card" *ngFor="let metric of metrics$ | async">
          <h3>{{ metric.title }}</h3>
          <div class="metric-value" [class.updating]="metric.isUpdating">
            {{ metric.value | number }}
          </div>
          <div class="metric-change" [class]="metric.changeType">
            {{ metric.change }}
          </div>
        </div>
      </div>

      <div class="live-feed">
        <h2>Live Activity</h2>
        <div class="activity-list">
          <div 
            *ngFor="let activity of activities$ | async; trackBy: trackActivity"
            class="activity-item"
            [class.new]="activity.isNew">
            <span class="timestamp">{{ activity.timestamp | date:'short' }}</span>
            <span class="description">{{ activity.description }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  metrics$: Observable<DashboardMetric[]>;
  activities$: Observable<Activity[]>;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'connecting';

  private destroy$ = new Subject<void>();
  private newActivitySubject = new Subject<Activity>();

  constructor(
    private dashboardService: DashboardService,
    private realtime: RealtimeCacheService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupRealtimeUpdates();
    this.monitorConnection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up real-time subscriptions
    this.realtime.unsubscribeFromEntity('dashboard-metrics');
    this.realtime.unsubscribeFromEntity('activities');
  }

  private loadDashboardData(): void {
    // Load initial data with caching
    this.metrics$ = this.dashboardService.getMetrics().pipe(
      shareReplay(1)
    );
    
    this.activities$ = this.dashboardService.getActivities().pipe(
      // Merge with real-time activity updates
      switchMap(initialActivities => 
        merge(
          of(initialActivities),
          this.newActivitySubject.pipe(
            scan((activities, newActivity) => {
              // Add new activity and mark as new
              const updatedActivity = { ...newActivity, isNew: true };
              const updated = [updatedActivity, ...activities.slice(0, 49)]; // Keep last 50
              
              // Remove 'new' flag after animation
              setTimeout(() => {
                updatedActivity.isNew = false;
                this.cdr.markForCheck();
              }, 3000);
              
              return updated;
            }, initialActivities)
          )
        )
      ),
      shareReplay(1)
    );
  }

  private setupRealtimeUpdates(): void {
    // Subscribe to metric updates
    this.realtime.subscribeToEntity('dashboard-metrics').pipe(
      takeUntil(this.destroy$)
    ).subscribe(update => {
      if (update.type === 'UPDATE') {
        this.handleMetricUpdate(update);
      }
    });

    // Subscribe to new activities
    this.realtime.subscribeToEntity('activities').pipe(
      takeUntil(this.destroy$),
      filter(update => update.type === 'CREATE')
    ).subscribe(update => {
      this.newActivitySubject.next(update.entity);
    });
  }

  private handleMetricUpdate(update: any): void {
    // Mark metric as updating for visual feedback
    this.metrics$ = this.metrics$.pipe(
      map(metrics => 
        metrics.map(metric => {
          if (metric.id === update.entityId) {
            return { ...metric, isUpdating: true };
          }
          return metric;
        })
      ),
      delay(500), // Show update indicator for 500ms
      map(metrics => 
        metrics.map(metric => ({ ...metric, isUpdating: false }))
      )
    );
    
    this.cdr.markForCheck();
  }

  private monitorConnection(): void {
    // Monitor WebSocket connection status
    this.realtime.connectionStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(status => {
      this.connectionStatus = status;
      this.cdr.markForCheck();
    });
  }

  getStatusIcon(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'cilCheckCircle';
      case 'connecting': return 'cilSync';
      case 'disconnected': return 'cilXCircle';
      default: return 'cilInfo';
    }
  }

  getStatusText(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'Live';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Offline';
      default: return 'Unknown';
    }
  }

  trackActivity(index: number, activity: Activity): string {
    return activity.id;
  }
}
```

## Offline-to-Online Sync

### Offline Sync Service
```typescript
@Injectable()
export class OfflineSyncService {
  private offlineActions: OfflineAction[] = [];
  private isOnline$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor(
    private hub: CacheHubService,
    private realtime: RealtimeCacheService
  ) {
    this.monitorOnlineStatus();
    this.setupSyncOnReconnect();
  }

  // Queue action for offline execution
  queueOfflineAction(action: OfflineAction): void {
    this.offlineActions.push({
      ...action,
      timestamp: Date.now(),
      id: this.generateActionId()
    });
    
    // Save to persistent storage
    localStorage.setItem('offline-actions', JSON.stringify(this.offlineActions));
  }

  // Sync when coming back online
  private setupSyncOnReconnect(): void {
    this.isOnline$.pipe(
      distinctUntilChanged(),
      filter(isOnline => isOnline),
      switchMap(() => this.syncOfflineActions())
    ).subscribe();
  }

  private syncOfflineActions(): Observable<any> {
    if (this.offlineActions.length === 0) {
      return of(null);
    }

    console.log(`Syncing ${this.offlineActions.length} offline actions...`);

    // Execute actions in order
    return from(this.offlineActions).pipe(
      concatMap(action => this.executeAction(action)),
      tap(() => {
        // Remove synced action
        this.offlineActions.shift();
        this.updateOfflineStorage();
      }),
      finalize(() => {
        console.log('Offline sync completed');
      })
    );
  }

  private executeAction(action: OfflineAction): Observable<any> {
    switch (action.type) {
      case 'CREATE_CUSTOMER':
        return this.syncCreateCustomer(action);
      case 'UPDATE_CUSTOMER':
        return this.syncUpdateCustomer(action);
      case 'DELETE_CUSTOMER':
        return this.syncDeleteCustomer(action);
      default:
        return of(null);
    }
  }

  private syncCreateCustomer(action: OfflineAction): Observable<any> {
    return this.customerService.createCustomer(action.data).pipe(
      tap(createdCustomer => {
        // Update cache with real server data
        this.hub.invalidate(`customers:detail-${action.tempId}`);
        this.hub.set(`customers:detail-${createdCustomer.id}`, createdCustomer);
      }),
      catchError(error => {
        console.error('Failed to sync customer creation:', error);
        // Mark action as failed, don't remove from queue
        action.failed = true;
        return of(null);
      })
    );
  }

  private monitorOnlineStatus(): void {
    fromEvent(window, 'online').subscribe(() => {
      this.isOnline$.next(true);
    });

    fromEvent(window, 'offline').subscribe(() => {
      this.isOnline$.next(false);
    });
  }

  private generateActionId(): string {
    return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateOfflineStorage(): void {
    localStorage.setItem('offline-actions', JSON.stringify(this.offlineActions));
  }
}
```

## Performance Optimizations

### Debounced Update Handling
```typescript
@Injectable()
export class OptimizedRealtimeService {
  private updateBuffer = new Map<string, any[]>();
  private flushSubject = new Subject<void>();

  constructor(private hub: CacheHubService) {
    this.setupBatchedUpdates();
  }

  // Buffer updates and flush in batches
  bufferUpdate(entityType: string, update: any): void {
    if (!this.updateBuffer.has(entityType)) {
      this.updateBuffer.set(entityType, []);
    }
    
    this.updateBuffer.get(entityType)!.push(update);
    this.flushSubject.next();
  }

  private setupBatchedUpdates(): void {
    this.flushSubject.pipe(
      debounceTime(100), // Batch updates for 100ms
      tap(() => this.flushUpdates())
    ).subscribe();
  }

  private flushUpdates(): void {
    this.updateBuffer.forEach((updates, entityType) => {
      if (updates.length > 0) {
        this.processBatchedUpdates(entityType, updates);
        this.updateBuffer.set(entityType, []);
      }
    });
  }

  private processBatchedUpdates(entityType: string, updates: any[]): void {
    // Group updates by type
    const creates = updates.filter(u => u.type === 'CREATE');
    const updates_only = updates.filter(u => u.type === 'UPDATE');
    const deletes = updates.filter(u => u.type === 'DELETE');

    // Process in efficient batches
    if (creates.length > 0) this.handleBatchCreates(entityType, creates);
    if (updates_only.length > 0) this.handleBatchUpdates(entityType, updates_only);
    if (deletes.length > 0) this.handleBatchDeletes(entityType, deletes);
  }

  private handleBatchCreates(entityType: string, creates: any[]): void {
    // For many creates, invalidate lists instead of updating each
    if (creates.length > 10) {
      this.hub.invalidate(new RegExp(`^${entityType}:list-`));
    } else {
      creates.forEach(create => this.addToLists(entityType, create.entity));
    }
  }

  private handleBatchUpdates(entityType: string, updates: any[]): void {
    // Update individual items in cache
    updates.forEach(update => {
      this.hub.update(`${entityType}:detail-${update.entityId}`, current => ({
        ...current,
        ...update.changes
      }));
    });

    // Update lists efficiently
    this.updateListsForBatch(entityType, updates);
  }

  private handleBatchDeletes(entityType: string, deletes: any[]): void {
    deletes.forEach(deleteUpdate => {
      this.hub.invalidate(`${entityType}:detail-${deleteUpdate.entityId}`);
    });

    // Remove from lists
    this.removeFromListsForBatch(entityType, deletes.map(d => d.entityId));
  }
}
```

## Best Practices

### ✅ DO

1. **Debounce high-frequency updates**
   ```typescript
   this.updates$.pipe(debounceTime(100)).subscribe(...)
   ```

2. **Use optimistic updates for better UX**
   ```typescript
   // Update UI immediately, rollback on error
   this.updateCacheOptimistically(data);
   ```

3. **Handle connection states gracefully**
   ```typescript
   this.connectionStatus$.subscribe(status => {
     this.showOfflineMode = status === 'disconnected';
   });
   ```

4. **Batch updates for performance**
   ```typescript
   // Don't update cache for every individual change
   this.bufferUpdates(updates);
   ```

### ❌ DON'T

1. **Don't update cache on every WebSocket message**
   ```typescript
   // Wrong - causes performance issues
   websocket.subscribe(msg => this.updateCache(msg));
   ```

2. **Don't forget to unsubscribe**
   ```typescript
   // Wrong - causes memory leaks
   this.realtime.subscribe(data => {...});
   
   // Right - clean up subscriptions
   .pipe(takeUntil(this.destroy$))
   ```

3. **Don't invalidate entire cache for small updates**
   ```typescript
   // Wrong - throws away good cached data
   this.hub.clear();
   
   // Right - selective updates
   this.hub.update(key, current => ({ ...current, ...changes }));
   ```

## Common Issues

### Update Conflicts
**Problem:** Multiple updates to same entity cause conflicts
**Solution:** Use versioning and last-write-wins strategy

### Memory Leaks
**Problem:** WebSocket subscriptions not cleaned up
**Solution:** Use takeUntil pattern and component lifecycle

### Cache Invalidation Storms
**Problem:** Too many cache invalidations during bulk updates
**Solution:** Debounce invalidations and use batch processing

### Stale Data After Reconnect
**Problem:** Cache not updated after offline period
**Solution:** Implement cache refresh strategy on reconnection

## Next Steps

- **[Performance Tuning](../advanced/performance.md)** - Optimize real-time performance
- **[Offline Support](../advanced/offline.md)** - Complete offline-first architecture
- **[Monitoring](../advanced/monitoring.md)** - Track real-time cache performance