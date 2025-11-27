import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { IconComponent } from '@shared/components/icon/icon.component';

export interface RefundsData {
  totalRevenue: number;
  totalCost: number;
  totalMargin: number;
  totalCount: number;
}

@Component({
  standalone: true,
  selector: 'app-refunds-summary',
  imports: [
    CommonModule,
    TranslateModule,
    IconComponent
  ],
  templateUrl: './refunds-summary.component.html',
  styleUrls: ['./refunds-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefundsSummaryComponent {
  // Inputs
  readonly refunds = input<RefundsData | undefined>();
  readonly currency = input<string>('EUR');

  // UI state
  readonly expanded = signal(false);

  // Computed
  readonly hasRefunds = computed(() => {
    const data = this.refunds();
    return data && data.totalCount > 0;
  });

  toggle(): void {
    if (this.hasRefunds()) {
      this.expanded.update(v => !v);
    }
  }
}
