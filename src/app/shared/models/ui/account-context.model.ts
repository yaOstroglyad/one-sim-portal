/**
 * Configuration options for account context per module/page.
 * Passed to AccountContextService.configure() when a page initializes.
 */
export interface AccountContextOptions {
  /**
   * Whether to show the account selector in the header.
   * If false, selector is hidden regardless of other settings.
   */
  visible: boolean;

  /**
   * Whether account selection is required for this module.
   * If true and no account selected, shows attention indicator.
   * @default false
   */
  required?: boolean;

  /**
   * Whether to auto-select the first account if none is persisted.
   * Only applies when visible=true.
   * @default false
   */
  selectFirstByDefault?: boolean;
}
