export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  isProtected: boolean;
  createdAt: string;
}

export interface RolesPageResponse {
  number: number;
  size: number;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  content: Role[];
}

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description: string;
  category: string;
}

export interface UpdateRoleRequest {
  displayName: string;
  description: string;
}