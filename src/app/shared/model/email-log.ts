export interface EmailLog {
  id: string;
  accountId: string;
  iccid?: string;
  emailAddress: string;
  subject: string;
  emailType: string;
  status: EmailLogStatus;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  templateId?: string;
  templateName?: string;
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