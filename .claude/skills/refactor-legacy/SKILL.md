---
name: refactor-legacy
description: Refactors legacy code to match current project standards. Use when asked to refactor, modernize, update old code, migrate to signals, or fix legacy patterns.
allowed-tools: Read, Edit, Glob, Grep
---

# Refactor Legacy Code

Modernize legacy code to comply with current One-Sim-Portal standards.

> **Rules Reference:** All modern patterns in `constitution.md` Section II.
> This skill provides the **procedure** for systematic refactoring.

## Procedure

1. **Read the file** to identify legacy patterns
2. **List all violations** (see checklist below)
3. **Refactor in order** (safest first)
4. **Verify** no functionality broken
5. **Update imports** if needed

## Legacy → Modern Transformation Guide

### 1. Constructor Injection → inject()

```typescript
// ❌ LEGACY
constructor(
  private http: HttpClient,
  private router: Router,
  private cdr: ChangeDetectorRef
) {}

// ✅ MODERN
private readonly http = inject(HttpClient);
private readonly router = inject(Router);
private readonly cdr = inject(ChangeDetectorRef);
```

### 2. @Input/@Output → Signal API

```typescript
// ❌ LEGACY
@Input() data: Data;
@Input() disabled = false;
@Output() dataChange = new EventEmitter<Data>();

// ✅ MODERN
readonly data = input<Data>();
readonly disabled = input<boolean>(false);
readonly dataChange = output<Data>();
```

### 3. BehaviorSubject → signal()

```typescript
// ❌ LEGACY
private readonly isLoading$ = new BehaviorSubject<boolean>(false);
private readonly items$ = new BehaviorSubject<Item[]>([]);

get isLoading(): boolean {
  return this.isLoading$.value;
}

// ✅ MODERN
readonly isLoading = signal(false);
readonly items = signal<Item[]>([]);
```

### 4. Getter/combineLatest → computed()

```typescript
// ❌ LEGACY
get isEmpty(): boolean {
  return this.items.length === 0;
}

readonly filtered$ = combineLatest([this.items$, this.query$]).pipe(
  map(([items, query]) => items.filter(i => i.name.includes(query)))
);

// ✅ MODERN
readonly isEmpty = computed(() => this.items().length === 0);

readonly filtered = computed(() =>
  this.items().filter(i => i.name.includes(this.query()))
);
```

### 5. *ngIf/*ngFor → @if/@for

```html
<!-- ❌ LEGACY -->
<div *ngIf="isLoading">Loading...</div>
<div *ngFor="let item of items">{{ item.name }}</div>
<div [ngSwitch]="status">
  <span *ngSwitchCase="'active'">Active</span>
</div>

<!-- ✅ MODERN -->
@if (isLoading()) {
  <div>Loading...</div>
}
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}
@switch (status()) {
  @case ('active') { <span>Active</span> }
}
```

### 6. @import → @use

```scss
// ❌ LEGACY
@import "../../../../scss/variables";
@import "../../../../scss/mixins";

// ✅ MODERN
@use "variables" as vars;
@use "mixins" as mixins;
```

### 7. Hardcoded Colors → CSS Variables

```scss
// ❌ LEGACY
color: #2c2c2c;
background: #ffffff;
border: 1px solid #e0e0e0;

// ✅ MODERN
color: var(--os-color-text-primary);
background: var(--os-color-background);
border: 1px solid var(--os-color-border);
```

### 8. app- prefix → os- prefix

```typescript
// ❌ LEGACY
selector: 'app-my-component'

// ✅ MODERN
selector: 'os-my-component'
```

### 9. Missing standalone/OnPush

```typescript
// ❌ LEGACY
@Component({
  selector: 'os-my-component',
  templateUrl: './my.component.html'
})

// ✅ MODERN
@Component({
  selector: 'os-my-component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './my.component.html'
})
```

## Refactoring Order (safest first)

1. **SCSS** (@import → @use, hardcoded colors) — no runtime impact
2. **Template** (*ngIf → @if) — low risk
3. **Selector prefix** (app- → os-) — may need search/replace in usages
4. **OnPush + standalone** — may expose hidden bugs
5. **inject()** — straightforward but many changes
6. **Signal inputs/outputs** — API change, check usages
7. **signal()/computed()** — logic change, test carefully

## Quick Checklist

After refactoring, verify:
- [ ] No constructor injection (use `inject()`)
- [ ] No `@Input()/@Output()` (use `input()/output()`)
- [ ] No `BehaviorSubject` for local state (use `signal()`)
- [ ] No `*ngIf/*ngFor` (use `@if/@for`)
- [ ] No `@import` in SCSS (use `@use`)
- [ ] No hardcoded colors (use CSS variables)
- [ ] `standalone: true` present
- [ ] `changeDetection: OnPush` present
- [ ] `os-` selector prefix
- [ ] Build passes
