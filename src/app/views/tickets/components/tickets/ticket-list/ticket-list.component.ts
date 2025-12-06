import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy, signal, effect, inject } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import {
  GenericRightPanelComponent,
  PanelAction,
  GenericTableComponent,
  HeaderComponent,
  TableConfig,
  SearchableSelectComponent,
  SearchableSelectOption,
  SearchableSelectConfig,
  Account,
  AuthService,
  ADMIN_PERMISSION
} from '@shared';
import { TicketDetailsWrapperComponent } from '../ticket-details-wrapper/ticket-details-wrapper.component';
import { TicketEditWrapperComponent } from '../ticket-edit-wrapper/ticket-edit-wrapper.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ButtonDirective, BadgeComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';

import { TicketService, TicketEventService } from '../../../services';
import { Ticket, TicketSearchRequest, TicketStatus, TicketPriority, TicketCategory } from '../../../models';
import { TicketsTableService } from '../tickets-table.service';
import { MatDividerModule } from '@angular/material/divider';
import { AccountSelectorComponent } from '@shared/components/account-selector/account-selector.component';

@Component({
    selector: 'app-ticket-list',
    standalone: true,
    imports: [
        RouterModule,
        ReactiveFormsModule,
        TranslateModule,
        GenericRightPanelComponent,
        TicketDetailsWrapperComponent,
        TicketEditWrapperComponent,
        GenericTableComponent,
        HeaderComponent,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        ButtonDirective,
        BadgeComponent,
        IconDirective,
        SearchableSelectComponent,
        MatDividerModule,
        AccountSelectorComponent
    ],
    providers: [TicketsTableService],
    templateUrl: './ticket-list.component.html',
    styleUrls: ['./ticket-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('statusTemplate', { static: true }) statusTemplate: TemplateRef<any>;
  @ViewChild('priorityTemplate', { static: true }) priorityTemplate: TemplateRef<any>;
  @ViewChild('categoryTemplate', { static: true }) categoryTemplate: TemplateRef<any>;
  @ViewChild('assigneeTemplate', { static: true }) assigneeTemplate: TemplateRef<any>;
  @ViewChild('editWrapper') editWrapperComponent: TicketEditWrapperComponent;

  // Services
  private ticketService = inject(TicketService);
  private tableService = inject(TicketsTableService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketEventService = inject(TicketEventService);
  private authService = inject(AuthService);

  // Observable for GenericTable compatibility
  tickets$: Observable<Ticket[]>;
  tableConfig$: BehaviorSubject<TableConfig>;
  filterForm: FormGroup;

  // State signals
  loading = signal(true);
  error = signal(false);

  private unsubscribe$ = new Subject<void>();

  // Panel states as signals
  showCreatePanel = signal(false);
  showEditPanel = signal(false);
  showDetailsPanel = signal(false);
  selectedTicket = signal<Ticket | null>(null);
  selectedTicketDetails = signal<Ticket | null>(null);
  editLoading = signal(false);
  detailsLoading = signal(false);

  // Panel actions
  detailsPanelActions: PanelAction[] = [];

  // Filter options
  statusOptions: SearchableSelectOption[] = [];
  priorityOptions: SearchableSelectOption[] = [];
  categoryOptions: SearchableSelectOption[] = [];

  // SearchableSelect configurations
  statusSelectConfig: SearchableSelectConfig;
  prioritySelectConfig: SearchableSelectConfig;
  categorySelectConfig: SearchableSelectConfig;

  // Account selector properties as signals
  isAdmin = signal(false);
  selectedAccountId = signal<string | null>(null);

  // Sort state as signal
  currentSort = signal<{ column: string; direction: 'asc' | 'desc' } | null>(null);

  constructor() {
    // Initialize form
    this.filterForm = new FormGroup({
      status: new FormControl([]),
      priority: new FormControl([]),
      category: new FormControl([]),
      search: new FormControl('')
    });

    // Get table config from service
    this.tableConfig$ = this.tableService.getTableConfig();

    // Initialize panel actions
    this.initializePanelActions();

    // Initialize tickets$ with empty data
    this.tickets$ = of([]);

    // Initialize filter options
    this.initializeFilterOptions();

    // Initialize searchable-select configurations
    this.initializeSelectConfigurations();

    // Effects for signal-based event service
    this.setupEventEffects();
  }

  private setupEventEffects(): void {
    // Effect for applyFilters
    effect(() => {
      const filtersEvent = this.ticketEventService.applyFilters();
      if (filtersEvent) {
        this.filterForm.patchValue(filtersEvent.data);
        this.filterForm.markAsDirty();
      }
    });
  }

  ngOnInit(): void {
    // Check permissions and initialize account
    this.checkPermissions();
    this.initializeAccount();

    // Setup filters first
    this.setupFilters();

    // Then check for query parameters from quick actions
    this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
      let filtersApplied = false;

      // Handle accountId from overview navigation
      if (params['accountId'] && this.isAdmin()) {
        this.selectedAccountId.set(params['accountId']);
        filtersApplied = true;
      }

      if (params['priority']) {
        // Set priority filter from quick action
        this.filterForm.patchValue({
          priority: [params['priority']]
        });
        filtersApplied = true;
      }

      if (params['assignedToMe'] === 'true') {
        // TODO: Add assignedTo filter when user context is available
        filtersApplied = true;
      }

      // Mark form as dirty to enable reset button
      if (filtersApplied) {
        this.filterForm.markAsDirty();
      }
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit(): void {
    // Set templates after view initialization
    this.tableService.setTemplates(
      this.statusTemplate,
      this.priorityTemplate,
      this.categoryTemplate,
      this.assigneeTemplate
    );
  }

  private checkPermissions(): void {
    this.isAdmin.set(this.authService.hasPermission(ADMIN_PERMISSION));
  }

  private initializeAccount(): void {
    if (!this.isAdmin()) {
      // For non-admin users, use account from loggedUser
      const loggedUser = this.authService.loggedUser;
      if (loggedUser?.accountId) {
        this.selectedAccountId.set(loggedUser.accountId);
      }
    }
  }

  public onAccountSelected(account: Account): void {
    this.selectedAccountId.set(account.id);
    this.loadData();
  }

  private initializeFilterOptions(): void {
    // Status options
    this.statusOptions = [
      { value: 'OPEN', label: 'Open', data: { color: 'info' } },
      { value: 'IN_PROGRESS', label: 'In Progress', data: { color: 'warning' } },
      { value: 'RESOLVED', label: 'Resolved', data: { color: 'success' } },
      { value: 'CLOSED', label: 'Closed', data: { color: 'medium' } },
      { value: 'CANCELLED', label: 'Cancelled', data: { color: 'danger' } }
    ];

    // Priority options
    this.priorityOptions = [
      { value: 'LOW', label: 'Low', data: { color: 'light' } },
      { value: 'MEDIUM', label: 'Medium', data: { color: 'warning' } },
      { value: 'HIGH', label: 'High', data: { color: 'orange' } },
      { value: 'URGENT', label: 'Urgent', data: { color: 'danger' } }
    ];

    // Category options
    this.categoryOptions = [
      { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
      { value: 'TECHNICAL_ISSUE', label: 'Technical Issue' },
      { value: 'BILLING_QUESTION', label: 'Billing Question' },
      { value: 'FEATURE_REQUEST', label: 'Feature Request' },
      { value: 'BUG_REPORT', label: 'Bug Report' },
      { value: 'ACCOUNT_ISSUE', label: 'Account Issue' },
      { value: 'INTEGRATION_SUPPORT', label: 'Integration Support' },
      { value: 'PERFORMANCE_ISSUE', label: 'Performance Issue' },
      { value: 'SECURITY_CONCERN', label: 'Security Concern' },
      { value: 'DATA_REQUEST', label: 'Data Request' },
      { value: 'COMPLIANCE_INQUIRY', label: 'Compliance Inquiry' },
      { value: 'OTHER', label: 'Other' }
    ];
  }

  private initializeSelectConfigurations(): void {
    // Status select configuration
    this.statusSelectConfig = {
      placeholder: 'tickets.filter.selectStatus',
      searchPlaceholder: 'common.search',
      noResultsText: 'common.noResultsFound',
      clearable: true,
      searchable: true,
      multiple: true
    };

    // Priority select configuration
    this.prioritySelectConfig = {
      placeholder: 'tickets.filter.selectPriority',
      searchPlaceholder: 'common.search',
      noResultsText: 'common.noResultsFound',
      clearable: true,
      searchable: true,
      multiple: true
    };

    // Category select configuration
    this.categorySelectConfig = {
      placeholder: 'tickets.filter.selectCategory',
      searchPlaceholder: 'common.search',
      noResultsText: 'common.noResultsFound',
      clearable: true,
      searchable: true,
      multiple: true
    };
  }

  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.applyFilter();
    });
  }

  private loadData(params: {
    page: number;
    size: number;
    status?: TicketStatus[];
    priority?: TicketPriority[];
    category?: TicketCategory[];
    search?: string;
  } = { page: 0, size: 15 }): void {

    // Don't load data if admin hasn't selected an account yet
    if (this.isAdmin() && !this.selectedAccountId()) {
      return;
    }

    const currentSort = this.currentSort();
    const searchRequest: TicketSearchRequest = {
      searchParams: {
        status: params.status || undefined,
        priority: params.priority || undefined,
        category: params.category || undefined,
        search: params.search || undefined,
        accountId: this.selectedAccountId() || undefined
      },
      page: {
        page: params.page,
        size: params.size,
        sort: currentSort ? [`${currentSort.column},${currentSort.direction}`] : undefined
      }
    };

    this.ticketService.getTickets(searchRequest)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.tableService.updateConfigData(data?.totalPages || 15);
          this.tableConfig$ = this.tableService.getTableConfig();
          this.tickets$ = of(data.content);
          this.loading.set(false);
          this.error.set(false);
        },
        error: (error) => {
          console.error('Error loading tickets:', error);
          this.loading.set(false);
          this.error.set(true);
          this.tickets$ = of([]);
        }
      });
  }

  onRefresh(): void {
    this.loadData();
  }

  resetForm(): void {
    this.filterForm.reset();
    // Clear query params when resetting filters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
    this.loadData();
  }

  applyFilter(): void {
    const formValue = this.filterForm.getRawValue();
    const params = {
      page: 0,
      size: 15,
      status: formValue.status && formValue.status.length > 0 ? formValue.status : undefined,
      priority: formValue.priority && formValue.priority.length > 0 ? formValue.priority : undefined,
      category: formValue.category && formValue.category.length > 0 ? formValue.category : undefined,
      search: formValue.search || undefined
    };
    this.loadData(params);
  }

  onPageChange({ page, size }: { page: number; size: number }): void {
    const formValue = this.filterForm.getRawValue();
    this.loadData({
      page,
      size,
      status: formValue.status,
      priority: formValue.priority,
      category: formValue.category,
      search: formValue.search
    });
  }

  onSortChange(sortEvent: { column: string; direction: 'asc' | 'desc' }): void {
    this.currentSort.set(sortEvent);
    this.applyFilter();
  }

  onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableService.updateColumnVisibility(selectedColumns);
  }

  private initializePanelActions(): void {
    this.detailsPanelActions = [
      {
        id: 'edit',
        icon: 'cilPencil',
        label: 'Edit Ticket',
        handler: () => this.onEditFromDetails()
      }
    ];
  }

  onCreateNew(): void {
    this.selectedTicket.set(null);
    this.showCreatePanel.set(true);
  }

  onViewDetails(ticket: Ticket): void {
    // Show panel with loading state
    this.detailsLoading.set(true);
    this.showDetailsPanel.set(true);
    this.selectedTicketDetails.set(null);

    // Load full ticket details
    this.ticketService.getTicket(ticket.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (ticketDetails) => {
          this.selectedTicketDetails.set(ticketDetails);
          this.detailsLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading ticket details:', error);
          this.detailsLoading.set(false);
          this.showDetailsPanel.set(false);
        }
      });
  }

  onEdit(ticket: Ticket): void {
    // Show panel with loading state
    this.editLoading.set(true);
    this.showEditPanel.set(true);
    this.selectedTicket.set(null);

    // Load full ticket details before editing
    this.ticketService.getTicket(ticket.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (ticketDetails) => {
          this.selectedTicket.set(ticketDetails);
          this.editLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading ticket details for edit:', error);
          this.editLoading.set(false);
          this.showEditPanel.set(false);
        }
      });
  }

  onEditFromDetails(): void {
    // Use already loaded details from the details panel
    const details = this.selectedTicketDetails();
    if (details) {
      this.selectedTicket.set(details);
    }
    this.showDetailsPanel.set(false);
    this.showEditPanel.set(true);
  }

  onPanelClose(): void {
    this.showCreatePanel.set(false);
    this.showEditPanel.set(false);
    this.showDetailsPanel.set(false);
    this.selectedTicket.set(null);
    this.selectedTicketDetails.set(null);
  }

  onTicketSaved(): void {
    this.onPanelClose();
    this.onRefresh();
  }

  onStatusChange(ticket: Ticket, newStatus: TicketStatus): void {
    this.ticketService.updateTicket(ticket.id, { status: newStatus })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.onRefresh();
        },
        error: (error) => {
          console.error('Error updating ticket status:', error);
        }
      });
  }

  // Helper methods for templates
  getStatusColor(status: TicketStatus): string {
    switch (status) {
      case 'OPEN': return 'primary';
      case 'IN_PROGRESS': return 'info';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'dark';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  }

  getPriorityColor(priority: TicketPriority): string {
    switch (priority) {
      case 'LOW': return 'secondary';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'dark';
      case 'URGENT': return 'danger';
      default: return 'secondary';
    }
  }

  getCategoryLabel(category: TicketCategory): string {
    const option = this.categoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  }
}
