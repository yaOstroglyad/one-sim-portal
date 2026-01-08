import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Location } from '@angular/common';
import { ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'os-back-button',
  standalone: true,
  imports: [ButtonDirective, IconDirective],
  template: `
    <button cButton color="light" variant="ghost" (click)="goBack()">
      <svg cIcon name="cilArrowLeft" size="lg"></svg>
    </button>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackButtonComponent {
  private readonly location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
