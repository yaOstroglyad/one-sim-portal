import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export interface ChartLegendItem {
  label: string;
  color: string;
  value?: number;
  hidden?: boolean;
}

/**
 * Custom scrollable chart legend component
 * Provides a better UX for charts with many data series
 */
@Component({
  standalone: true,
  selector: 'app-chart-legend',
  imports: [TranslateModule],
  templateUrl: './chart-legend.component.html',
  styleUrls: ['./chart-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartLegendComponent {
  /** Legend items to display */
  items = input.required<ChartLegendItem[]>();

  /** Maximum height before scrolling (in pixels) */
  maxHeight = input<number>(100);

  /** Whether to show control buttons (Show All / Hide All) */
  showControls = input<boolean>(true);

  /** Number of top items to show when "Top N" is clicked */
  topN = input<number>(3);

  /** Emits when a legend item is clicked (for toggling visibility) */
  itemClick = output<{ index: number; item: ChartLegendItem }>();

  /** Emits when "Show All" is clicked */
  showAll = output<void>();

  /** Emits when "Hide All" is clicked */
  hideAll = output<void>();

  /** Emits when "Top N" is clicked */
  showTopN = output<void>();

  /** Total items count */
  totalCount = computed(() => this.items().length);

  /** Count of visible items */
  visibleCount = computed(() => {
    return this.items().filter(item => !item.hidden).length;
  });

  /** Whether all items are visible */
  allVisible = computed(() => this.visibleCount() === this.totalCount());

  /** Whether all items are hidden */
  allHidden = computed(() => this.visibleCount() === 0);

  onItemClick(index: number, item: ChartLegendItem): void {
    this.itemClick.emit({ index, item });
  }

  onShowAll(): void {
    this.showAll.emit();
  }

  onHideAll(): void {
    this.hideAll.emit();
  }

  onShowTopN(): void {
    this.showTopN.emit();
  }
}
