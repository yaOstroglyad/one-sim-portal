export interface Attachment {
  id: string;
  entityId: string; // ID сущности к которой привязан файл (ticket, order, customer, etc.)
  entityType: string; // тип сущности ('ticket', 'order', 'customer', etc.)
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  uploadedByName: string;
  createdAt: Date;
}

export interface UploadAttachmentRequest {
  entityId: string;
  entityType: string;
  file: File;
}

export interface AttachmentsConfiguration {
  entityId: string;
  entityType: string;
  allowUpload: boolean;
  allowDownload: boolean;
  maxFileSize?: number; // в байтах
  allowedMimeTypes?: string[];
  uploadHint?: string;
}