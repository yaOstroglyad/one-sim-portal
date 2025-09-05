// User domain model and related interfaces

export interface User {
  id?: string;
  username: string;
  accountId: string;
  accountType: 'CORPORATE' | 'PRIVATE';
  firstName: string;
  lastName: string;
  email: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
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