export interface EmailLog {
  id: string;
  accountId: string;
  senderAccountId: string;
  iccids: string[];
  email: string;
  type: string;
  event: string;
  status: string;
  createdAt: string;
  messageId?: string;
  initialId?: string;
  metadata?: {
    status: number;
    response: string;
  };
}

export enum EmailLogStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  COMPLAINED = 'COMPLAINED'
}

export interface EmailLogFilterParams {
  accountId: string;
  iccid?: string;
  email?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

export interface EmailLogResponse {
  content: EmailLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
} 