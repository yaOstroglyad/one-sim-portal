/**
 * Dialog operation modes
 */
export enum DialogMode {
  /**
   * Create mode - add new tariff with validFrom to pricing schedule
   * Makes POST API call
   */
  Create = 'create',

  /**
   * Edit mode - modify existing future tariff
   * Makes PUT API call
   */
  Edit = 'edit'
}

/**
 * Helper to determine dialog mode from data
 */
export function getDialogMode(mode: 'create' | 'edit'): DialogMode {
  return mode === 'create' ? DialogMode.Create : DialogMode.Edit;
}

/**
 * Helper to get dialog title based on mode
 */
export function getDialogTitle(mode: DialogMode): string {
  switch (mode) {
    case DialogMode.Create:
      return 'Add Price';
    case DialogMode.Edit:
      return 'Edit Price';
  }
}

/**
 * Helper to get save button text based on mode
 */
export function getSaveButtonText(mode: DialogMode): string {
  switch (mode) {
    case DialogMode.Create:
      return 'Add Price';
    case DialogMode.Edit:
      return 'Update Price';
  }
}

/**
 * Helper to get info message based on mode
 */
export function getInfoMessage(mode: DialogMode): string {
  switch (mode) {
    case DialogMode.Create:
      return 'This will add a new price to the pricing schedule.';
    case DialogMode.Edit:
      return 'This will update the existing price in the pricing schedule.';
  }
}
