import { Component, ChangeDetectionStrategy, input, signal, computed, inject, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { Ticket, TicketComment, TicketAttachment, TICKET_ALLOWED_MIME_TYPES, TICKET_MAX_FILE_SIZE } from '../../../models';
import { TicketService } from '../../../services';
import { TicketDetailsComponent } from '../ticket-details/ticket-details.component';
import { CommentsComponent, AttachmentsComponent, Comment, Attachment, CommentsConfiguration, AttachmentsConfiguration } from '@shared';

@Component({
    selector: 'app-ticket-details-wrapper',
    standalone: true,
    imports: [
        TranslateModule,
        TicketDetailsComponent,
        CommentsComponent,
        AttachmentsComponent
    ],
    template: `
    <div class="ticket-details-wrapper">
      <!-- Original ticket details -->
      <app-ticket-details [ticket]="ticket()"></app-ticket-details>

      <!-- Comments Section (read-only in details view) -->
      @if (ticket()) {
        <div class="comments-section">
          <div class="section-header">
            <h4>{{ 'tickets.comments' | translate }} ({{ commentsData().length }})</h4>
          </div>
          <app-comments
            [comments]="commentsData()"
            [config]="commentsConfig()"
            [loading]="commentsLoading()">
          </app-comments>
        </div>

        <!-- Attachments Section (download only in details view) -->
        <div class="attachments-section">
          <div class="section-header">
            <h4>{{ 'tickets.attachments' | translate }} ({{ attachmentsData().length }})</h4>
          </div>
          <app-attachments
            [attachments]="attachmentsData()"
            [config]="attachmentsConfig()"
            [loading]="attachmentsLoading()"
            (fileDownloaded)="onFileDownloaded($event)">
          </app-attachments>
        </div>
      }
    </div>
  `,
    styles: [`
    .ticket-details-wrapper {
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
export class TicketDetailsWrapperComponent {
  // Input
  ticket = input.required<Ticket>();

  // Services
  private ticketService = inject(TicketService);
  private destroyRef = inject(DestroyRef);

  // State signals
  commentsData = signal<Comment[]>([]);
  commentsLoading = signal(false);
  attachmentsData = signal<Attachment[]>([]);
  attachmentsLoading = signal(false);

  // Computed configurations (read-only mode for details view)
  commentsConfig = computed<CommentsConfiguration>(() => ({
    entityId: this.ticket().id,
    entityType: 'ticket',
    allowAddComments: false,
    placeholder: 'comments.placeholder',
    minLength: 3,
    maxLength: 1000
  }));

  attachmentsConfig = computed<AttachmentsConfiguration>(() => ({
    entityId: this.ticket().id,
    entityType: 'ticket',
    allowUpload: false,
    allowDownload: true,
    maxFileSize: TICKET_MAX_FILE_SIZE,
    allowedMimeTypes: TICKET_ALLOWED_MIME_TYPES,
    uploadHint: 'attachments.uploadHint'
  }));

  constructor() {
    // React to ticket input changes
    effect(() => {
      const ticket = this.ticket();
      if (ticket) {
        this.loadCommentsData();
        this.loadAttachmentsData();
      }
    });
  }

  private loadCommentsData(): void {
    this.commentsLoading.set(true);

    this.ticketService.getComments(this.ticket().id)
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
    this.attachmentsLoading.set(true);

    this.ticketService.getAttachments(this.ticket().id)
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
