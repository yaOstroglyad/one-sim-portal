import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';

export interface DeleteConfirmationConfig {
  title?: string;
  itemName: string;
  itemType?: string;
  message?: string;
  warningMessage?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonClass?: string;
}

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [CommonModule, IconDirective],
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.scss']
})
export class DeleteConfirmationComponent {
  @Input() config: DeleteConfirmationConfig = {
    itemName: ''
  };
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get title(): string {
    return this.config.title || `Delete ${this.config.itemType || 'Item'}`;
  }

  get message(): string {
    if (this.config.message) {
      return this.config.message;
    }
    
    const itemType = this.config.itemType || 'item';
    return `Are you sure you want to delete the ${itemType.toLowerCase()} "${this.config.itemName}"?`;
  }

  get warningMessage(): string {
    return this.config.warningMessage || 'This action cannot be undone.';
  }

  get confirmButtonText(): string {
    return this.config.confirmButtonText || `Delete ${this.config.itemType || 'Item'}`;
  }

  get cancelButtonText(): string {
    return this.config.cancelButtonText || 'Cancel';
  }

  get confirmButtonClass(): string {
    return this.config.confirmButtonClass || 'btn-danger';
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}