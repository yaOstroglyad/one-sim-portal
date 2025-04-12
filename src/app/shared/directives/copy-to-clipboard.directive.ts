import { Directive, HostListener, ElementRef, inject, Renderer2 } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Directive({
  selector: '[appCopyToClipboard]',
  standalone: true
})
export class CopyToClipboardDirective {
  private snackBar = inject(MatSnackBar);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

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
        this.snackBar.open('Text copied to clipboard', 'Close', {
          duration: 2000,
        });
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    }
  }
} 