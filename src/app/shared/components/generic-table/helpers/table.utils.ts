import { TableColumnConfig } from '@shared/models';

/**
 * Utility functions for table operations
 */
export class TableUtils {
  /**
   * Check if index is even
   * @param index - Row index
   * @returns true if index is even
   */
  static isEven(index: number): boolean {
    return index % 2 === 0;
  }

  /**
   * Check if index is odd
   * @param index - Row index
   * @returns true if index is odd
   */
  static isOdd(index: number): boolean {
    return !this.isEven(index);
  }

  /**
   * Get minimum number of rows for table display
   * Returns actual length if less than 10, otherwise returns 10
   * This ensures the table shows actual size for small datasets
   * but maintains a minimum height for larger datasets
   * @param dataLength - Number of data items
   * @returns Minimum rows to display
   */
  static getMinRows(dataLength: number): number {
    return Math.min(dataLength || 0, 10);
  }

  /**
   * Track by function for ngFor optimization
   * @param index - Item index
   * @param item - Data item
   * @returns Unique identifier (item.id or index)
   */
  static trackById(index: number, item: any): any {
    return item.id ?? index;
  }

  /**
   * Set default sort direction for sortable columns
   * @param columns - Array of table columns
   */
  static setSortDirection(columns: TableColumnConfig[]): void {
    columns.forEach(column => {
      if (column?.sortable && !column.sortDirection) {
        column.sortDirection = 'asc';
      }
    });
  }
}
