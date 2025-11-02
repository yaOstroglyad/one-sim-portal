export interface Comment {
  id: string;
  entityId: string; // ID сущности к которой привязан комментарий (ticket, order, customer, etc.)
  entityType: string; // тип сущности ('ticket', 'order', 'customer', etc.)
  content: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentRequest {
  entityId: string;
  entityType: string;
  content: string;
}

export interface CommentsConfiguration {
  entityId: string;
  entityType: string;
  allowAddComments: boolean;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
}