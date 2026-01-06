/**
 * Navigation Items Injection Token
 *
 * Used to provide navigation items to search providers
 * without creating circular dependencies.
 */

import { InjectionToken } from '@angular/core';
import { NavItemWithSearch } from '@models';

/**
 * Injection token for navigation items
 * Provided in main.ts with the value from _nav.ts
 */
export const NAV_ITEMS = new InjectionToken<NavItemWithSearch[]>('NAV_ITEMS');
