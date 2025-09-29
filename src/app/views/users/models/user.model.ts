export interface User {
  id: string;
  name: string;
  loginName: string;
  email: string;
  phone?: string;
  createdAt?: string;
  createdBy?: string;
  accountInfo: {
    id: string;
    name: string;
    type: string;
    externalId: string;
  };
  roles?: {
    id: string;
    name: string;
    displayName: string;
  }[];
}

export interface UsersPageResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
}

export interface CreateUserRequest {
  name: string;
  loginName: string;
  email: string;
  phone?: string;
  accountId: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface UserSearchRequest {
  searchQuery?: string;
  roleId?: string;
  accountId?: string;
  isActive?: boolean;
}