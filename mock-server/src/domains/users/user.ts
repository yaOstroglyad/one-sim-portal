// User domain model and related interfaces

export interface UserRole {
  id: string;
  name: string;
}

export interface User {
  id?: string;
  username: string;
  accountId: string;
  accountType: 'CORPORATE' | 'PRIVATE';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  roles?: UserRole[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface AssignRolesRequest {
  roleIds: string[];
}

export interface RemoveRolesRequest {
  roleIds: string[];
}

export interface GetUsersParams {
  page?: string;
  size?: string;
  sort?: string;
  username?: string;
  email?: string;
  accountType?: string;
}

export interface UsersListData {
  content: User[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface VerifyEmailData {
  existingEmails: string[];
  response: {
    isExist: boolean;
  };
}

export interface VerifyEmailResponse {
  isExist: boolean;
}