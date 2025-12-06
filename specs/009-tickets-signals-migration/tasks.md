# Tasks: Tickets Module - Angular Signals Migration

**Input**: Design documents from `/specs/009-tickets-signals-migration/`
**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: Not requested (manual testing)

---

## Phase 1: TicketDetailsComponent

**Purpose**: Migrate simplest component to establish patterns

- [ ] T001 Replace @Input with input.required<Ticket>() in ticket-details.component.ts
- [ ] T002 Remove CommonModule import from ticket-details.component.ts
- [ ] T003 Update imports to include input from @angular/core in ticket-details.component.ts
- [ ] T004 Replace *ngIf="ticket" with @if (ticket()) in ticket-details.component.html
- [ ] T005 Replace *ngIf="ticket.assignedToName; else unassigned" with @if/@else in ticket-details.component.html
- [ ] T006 Replace *ngIf="ticket.updatedAt !== ticket.createdAt" with @if in ticket-details.component.html
- [ ] T007 Replace *ngIf="ticket.customerName" with @if in ticket-details.component.html
- [ ] T008 Replace *ngIf="ticket.customerEmail" with @if in ticket-details.component.html
- [ ] T009 Replace *ngIf="ticket.iccid" with @if in ticket-details.component.html
- [ ] T010 Update all template references from ticket.property to ticket().property in ticket-details.component.html

**Checkpoint**: TicketDetailsComponent compiles and renders correctly

---

## Phase 2: TicketDetailsWrapperComponent

**Purpose**: Migrate state to signals, eliminate markForCheck

- [ ] T011 Update imports to include input, signal, computed, inject in ticket-details-wrapper.component.ts
- [ ] T012 Remove CommonModule and ChangeDetectorRef imports in ticket-details-wrapper.component.ts
- [ ] T013 Replace @Input() ticket with ticket = input.required<Ticket>() in ticket-details-wrapper.component.ts
- [ ] T014 Convert commentsData to signal<Comment[]>([]) in ticket-details-wrapper.component.ts
- [ ] T015 Convert commentsLoading to signal(false) in ticket-details-wrapper.component.ts
- [ ] T016 Convert attachmentsData to signal<Attachment[]>([]) in ticket-details-wrapper.component.ts
- [ ] T017 Convert attachmentsLoading to signal(false) in ticket-details-wrapper.component.ts
- [ ] T018 Replace constructor injection with inject() pattern for TicketService in ticket-details-wrapper.component.ts
- [ ] T019 Remove ChangeDetectorRef from constructor in ticket-details-wrapper.component.ts
- [ ] T020 Convert commentsConfig to computed() in ticket-details-wrapper.component.ts
- [ ] T021 Convert attachmentsConfig to computed() in ticket-details-wrapper.component.ts
- [ ] T022 Update loadCommentsData to use signal.set() and remove markForCheck in ticket-details-wrapper.component.ts
- [ ] T023 Update loadAttachmentsData to use signal.set() and remove markForCheck in ticket-details-wrapper.component.ts
- [ ] T024 Replace *ngIf="ticket" with @if (ticket()) in inline template
- [ ] T025 Update template bindings to use signal calls: commentsData(), commentsLoading(), etc.

**Checkpoint**: TicketDetailsWrapperComponent compiles, comments/attachments load correctly

---

## Phase 3: TicketFormComponent

**Purpose**: Migrate input/output, eliminate markForCheck

- [ ] T026 Update imports to include input, output, signal, computed, inject in ticket-form.component.ts
- [ ] T027 Remove EventEmitter, Input, Output, ChangeDetectorRef imports in ticket-form.component.ts
- [ ] T028 Remove CommonModule import in ticket-form.component.ts
- [ ] T029 Replace @Input() ticket with ticket = input<Ticket | null>(null) in ticket-form.component.ts
- [ ] T030 Replace @Output() save with save = output<void>() in ticket-form.component.ts
- [ ] T031 Replace @Output() cancel with cancel = output<void>() in ticket-form.component.ts
- [ ] T032 Convert loading to signal(false) in ticket-form.component.ts
- [ ] T033 Convert ticketForm to signal<FormGroup | null>(null) in ticket-form.component.ts
- [ ] T034 Convert formSchema to computed() in ticket-form.component.ts
- [ ] T035 Convert initialFormValues to computed() in ticket-form.component.ts
- [ ] T036 Convert isFormInvalid getter to computed() in ticket-form.component.ts
- [ ] T037 Replace constructor injection with inject() pattern in ticket-form.component.ts
- [ ] T038 Update onSubmit to use signal methods and remove markForCheck in ticket-form.component.ts
- [ ] T039 Update onFormReady to use ticketForm.set() and remove markForCheck in ticket-form.component.ts
- [ ] T040 Update onCancel to use output emit in ticket-form.component.ts

**Checkpoint**: TicketFormComponent compiles, create/edit ticket works

---

## Phase 4: TicketEventService

**Purpose**: Convert Subject-based events to signal-based pattern

- [ ] T041 Update imports to include signal from @angular/core in ticket-event.service.ts
- [ ] T042 Remove Subject import from rxjs in ticket-event.service.ts
- [ ] T043 Replace ticketCreatedSource Subject with ticketCreatedSignal signal in ticket-event.service.ts
- [ ] T044 Replace ticketUpdatedSource Subject with ticketUpdatedSignal signal in ticket-event.service.ts
- [ ] T045 Replace applyFiltersSource Subject with applyFiltersSignal signal in ticket-event.service.ts
- [ ] T046 Replace refreshListSource Subject with refreshListSignal signal in ticket-event.service.ts
- [ ] T047 Add public readonly signal accessors (ticketCreated, ticketUpdated, applyFilters, refreshListTrigger) in ticket-event.service.ts
- [ ] T048 Update emitTicketCreated to use signal.set() in ticket-event.service.ts
- [ ] T049 Update emitTicketUpdated to use signal.set() in ticket-event.service.ts
- [ ] T050 Update emitApplyFilters to use signal.set() in ticket-event.service.ts
- [ ] T051 Update emitRefreshList to use signal.update() in ticket-event.service.ts
- [ ] T052 Remove Observable exports (ticketCreated$, ticketUpdated$, etc.) in ticket-event.service.ts

**Checkpoint**: TicketEventService compiles with signal-based API

---

## Phase 5: TicketListComponent

**Purpose**: Full signal migration with effect() for events

### 5.1 State Migration

- [ ] T053 Update imports to include signal, computed, effect, inject in ticket-list.component.ts
- [ ] T054 Remove ChangeDetectorRef import in ticket-list.component.ts
- [ ] T055 Convert showCreatePanel to signal(false) in ticket-list.component.ts
- [ ] T056 Convert showEditPanel to signal(false) in ticket-list.component.ts
- [ ] T057 Convert showDetailsPanel to signal(false) in ticket-list.component.ts
- [ ] T058 Convert selectedTicket to signal<Ticket | null>(null) in ticket-list.component.ts
- [ ] T059 Convert selectedTicketDetails to signal<Ticket | null>(null) in ticket-list.component.ts
- [ ] T060 Convert editLoading to signal(false) in ticket-list.component.ts
- [ ] T061 Convert loading to signal(true) in ticket-list.component.ts
- [ ] T062 Convert error to signal(false) in ticket-list.component.ts
- [ ] T063 Convert isAdmin to signal(false) in ticket-list.component.ts
- [ ] T064 Convert selectedAccountId to signal<string | null>(null) in ticket-list.component.ts
- [ ] T065 Convert currentSort to signal in ticket-list.component.ts

### 5.2 Inject Pattern & Effects

- [ ] T066 Replace constructor injections with inject() pattern in ticket-list.component.ts
- [ ] T067 Remove ChangeDetectorRef from constructor in ticket-list.component.ts
- [ ] T068 Add effect() for ticketCreated signal in ticket-list.component.ts
- [ ] T069 Add effect() for ticketUpdated signal in ticket-list.component.ts
- [ ] T070 Add effect() for refreshListTrigger signal in ticket-list.component.ts
- [ ] T071 Add effect() for applyFilters signal in ticket-list.component.ts
- [ ] T072 Remove subscribeToTicketEvents method and its subscriptions in ticket-list.component.ts

### 5.3 Method Updates

- [ ] T073 Update loadData to use signal.set() and remove detectChanges in ticket-list.component.ts
- [ ] T074 Update onViewDetails to use signal.set() and remove markForCheck in ticket-list.component.ts
- [ ] T075 Update onEdit to use signal.set() and remove markForCheck in ticket-list.component.ts
- [ ] T076 Update onEditFromDetails to use signal methods in ticket-list.component.ts
- [ ] T077 Update onPanelClose to use signal.set() in ticket-list.component.ts
- [ ] T078 Update onStatusChange to use signal methods and remove markForCheck in ticket-list.component.ts
- [ ] T079 Update onAccountSelected to use signal.set() in ticket-list.component.ts
- [ ] T080 Update checkPermissions to use signal.set() in ticket-list.component.ts
- [ ] T081 Update initializeAccount to use signal methods in ticket-list.component.ts

### 5.4 Template Updates

- [ ] T082 Remove CommonModule import in ticket-list.component.ts
- [ ] T083 Replace *ngIf="isAdmin" with @if (isAdmin()) in ticket-list.component.html
- [ ] T084 Replace *ngIf="data.assignedToName; else unassigned" with @if/@else in ticket-list.component.html
- [ ] T085 Replace *ngIf for status menu items with @if in ticket-list.component.html
- [ ] T086 Replace *ngIf="showCreatePanel" with @if (showCreatePanel()) in ticket-list.component.html
- [ ] T087 Replace *ngIf="showEditPanel" with @if (showEditPanel()) in ticket-list.component.html
- [ ] T088 Replace *ngIf="editLoading" with @if (editLoading()) in ticket-list.component.html
- [ ] T089 Replace *ngIf for editForm conditions with @if in ticket-list.component.html
- [ ] T090 Replace *ngIf="showDetailsPanel && selectedTicketDetails" with @if in ticket-list.component.html
- [ ] T091 Update template bindings to use signal calls: selectedTicket(), editLoading(), etc.
- [ ] T092 Update editFormComponent references to use signal accessors: loading(), isFormInvalid()

**Checkpoint**: TicketListComponent compiles, all panel operations work

---

## Phase 6: Build & Validation

**Purpose**: Build and verify all changes work correctly

- [ ] T093 Build project: `npm run build`
- [ ] T094 Fix any TypeScript compilation errors
- [ ] T095 Update spec.md status to "Implemented"

**Checkpoint**: Build succeeds, spec updated

---

## Summary

| Phase | Description | Tasks |
|-------|-------------|-------|
| 1 | TicketDetailsComponent | T001-T010 |
| 2 | TicketDetailsWrapperComponent | T011-T025 |
| 3 | TicketFormComponent | T026-T040 |
| 4 | TicketEventService | T041-T052 |
| 5 | TicketListComponent | T053-T092 |
| 6 | Build & Validation | T093-T095 |

**Total Tasks**: 95

**Files to Modify**: 8
- `src/app/views/tickets/components/tickets/ticket-details/ticket-details.component.ts`
- `src/app/views/tickets/components/tickets/ticket-details/ticket-details.component.html`
- `src/app/views/tickets/components/tickets/ticket-details-wrapper/ticket-details-wrapper.component.ts`
- `src/app/views/tickets/components/tickets/ticket-form/ticket-form.component.ts`
- `src/app/views/tickets/components/tickets/ticket-form/ticket-form.component.html`
- `src/app/views/tickets/components/tickets/ticket-list/ticket-list.component.ts`
- `src/app/views/tickets/components/tickets/ticket-list/ticket-list.component.html`
- `src/app/views/tickets/services/ticket-event.service.ts`

---

**Tasks Version**: 1.0.0 | **Generated**: 2025-12-06
