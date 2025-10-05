import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonDirective, FormControlDirective, AvatarComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { Comment, CommentsConfiguration, CreateCommentRequest } from '../../models';

@Component({
    selector: 'app-comments',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        ButtonDirective,
        AvatarComponent,
        IconDirective
    ],
    templateUrl: './comments.component.html',
    styleUrls: ['./comments.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsComponent implements OnInit {
  @Input() comments: Comment[] = [];
  @Input() config: CommentsConfiguration;
  @Input() loading: boolean = false;
  
  @Output() commentAdded = new EventEmitter<CreateCommentRequest>();

  commentForm: FormGroup;
  isSubmitting = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const minLength = this.config?.minLength || 3;
    const maxLength = this.config?.maxLength || 1000;
    
    this.commentForm = new FormGroup({
      content: new FormControl('', [
        Validators.required, 
        Validators.minLength(minLength),
        Validators.maxLength(maxLength)
      ])
    });
  }

  onSubmitComment(): void {
    if (this.commentForm.valid && !this.isSubmitting && this.config.allowAddComments) {
      this.isSubmitting = true;
      
      const content = this.commentForm.get('content')?.value;
      const request: CreateCommentRequest = {
        entityId: this.config.entityId,
        entityType: this.config.entityType,
        content: content.trim()
      };

      this.commentAdded.emit(request);
      
      // Reset form after emission
      setTimeout(() => {
        this.commentForm.reset();
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }, 100);
    }
  }

  getAuthorInitials(authorName: string): string {
    return authorName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.id;
  }

  get placeholder(): string {
    return this.config?.placeholder || 'comments.placeholder';
  }
}

