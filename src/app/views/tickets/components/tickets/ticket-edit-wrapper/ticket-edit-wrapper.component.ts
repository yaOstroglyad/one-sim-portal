import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject, effect, DestroyRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Ticket, TicketComment, TicketAttachment } from '../../../models';
import { TicketService, TicketEventService } from '../../../services';
import { TicketFormComponent } from '../ticket-form/ticket-form.component';
import { CommentsComponent, AttachmentsComponent, Comment, Attachment, CommentsConfiguration, AttachmentsConfiguration, CreateCommentRequest, UploadAttachmentRequest } from '@shared';
import {
  getTicketCreateRequest
} from '../ticket-form/ticket-form.utils';
import { TICKET_ALLOWED_MIME_TYPES, TICKET_MAX_FILE_SIZE, TICKET_PENDING_AUTHOR_KEY } from '../../../models';

@Component({
    selector: 'app-ticket-edit-wrapper',
    standalone: true,
    imports: [
        TranslateModule,
        TicketFormComponent,
        CommentsComponent,
        AttachmentsComponent
    ],
    template: `
    <div class="ticket-edit-wrapper">
      <!-- Ticket Form -->
      <app-ticket-form
        #ticketForm
        [ticket]="ticket()"
        (save)="onFormSaved()">
      </app-ticket-form>

      <!-- Comments Section (always visible, works in both create and edit mode) -->
      <div class="comments-section">
        <div class="section-header">
          <h4>{{ 'tickets.comments' | translate }} ({{ displayedComments().length }})</h4>
        </div>
        <app-comments
          [comments]="displayedComments()"
          [config]="commentsConfig()"
          [loading]="commentsLoading()"
          (commentAdded)="onCommentAdded($event)">
        </app-comments>
      </div>

      <!-- Attachments Section (always visible, works in both create and edit mode) -->
      <div class="attachments-section">
        <div class="section-header">
          <h4>{{ 'tickets.attachments' | translate }} ({{ displayedAttachments().length }})</h4>
        </div>
        <app-attachments
          [attachments]="displayedAttachments()"
          [config]="attachmentsConfig()"
          [loading]="attachmentsLoading()"
          (fileUploaded)="onFileUploaded($event)"
          (fileDownloaded)="onFileDownloaded($event)">
        </app-attachments>
      </div>
    </div>
  `,
    styles: [`
    .ticket-edit-wrapper {
      .comments-section,
      .attachments-section {
        margin-top: 2rem;
        padding: 1.5rem;
        border: 1px solid var(--cui-border-color);
        border-radius: 0.375rem;
        background-color: var(--cui-bg);

        .section-header {
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--cui-border-color);

          h4 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--cui-body-color);
          }
        }
      }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketEditWrapperComponent {
  // Inputs/Outputs
  ticket = input<Ticket | null>(null);
  save = output<void>();

  // ViewChild for form access
  @ViewChild('ticketForm') ticketFormComponent!: TicketFormComponent;

  // Services
  private ticketService = inject(TicketService);
  private ticketEventService = inject(TicketEventService);
  private translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  // State signals - existing ticket data
  commentsData = signal<Comment[]>([]);
  commentsLoading = signal(false);
  attachmentsData = signal<Attachment[]>([]);
  attachmentsLoading = signal(false);

  // Pending data for create mode (before ticket exists)
  pendingComments = signal<string[]>([]);
  pendingAttachments = signal<File[]>([]);

  // Loading state for the whole submit process
  submitting = signal(false);

  // Computed: check if in create mode
  isCreateMode = computed(() => !this.ticket());

  // Pending author label - computed from translation service
  private pendingAuthorLabel = computed(() =>
    this.translateService.instant(TICKET_PENDING_AUTHOR_KEY)
  );

  // Computed: displayed comments (existing + pending as preview)
  displayedComments = computed<Comment[]>(() => {
    const existing = this.commentsData();
    const pending = this.pendingComments();
    const authorLabel = this.pendingAuthorLabel();

    // In create mode, show pending comments as preview
    const pendingAsComments: Comment[] = pending.map((content, index) => ({
      id: `pending-${index}`,
      entityId: '',
      entityType: 'ticket',
      content,
      authorName: authorLabel,
      authorAvatar: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    return [...existing, ...pendingAsComments];
  });

  // Computed: displayed attachments (existing + pending as preview)
  displayedAttachments = computed<Attachment[]>(() => {
    const existing = this.attachmentsData();
    const pending = this.pendingAttachments();
    const authorLabel = this.pendingAuthorLabel();

    // In create mode, show pending files as preview
    const pendingAsAttachments: Attachment[] = pending.map((file, index) => ({
      id: `pending-${index}`,
      entityId: '',
      entityType: 'ticket',
      fileName: file.name,
      originalFileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      downloadUrl: '',
      uploadedByName: authorLabel,
      createdAt: new Date()
    }));

    return [...existing, ...pendingAsAttachments];
  });

  // Expose form state for parent component
  isLoading(): boolean {
    return this.submitting() || (this.ticketFormComponent?.loading() ?? false);
  }

  isInvalid(): boolean {
    return this.ticketFormComponent?.isFormInvalid() ?? true;
  }

  // Computed configurations
  commentsConfig = computed<CommentsConfiguration>(() => {
    const t = this.ticket();
    return {
      entityId: t?.id ?? 'pending',
      entityType: 'ticket',
      allowAddComments: true,
      placeholder: 'comments.placeholder',
      minLength: 3,
      maxLength: 1000
    };
  });

  attachmentsConfig = computed<AttachmentsConfiguration>(() => {
    const t = this.ticket();
    return {
      entityId: t?.id ?? 'pending',
      entityType: 'ticket',
      allowUpload: true,
      allowDownload: !!t, // Only allow download for existing tickets
      maxFileSize: TICKET_MAX_FILE_SIZE,
      allowedMimeTypes: TICKET_ALLOWED_MIME_TYPES,
      uploadHint: 'attachments.uploadHint'
    };
  });

  constructor() {
    // React to ticket input changes - load comments/attachments for existing tickets
    effect(() => {
      const ticket = this.ticket();
      if (ticket) {
        this.loadCommentsData();
        this.loadAttachmentsData();
        // Clear pending data when switching to edit mode
        this.pendingComments.set([]);
        this.pendingAttachments.set([]);
      }
    });
  }

  // Public method to trigger form submission
  onSubmit(): void {
    if (this.isCreateMode()) {
      this.submitCreate();
    } else {
      // In edit mode, just submit the form (comments/attachments are already saved)
      this.ticketFormComponent?.onSubmit();
    }
  }

  private submitCreate(): void {
    const form = this.ticketFormComponent?.getForm();
    if (!form || form.invalid) {
      return;
    }

    this.submitting.set(true);

    const formValue = form.getRawValue();
    const createRequest = getTicketCreateRequest(formValue);

    // Step 1: Create the ticket
    this.ticketService.createTicket(createRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (createdTicket) => {
          // Step 2: Add pending comments and attachments
          this.addPendingData(createdTicket.id, createdTicket);
        },
        error: (error) => {
          console.error('Error creating ticket:', error);
          this.submitting.set(false);
        }
      });
  }

  private addPendingData(ticketId: string, createdTicket: Ticket): void {
    const comments = this.pendingComments();
    const files = this.pendingAttachments();

    // Build array of observables for pending operations
    const commentOps = comments.map(content =>
      this.ticketService.addComment(ticketId, { content, isInternal: false })
    );

    const fileOps = files.map(file =>
      this.ticketService.uploadAttachment(ticketId, file)
    );

    const allOps = [...commentOps, ...fileOps];

    if (allOps.length === 0) {
      // No pending data, just finish
      this.finishCreate(createdTicket);
      return;
    }

    // Execute all operations in parallel
    forkJoin(allOps)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.finishCreate(createdTicket);
        },
        error: (error) => {
          // Even if some fail, ticket is created - finish anyway
          console.error('Error adding comments/attachments:', error);
          this.finishCreate(createdTicket);
        }
      });
  }

  private finishCreate(ticket: Ticket): void {
    this.submitting.set(false);
    this.pendingComments.set([]);
    this.pendingAttachments.set([]);
    this.ticketEventService.emitTicketCreated(ticket);
    this.save.emit();
  }

  onFormSaved(): void {
    // This is called from TicketFormComponent in edit mode
    this.save.emit();
  }

  private loadCommentsData(): void {
    const ticket = this.ticket();
    if (!ticket) return;

    this.commentsLoading.set(true);

    this.ticketService.getComments(ticket.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (comments) => {
          this.commentsData.set(comments.map(c => this.mapToComment(c)));
          this.commentsLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load comments:', error);
          this.commentsData.set([]);
          this.commentsLoading.set(false);
        }
      });
  }

  private loadAttachmentsData(): void {
    const ticket = this.ticket();
    if (!ticket) return;

    this.attachmentsLoading.set(true);

    this.ticketService.getAttachments(ticket.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (attachments) => {
          this.attachmentsData.set(attachments.map(a => this.mapToAttachment(a)));
          this.attachmentsLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load attachments:', error);
          this.attachmentsData.set([]);
          this.attachmentsLoading.set(false);
        }
      });
  }

  private mapToComment(apiComment: TicketComment): Comment {
    return {
      id: apiComment.id,
      entityId: apiComment.ticketId,
      entityType: 'ticket',
      content: apiComment.content,
      authorName: apiComment.authorName,
      authorAvatar: null,
      createdAt: new Date(apiComment.createdAt),
      updatedAt: new Date(apiComment.updatedAt)
    };
  }

  private mapToAttachment(apiAttachment: TicketAttachment): Attachment {
    return {
      id: apiAttachment.id,
      entityId: apiAttachment.ticketId,
      entityType: 'ticket',
      fileName: apiAttachment.filename,
      originalFileName: apiAttachment.filename,
      fileSize: apiAttachment.size,
      mimeType: apiAttachment.contentType,
      downloadUrl: '',
      uploadedByName: apiAttachment.uploadedByName,
      createdAt: new Date(apiAttachment.uploadedAt)
    };
  }

  onCommentAdded(request: CreateCommentRequest): void {
    const ticket = this.ticket();

    if (!ticket) {
      // Create mode: store in pending
      this.pendingComments.update(comments => [...comments, request.content]);
      return;
    }

    // Edit mode: send to server immediately
    this.ticketService.addComment(ticket.id, {
      content: request.content,
      isInternal: false
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadCommentsData();
        },
        error: (error) => {
          console.error('Failed to add comment:', error);
        }
      });
  }

  onFileUploaded(request: UploadAttachmentRequest): void {
    const ticket = this.ticket();

    if (!ticket) {
      // Create mode: store in pending
      this.pendingAttachments.update(files => [...files, request.file]);
      return;
    }

    // Edit mode: send to server immediately
    this.ticketService.uploadAttachment(ticket.id, request.file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadAttachmentsData();
        },
        error: (error) => {
          console.error('Failed to upload attachment:', error);
        }
      });
  }

  onFileDownloaded(attachment: Attachment): void {
    this.ticketService.getAttachmentDownloadUrl(attachment.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          window.open(response.url, '_blank');
        },
        error: (error) => {
          console.error('Failed to get download URL:', error);
        }
      });
  }
}
