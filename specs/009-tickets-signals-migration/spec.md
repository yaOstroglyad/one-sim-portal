# Feature Specification: Tickets Module - Angular Signals Migration

**Feature Branch**: `009-tickets-signals-migration`
**Created**: 2025-12-06
**Status**: Implemented
**Input**: Modernize Tickets module to Angular 19 standards with Signals and new control flow

## Overview

Migrate the Tickets module from RxJS-heavy patterns with manual change detection to Angular Signals and modern control flow syntax (@if, @for, @switch). This eliminates ~13 manual `markForCheck()` calls and ~8 observable subscriptions.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Ticket List (Priority: P1)

As a support agent, I want to view the ticket list so that I can manage support requests.

**Why this priority**: Core functionality must remain working after migration.

**Independent Test**: Navigate to /home/tickets, verify list loads and displays correctly.

**Acceptance Scenarios**:

1. **Given** I navigate to tickets, **When** page loads, **Then** I see ticket list (same as before)
2. **Given** I filter by status, **When** filter applied, **Then** list updates reactively
3. **Given** I click a ticket row, **When** details panel opens, **Then** I see ticket details

---

### User Story 2 - Create/Edit Ticket (Priority: P1)

As a support agent, I want to create and edit tickets so that I can manage support requests.

**Why this priority**: Core CRUD operations must work.

**Independent Test**: Create new ticket, edit existing ticket.

**Acceptance Scenarios**:

1. **Given** I click Create, **When** form opens, **Then** form works with signals
2. **Given** I edit a ticket, **When** loading details, **Then** loading spinner shows
3. **Given** I submit form, **When** save completes, **Then** list refreshes automatically

---

### User Story 3 - Comments & Attachments (Priority: P1)

As a support agent, I want to manage comments and attachments on tickets.

**Why this priority**: Full ticket management workflow.

**Independent Test**: Add comment, upload attachment, download attachment.

**Acceptance Scenarios**:

1. **Given** I view ticket details, **When** comments load, **Then** loading state shows with @if
2. **Given** I add a comment, **When** saved, **Then** comments list updates reactively

---

### Edge Cases

- What if API call fails during loading? -> Show error state, no manual CD needed
- What if user switches panels quickly? -> Signals handle cleanup automatically
- What if form validation fails? -> Computed signals handle form state

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All existing functionality MUST work identically after migration
- **FR-002**: Components MUST use signal() for local state management
- **FR-003**: Components MUST use computed() for derived state
- **FR-004**: Templates MUST use @if/@for/@switch instead of *ngIf/*ngFor/*ngSwitch
- **FR-005**: @Input MUST migrate to input() signal where possible
- **FR-006**: @Output MUST migrate to output() function where applicable
- **FR-007**: All manual markForCheck()/detectChanges() calls MUST be eliminated
- **FR-008**: Subscriptions MUST use takeUntilDestroyed() or be eliminated via toSignal()

### Non-Functional Requirements

- **NFR-001**: No performance degradation
- **NFR-002**: Bundle size should remain similar or decrease
- **NFR-003**: Code should be more readable and maintainable

### Scope Clarifications (from /speckit.clarify)

- **GenericTableComponent**: Keep Observable inputs (tickets$, tableConfig$) - shared component not in scope
- **TicketEventService**: Convert to signal-based event pattern (shared signals with set())
- **FormGeneratorComponent**: Don't touch - reactive forms work separately from signals

## Technical Implementation

### Current State Analysis

| Component | LOC | markForCheck | detectChanges | Subscriptions | Complexity |
|-----------|-----|--------------|---------------|---------------|------------|
| TicketListComponent | 557 | 5 | 2 | 8 | HIGH |
| TicketFormComponent | 109 | 4 | 0 | 1 | MEDIUM |
| TicketDetailsWrapperComponent | 238 | 4 | 0 | 5 | MEDIUM |
| TicketDetailsComponent | 63 | 0 | 0 | 0 | LOW |

### Migration Strategy

#### Phase 1: TicketDetailsComponent (Simplest - Start Here)
- Convert @Input to input() signal
- Convert *ngIf to @if in template
- No subscriptions to handle

#### Phase 2: TicketDetailsWrapperComponent
- Convert state properties to signal()
- Convert loading flags to signal()
- Use computed() for derived states
- Convert template to @if blocks
- Replace subscriptions with toSignal() or effect()

#### Phase 3: TicketFormComponent
- Convert @Input/@Output to input()/output()
- Convert loading state to signal()
- Keep FormGroup (reactive forms stay)
- Replace manual CD with signals

#### Phase 4: TicketListComponent (Most Complex)
- Convert panel states to signals
- Convert filter state to signals
- Replace BehaviorSubject with signal()
- Use computed() for derived data
- Convert all template directives
- Eliminate all manual CD calls

#### Phase 5: Services
- TicketEventService: Convert Subject to signal-based pattern (shared signals with set())
- TicketsTableService: Keep BehaviorSubject for Observable compatibility with GenericTableComponent

### Key Patterns to Apply

**Before (Observable + Manual CD):**
```typescript
loading = false;
data: Ticket[] = [];

loadData() {
  this.loading = true;
  this.cdr.markForCheck();

  this.service.getData().subscribe({
    next: (data) => {
      this.data = data;
      this.loading = false;
      this.cdr.markForCheck();
    }
  });
}
```

**After (Signals):**
```typescript
loading = signal(false);
data = signal<Ticket[]>([]);

loadData() {
  this.loading.set(true);

  this.service.getData().subscribe({
    next: (data) => {
      this.data.set(data);
      this.loading.set(false);
    }
  });
}
```

**Template Before:**
```html
<div *ngIf="loading">Loading...</div>
<div *ngIf="!loading && data.length > 0">
  <div *ngFor="let item of data">{{ item.name }}</div>
</div>
```

**Template After:**
```html
@if (loading()) {
  <div>Loading...</div>
} @else if (data().length > 0) {
  @for (item of data(); track item.id) {
    <div>{{ item.name }}</div>
  }
}
```

### Input/Output Migration

**Before:**
```typescript
@Input() ticket: Ticket | null = null;
@Output() save = new EventEmitter<void>();
```

**After:**
```typescript
ticket = input<Ticket | null>(null);
save = output<void>();
```

### Files to Modify

| File | Changes |
|------|---------|
| `ticket-details.component.ts` | input() signal, template @if |
| `ticket-details.component.html` | @if blocks |
| `ticket-details-wrapper.component.ts` | signals for state, input(), template |
| `ticket-form.component.ts` | input(), output(), signal() for loading |
| `ticket-form.component.html` | @if blocks |
| `ticket-list.component.ts` | Full signal migration |
| `ticket-list.component.html` | Full @if/@for migration |
| `tickets-table.service.ts` | Keep as-is (Observable compatibility) |
| `ticket-event.service.ts` | Signal-based event pattern |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero markForCheck() calls in tickets module
- **SC-002**: Zero detectChanges() calls in tickets module
- **SC-003**: All *ngIf replaced with @if
- **SC-004**: All *ngFor replaced with @for (if any)
- **SC-005**: All @Input using input() signal
- **SC-006**: All @Output using output() function
- **SC-007**: Build succeeds with no errors
- **SC-008**: All existing functionality works (manual testing)

---

**Specification Version:** 1.0.0 | **Last Updated:** 2025-12-06
