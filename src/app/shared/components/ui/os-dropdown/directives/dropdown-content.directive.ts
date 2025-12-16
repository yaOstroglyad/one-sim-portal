import { Directive } from '@angular/core';

/**
 * Directive to mark the content that will be displayed in the dropdown panel.
 *
 * @example
 * ```html
 * <os-dropdown>
 *   <button dropdownTrigger>Click me</button>
 *   <div dropdownContent>
 *     <!-- Your content here -->
 *   </div>
 * </os-dropdown>
 * ```
 */
@Directive({
  standalone: true,
  selector: '[dropdownContent]',
})
export class DropdownContentDirective {}
