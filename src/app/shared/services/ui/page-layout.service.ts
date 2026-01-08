/**
 * PageLayoutService
 *
 * Centralized service for managing dynamic page layout slots.
 * Allows pages to inject components into fixed header areas while
 * only the main content scrolls.
 *
 * Features:
 * - Signal-based header/subheader slots with zones (start, center, end)
 * - Auto-cleanup on navigation
 * - Mobile filter drawer state management
 * - Event streams for filter apply/clear actions
 *
 * @example
 * ```typescript
 * @Component({...})
 * export class CustomersComponent {
 *   private layout = inject(PageLayoutService);
 *
 *   constructor() {
 *     this.layout.header.set({
 *       start: [{ component: BreadcrumbComponent }],
 *       end: [{ component: AddButtonComponent }],
 *     });
 *
 *     this.layout.subheader.set({
 *       start: [{ component: SmartFilterComponent }],
 *       end: [{ component: ColumnControlComponent }],
 *     });
 *
 *     // Subscribe to filter events (for mobile drawer)
 *     this.layout.filterApply$.pipe(
 *       takeUntilDestroyed()
 *     ).subscribe(() => this.applyFilters());
 *   }
 * }
 * ```
 */

import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SlotZones } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class PageLayoutService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // === Slot Signals ===
  readonly header = signal<SlotZones>({});
  readonly subheader = signal<SlotZones>({});

  // === Computed ===
  readonly hasHeader = computed(() => this.hasContent(this.header()));
  readonly hasSubheader = computed(() => this.hasContent(this.subheader()));

  // === Mobile Filter Drawer State ===
  readonly isFilterDrawerOpen = signal(false);
  readonly activeFilterCount = signal(0);

  // === Event Streams (pages subscribe to these) ===
  private readonly _filterApply$ = new Subject<void>();
  private readonly _filterClear$ = new Subject<void>();

  readonly filterApply$ = this._filterApply$.asObservable();
  readonly filterClear$ = this._filterClear$.asObservable();

  constructor() {
    // Auto-cleanup on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.clearAll());
  }

  // === Public Methods ===

  /**
   * Clear all slot content and reset state.
   * Called automatically on navigation.
   */
  clearAll(): void {
    this.header.set({});
    this.subheader.set({});
    this.isFilterDrawerOpen.set(false);
    this.activeFilterCount.set(0);
  }

  /**
   * Open the mobile filter drawer
   */
  openFilterDrawer(): void {
    this.isFilterDrawerOpen.set(true);
  }

  /**
   * Close the mobile filter drawer
   */
  closeFilterDrawer(): void {
    this.isFilterDrawerOpen.set(false);
  }

  /**
   * Set the number of active filters (displayed on mobile filter button)
   */
  setActiveFilterCount(count: number): void {
    this.activeFilterCount.set(count);
  }

  /**
   * Emit filter apply event (called by filter drawer).
   * Pages subscribe to filterApply$ to react.
   */
  emitFilterApply(): void {
    this._filterApply$.next();
    this.closeFilterDrawer();
  }

  /**
   * Emit filter clear event (called by filter drawer).
   * Pages subscribe to filterClear$ to react.
   */
  emitFilterClear(): void {
    this._filterClear$.next();
  }

  // === Private Methods ===

  /**
   * Check if a SlotZones object has any content
   */
  private hasContent(zones: SlotZones): boolean {
    return (zones.start?.length ?? 0) +
           (zones.center?.length ?? 0) +
           (zones.end?.length ?? 0) > 0;
  }
}
