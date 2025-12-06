import { Response, Application } from 'express';
import { BaseController } from '../../shared/base.controller';
import { UsersService } from './users.service';
import { MockRequest } from '../../types';
import { User, UpdateUserRequest, AssignRolesRequest, RemoveRolesRequest } from './user';

export class UsersController extends BaseController {
  private usersService: UsersService;

  constructor() {
    super('UsersController');
    this.usersService = new UsersService();
  }

  // GET /api/v1/users/query/all
  private getAllUsers = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', '/api/v1/users/query/all', req.query);
      const result = this.usersService.getUsers(req.query);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(res, error, 'Failed to load users data');
    }
  }

  // POST /api/v1/users/command/create
  private createUser = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('POST', '/api/v1/users/command/create', { query: req.query, body: req.body });
      
      this.validateRequiredParams(req.query, ['accountId']);
      
      const { accountId } = req.query;
      const userData: Partial<User> = req.body;

      const createdUser = this.usersService.createUser(accountId!, userData);
      this.successResponse(res, createdUser, 201);
    } catch (error) {
      this.handleError(res, error, 'Failed to create user');
    }
  }

  // GET /api/v1/users/query/verify-user
  private verifyUser = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', '/api/v1/users/query/verify-user', req.query);

      this.validateRequiredParams(req.query, ['email']);

      const { email } = req.query;
      const result = this.usersService.verifyEmail(email!);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(res, error, 'Failed to verify email');
    }
  }

  // PUT /api/v1/users/:id/update
  private updateUser = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('PUT', `/api/v1/users/${req.params.id}/update`, req.body);

      const { id } = req.params;
      const data: UpdateUserRequest = req.body;

      const updatedUser = this.usersService.updateUser(id, data);
      this.successResponse(res, updatedUser);
    } catch (error) {
      this.handleError(res, error, 'Failed to update user');
    }
  }

  // DELETE /api/v1/users/:id/delete
  private deleteUser = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('DELETE', `/api/v1/users/${req.params.id}/delete`, req.params);

      const { id } = req.params;
      this.usersService.deleteUser(id);
      this.successResponse(res, { message: 'User deleted successfully' });
    } catch (error) {
      this.handleError(res, error, 'Failed to delete user');
    }
  }

  // POST /api/v1/users/:id/reset-password
  private resetPassword = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('POST', `/api/v1/users/${req.params.id}/reset-password`, req.params);

      const { id } = req.params;
      const result = this.usersService.resetPassword(id);
      this.successResponse(res, result);
    } catch (error) {
      this.handleError(res, error, 'Failed to reset password');
    }
  }

  // POST /api/v1/users/:userId/roles/assign
  private assignRoles = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('POST', `/api/v1/users/${req.params.userId}/roles/assign`, req.body);

      const { userId } = req.params;
      const { roleIds }: AssignRolesRequest = req.body;

      const updatedUser = this.usersService.assignRoles(userId, roleIds);
      this.successResponse(res, updatedUser);
    } catch (error) {
      this.handleError(res, error, 'Failed to assign roles');
    }
  }

  // DELETE /api/v1/users/:userId/roles/remove
  private removeRoles = (req: MockRequest, res: Response): void => {
    try {
      this.logRequest('DELETE', `/api/v1/users/${req.params.userId}/roles/remove`, req.body);

      const { userId } = req.params;
      const { roleIds }: RemoveRolesRequest = req.body;

      const updatedUser = this.usersService.removeRoles(userId, roleIds);
      this.successResponse(res, updatedUser);
    } catch (error) {
      this.handleError(res, error, 'Failed to remove roles');
    }
  }

  // GET /api/v1/users/query/types
  private getUserTypes = (_req: MockRequest, res: Response): void => {
    try {
      this.logRequest('GET', '/api/v1/users/query/types', {});

      const types = this.usersService.getUserTypes();
      this.successResponse(res, types);
    } catch (error) {
      this.handleError(res, error, 'Failed to get user types');
    }
  }

  // Register routes on Express app
  public registerRoutes(app: Application): void {
    // Existing routes
    app.get('/api/v1/users/query/all', this.getAllUsers);
    app.post('/api/v1/users/command/create', this.createUser);
    app.get('/api/v1/users/query/verify-user', this.verifyUser);
    app.get('/api/v1/users/query/types', this.getUserTypes);

    // New routes
    app.put('/api/v1/users/:id/update', this.updateUser);
    app.delete('/api/v1/users/:id/delete', this.deleteUser);
    app.post('/api/v1/users/:id/reset-password', this.resetPassword);
    app.post('/api/v1/users/:userId/roles/assign', this.assignRoles);
    app.delete('/api/v1/users/:userId/roles/remove', this.removeRoles);
  }
}