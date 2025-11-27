/**
 * Status values for [Entity]
 * Use this const for runtime checks and type derivation
 */
export const ExampleStatus = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

export type ExampleStatus = (typeof ExampleStatus)[keyof typeof ExampleStatus];

/**
 * [Model Description]
 *
 * @example
 * ```typescript
 * const example: ExampleModel = {
 *   id: '123',
 *   name: 'Example',
 *   status: ExampleStatus.Active
 * };
 * ```
 */
export interface ExampleModel {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Current status */
  status: ExampleStatus;

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
  status?: ExampleStatus;
}

/**
 * Response model for [Entity]
 */
export interface ExampleResponse extends ExampleModel {
  // Additional response fields
}
