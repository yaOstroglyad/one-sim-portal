import * as fs from 'fs';
import * as path from 'path';
import { PaginatedResponse, ServiceError } from '../../types';
import { User, UserRole, GetUsersParams, UsersListData, VerifyEmailData, VerifyEmailResponse, UpdateUserRequest } from './user';

export class UsersService {
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(__dirname, '../../../data/users');
  }

  // Helper function to read JSON data
  private readJsonFile<T>(filename: string): T {
    try {
      const filePath = path.join(this.dataPath, filename);
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
      throw new ServiceError(`Failed to load ${filename}`, 500);
    }
  }

  // Get paginated users with filtering
  public getUsers(params: GetUsersParams): PaginatedResponse<User> {
    const page = parseInt(params.page || '0');
    const size = parseInt(params.size || '20');
    const sort = params.sort;
    
    const allUsers = this.readJsonFile<UsersListData>('list.json');
    
    if (!allUsers) {
      throw new ServiceError('Failed to load users data', 500);
    }
    
    // Simple pagination
    const start = page * size;
    const end = start + size;
    const paginatedContent = allUsers.content.slice(start, end);
    
    // Filter by search params
    let filteredContent = paginatedContent;
    
    if (params.username) {
      filteredContent = filteredContent.filter(u => 
        u.username.toLowerCase().includes(params.username!.toLowerCase())
      );
    }
    
    if (params.email) {
      filteredContent = filteredContent.filter(u => 
        u.email.toLowerCase().includes(params.email!.toLowerCase())
      );
    }
    
    if (params.accountType) {
      filteredContent = filteredContent.filter(u => 
        u.accountType === params.accountType
      );
    }
    
    return {
      content: filteredContent,
      totalElements: allUsers.totalElements,
      totalPages: Math.ceil(allUsers.totalElements / size),
      number: page,
      size: size,
      sort: {
        sorted: !!sort,
        unsorted: !sort,
        empty: !sort
      },
      first: page === 0,
      last: page >= Math.ceil(allUsers.totalElements / size) - 1,
      numberOfElements: filteredContent.length,
      empty: filteredContent.length === 0
    };
  }

  // Create new user
  public createUser(accountId: string, userData: Partial<User>): User {
    // Simulate created user response
    const createdUser: User = {
      ...userData as User,
      id: `USER-${Date.now()}`,
      accountId: accountId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
    
    console.log('[MOCK] Created user:', createdUser);
    
    return createdUser;
  }

  // Verify if email exists
  public verifyEmail(email: string): VerifyEmailResponse {
    const verifyData = this.readJsonFile<VerifyEmailData>('verify-email.json');

    if (!verifyData) {
      throw new ServiceError('Failed to load verify data', 500);
    }

    const isExist = verifyData.existingEmails.includes(email);

    return { isExist };
  }

  // Get user by ID
  private getUserById(id: string): User {
    const allUsers = this.readJsonFile<UsersListData>('list.json');
    const user = allUsers.content.find(u => u.id === id);

    if (!user) {
      throw new ServiceError(`User with ID ${id} not found`, 404);
    }

    return user;
  }

  // Update user
  public updateUser(id: string, data: UpdateUserRequest): User {
    const user = this.getUserById(id);

    const updatedUser: User = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString()
    };

    console.log('[MOCK] Updated user:', { id, changes: data });
    return updatedUser;
  }

  // Delete user
  public deleteUser(id: string): void {
    const user = this.getUserById(id);
    console.log('[MOCK] Deleted user:', { id, username: user.username });
  }

  // Reset password
  public resetPassword(id: string): { message: string } {
    const user = this.getUserById(id);
    console.log('[MOCK] Reset password for user:', { id, email: user.email });
    return { message: `Password reset email sent to ${user.email}` };
  }

  // Assign roles to user
  public assignRoles(userId: string, roleIds: string[]): User {
    const user = this.getUserById(userId);

    // Create role objects from IDs
    const newRoles: UserRole[] = roleIds.map(id => ({
      id,
      name: `Role-${id}`
    }));

    const existingRoles = user.roles || [];
    const allRoles = [...existingRoles, ...newRoles.filter(nr =>
      !existingRoles.some(er => er.id === nr.id)
    )];

    const updatedUser: User = {
      ...user,
      roles: allRoles,
      updatedAt: new Date().toISOString()
    };

    console.log('[MOCK] Assigned roles to user:', { userId, roleIds });
    return updatedUser;
  }

  // Remove roles from user
  public removeRoles(userId: string, roleIds: string[]): User {
    const user = this.getUserById(userId);

    const existingRoles = user.roles || [];
    const remainingRoles = existingRoles.filter(r => !roleIds.includes(r.id));

    const updatedUser: User = {
      ...user,
      roles: remainingRoles,
      updatedAt: new Date().toISOString()
    };

    console.log('[MOCK] Removed roles from user:', { userId, roleIds });
    return updatedUser;
  }

  // Get user types
  public getUserTypes(): string[] {
    return ['CORPORATE', 'PRIVATE'];
  }
}