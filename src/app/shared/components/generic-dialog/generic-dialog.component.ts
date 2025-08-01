import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './generic-dialog.component.html',
  styleUrls: ['./generic-dialog.component.scss']
})
export class GenericDialogComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() isOpen: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() hasActions: boolean = true;
  
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: Event): void {
    this.onClose();
  }
}