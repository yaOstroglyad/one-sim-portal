/**
 * Data search and filtering utilities
 *
 * Provides functions for searching through complex data structures
 */

/**
 * Recursively search for a string in nested objects and arrays
 *
 * Performs case-insensitive search through:
 * - String values
 * - Array elements (recursively)
 * - Object properties (recursively)
 *
 * @param item - Item to search (can be string, array, object, or primitive)
 * @param filterString - Search string (case-insensitive)
 * @returns true if filterString is found anywhere in the item
 *
 * @example
 * ```typescript
 * const data = {
 *   name: 'John Doe',
 *   address: { city: 'New York' },
 *   tags: ['developer', 'senior']
 * };
 *
 * deepSearch(data, 'york');      // true (found in address.city)
 * deepSearch(data, 'developer'); // true (found in tags array)
 * deepSearch(data, 'admin');     // false
 * ```
 */
export function deepSearch(item: any, filterString: string): boolean {
  // Convert filter string to lowercase for case-insensitive search
  const lowerFilter = filterString.toLowerCase();

  // Check if item is a string
  if (typeof item === 'string' && item.toLowerCase().includes(lowerFilter)) {
    return true;
  }

  // Check if item is an array
  if (Array.isArray(item)) {
    return item.some(element => deepSearch(element, filterString));
  }

  // Check if item is an object
  if (typeof item === 'object' && item !== null) {
    return Object.values(item).some(value => deepSearch(value, filterString));
  }

  return false;
}

/**
 * Filter array of objects by searching multiple fields
 *
 * @param items - Array of objects to search
 * @param searchTerm - Search string
 * @param fields - Array of field names to search in
 * @returns Filtered array containing only matching items
 *
 * @example
 * ```typescript
 * const users = [
 *   { name: 'John', email: 'john@example.com' },
 *   { name: 'Jane', email: 'jane@example.com' }
 * ];
 *
 * multiFieldSearch(users, 'jane', ['name', 'email']);
 * // Returns: [{ name: 'Jane', email: 'jane@example.com' }]
 * ```
 */
export function multiFieldSearch<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return items;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();

  return items.filter(item =>
    fields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerSearchTerm);
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    })
  );
}

/**
 * Filter array by global search (searches all fields)
 *
 * @param items - Array of objects to search
 * @param searchTerm - Search string
 * @returns Filtered array containing only matching items
 *
 * @example
 * ```typescript
 * const products = [
 *   { id: 1, name: 'Laptop', price: 999 },
 *   { id: 2, name: 'Mouse', price: 29 }
 * ];
 *
 * globalSearch(products, 'laptop');
 * // Returns: [{ id: 1, name: 'Laptop', price: 999 }]
 * ```
 */
export function globalSearch<T>(items: T[], searchTerm: string): T[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return items;
  }

  return items.filter(item => deepSearch(item, searchTerm));
}
