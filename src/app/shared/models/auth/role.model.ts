/**
 * Role model for role management
 *
 * @example
 * ```typescript
 * const role: RoleOption = {
 *   id: '123',
 *   name: 'ADMIN',
 *   displayName: 'Administrator'
 * };
 * ```
 */
export interface RoleOption {
  id: string;
  name: string;
  displayName?: string;
}
