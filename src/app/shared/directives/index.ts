/**
 * Shared directives barrel export
 *
 * Organized by directive type:
 * - Structural directives: Modify DOM structure (*directive)
 * - Attribute directives: Modify element behavior/appearance ([directive])
 *
 * Usage:
 * import { CopyToClipboardDirective, FeatureToggleDirective, HasPermissionDirective } from '@shared/directives'
 */

// Attribute Directives - modify element behavior
export * from './attribute/copy-to-clipboard/copy-to-clipboard.directive';

// Structural Directives - conditionally show/hide content
export * from './structural/feature-toggle/feature-toggle.directive';
export * from './structural/has-permission/has-permission.directive';
