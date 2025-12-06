# Feature Specification: FAB Layout

**Feature Branch**: `004-fab-layout`
**Created**: 2025-12-03
**Status**: Implemented
**Input**: Global Floating Action Button with flyout panel for quick actions

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Quick Actions (Priority: P1)

As a user, I want quick access to common actions from any page via a floating button.

**Why this priority**: Core purpose of FAB - providing global access to features.

**Independent Test**: Can be tested by clicking FAB and verifying menu appears.

**Acceptance Scenarios**:

1. **Given** I am on any page, **When** I see the FAB at bottom center, **Then** I can click it
2. **Given** FAB is visible, **When** I click a button, **Then** the corresponding action triggers
3. **Given** a panel is open, **When** I click backdrop or press Esc, **Then** panel closes

---

### User Story 2 - Auto-Hide Behavior (Priority: P2)

As a user, I want the FAB to auto-hide when not needed so that it doesn't obstruct content.

**Why this priority**: UX polish - improves content visibility but not blocking for MVP.

**Independent Test**: Can be tested by waiting for auto-hide and hovering near bottom edge.

**Acceptance Scenarios**:

1. **Given** FAB is visible, **When** 3 seconds pass without interaction, **Then** FAB slides down
2. **Given** FAB is hidden, **When** I move mouse near bottom edge, **Then** FAB appears after delay
3. **Given** menu is open, **When** I interact with menu, **Then** FAB stays visible

---

### User Story 3 - Role-Based Buttons (Priority: P1)

As an admin, I want to see admin-specific actions in the FAB that regular users don't see.

**Why this priority**: Security and UX - users should only see relevant actions.

**Independent Test**: Can be tested by logging in as different roles and checking visible buttons.

**Acceptance Scenarios**:

1. **Given** I am logged in as admin, **When** I view FAB, **Then** I see admin buttons
2. **Given** I am a regular user, **When** I view FAB, **Then** admin buttons are hidden
3. **Given** FAB has no available buttons for my role, **When** I view page, **Then** FAB is hidden

---

### User Story 4 - Lazy Load Features (Priority: P2)

As a user, I want features to load quickly when I need them.

**Why this priority**: Performance optimization - improves perceived speed.

**Independent Test**: Can be tested by opening a feature panel and verifying component loads.

**Acceptance Scenarios**:

1. **Given** I click a FAB button, **When** panel opens, **Then** feature component loads dynamically
2. **Given** feature is loading, **When** I wait, **Then** I see loading indicator

---

### User Story 5 - Route-Specific Buttons (Priority: P3)

As a developer, I want to register route-specific buttons that auto-cleanup on navigation.

**Why this priority**: Developer convenience - helps with contextual actions but not user-facing.

**Independent Test**: Can be tested by navigating between routes and checking button visibility.

**Acceptance Scenarios**:

1. **Given** a route registers a button, **When** I'm on that route, **Then** button appears
2. **Given** I navigate away, **When** new route loads, **Then** old route's buttons are removed

---

### Edge Cases

- What if panel component fails to load? → Show error message in panel
- How to handle very slow feature loads? → Show loading state, allow cancel
- What if user has no permissions for any button? → Hide FAB entirely

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: FAB MUST be positioned at bottom center of screen
- **FR-002**: FAB MUST support click to open panel or execute action
- **FR-003**: Panel MUST close on Esc key or backdrop click
- **FR-004**: Features MUST load lazily via dynamic import
- **FR-005**: Buttons MUST be filtered by user permissions
- **FR-006**: FAB MUST auto-hide after initial display (3s)
- **FR-007**: FAB MUST show on mouse near bottom edge (50px threshold)
- **FR-008**: Visual pill indicator MUST show when FAB is hidden
- **FR-009**: Route-specific buttons MUST cleanup on navigation
- **FR-010**: Focus MUST return to FAB on panel close

### Key Entities

- **FabButtonConfig**: Button definition with id, label, icon, roles, action
- **FeatureEntry**: Lazy-loadable feature with metadata and loader

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: FAB is visible within 100ms of page load
- **SC-002**: Panel opens within 200ms of button click
- **SC-003**: Feature component loads within 500ms
- **SC-004**: Auto-hide animation is smooth (60fps)

---

## Technical Implementation

### Data Models

```typescript
interface FabButtonConfig {
  id: string;
  label: string;
  icon: string;
  order: number;
  roles?: string[];
  hasMenu: boolean;
  menuItems?: FabMenuItem[];
  action: 'route' | 'component' | 'callback' | 'external';
  target?: string;
}

interface FeatureEntry {
  meta: FeatureMeta;
  load: () => Promise<Type<unknown>>;
}

interface FeatureMeta {
  key: string;
  title: string;
  icon?: string;
  roles?: string[];
  order?: number;
}
```

### Auto-Hide Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| EDGE_THRESHOLD | 50px | Distance from bottom to trigger show |
| SHOW_DELAY | 400ms | Delay before showing |
| HIDE_DELAY | 800ms | Delay before hiding |
| INITIAL_DISPLAY | 3s | Initial visibility duration |

### File Structure

```
src/app/shared/components/fab-layout/
├── components/
│   ├── global-fab/
│   └── flyout-layout/
├── services/
│   ├── global-flyout.service.ts
│   ├── feature-registry.service.ts
│   └── fab-config.service.ts
├── models/
│   └── fab-layout.model.ts
└── providers/
    └── feature-provider.ts
```

### Usage Example

```typescript
// App Component
@Component({
  template: `
    <router-outlet />
    <app-global-fab />
    <app-flyout-layout />
  `
})

// Registration in main.ts
bootstrapApplication(AppComponent, {
  providers: [
    provideFabLayout(),
    provideFabButton({ id: 'chat', label: 'Chat', icon: 'chat', order: 10 }),
    provideFeature({
      meta: { key: 'chat', title: 'Support Chat' },
      load: () => import('./features/chat').then(m => m.ChatComponent)
    })
  ]
});
```

---

**Specification Version:** 1.0.0 | **Last Updated:** 2025-12-03
