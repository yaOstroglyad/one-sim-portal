# Implementation Plan: Tickets Module - Angular Signals Migration

**Input**: spec.md from `/specs/009-tickets-signals-migration/`
**Approach**: Incremental migration from simplest to most complex component

---

## Current State Analysis

### Files to Migrate

| File | @Input | @Output | markForCheck | *ngIf | Subscriptions |
|------|--------|---------|--------------|-------|---------------|
| ticket-details.component.ts | 1 | 0 | 0 | 0 | 0 |
| ticket-details.component.html | - | - | - | 6 | - |
| ticket-details-wrapper.component.ts | 1 | 0 | 4 | 2 (inline) | 5 |
| ticket-form.component.ts | 1 | 2 | 4 | 0 | 1 |
| ticket-form.component.html | - | - | - | 0 | - |
| ticket-list.component.ts | 0 | 0 | 5+2 | 0 | 8 |
| ticket-list.component.html | - | - | - | 12+ | - |
| ticket-event.service.ts | - | - | - | - | 4 Subjects |

---

## Phase 1: TicketDetailsComponent (Simplest)

**Goal**: Migrate simplest component to establish patterns

### Changes to `ticket-details.component.ts`

```typescript
// Remove
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

// Add
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

// Replace @Input with input() signal
// Before: @Input() ticket: Ticket;
// After:
ticket = input.required<Ticket>();
```

**Imports Update:**
- Remove `CommonModule` (not needed with new control flow)
- Keep all other imports

### Changes to `ticket-details.component.html`

Replace all `*ngIf` with `@if`:

```html
<!-- Before -->
<div class="ticket-details" *ngIf="ticket">

<!-- After -->
@if (ticket()) {
<div class="ticket-details">
```

```html
<!-- Before -->
<span *ngIf="ticket.assignedToName; else unassigned">{{ ticket.assignedToName }}</span>
<ng-template #unassigned>
  <span class="text-muted">{{ 'tickets.unassigned' | translate }}</span>
</ng-template>

<!-- After -->
@if (ticket().assignedToName) {
  <span>{{ ticket().assignedToName }}</span>
} @else {
  <span class="text-muted">{{ 'tickets.unassigned' | translate }}</span>
}
```

**Template access pattern:** `ticket` → `ticket()` (signal call)

---

## Phase 2: TicketDetailsWrapperComponent

**Goal**: Migrate state properties to signals, eliminate markForCheck

### Changes to `ticket-details-wrapper.component.ts`

```typescript
// Imports
import { Component, ChangeDetectionStrategy, OnInit, input, signal, inject } from '@angular/core';

// Remove CommonModule, ChangeDetectorRef
// Remove: private cdr: ChangeDetectorRef from constructor

// Input
ticket = input.required<Ticket>();

// State signals
commentsData = signal<Comment[]>([]);
commentsLoading = signal(false);
attachmentsData = signal<Attachment[]>([]);
attachmentsLoading = signal(false);

// Inject pattern
private ticketService = inject(TicketService);

// Computed for config (depends on ticket)
commentsConfig = computed<CommentsConfiguration>(() => ({
  entityId: this.ticket().id,
  entityType: 'ticket',
  allowAddComments: true,
  placeholder: 'comments.placeholder',
  minLength: 3,
  maxLength: 1000
}));

attachmentsConfig = computed<AttachmentsConfiguration>(() => ({
  entityId: this.ticket().id,
  entityType: 'ticket',
  allowUpload: true,
  allowDownload: true,
  maxFileSize: 10 * 1024 * 1024,
  allowedMimeTypes: [...],
  uploadHint: 'attachments.uploadHint'
}));
```

**Method updates (remove markForCheck):**
```typescript
private loadCommentsData(): void {
  this.commentsLoading.set(true);

  this.ticketService.getComments(this.ticket().id).subscribe({
    next: (comments) => {
      this.commentsData.set(comments.map(c => this.mapToComment(c)));
      this.commentsLoading.set(false);
      // No markForCheck needed!
    },
    error: (error) => {
      console.error('Failed to load comments:', error);
      this.commentsData.set([]);
      this.commentsLoading.set(false);
    }
  });
}
```

### Inline Template Updates

```html
<!-- Before -->
<div class="comments-section" *ngIf="ticket">

<!-- After -->
@if (ticket()) {
<div class="comments-section">
```

```html
<!-- Before -->
[comments]="commentsData"
[loading]="commentsLoading"

<!-- After -->
[comments]="commentsData()"
[loading]="commentsLoading()"
```

---

## Phase 3: TicketFormComponent

**Goal**: Migrate input/output, eliminate markForCheck, keep FormGroup

### Changes to `ticket-form.component.ts`

```typescript
// Imports
import { Component, ChangeDetectionStrategy, OnInit, inject, input, output, signal, computed } from '@angular/core';

// Remove: EventEmitter, Input, Output, ChangeDetectorRef

// Input/Output
ticket = input<Ticket | null>(null);
save = output<void>();
cancel = output<void>();

// State
loading = signal(false);
ticketForm = signal<FormGroup | null>(null);

// Computed
formSchema = computed(() => getTicketFormConfig(this.ticket()));
initialFormValues = computed(() => getTicketInitialValues(this.ticket()));
isFormInvalid = computed(() => {
  const form = this.ticketForm();
  return form ? form.invalid : true;
});

// Inject
private ticketService = inject(TicketService);
private ticketEventService = inject(TicketEventService);
```

**Method updates:**
```typescript
onSubmit(): void {
  const form = this.ticketForm();
  if (!form || form.invalid) {
    return;
  }

  this.loading.set(true);

  const formValue = form.getRawValue();
  const currentTicket = this.ticket();

  const operation$ = currentTicket
    ? this.ticketService.updateTicket(currentTicket.id, getTicketUpdateRequest(formValue))
    : this.ticketService.createTicket(getTicketCreateRequest(formValue));

  operation$.subscribe({
    next: (ticket) => {
      this.loading.set(false);
      if (currentTicket) {
        this.ticketEventService.emitTicketUpdated(ticket);
      } else {
        this.ticketEventService.emitTicketCreated(ticket);
      }
      this.save.emit();
    },
    error: (error) => {
      console.error('Error saving ticket:', error);
      this.loading.set(false);
    }
  });
}

onFormReady(form: FormGroup): void {
  this.ticketForm.set(form);

  const initialValues = this.initialFormValues();
  if (initialValues && form) {
    form.patchValue(initialValues, { emitEvent: false });
  }
}

onCancel(): void {
  this.cancel.emit();
}
```

---

## Phase 4: TicketEventService (Signal-based Events)

**Goal**: Convert Subject-based events to signal-based pattern

### Changes to `ticket-event.service.ts`

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Ticket } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TicketEventService {
  // Signal-based events (increment counter to trigger reactivity)
  private ticketCreatedSignal = signal<{ ticket: Ticket; timestamp: number } | null>(null);
  private ticketUpdatedSignal = signal<{ ticket: Ticket; timestamp: number } | null>(null);
  private applyFiltersSignal = signal<{ filters: any; timestamp: number } | null>(null);
  private refreshListSignal = signal<number>(0);

  // Public readable signals
  readonly ticketCreated = this.ticketCreatedSignal.asReadonly();
  readonly ticketUpdated = this.ticketUpdatedSignal.asReadonly();
  readonly applyFilters = this.applyFiltersSignal.asReadonly();
  readonly refreshListTrigger = this.refreshListSignal.asReadonly();

  // Emit methods
  emitTicketCreated(ticket: Ticket): void {
    console.log('[TicketEventService] Ticket created:', ticket);
    this.ticketCreatedSignal.set({ ticket, timestamp: Date.now() });
    this.emitRefreshList();
  }

  emitTicketUpdated(ticket: Ticket): void {
    console.log('[TicketEventService] Ticket updated:', ticket);
    this.ticketUpdatedSignal.set({ ticket, timestamp: Date.now() });
    this.emitRefreshList();
  }

  emitApplyFilters(filters: any): void {
    console.log('[TicketEventService] Apply filters:', filters);
    this.applyFiltersSignal.set({ filters, timestamp: Date.now() });
  }

  emitRefreshList(): void {
    console.log('[TicketEventService] Refresh list requested');
    this.refreshListSignal.update(v => v + 1);
  }
}
```

---

## Phase 5: TicketListComponent (Most Complex)

**Goal**: Full migration with effect() for event subscriptions

### Changes to `ticket-list.component.ts`

**State signals:**
```typescript
// Panel states
showCreatePanel = signal(false);
showEditPanel = signal(false);
showDetailsPanel = signal(false);
selectedTicket = signal<Ticket | null>(null);
selectedTicketDetails = signal<Ticket | null>(null);
editLoading = signal(false);

// Data states
loading = signal(true);
error = signal(false);

// Keep Observable for GenericTable compatibility
tickets$ = signal<Observable<Ticket[]>>(of([]));

// Sort state
currentSort = signal<{ column: string; direction: 'asc' | 'desc' } | null>(null);

// Account
selectedAccountId = signal<string | null>(null);
isAdmin = signal(false);
```

**Effects for event service (replaces subscriptions):**
```typescript
constructor() {
  // Effect to react to ticket events
  effect(() => {
    const created = this.ticketEventService.ticketCreated();
    if (created) {
      console.log('[TicketList] New ticket created, refreshing list');
      this.loadData();
    }
  });

  effect(() => {
    const updated = this.ticketEventService.ticketUpdated();
    if (updated) {
      console.log('[TicketList] Ticket updated, refreshing list');
      this.loadData();
    }
  });

  effect(() => {
    const refresh = this.ticketEventService.refreshListTrigger();
    if (refresh > 0) {
      console.log('[TicketList] Refresh requested');
      this.loadData();
    }
  });

  effect(() => {
    const filtersEvent = this.ticketEventService.applyFilters();
    if (filtersEvent) {
      console.log('[TicketList] External filters received:', filtersEvent.filters);
      this.filterForm.patchValue(filtersEvent.filters);
      this.filterForm.markAsDirty();
    }
  });
}
```

**Method updates (remove markForCheck/detectChanges):**
```typescript
onEdit(ticket: Ticket): void {
  this.editLoading.set(true);
  this.showEditPanel.set(true);
  this.selectedTicket.set(null);

  this.ticketService.getTicket(ticket.id).subscribe({
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

onPanelClose(): void {
  this.showCreatePanel.set(false);
  this.showEditPanel.set(false);
  this.showDetailsPanel.set(false);
  this.selectedTicket.set(null);
  this.selectedTicketDetails.set(null);
}
```

### Changes to `ticket-list.component.html`

**All *ngIf → @if:**
```html
<!-- Before -->
<app-account-selector *ngIf="isAdmin"

<!-- After -->
@if (isAdmin()) {
<app-account-selector
```

```html
<!-- Before -->
<app-generic-right-panel *ngIf="showEditPanel"

<!-- After -->
@if (showEditPanel()) {
<app-generic-right-panel
```

```html
<!-- Before -->
<div *ngIf="editLoading" class="d-flex justify-content-center...">

<!-- After -->
@if (editLoading()) {
<div class="d-flex justify-content-center...">
```

**Signal property access:**
```html
<!-- Before -->
[disabled]="!editFormComponent || editFormComponent.loading || editFormComponent.isFormInvalid"

<!-- After -->
[disabled]="!editFormComponent || editFormComponent.loading() || editFormComponent.isFormInvalid()"
```

---

## Phase 6: Build & Validation

**Goal**: Verify all changes compile and work correctly

### Build Verification
```bash
npm run build
```

### Manual Testing Checklist
- [ ] Navigate to /home/tickets - list loads
- [ ] Filter by status/priority/category works
- [ ] Click row - details panel opens
- [ ] Edit ticket - form loads with data
- [ ] Create ticket - form works
- [ ] Add comment - saves and refreshes
- [ ] Upload attachment - works
- [ ] Download attachment - works

---

## Implementation Order

1. **Phase 1**: TicketDetailsComponent (~10 min)
2. **Phase 2**: TicketDetailsWrapperComponent (~20 min)
3. **Phase 3**: TicketFormComponent (~15 min)
4. **Phase 4**: TicketEventService (~10 min)
5. **Phase 5**: TicketListComponent (~45 min)
6. **Phase 6**: Build & validation (~10 min)

**Total estimated effort**: ~2 hours

---

## Rollback Strategy

If issues arise:
1. Each phase can be reverted independently
2. Git commit after each phase
3. Observable compatibility maintained for GenericTable

---

**Plan Version**: 1.0.0 | **Created**: 2025-12-06
