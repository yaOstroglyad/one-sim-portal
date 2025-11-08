/**
 * [Model Description]
 *
 * @example
 * ```typescript
 * const example: ExampleModel = {
 *   id: '123',
 *   name: 'Example',
 *   status: 'active'
 * };
 * ```
 */
export interface ExampleModel {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Current status */
  status: 'active' | 'inactive';

  /** Creation timestamp */
  createdAt?: Date;

  /** Last update timestamp */
  updatedAt?: Date;
}

/**
 * Request model for creating [Entity]
 */
export interface CreateExampleRequest {
  name: string;
  status?: 'active' | 'inactive';
}

/**
 * Response model for [Entity]
 */
export interface ExampleResponse extends ExampleModel {
  // Additional response fields
}
