/**
 * Page Layout Slot Models
 *
 * Models for the dynamic page layout slot system that allows pages
 * to inject components into fixed header areas.
 */

import { Type } from '@angular/core';

/**
 * Represents a component that can be rendered in a slot zone.
 * Supports dynamic component rendering with optional inputs.
 *
 * @example
 * const titleSlot: SlotComponent = {
 *   component: PageTitleComponent,
 *   inputs: { title: 'Customers' }
 * };
 */
export interface SlotComponent<T = unknown> {
  /** The component class to render */
  component: Type<T>;
  /** Optional inputs to pass to the component */
  inputs?: Record<string, unknown>;
}

/**
 * Defines the zones within a slot (header or subheader).
 * Each zone can contain multiple components rendered in order.
 *
 * Layout:
 * ┌─────────────┬─────────────────────┬─────────────────┐
 * │ start       │ center (optional)   │ end             │
 * └─────────────┴─────────────────────┴─────────────────┘
 */
export interface SlotZones {
  /** Components aligned to the start (left in LTR) */
  start?: SlotComponent[];
  /** Components centered in the middle (optional) */
  center?: SlotComponent[];
  /** Components aligned to the end (right in LTR) */
  end?: SlotComponent[];
}

/**
 * Available page slot names for type safety
 */
export const PAGE_SLOTS = {
  HEADER: 'header',
  SUBHEADER: 'subheader',
} as const;

export type PageSlotName = (typeof PAGE_SLOTS)[keyof typeof PAGE_SLOTS];
