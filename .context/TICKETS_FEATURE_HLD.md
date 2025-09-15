# Tickets Feature - High Level Design

## Overview

The Tickets feature provides a comprehensive support ticketing system for the OneSim Portal, allowing users to create, track, and manage support requests with attachments, comments, and status tracking.

## Architecture Overview

### Module Structure
Following Angular standalone component architecture with lazy loading pattern from product-constructor:

```
src/app/views/tickets/
├── models/
│   ├── index.ts                        # Export barrel
│   ├── ticket.model.ts                 # Core ticket interfaces
│   ├── common.model.ts                 # Shared types (filters, requests)
│   └── overview.model.ts               # Overview/dashboard specific models
├── services/
│   ├── index.ts                        # Service exports
│   ├── ticket.service.ts               # Main API service
│   └── overview.service.ts             # Overview data service
├── components/
│   ├── overview/                       # Dashboard/overview page
│   │   ├── overview.component.ts
│   │   ├── overview.component.html
│   │   ├── overview.component.scss
│   │   └── overview.utils.ts
│   ├── tickets/
│   │   ├── index.ts
│   │   ├── ticket-list/                # Main list component
│   │   │   ├── ticket-list.component.ts
│   │   │   ├── ticket-list.component.html
│   │   │   └── ticket-list.component.scss
│   │   ├── ticket-details/             # Details panel component
│   │   │   ├── ticket-details.component.ts
│   │   │   ├── ticket-details.component.html
│   │   │   └── ticket-details.component.scss
│   │   ├── ticket-form/                # Create/Edit form
│   │   │   ├── ticket-form.component.ts
│   │   │   ├── ticket-form.component.html
│   │   │   ├── ticket-form.component.scss
│   │   │   └── ticket-form.utils.ts
│   │   └── tickets-table.service.ts    # Table configuration service
│   └── kanban/                         # Kanban view (new component)
│       ├── ticket-kanban/
│       │   ├── ticket-kanban.component.ts
│       │   ├── ticket-kanban.component.html
│       │   └── ticket-kanban.component.scss
│       └── kanban-board/               # Reusable kanban (to be moved to shared)
│           └── ...
└── tickets.routes.ts                   # Module routes
```

## Data Models

### Core Models

#### Ticket Model
```typescript
export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdById: string;
  createdByName: string;
  assignedToId?: string;
  assignedToName?: string;
  companyId: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  commentsCount: number;
  attachmentsCount: number;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'GENERAL_INQUIRY' | 'TECHNICAL_ISSUE' | 'BILLING_QUESTION' 
  | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'ACCOUNT_ISSUE' | 'INTEGRATION_SUPPORT' 
  | 'PERFORMANCE_ISSUE' | 'SECURITY_CONCERN' | 'DATA_REQUEST' | 'COMPLIANCE_INQUIRY' | 'OTHER';
```

#### Comment Model
```typescript
export interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  ticketId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Attachment Model
```typescript
export interface Attachment {
  id: string;
  filename: string;
  size: number;
  contentType: string;
  ticketId: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  downloadUrl?: string;
}
```

### Request/Response DTOs (common.model.ts)

```typescript
// Following product-constructor pattern
export interface TicketSearchRequest {
  searchParams: {
    status?: TicketStatus[];
    priority?: TicketPriority[];
    category?: TicketCategory[];
    assignedToId?: string;
    search?: string;
  };
  page: PageRequest;
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  number: number;
  size: number;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string;
  subject?: string;
  description?: string;
}
```

## Services Architecture

### TicketService (ticket.service.ts)
Primary service for API communication following product.service.ts pattern.

```typescript
@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly baseUrl = '/api/v1/tickets';

  constructor(
    private http: HttpClient,
    private cacheHub: CacheHubService
  ) {}

  getTickets(searchRequest: TicketSearchRequest): Observable<PageResponse<Ticket>> {
    let params = new HttpParams()
      .set('page', searchRequest.page.page.toString())
      .set('size', searchRequest.page.size.toString());

    // Add sort parameters if provided
    if (searchRequest.page.sort?.length) {
      params = params.set('sort', searchRequest.page.sort.join(','));
    }

    // Add search parameters
    Object.entries(searchRequest.searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, Array.isArray(value) ? value.join(',') : value.toString());
      }
    });

    return this.http.get<PageResponse<Ticket>>(this.baseUrl, { params });
  }

  getTicket(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  createTicket(request: CreateTicketRequest): Observable<any> {
    return this.http.post(this.baseUrl, request).pipe(
      tap(() => this.cacheHub.invalidate('tickets:overview'))
    );
  }

  updateTicket(id: string, request: UpdateTicketRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, request).pipe(
      tap(() => this.cacheHub.invalidate('tickets:overview'))
    );
  }

  updateTicketStatus(id: string, status: TicketStatus): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/status`, { status }).pipe(
      tap(() => this.cacheHub.invalidate('tickets:overview'))
    );
  }

  // Comments & Attachments
  getComments(ticketId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/${ticketId}/comments`);
  }

  addComment(ticketId: string, comment: { content: string; isInternal: boolean }): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/${ticketId}/comments`, comment);
  }

  getAttachments(ticketId: string): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.baseUrl}/${ticketId}/attachments`);
  }

  uploadAttachment(ticketId: string, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Attachment>(`${this.baseUrl}/${ticketId}/attachments`, formData);
  }
}
```

### OverviewService (overview.service.ts)
Service for dashboard/overview data following product-constructor pattern.

```typescript
@Injectable({
  providedIn: 'root'
})
export class OverviewService {
  private readonly baseUrl = '/api/v1/tickets';

  constructor(private http: HttpClient) {}

  getOverviewData(): Observable<TicketOverview> {
    return this.http.get<TicketOverview>(`${this.baseUrl}/overview`);
  }

  getRecentTickets(limit: number = 10): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/recent?limit=${limit}`);
  }

  getTicketStats(): Observable<TicketStats> {
    return this.http.get<TicketStats>(`${this.baseUrl}/stats`);
  }
}
```

## Component Architecture

### Page Components (Route Components)

#### OverviewComponent
- **Purpose**: Dashboard page showing ticket statistics and recent activity
- **Features**: 
  - Ticket count cards (open, in-progress, resolved, etc.)
  - Recent tickets list
  - Statistics charts
  - Quick action buttons
- **Pattern**: Follows product-constructor overview.component.ts exactly

#### TicketListComponent (Main List Page)
- **Purpose**: Main tickets list page with filtering, search, and CRUD operations
- **Features**: 
  - Advanced filtering and search via HeaderModule
  - Sortable and paginated table via GenericTableModule
  - Right panel operations (create/edit/view)
  - View mode toggle (table/kanban)
- **Dependencies**: 
  - GenericTableModule, HeaderModule
  - GenericRightPanelComponent
  - TicketsTableService for table configuration
- **Pattern**: Follows ProductListComponent pattern exactly
- **Panel States**:
  ```typescript
  // Panel state management (like ProductListComponent)
  showCreatePanel = false;
  showEditPanel = false; 
  showDetailsPanel = false;
  selectedTicket: Ticket | null = null;
  selectedTicketDetails: Ticket | null = null;
  
  // Panel actions
  detailsPanelActions: PanelAction[] = [];
  ```

### Feature Components

#### TicketDetailsComponent
- **Purpose**: Display full ticket details in right panel
- **Props**: `ticket: Ticket`
- **Features**: Shows all ticket information, comments, attachments
- **Pattern**: Follows ProductDetailsComponent

#### TicketFormComponent  
- **Purpose**: Form for creating/editing tickets using FormGeneratorComponent
- **Props**: `ticket?: Ticket` (for editing)
- **Pattern**: Follows ProductFormComponent with app-form-generator

#### TicketsTableService
- **Purpose**: Table configuration service
- **Pattern**: Follows ProductsTableService exactly
- **Features**:
  - Table column definitions
  - Sorting and filtering setup
  - Template management
  - Pagination configuration

#### Comments & Attachments Integration
Comments and attachments will be integrated directly into TicketDetailsComponent following the pattern where all related data is displayed in a single details component, rather than separate components.

## Routing Configuration

```typescript
// tickets.routes.ts - Following product-constructor pattern exactly
export const TICKETS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () =>
      import('./components/overview/overview.component').then(
        (m) => m.OverviewComponent
      ),
    data: {
      title: 'Tickets Overview'
    }
  },
  {
    path: 'tickets',
    loadComponent: () =>
      import('./components/tickets/ticket-list/ticket-list.component').then(
        (m) => m.TicketListComponent
      ),
    data: {
      title: 'Support Tickets'
    }
  }
];
```

## UI/UX Design Guidelines

### Color Coding
- **Status Colors**:
  - OPEN: `var(--os-color-info)` (blue)
  - IN_PROGRESS: `var(--os-color-warning)` (orange)
  - RESOLVED: `var(--os-color-success)` (green)
  - CLOSED: `var(--os-color-medium)` (gray)
  - CANCELLED: `var(--os-color-danger)` (red)

- **Priority Colors**:
  - LOW: `var(--os-color-light)`
  - MEDIUM: `var(--os-color-warning)`
  - HIGH: `var(--os-color-orange)`
  - URGENT: `var(--os-color-danger)`

### SCSS Architecture Implementation

Following the established SCSS architecture rules:

#### Component Styling Rules
```scss
// tickets-overview.component.scss
@import "../../../../scss/variables";  // Variables first
@import "../../../../scss/mixins";     // Mixins second

.os-tickets-overview {
  // Use dashboard mixins for consistent styling
  @include dashboard-card-header();
  @include dashboard-kpi-grid(4);  // 4-column grid for status cards
  
  &__dashboard {
    @include dashboard-chart-container(300px);
    @include dashboard-dark-theme();
  }
}
```

#### Ticket Status & Priority Colors
```scss
// Use existing color system instead of creating new ones
.os-ticket-status {
  @include generate-os-colors('ticket-status');
}

.os-ticket-priority {
  @include generate-os-colors('ticket-priority');
}
```

#### Right Panel Integration
```scss
.os-tickets-panel {
  // Panel content specific styling only
  // Generic panel styling handled by GenericRightPanelComponent
  
  &__form {
    padding: map-get($spacing, '4');
  }
  
  &__comments {
    @include dashboard-metric-summary();
  }
}
```

#### Responsive Design
```scss
// Use existing responsive mixins
@include responsive-spacing();
@include responsive-typography();

@media (max-width: 768px) {
  .os-tickets-overview__dashboard {
    @include dashboard-kpi-grid(2); // 2 columns on mobile
  }
}
```

## Kanban Board View Implementation

### Overview
A Kanban board view will be implemented as an alternative visualization for tickets, allowing users to see tickets organized by status columns with drag-and-drop functionality.

### Component Architecture

#### GenericKanbanBoardComponent (New Shared Component)
**Location**: `src/app/shared/components/kanban-board/`

This will be a new reusable component that needs to be created, as the project currently doesn't have a Kanban board implementation.

**Component Structure**:
```typescript
@Component({
  selector: 'app-generic-kanban-board',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CdkDragDrop, CdkDropList, CdkDrag],
  templateUrl: './generic-kanban-board.component.html',
  styleUrls: ['./generic-kanban-board.component.scss']
})
export class GenericKanbanBoardComponent<T> {
  @Input() items: T[] = [];
  @Input() columns: KanbanColumn[] = [];
  @Input() itemTemplate: TemplateRef<any>;
  @Input() groupByField: keyof T;
  @Input() allowDragDrop: boolean = true;
  @Input() columnColors: Record<string, string> = {};
  
  @Output() itemMoved = new EventEmitter<KanbanMoveEvent<T>>();
  @Output() itemClicked = new EventEmitter<T>();
}

interface KanbanColumn {
  id: string;
  title: string;
  wipLimit?: number;
  collapsed?: boolean;
}

interface KanbanMoveEvent<T> {
  item: T;
  previousColumn: string;
  newColumn: string;
  previousIndex: number;
  newIndex: number;
}
```

### Integration with Tickets Module

#### TicketsOverviewComponent Updates
```typescript
// Add view mode toggle
viewMode: 'table' | 'kanban' = 'table';

// Kanban columns configuration
kanbanColumns: KanbanColumn[] = [
  { id: 'OPEN', title: 'Open', wipLimit: 10 },
  { id: 'IN_PROGRESS', title: 'In Progress', wipLimit: 5 },
  { id: 'RESOLVED', title: 'Resolved' },
  { id: 'CLOSED', title: 'Closed' }
];

// Column colors matching status colors
kanbanColumnColors = {
  'OPEN': 'var(--os-color-info)',
  'IN_PROGRESS': 'var(--os-color-warning)',
  'RESOLVED': 'var(--os-color-success)',
  'CLOSED': 'var(--os-color-medium)'
};

// Handle drag & drop
onTicketMoved(event: KanbanMoveEvent<Ticket>): void {
  const updateRequest: UpdateTicketRequest = {
    status: event.newColumn as TicketStatus
  };
  
  this.ticketsService.updateTicket(event.item.id, updateRequest)
    .subscribe(() => {
      this.refreshTickets();
      this.cdr.markForCheck();
    });
}
```

#### Template Implementation
```html
<!-- View mode toggle -->
<div class="view-toggle">
  <button [class.active]="viewMode === 'table'" (click)="viewMode = 'table'">
    <svg cIcon name="cil-list"></svg> Table View
  </button>
  <button [class.active]="viewMode === 'kanban'" (click)="viewMode = 'kanban'">
    <svg cIcon name="cil-applications-settings"></svg> Kanban View
  </button>
</div>

<!-- Kanban view -->
<app-generic-kanban-board
  *ngIf="viewMode === 'kanban'"
  [items]="tickets$ | async"
  [columns]="kanbanColumns"
  [groupByField]="'status'"
  [columnColors]="kanbanColumnColors"
  [itemTemplate]="ticketCardTemplate"
  (itemMoved)="onTicketMoved($event)"
  (itemClicked)="onViewDetails($event)">
</app-generic-kanban-board>

<!-- Ticket card template -->
<ng-template #ticketCardTemplate let-ticket>
  <div class="ticket-card">
    <div class="ticket-header">
      <span class="ticket-number">{{ ticket.ticketNumber }}</span>
      <c-badge [color]="getPriorityColor(ticket.priority)" shape="rounded-pill">
        {{ ticket.priority }}
      </c-badge>
    </div>
    <h4 class="ticket-subject">{{ ticket.subject }}</h4>
    <div class="ticket-meta">
      <span class="assignee">{{ ticket.assignedToName || 'Unassigned' }}</span>
      <span class="date">{{ ticket.createdAt | date:'shortDate' }}</span>
    </div>
  </div>
</ng-template>
```

### SCSS Styling
```scss
// kanban-board.component.scss
@import "../../../../scss/variables";
@import "../../../../scss/mixins";

.os-kanban-board {
  display: flex;
  gap: map-get($spacing, '4');
  overflow-x: auto;
  padding: map-get($spacing, '4');
  
  &__column {
    flex: 0 0 300px;
    background: var(--cui-body-bg);
    border-radius: map-get($border-radius, 'lg');
    box-shadow: map-get($shadows, 'sm');
    
    &-header {
      @include dashboard-card-header();
      border-bottom: 2px solid var(--column-color);
    }
    
    &-items {
      padding: map-get($spacing, '3');
      min-height: 400px;
    }
  }
  
  &__item {
    margin-bottom: map-get($spacing, '3');
    cursor: move;
    
    &.cdk-drag-preview {
      box-shadow: map-get($shadows, 'lg');
      opacity: 0.8;
    }
    
    &.cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  }
}
```

### Key Features
1. **Drag & Drop**: Using Angular CDK for smooth drag-and-drop between columns
2. **WIP Limits**: Optional work-in-progress limits per column
3. **Responsive**: Horizontal scroll on mobile, fixed columns on desktop
4. **Accessibility**: Keyboard navigation support
5. **Performance**: Virtual scrolling for large ticket lists
6. **Customization**: Configurable columns, colors, and templates

### Benefits
- **Visual Management**: Better overview of ticket flow and bottlenecks
- **Quick Updates**: Drag-and-drop for fast status changes
- **Flexible**: Can be reused for other entities (orders, inventory)
- **User Preference**: Users can choose their preferred view

## Form Implementation with FormGeneratorComponent

### Overview
All ticket forms (create/edit) must be implemented using the `app-form-generator` component following the established pattern from the product-constructor module.

### Implementation Reference
- **Example**: `src/app/views/product-constructor/components/products/product-form`
- **Component**: `FormGeneratorComponent` from `src/app/shared/components/form-generator/`
- **Documentation**: See `src/app/shared/components/form-generator/README.md`

### Form Schema Structure
```typescript
// ticket-form.component.ts
export class TicketFormComponent {
  formSchema: FormGeneratorConfig = {
    fields: [
      {
        key: 'subject',
        type: 'text',
        label: 'tickets.form.subject',
        validators: [Validators.required, Validators.maxLength(200)],
        grid: { cols: 12 }
      },
      {
        key: 'description',
        type: 'textarea',
        label: 'tickets.form.description',
        validators: [Validators.required],
        grid: { cols: 12 },
        props: { rows: 5 }
      },
      {
        key: 'category',
        type: 'select',
        label: 'tickets.form.category',
        validators: [Validators.required],
        grid: { cols: 6 },
        options: this.categoryOptions$ // Observable from service
      },
      {
        key: 'priority',
        type: 'select',
        label: 'tickets.form.priority',
        validators: [Validators.required],
        grid: { cols: 6 },
        options: this.priorityOptions$
      },
      {
        key: 'assignedToId',
        type: 'searchable-select',
        label: 'tickets.form.assignTo',
        grid: { cols: 12 },
        dependencies: {
          // Load assignees based on category selection
          category: {
            url: '/api/v1/users/by-category/{value}',
            mapResponse: (users) => users.map(u => ({
              value: u.id,
              label: u.name
            }))
          }
        }
      }
    ]
  };
}
```

### Key Features to Implement

1. **Field Dependencies**
   - Assignee list filtered by selected category
   - Dynamic field visibility based on ticket type
   - Conditional validations

2. **HTTP Dependencies**
   - Load categories from API
   - Fetch available assignees based on permissions
   - Dynamic field options based on company settings

3. **FormArray Support**
   - Custom fields (if needed)
   - Initial attachments list
   - Related tickets

4. **Validation**
   - Required fields enforcement
   - Character limits
   - Custom async validators for unique ticket numbers

### Template Implementation
```html
<!-- ticket-form.component.html -->
<app-form-generator
  [config]="formSchema"
  [initialValues]="ticket"
  [loading]="loading"
  (formSubmit)="onSubmit($event)"
  (formCancel)="onCancel()">
</app-form-generator>
```

### Benefits
- **Consistency**: Uses the same form patterns as other modules
- **Maintainability**: Centralized form logic in FormGeneratorComponent
- **Flexibility**: Easy to add/remove fields via configuration
- **Validation**: Built-in support for complex validation rules
- **Accessibility**: FormGenerator handles ARIA attributes and keyboard navigation

## State Management Strategy

### Component State
- Use OnPush change detection for all components
- Implement `markForCheck()` for state updates
- Use reactive forms for all form inputs

### Data Flow
1. **Route Guard**: Check permissions before loading
2. **Resolver**: Pre-load ticket data for detail views  
3. **Service Layer**: Handle API calls and caching
4. **State Service**: Manage component communication
5. **Component**: Display data and handle user interactions

### Caching Strategy
- Use HTTP interceptor caching for GET requests
- Implement selective refresh for list updates
- Cache ticket details for 5 minutes
- Real-time updates for comments (optional: WebSocket)

## Permission System Integration

### Required Permissions
- `TICKETS_READ`: View tickets and comments
- `TICKETS_WRITE`: Create and update tickets
- `TICKETS_DELETE`: Delete tickets (admin only)
- `TICKETS_ADMIN`: Access all company tickets

### Route Guards
```typescript
@Injectable()
export class TicketsGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  
  canActivate(): boolean {
    return this.authService.hasPermission('TICKETS_READ');
  }
}
```

## Error Handling

### Service Level
- Use BaseDataService error handling
- Implement retry logic for failed requests
- Show user-friendly error messages

### Component Level
- Handle loading states with skeleton screens
- Display error messages with retry options
- Validate form inputs with real-time feedback

## Performance Considerations

### Optimization Strategies
- Implement virtual scrolling for large ticket lists
- Use OnPush change detection throughout
- Lazy load images in attachments
- Implement pagination with reasonable page sizes (20-50 items)

### Bundle Optimization
- Lazy load tickets module
- Tree-shake unused imports
- Use dynamic imports for heavy dependencies

## Testing Strategy

### Unit Tests
- Service methods with mock HTTP responses
- Component logic and event handling
- Form validation and user interactions

### Integration Tests
- End-to-end user workflows
- API integration with mock server
- Permission-based access control

### Mock Data
- Use existing mock-server tickets domain
- Implement realistic test scenarios
- Cover edge cases (empty states, errors)

## Internationalization

### Translation Keys Structure
```typescript
// tickets.en.json
{
  "tickets": {
    "title": "Support Tickets",
    "create": "Create Ticket",
    "status": {
      "open": "Open",
      "in_progress": "In Progress", 
      "resolved": "Resolved",
      "closed": "Closed",
      "cancelled": "Cancelled"
    },
    "priority": {
      "low": "Low",
      "medium": "Medium", 
      "high": "High",
      "urgent": "Urgent"
    },
    "category": {
      "technical_issue": "Technical Issue",
      "billing_question": "Billing Question"
      // ... other categories
    }
  }
}
```

## Right Panel Implementation

### Panel States Management
Following the product-list pattern with three panel states:

```typescript
// tickets-overview.component.ts
export class TicketsOverviewComponent {
  // Panel state management
  showCreatePanel = false;
  showEditPanel = false;
  showDetailsPanel = false;
  selectedTicket: Ticket | null = null;
  
  // Panel actions
  createPanelActions: PanelAction[] = [];
  editPanelActions: PanelAction[] = [];
  detailsPanelActions: PanelAction[] = [
    {
      id: 'edit',
      icon: 'cilPencil',
      label: 'Edit Ticket',
      handler: () => this.openEditPanel(this.selectedTicket!)
    }
  ];
}
```

### Panel Template Structure
```html
<!-- Create Panel -->
<app-generic-right-panel
  *ngIf="showCreatePanel"
  title="Create Support Ticket"
  subtitle="Submit a new support request"
  [isOpen]="showCreatePanel"
  [hasFooter]="true"
  (close)="closeCreatePanel()">
  
  <div panel-content>
    <app-ticket-form 
      mode="create"
      [loading]="createForm.loading"
      (submitted)="onCreateTicket($event)"
      (cancelled)="closeCreatePanel()">
    </app-ticket-form>
  </div>
  
  <ng-container panel-footer>
    <button class="btn btn-primary" [disabled]="createForm.invalid || createForm.loading">
      <span *ngIf="createForm.loading" class="spinner-border spinner-border-sm me-2"></span>
      Create Ticket
    </button>
  </ng-container>
</app-generic-right-panel>

<!-- Edit Panel -->
<app-generic-right-panel
  *ngIf="showEditPanel && selectedTicket"
  title="Edit Ticket"
  subtitle="Update ticket details and status"
  [isOpen]="showEditPanel"
  [hasFooter]="true"
  (close)="closeEditPanel()">
  
  <div panel-content>
    <app-ticket-form 
      mode="edit"
      [ticket]="selectedTicket"
      [loading]="editForm.loading"
      (submitted)="onUpdateTicket($event)"
      (cancelled)="closeEditPanel()">
    </app-ticket-form>
  </div>
</app-generic-right-panel>

<!-- Details Panel -->
<app-generic-right-panel
  *ngIf="showDetailsPanel && selectedTicket"
  title="Ticket Details"
  [isOpen]="showDetailsPanel"
  [actions]="detailsPanelActions"
  [resizable]="true"
  [defaultWidth]="600"
  [maxWidth]="900"
  (close)="closeDetailsPanel()">
  
  <div panel-content>
    <app-ticket-detail [ticket]="selectedTicket"></app-ticket-detail>
    <app-comments-section [ticketId]="selectedTicket.id"></app-comments-section>
    <app-attachments-section [ticketId]="selectedTicket.id"></app-attachments-section>
  </div>
</app-generic-right-panel>
```

## SCSS Architecture Compliance

### Import Rules Enforcement
```scss
// ✅ CORRECT: tickets-overview.component.scss
@import "../../../../scss/variables";  // First: variables only
@import "../../../../scss/mixins";     // Second: mixins only

.os-tickets-overview {
  // Use existing dashboard patterns
  @include dashboard-card-header();
  @include dashboard-kpi-grid(4);
  
  // Status cards using color system
  &__status-cards {
    @include generate-os-colors('status-card');
  }
  
  // Use existing spacing scale
  padding: map-get($spacing, '4');
  margin: map-get($spacing, '2');
  
  // Use existing shadows
  box-shadow: map-get($shadows, 'md');
}
```

### Color System Integration
```scss
// Define ticket-specific color variants in _variables.scss
$ticket-colors: (
  'status-open': #0ea5e9,      // cyan-500
  'status-progress': #f59e0b,   // amber-500
  'status-resolved': #22c55e,   // green-500
  'status-closed': #6b7280,     // gray-500
  'priority-urgent': #ef4444,   // red-500
  'priority-high': #f97316,     // orange-500
  'priority-medium': #eab308,   // yellow-500
  'priority-low': #84cc16       // lime-500
);
```

### Dashboard Integration
```scss
.os-tickets-dashboard {
  @include dashboard-chart-container(400px);
  @include dashboard-dark-theme();
  
  &__metrics {
    @include dashboard-metric-summary();
  }
  
  &__charts {
    @include dashboard-chart-legend();
  }
}
```

## Implementation Phases

### Phase 1: Core Infrastructure (Following Product-Constructor Pattern)
1. **Models & Services**:
   - Create `models/` directory with ticket.model.ts, common.model.ts, overview.model.ts
   - Implement TicketService following ProductService pattern
   - Implement OverviewService for dashboard data
   - Create TicketsTableService following ProductsTableService pattern

2. **Overview Page**:
   - Create OverviewComponent following product-constructor overview pattern
   - Dashboard with ticket statistics and recent activity
   - Navigation to ticket list

### Phase 2: Main Tickets List & CRUD
1. **TicketListComponent**:
   - Copy ProductListComponent structure exactly
   - Implement table with GenericTableModule 
   - Add filtering via HeaderModule
   - Implement right panels (create/edit/details)

2. **Form & Details Components**:
   - TicketFormComponent with FormGeneratorComponent
   - TicketDetailsComponent with comments and attachments integrated
   - Follow ProductFormComponent and ProductDetailsComponent patterns

### Phase 3: Enhanced Features
1. **Comments & Attachments**:
   - Integrate into TicketDetailsComponent
   - File upload functionality
   - Internal/external comment visibility

2. **Advanced Filtering**:
   - SearchableSelectComponent for assignees
   - Date range filters
   - Status and priority multi-select

### Phase 4: Kanban View
1. **Reusable Kanban Component**:
   - Create GenericKanbanBoardComponent in `src/app/shared/components/`
   - Drag & drop with Angular CDK
   - Configurable columns and templates

2. **Integration**:
   - Add view toggle to TicketListComponent
   - Implement status updates via drag & drop

### Phase 5: Polish & Testing
1. **SCSS & Styling**:
   - Follow SCSS architecture rules
   - Use existing mixins and utilities
   - Responsive design

2. **Testing & i18n**:
   - Unit tests for all components
   - Translation keys
   - E2E scenarios

## UX/UI Innovation Opportunities 🎨

### **Important Note**: Modern UX/UI Improvements Welcome!

While this HLD follows the established product-constructor patterns for **architectural consistency**, we encourage **modern UX/UI innovations** where they improve user experience:

#### **Potential Modern Enhancements:**
- **Advanced Filters UI**: Modern filter chips, tags, or advanced search builders instead of basic dropdowns
- **Ticket Timeline View**: Interactive timeline showing ticket lifecycle and activities
- **Smart Status Transitions**: Visual workflow indicators showing available next states
- **Modern Card Layouts**: Instead of plain tables, consider card-based layouts with better visual hierarchy
- **Drag & Drop Enhancements**: Beyond kanban - drag to assign, bulk actions, etc.
- **Real-time Updates**: Live notifications, real-time status updates, collaborative features
- **Mobile-First Design**: Touch-friendly interactions, swipe gestures, responsive cards
- **Quick Actions**: Floating action buttons, right-click context menus, keyboard shortcuts
- **Visual Priority Indicators**: Color-coded priority bars, urgency animations
- **Smart Defaults**: AI-suggested categories, auto-assignment based on content

#### **Innovation Guidelines:**
- ✅ **Improve UX/UI** where it makes sense
- ✅ **Keep architectural patterns** (services, models, routing)
- ✅ **Follow SCSS rules** but create new modern components if needed
- ✅ **Enhance existing components** rather than replace core functionality
- ✅ **Consider accessibility** in all modern designs

#### **Implementation Approach:**
- Start with **base architecture** (Phase 1-2) following product-constructor patterns
- **Innovate in Phase 3-4** with modern UI components and interactions
- **Test user feedback** and iterate on modern features

**Goal**: Build a tickets system that is **architecturally sound** AND **visually modern** - best of both worlds! 🚀

## Architectural Benefits

- **Consistency**: Uses established patterns for reliable architecture
- **Innovation**: Encourages modern UX/UI improvements where valuable
- **SCSS Compliance**: Follows existing architecture rules while allowing new modern components
- **Reusability**: Leverages existing components and creates new reusable modern ones
- **Performance**: OnPush strategy and optimized change detection
- **Maintainability**: Clear separation of concerns with domain-based structure
- **User Experience**: Balance between familiar patterns and modern interactions

This HLD provides a comprehensive foundation for implementing a tickets feature that maintains architectural consistency while embracing modern UX/UI innovation opportunities.