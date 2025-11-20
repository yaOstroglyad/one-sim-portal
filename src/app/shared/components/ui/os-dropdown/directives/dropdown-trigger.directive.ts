import { Directive } from '@angular/core';

/**
 * Directive to mark the trigger element for the dropdown.
 * This element will be positioned relative to when the dropdown opens.
 *
 * @example
 * ```html
 * <os-dropdown>
 *   <button dropdownTrigger>Click me</button>
 * </os-dropdown>
 * ```
 */
@Directive({
  selector: '[dropdownTrigger]',
  standalone: true
})
export class DropdownTriggerDirective {}
