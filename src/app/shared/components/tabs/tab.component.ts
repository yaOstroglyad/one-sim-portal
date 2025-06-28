import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'os-tab',
  standalone: true,
  template: `
    <ng-template #content>
      <ng-content></ng-content>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent {
  @Input() id?: string;
  @Input() label!: string;
  @Input() disabled = false;
  @Input() badge?: string | number;
  @Input() icon?: string;
  @Input() closable = false;
  @Input() tooltip?: string;
  @Input() disabledReason?: string;

  @ViewChild('content', { static: true }) content!: TemplateRef<any>;
}