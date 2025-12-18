import { Directive, HostListener, ElementRef, inject, Renderer2 } from '@angular/core';
import { NotificationService } from '@shared/services/ui/notification.service';

@Directive({
  standalone: true,
  selector: '[copyToClipboard]',
})
export class CopyToClipboardDirective {
  private readonly notification = inject(NotificationService);
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  constructor() {
    this.renderer.listen(this.el.nativeElement, 'mouseenter', () => {
      this.renderer.setStyle(this.el.nativeElement, 'color', 'blue');
      this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
    });
    this.renderer.listen(this.el.nativeElement, 'mouseleave', () => {
      this.renderer.removeStyle(this.el.nativeElement, 'color');
      this.renderer.removeStyle(this.el.nativeElement, 'cursor');
    });
  }

  @HostListener('click')
  onClick() {
    const text = this.el.nativeElement.innerText;
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        this.notification.success('notifications.copiedToClipboard');
      }).catch(err => {
        console.error('Could not copy text: ', err);
        this.notification.error('errors.copyFailed');
      });
    }
  }
} 
