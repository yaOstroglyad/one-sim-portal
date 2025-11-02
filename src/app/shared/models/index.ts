/**
 * Shared Models Barrel Export
 *
 * Organized by domain categories:
 * - auth: Authentication & authorization
 * - business: Business entities (customers, companies, accounts)
 * - subscriber: Subscriber management and SIM cards
 * - communication: Emails, comments, attachments
 * - core: Core types (errors, pagination, countries)
 * - ui: UI configurations (forms, tables, grids)
 * - payment: Payment and order models
 * - feature: Feature flags
 * - product: Products and resources
 *
 * Usage examples:
 * ```typescript
 * // Import from specific category
 * import { Customer, Company } from '@shared/models/business';
 * import { LoginRequest } from '@shared/models/auth';
 *
 * // Import from main barrel
 * import { Customer, LoginRequest } from '@shared/models';
 *
 * // Import from shared (still works)
 * import { Customer, LoginRequest } from '@shared';
 * ```
 */

// Export all categories
export * from './auth';
export * from './business';
export * from './subscriber';
export * from './communication';
export * from './core';
export * from './ui';
export * from './payment';
export * from './feature';
export * from './product';
