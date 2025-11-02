import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { TicketFormComponent } from '../ticket-form/ticket-form.component';
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
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        TranslateModule,
        GenericRightPanelComponent,
        TicketDetailsWrapperComponent,
        TicketFormComponent,
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

  tickets$: Observable<Ticket[]>;
  tableConfig$: BehaviorSubject<TableConfig>;
  filterForm: FormGroup;
  loading = true;
  error = false;

  private unsubscribe$ = new Subject<void>();

  // Panel states
  showCreatePanel = false;
  showEditPanel = false;
  showDetailsPanel = false;
  selectedTicket: Ticket | null = null;
  selectedTicketDetails: Ticket | null = null;

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

  // Account selector properties
  isAdmin = false;
  selectedAccountId: string | null = null;

  // Sort state
  currentSort: { column: string; direction: 'asc' | 'desc' } | null = null;

  constructor(
    private ticketService: TicketService,
    private tableService: TicketsTableService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private ticketEventService: TicketEventService,
    private authService: AuthService
  ) {
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
  }

  ngOnInit(): void {
    // Check permissions and initialize account
    this.checkPermissions();
    this.initializeAccount();

    // Setup filters first
    this.setupFilters();

    // Subscribe to ticket events
    this.subscribeToTicketEvents();

    // Then check for query parameters from quick actions
    this.route.queryParams.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
      console.log('[TicketList] Query params received:', params);

      let filtersApplied = false;

      // Handle accountId from overview navigation
      if (params['accountId'] && this.isAdmin) {
        console.log('[TicketList] Setting account from query params:', params['accountId']);
        this.selectedAccountId = params['accountId'];
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
        console.log('[TicketList] Filter by assigned to current user');
        filtersApplied = true;
      }

      // Mark form as dirty to enable reset button
      if (filtersApplied) {
        this.filterForm.markAsDirty();
        // Trigger data load with filters
        this.loadData();
      } else {
        // Load data without filters
        this.loadData();
      }
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
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  private initializeAccount(): void {
    if (!this.isAdmin) {
      // Для не-админов используем аккаунт из loggedUser
      const loggedUser = this.authService.loggedUser;
      if (loggedUser?.accountId) {
        this.selectedAccountId = loggedUser.accountId;
      }
    }
  }

  public onAccountSelected(account: Account): void {
    this.selectedAccountId = account.id;
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
    if (this.isAdmin && !this.selectedAccountId) {
      console.log('[TicketList] Admin without account selected - skipping data loading');
      return;
    }

    const searchRequest: TicketSearchRequest = {
      searchParams: {
        status: params.status || undefined,
        priority: params.priority || undefined,
        category: params.category || undefined,
        search: params.search || undefined,
        accountId: this.selectedAccountId || undefined
      },
      page: {
        page: params.page,
        size: params.size,
        sort: this.currentSort ? [`${this.currentSort.column},${this.currentSort.direction}`] : undefined
      }
    };

    this.ticketService.getTickets(searchRequest)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.tableService.updateConfigData(data?.totalPages || 15);
          this.tableConfig$ = this.tableService.getTableConfig();
          this.tickets$ = of(data.content);
          this.loading = false;
          this.error = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading tickets:', error);
          this.loading = false;
          this.error = true;
          this.tickets$ = of([]);
          this.cdr.detectChanges();
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

  private subscribeToTicketEvents(): void {
    // Listen for ticket creation
    this.ticketEventService.ticketCreated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        console.log('[TicketList] New ticket created, refreshing list');
        this.loadData();
        // Show success message or highlight new row
      });

    // Listen for ticket updates
    this.ticketEventService.ticketUpdated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        console.log('[TicketList] Ticket updated, refreshing list');
        this.loadData();
      });

    // Listen for refresh requests
    this.ticketEventService.refreshList$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        console.log('[TicketList] Refresh requested');
        this.loadData();
      });

    // Listen for filter changes from external sources
    this.ticketEventService.applyFilters$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(filters => {
        console.log('[TicketList] External filters received:', filters);
        this.filterForm.patchValue(filters);
        this.filterForm.markAsDirty();
      });
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
    console.log('[TicketList] Sort changed:', sortEvent);
    this.currentSort = sortEvent;
    this.applyFilter(); // Reload data with new sort
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
    this.selectedTicket = null;
    this.showCreatePanel = true;
  }

  onViewDetails(ticket: Ticket): void {
    this.selectedTicket = ticket;
    // Show panel immediately with basic data
    this.selectedTicketDetails = ticket;
    this.showDetailsPanel = true;

    // Then load detailed data if needed
    this.ticketService.getTicket(ticket.id).subscribe({
      next: (ticketDetails) => {
        this.selectedTicketDetails = ticketDetails;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading ticket details:', error);
        // Keep the panel open with basic data even if detailed loading fails
      }
    });
  }

  onEdit(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.showEditPanel = true;
  }

  onEditFromDetails(): void {
    this.showDetailsPanel = false;
    this.showEditPanel = true;
  }

  onPanelClose(): void {
    this.showCreatePanel = false;
    this.showEditPanel = false;
    this.showDetailsPanel = false;
    this.selectedTicket = null;
    this.selectedTicketDetails = null;
  }

  onTicketSaved(): void {
    this.onPanelClose();
    this.onRefresh();
  }

  onStatusChange(ticket: Ticket, newStatus: TicketStatus): void {
    this.ticketService.updateTicketStatus(ticket.id, newStatus).subscribe({
      next: () => {
        ticket.status = newStatus;
        this.onRefresh();
        this.cdr.markForCheck();
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
