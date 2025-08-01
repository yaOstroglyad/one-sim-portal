import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';

export interface PanelAction {
  id: string;
  icon: string;
  label: string;
  disabled?: boolean;
  handler: () => void;
}

@Component({
  selector: 'app-generic-right-panel',
  standalone: true,
  imports: [CommonModule, IconDirective],
  templateUrl: './generic-right-panel.component.html',
  styleUrls: ['./generic-right-panel.component.scss']
})
export class GenericRightPanelComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() isOpen: boolean = false;
  @Input() actions: PanelAction[] = [];
  @Input() hasFooter: boolean = false;
  @Input() resizable: boolean = true;
  @Input() minWidth: number = 400;
  @Input() maxWidth: number = 800;
  @Input() defaultWidth: number = 500;
  @Input() showOverlay: boolean = true;
  @Input() topOffset: number = 64; // Default header height

  @Output() close = new EventEmitter<void>();
  @Output() widthChange = new EventEmitter<number>();

  @ViewChild('panel', { static: false }) panelRef!: ElementRef<HTMLDivElement>;
  @ViewChild('resizeHandle', { static: false }) resizeHandleRef!: ElementRef<HTMLDivElement>;

  currentWidth: number = 500;
  isResizing: boolean = false;
  isExpanded: boolean = false;

  private resizeStartX: number = 0;
  private resizeStartWidth: number = 0;
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);

  ngOnInit(): void {
    this.currentWidth = this.defaultWidth;
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngAfterViewInit(): void {
    if (this.panelRef) {
      this.panelRef.nativeElement.style.width = `${this.currentWidth}px`;
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    this.removeResizeListeners();
  }

  get defaultActions(): PanelAction[] {
    const defaults: PanelAction[] = [
      {
        id: 'expand',
        icon: this.isExpanded ? 'cilArrowRight' : 'cilArrowLeft',
        label: this.isExpanded ? 'Collapse' : 'Expand',
        handler: () => this.toggleExpand()
      },
      {
        id: 'close',
        icon: 'cilX',
        label: 'Close',
        handler: () => this.onClose()
      }
    ];

    return defaults;
  }

  get allActions(): PanelAction[] {
    return [...this.actions, ...this.defaultActions];
  }

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: Event): void {
    if (this.showOverlay) {
      this.onClose();
    }
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;

    if (this.isExpanded) {
      this.currentWidth = this.maxWidth;
    } else {
      this.currentWidth = this.defaultWidth;
    }

    this.updatePanelWidth();
  }

  onResizeStart(event: MouseEvent): void {
    if (!this.resizable) return;

    event.preventDefault();
    this.isResizing = true;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = this.currentWidth;

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isResizing) return;

    const deltaX = this.resizeStartX - event.clientX;
    const newWidth = Math.max(
      this.minWidth,
      Math.min(this.maxWidth, this.resizeStartWidth + deltaX)
    );

    this.currentWidth = newWidth;
    this.updatePanelWidth();
  }

  private onMouseUp(): void {
    if (!this.isResizing) return;

    this.isResizing = false;
    this.removeResizeListeners();
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    this.widthChange.emit(this.currentWidth);
  }

  private removeResizeListeners(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  private updatePanelWidth(): void {
    if (this.panelRef) {
      this.panelRef.nativeElement.style.width = `${this.currentWidth}px`;
    }
  }
}
