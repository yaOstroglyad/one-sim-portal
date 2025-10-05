import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { Ticket } from '../../../models';
import { TicketDetailsComponent } from '../ticket-details/ticket-details.component';
import { CommentsComponent, AttachmentsComponent, Comment, Attachment, CommentsConfiguration, AttachmentsConfiguration, CreateCommentRequest, UploadAttachmentRequest } from '../../../../../shared';

@Component({
    selector: 'app-ticket-details-wrapper',
    imports: [
        CommonModule,
        TranslateModule,
        TicketDetailsComponent,
        CommentsComponent,
        AttachmentsComponent
    ],
    template: `
    <div class="ticket-details-wrapper">
      <!-- Original ticket details -->
      <app-ticket-details [ticket]="ticket"></app-ticket-details>
      
      <!-- Comments Section -->
      <div class="comments-section" *ngIf="ticket">
        <div class="section-header">
          <h4>{{ 'tickets.comments' | translate }} ({{ commentsData.length }})</h4>
        </div>
        <app-comments 
          [comments]="commentsData"
          [config]="commentsConfig"
          [loading]="commentsLoading"
          (commentAdded)="onCommentAdded($event)">
        </app-comments>
      </div>

      <!-- Attachments Section -->
      <div class="attachments-section" *ngIf="ticket">
        <div class="section-header">
          <h4>{{ 'tickets.attachments' | translate }} ({{ attachmentsData.length }})</h4>
        </div>
        <app-attachments
          [attachments]="attachmentsData"
          [config]="attachmentsConfig"
          [loading]="attachmentsLoading"
          (fileUploaded)="onFileUploaded($event)"
          (fileDownloaded)="onFileDownloaded($event)">
        </app-attachments>
      </div>
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
export class TicketDetailsWrapperComponent implements OnInit {
  @Input() ticket: Ticket;

  // Comments data
  commentsData: Comment[] = [];
  commentsConfig: CommentsConfiguration;
  commentsLoading = false;

  // Attachments data
  attachmentsData: Attachment[] = [];
  attachmentsConfig: AttachmentsConfiguration;
  attachmentsLoading = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.ticket) {
      this.initializeConfigurations();
      this.loadCommentsData();
      this.loadAttachmentsData();
    }
  }

  private initializeConfigurations(): void {
    // Comments configuration
    this.commentsConfig = {
      entityId: this.ticket.id,
      entityType: 'ticket',
      allowAddComments: true,
      placeholder: 'comments.placeholder',
      minLength: 3,
      maxLength: 1000
    };

    // Attachments configuration
    this.attachmentsConfig = {
      entityId: this.ticket.id,
      entityType: 'ticket',
      allowUpload: true,
      allowDownload: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/gif'
      ],
      uploadHint: 'attachments.uploadHint'
    };
  }

  private loadCommentsData(): void {
    this.commentsLoading = true;
    
    // Mock comments data - in real app this would come from a service
    setTimeout(() => {
      this.commentsData = [
        {
          id: 'comment-1',
          entityId: this.ticket.id,
          entityType: 'ticket',
          content: 'I have checked the authentication logs and found that the issue occurs during peak hours when the authentication server is under heavy load.',
          authorName: 'Sarah Wilson',
          authorAvatar: null,
          createdAt: new Date('2024-01-15T13:45:00'),
          updatedAt: new Date('2024-01-15T13:45:00')
        },
        {
          id: 'comment-2',
          entityId: this.ticket.id,
          entityType: 'ticket',
          content: 'We are working on implementing a load balancer to distribute the authentication requests. This should resolve the intermittent login failures.',
          authorName: 'John Doe',
          authorAvatar: null,
          createdAt: new Date('2024-01-15T14:30:00'),
          updatedAt: new Date('2024-01-15T14:30:00')
        },
        {
          id: 'comment-3',
          entityId: this.ticket.id,
          entityType: 'ticket',
          content: 'The load balancer has been deployed to production. Can you please test the login functionality and confirm if the issue is resolved?',
          authorName: 'Sarah Wilson',
          authorAvatar: null,
          createdAt: new Date('2024-01-15T16:15:00'),
          updatedAt: new Date('2024-01-15T16:15:00')
        }
      ];
      
      this.commentsLoading = false;
      this.cdr.markForCheck();
    }, 500);
  }

  private loadAttachmentsData(): void {
    this.attachmentsLoading = true;
    
    // Mock attachments data - in real app this would come from a service
    setTimeout(() => {
      this.attachmentsData = [
        {
          id: 'attachment-1',
          entityId: this.ticket.id,
          entityType: 'ticket',
          fileName: 'error_screenshot.png',
          originalFileName: 'Login Error Screenshot.png',
          fileSize: 245760, // 240 KB
          mimeType: 'image/png',
          downloadUrl: '/api/v1/attachments/attachment-1/download',
          uploadedByName: 'John Doe',
          createdAt: new Date('2024-01-15T12:30:00')
        },
        {
          id: 'attachment-2',
          entityId: this.ticket.id,
          entityType: 'ticket',
          fileName: 'auth_logs.txt',
          originalFileName: 'Authentication Logs.txt',
          fileSize: 12800, // 12.5 KB
          mimeType: 'text/plain',
          downloadUrl: '/api/v1/attachments/attachment-2/download',
          uploadedByName: 'Sarah Wilson',
          createdAt: new Date('2024-01-15T13:45:00')
        }
      ];
      
      this.attachmentsLoading = false;
      this.cdr.markForCheck();
    }, 300);
  }

  onCommentAdded(request: CreateCommentRequest): void {
    console.log('Adding comment:', request);
    
    // Simulate API call
    setTimeout(() => {
      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        entityId: request.entityId,
        entityType: request.entityType,
        content: request.content,
        authorName: 'Current User', // In real app, get from auth service
        authorAvatar: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.commentsData = [...this.commentsData, newComment];
      this.cdr.markForCheck();
    }, 500);
  }

  onFileUploaded(request: UploadAttachmentRequest): void {
    console.log('Uploading file:', request);
    
    // Simulate API call
    setTimeout(() => {
      const newAttachment: Attachment = {
        id: `attachment-${Date.now()}`,
        entityId: request.entityId,
        entityType: request.entityType,
        fileName: request.file.name.toLowerCase().replace(/\s+/g, '_'),
        originalFileName: request.file.name,
        fileSize: request.file.size,
        mimeType: request.file.type,
        downloadUrl: `/api/v1/attachments/attachment-${Date.now()}/download`,
        uploadedByName: 'Current User', // In real app, get from auth service
        createdAt: new Date()
      };

      this.attachmentsData = [...this.attachmentsData, newAttachment];
      this.cdr.markForCheck();
    }, 1000);
  }

  onFileDownloaded(attachment: Attachment): void {
    console.log('Downloading attachment:', attachment.originalFileName);
    
    // In real app, this would trigger file download
    const link = document.createElement('a');
    link.href = attachment.downloadUrl;
    link.download = attachment.originalFileName;
    link.click();
  }
}