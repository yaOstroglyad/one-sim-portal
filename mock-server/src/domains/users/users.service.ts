import * as fs from 'fs';
import * as path from 'path';
import { PaginatedResponse, ServiceError } from '../../types';
import { User, GetUsersParams, UsersListData, VerifyEmailData, VerifyEmailResponse } from './user';

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
}