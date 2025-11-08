# Offline Support

Complete offline-first architecture with automatic synchronization when connection is restored.

## Offline Detection

### Connection Monitoring Service
```typescript
@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  
  isOnline$ = this.onlineSubject.asObservable();
  isOffline$ = this.isOnline$.pipe(map(online => !online));

  constructor() {
    this.setupConnectionMonitoring();
  }

  private setupConnectionMonitoring(): void {
    fromEvent(window, 'online').subscribe(() => {
      this.onlineSubject.next(true);
      console.log('🟢 Connection restored');
    });

    fromEvent(window, 'offline').subscribe(() => {
      this.onlineSubject.next(false);
      console.log('🔴 Connection lost - entering offline mode');
    });

    // Additional connection quality check
    this.setupConnectionQualityCheck();
  }

  private setupConnectionQualityCheck(): void {
    interval(30000).pipe( // Check every 30 seconds
      switchMap(() => this.pingServer()),
      catchError(() => of(false))
    ).subscribe(isConnected => {
      if (this.onlineSubject.value !== isConnected) {
        this.onlineSubject.next(isConnected);
      }
    });
  }

  private pingServer(): Observable<boolean> {
    return this.http.get('/api/ping', { 
      timeout: 5000,
      responseType: 'text'
    }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getCurrentStatus(): ConnectionStatus {
    return {
      isOnline: this.onlineSubject.value,
      lastCheck: new Date(),
      quality: this.getConnectionQuality()
    };
  }

  private getConnectionQuality(): 'good' | 'poor' | 'offline' {
    if (!this.onlineSubject.value) return 'offline';
    
    // Use Network Information API if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 'poor';
      }
    }
    
    return 'good';
  }
}
```

## Offline Queue Management

### Offline Action Queue
```typescript
interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

@Injectable()
export class OfflineQueueService {
  private actionQueue: OfflineAction[] = [];
  private syncInProgress = false;

  constructor(
    private connectionService: ConnectionService,
    private hub: CacheHubService,
    private storage: StorageService
  ) {
    this.loadQueueFromStorage();
    this.setupAutoSync();
  }

  // Queue action for offline execution
  queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): void {
    const queuedAction: OfflineAction = {
      ...action,
      id: this.generateActionId(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };

    this.actionQueue.push(queuedAction);
    this.saveQueueToStorage();

    console.log(`📝 Queued offline action: ${action.type} ${action.entity}`);
  }

  // Execute optimistic update immediately
  executeOptimisticUpdate(action: OfflineAction): void {
    switch (action.type) {
      case 'CREATE':
        this.handleOptimisticCreate(action);
        break;
      case 'UPDATE':
        this.handleOptimisticUpdate(action);
        break;
      case 'DELETE':
        this.handleOptimisticDelete(action);
        break;
    }
  }

  private handleOptimisticCreate(action: OfflineAction): void {
    const tempId = `temp-${action.id}`;
    const optimisticData = { ...action.data, id: tempId, _offline: true };

    // Add to cache with temporary ID
    this.hub.set(`${action.entity}:detail-${tempId}`, optimisticData);

    // Add to list caches
    this.addToListCaches(action.entity, optimisticData);
  }

  private handleOptimisticUpdate(action: OfflineAction): void {
    const entityId = action.data.id;
    
    // Update detail cache
    this.hub.update(`${action.entity}:detail-${entityId}`, current => ({
      ...current,
      ...action.data,
      _offline: true,
      _offlineAction: action.id
    }));

    // Update list caches
    this.updateInListCaches(action.entity, entityId, action.data);
  }

  private handleOptimisticDelete(action: OfflineAction): void {
    const entityId = action.data.id;
    
    // Mark as deleted in cache (don't remove yet)
    this.hub.update(`${action.entity}:detail-${entityId}`, current => ({
      ...current,
      _deleted: true,
      _offline: true,
      _offlineAction: action.id
    }));

    // Remove from list views
    this.removeFromListCaches(action.entity, entityId);
  }

  private setupAutoSync(): void {
    this.connectionService.isOnline$.pipe(
      distinctUntilChanged(),
      filter(isOnline => isOnline && this.actionQueue.length > 0),
      debounceTime(1000) // Wait 1 second after connection restored
    ).subscribe(() => {
      this.syncOfflineActions();
    });
  }

  async syncOfflineActions(): Promise<void> {
    if (this.syncInProgress || this.actionQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Syncing ${this.actionQueue.length} offline actions...`);

    const actionsToSync = [...this.actionQueue];
    
    for (const action of actionsToSync) {
      try {
        await this.syncSingleAction(action);
        this.removeActionFromQueue(action.id);
      } catch (error) {
        console.error(`❌ Failed to sync action ${action.id}:`, error);
        this.handleSyncFailure(action);
      }
    }

    this.syncInProgress = false;
    this.saveQueueToStorage();
    
    console.log(`✅ Offline sync completed. ${this.actionQueue.length} actions remaining.`);
  }

  private async syncSingleAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'CREATE':
        return this.syncCreate(action);
      case 'UPDATE':
        return this.syncUpdate(action);
      case 'DELETE':
        return this.syncDelete(action);
    }
  }

  private async syncCreate(action: OfflineAction): Promise<void> {
    const response = await this.apiService.create(action.entity, action.data).toPromise();
    
    // Replace temporary cache entry with real data
    const tempId = `temp-${action.id}`;
    this.hub.invalidate(`${action.entity}:detail-${tempId}`);
    this.hub.set(`${action.entity}:detail-${response.id}`, response);
    
    // Update list caches
    this.replaceInListCaches(action.entity, tempId, response);
  }

  private async syncUpdate(action: OfflineAction): Promise<void> {
    const response = await this.apiService.update(action.entity, action.data.id, action.data).toPromise();
    
    // Update cache with server response
    this.hub.set(`${action.entity}:detail-${response.id}`, response);
    this.updateInListCaches(action.entity, response.id, response);
  }

  private async syncDelete(action: OfflineAction): Promise<void> {
    await this.apiService.delete(action.entity, action.data.id).toPromise();
    
    // Actually remove from cache now
    this.hub.invalidate(`${action.entity}:detail-${action.data.id}`);
    this.removeFromListCaches(action.entity, action.data.id);
  }

  private handleSyncFailure(action: OfflineAction): void {
    action.retryCount++;
    
    if (action.retryCount >= action.maxRetries) {
      console.error(`💀 Action ${action.id} failed after ${action.maxRetries} retries`);
      // Could show user notification here
      this.removeActionFromQueue(action.id);
    }
  }

  private removeActionFromQueue(actionId: string): void {
    this.actionQueue = this.actionQueue.filter(action => action.id !== actionId);
  }

  private generateActionId(): string {
    return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveQueueToStorage(): void {
    this.storage.setItem('offline-action-queue', JSON.stringify(this.actionQueue));
  }

  private loadQueueFromStorage(): void {
    const saved = this.storage.getItem('offline-action-queue');
    if (saved) {
      this.actionQueue = JSON.parse(saved);
    }
  }
}
```

## Offline-First Service Pattern

### Enhanced Service with Offline Support
```typescript
@Injectable()
@CacheNamespace('customers')
export class OfflineCustomerService {
  constructor(
    private hub: CacheHubService,
    private api: ApiService,
    private offlineQueue: OfflineQueueService,
    private connectionService: ConnectionService
  ) {}

  getCustomers(): Observable<Customer[]> {
    // Always return cached data first for offline-first experience
    return this.hub.fetch('list', 
      this.connectionService.isOnline$.pipe(
        take(1),
        switchMap(isOnline => {
          if (isOnline) {
            return this.api.getCustomers();
          } else {
            // Return cached data or empty array if no cache
            const cached = this.hub.getValue<Customer[]>('list');
            return of(cached || []);
          }
        })
      )
    );
  }

  getCustomer(id: string): Observable<Customer> {
    const cacheKey = `detail-${id}`;
    
    return this.hub.fetch(cacheKey,
      this.connectionService.isOnline$.pipe(
        take(1),
        switchMap(isOnline => {
          if (isOnline) {
            return this.api.getCustomer(id);
          } else {
            const cached = this.hub.getValue<Customer>(cacheKey);
            if (cached) {
              return of(cached);
            } else {
              throw new Error('Customer not available offline');
            }
          }
        })
      )
    );
  }

  createCustomer(customer: CreateCustomerRequest): Observable<Customer> {
    const action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'> = {
      type: 'CREATE',
      entity: 'customers',
      data: customer,
      maxRetries: 3
    };

    // Queue for offline sync
    this.offlineQueue.queueAction(action);

    // Execute optimistic update
    const optimisticCustomer: Customer = {
      ...customer,
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.offlineQueue.executeOptimisticUpdate({
      ...action,
      id: 'temp',
      timestamp: Date.now(),
      retryCount: 0,
      data: optimisticCustomer
    });

    // If online, also try immediate sync
    if (this.connectionService.getCurrentStatus().isOnline) {
      return this.api.createCustomer(customer).pipe(
        tap(realCustomer => {
          // Replace optimistic data with real data
          this.hub.set(`detail-${realCustomer.id}`, realCustomer);
          this.replaceInLists(optimisticCustomer.id, realCustomer);
        }),
        catchError(error => {
          console.warn('Online create failed, will retry when connection restored');
          return of(optimisticCustomer);
        })
      );
    }

    return of(optimisticCustomer);
  }

  updateCustomer(id: string, updates: Partial<Customer>): Observable<Customer> {
    const action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'> = {
      type: 'UPDATE',
      entity: 'customers',
      data: { id, ...updates },
      maxRetries: 3
    };

    this.offlineQueue.queueAction(action);

    // Get current data and apply optimistic update
    const current = this.hub.getValue<Customer>(`detail-${id}`);
    if (current) {
      const optimisticCustomer = { ...current, ...updates, updatedAt: new Date() };
      
      this.offlineQueue.executeOptimisticUpdate({
        ...action,
        id: 'temp',
        timestamp: Date.now(),
        retryCount: 0,
        data: optimisticCustomer
      });

      return of(optimisticCustomer);
    }

    throw new Error('Customer not found in cache');
  }

  deleteCustomer(id: string): Observable<void> {
    const action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'> = {
      type: 'DELETE',
      entity: 'customers',
      data: { id },
      maxRetries: 3
    };

    this.offlineQueue.queueAction(action);
    this.offlineQueue.executeOptimisticUpdate({
      ...action,
      id: 'temp',
      timestamp: Date.now(),
      retryCount: 0
    });

    return of(undefined);
  }

  // Check if customer has offline changes
  hasOfflineChanges(id: string): boolean {
    const customer = this.hub.getValue<Customer>(`detail-${id}`);
    return customer?._offline === true;
  }

  // Get offline status for all customers
  getOfflineStatus(): { [id: string]: OfflineStatus } {
    const customers = this.hub.getValue<Customer[]>('list') || [];
    const status: { [id: string]: OfflineStatus } = {};

    customers.forEach(customer => {
      if (customer._offline) {
        status[customer.id] = {
          hasChanges: true,
          actionType: customer._deleted ? 'DELETE' : 'UPDATE',
          isTemporary: customer.id.startsWith('temp-')
        };
      }
    });

    return status;
  }
}
```

## Offline UI Components

### Offline Status Indicator
```typescript
@Component({
  selector: 'app-offline-status',
  template: `
    <div class="offline-status" [class]="connectionStatus">
      <div class="status-indicator">
        <svg cIcon [name]="getStatusIcon()"></svg>
        <span>{{ getStatusText() }}</span>
      </div>
      
      <div *ngIf="pendingActions > 0" class="pending-actions">
        {{ pendingActions }} actions pending sync
        <button (click)="showPendingActions()" class="link-button">View</button>
      </div>
    </div>
  `,
  styleUrls: ['./offline-status.component.scss']
})
export class OfflineStatusComponent implements OnInit {
  connectionStatus: 'online' | 'offline' | 'syncing' = 'online';
  pendingActions = 0;

  constructor(
    private connectionService: ConnectionService,
    private offlineQueue: OfflineQueueService
  ) {}

  ngOnInit(): void {
    this.connectionService.isOnline$.subscribe(isOnline => {
      this.connectionStatus = isOnline ? 'online' : 'offline';
    });

    // Monitor pending actions
    interval(1000).subscribe(() => {
      this.pendingActions = this.offlineQueue.getPendingActionCount();
    });
  }

  getStatusIcon(): string {
    switch (this.connectionStatus) {
      case 'online': return 'cilCheckCircle';
      case 'offline': return 'cilOfflinePin';
      case 'syncing': return 'cilSync';
      default: return 'cilInfo';
    }
  }

  getStatusText(): string {
    switch (this.connectionStatus) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'syncing': return 'Syncing...';
      default: return 'Unknown';
    }
  }

  showPendingActions(): void {
    // Open modal or navigate to pending actions view
  }
}
```

### Offline-Aware Data Table
```typescript
@Component({
  selector: 'app-offline-customer-list',
  template: `
    <app-generic-table
      [data$]="customers$"
      [config]="tableConfig"
      [loading]="loading">
      
      <!-- Custom row template to show offline status -->
      <ng-template #rowTemplate let-customer="row">
        <tr [class.offline-row]="customer._offline">
          <td>{{ customer.name }}</td>
          <td>{{ customer.email }}</td>
          <td>
            <span *ngIf="customer._offline" class="offline-badge">
              <svg cIcon name="cilOfflinePin"></svg>
              {{ getOfflineStatusText(customer) }}
            </span>
          </td>
        </tr>
      </ng-template>
    </app-generic-table>
  `
})
export class OfflineCustomerListComponent {
  customers$: Observable<Customer[]>;
  loading = false;
  tableConfig = this.buildTableConfig();

  constructor(private customerService: OfflineCustomerService) {
    this.customers$ = this.customerService.getCustomers();
  }

  getOfflineStatusText(customer: Customer): string {
    if (customer._deleted) return 'Deleted';
    if (customer.id.startsWith('temp-')) return 'Created';
    if (customer._offline) return 'Modified';
    return '';
  }

  private buildTableConfig(): any {
    return {
      columns: [
        { key: 'name', title: 'Name' },
        { key: 'email', title: 'Email' },
        { key: 'status', title: 'Status' }
      ]
    };
  }
}
```

## Storage Management

### Persistent Cache Storage
```typescript
@Injectable()
export class PersistentStorageService {
  constructor() {
    this.setupStorageCleanup();
  }

  // Store critical data that survives app restart
  storePersistent<T>(key: string, data: T, ttl?: number): void {
    const item: PersistentItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 24 * 60 * 60 * 1000, // 24 hours default
      version: 1
    };

    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to store to localStorage:', error);
      this.cleanupOldEntries();
    }
  }

  getPersistent<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(`cache:${key}`);
      if (!stored) return null;

      const item: PersistentItem<T> = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() > item.timestamp + item.ttl) {
        this.removePersistent(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  removePersistent(key: string): void {
    localStorage.removeItem(`cache:${key}`);
  }

  private setupStorageCleanup(): void {
    // Clean up expired entries on app start
    this.cleanupExpiredEntries();

    // Periodic cleanup
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60 * 60 * 1000); // Every hour
  }

  private cleanupExpiredEntries(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache:')) {
        try {
          const item = JSON.parse(localStorage.getItem(key)!);
          if (Date.now() > item.timestamp + item.ttl) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key); // Remove corrupted entries
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (keysToRemove.length > 0) {
      console.log(`🧹 Cleaned up ${keysToRemove.length} expired cache entries`);
    }
  }

  private cleanupOldEntries(): void {
    // Remove oldest entries to free up space
    const cacheEntries: Array<{ key: string; timestamp: number }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache:')) {
        try {
          const item = JSON.parse(localStorage.getItem(key)!);
          cacheEntries.push({ key, timestamp: item.timestamp });
        } catch {
          localStorage.removeItem(key); // Remove corrupted entries
        }
      }
    }

    // Sort by timestamp and remove oldest 25%
    cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = cacheEntries.slice(0, Math.floor(cacheEntries.length * 0.25));
    
    toRemove.forEach(entry => localStorage.removeItem(entry.key));
  }
}

interface PersistentItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: number;
}
```

## Best Practices for Offline Support

### ✅ DO
1. **Always show cached data first** for instant UX
2. **Use optimistic updates** for immediate feedback
3. **Queue all mutations** for offline sync
4. **Provide clear offline indicators** in UI
5. **Handle sync conflicts** gracefully

### ❌ DON'T
1. **Block UI** waiting for network requests
2. **Show errors** for network failures in offline mode
3. **Lose user data** when offline
4. **Assume network availability**
5. **Ignore storage quota** limits

## Testing Offline Functionality

### Offline Testing Utils
```typescript
export class OfflineTestingUtils {
  static simulateOffline(): void {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true
    });
    
    window.dispatchEvent(new Event('offline'));
  }

  static simulateOnline(): void {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true
    });
    
    window.dispatchEvent(new Event('online'));
  }

  static async simulateSlowNetwork(delay: number = 3000): Promise<void> {
    // Mock slow network conditions
    const originalFetch = window.fetch;
    
    window.fetch = (...args) => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(originalFetch(...args));
        }, delay);
      });
    };
  }
}
```