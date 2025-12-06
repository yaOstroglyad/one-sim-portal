/**
 * Allowed MIME types for ticket attachments
 */
export const TICKET_ALLOWED_MIME_TYPES: string[] = [
  // PDF
  'application/pdf',
  // Word documents
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Excel spreadsheets
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // PowerPoint presentations
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text files
  'text/plain',
  // Images
  'image/png',
  'image/jpeg',
  'image/gif'
];

/**
 * Maximum file size for ticket attachments (10MB)
 */
export const TICKET_MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Translation keys for pending items (used in create mode)
 */
export const TICKET_PENDING_AUTHOR_KEY = 'tickets.pending.author';
