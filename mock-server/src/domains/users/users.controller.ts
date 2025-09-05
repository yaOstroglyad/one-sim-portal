import { Response, Application } from 'express';
import { BaseController } from '../../shared/base.controller';
import { UsersService } from './users.service';
import { MockRequest } from '../../types';
import { User, GetUsersParams } from './user';

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

  // Register routes on Express app
  public registerRoutes(app: Application): void {
    app.get('/api/v1/users/query/all', this.getAllUsers);
    app.post('/api/v1/users/command/create', this.createUser);
    app.get('/api/v1/users/query/verify-user', this.verifyUser);
  }
}