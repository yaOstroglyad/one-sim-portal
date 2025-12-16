import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed
} from '@angular/core';
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
  imports: [],
  templateUrl: './chart-legend.component.html',
  styleUrls: ['./chart-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartLegendComponent {
  /** Legend items to display */
  items = input.required<ChartLegendItem[]>();

  /** Maximum height before scrolling (in pixels) */
  maxHeight = input<number>(100);

  /** Emits when a legend item is clicked (for toggling visibility) */
  itemClick = output<{ index: number; item: ChartLegendItem }>();

  /** Check if scroll is needed */
  needsScroll = computed(() => {
    const itemCount = this.items().length;
    // Approximate: each row ~28px, 3 items per row
    const estimatedHeight = Math.ceil(itemCount / 3) * 28;
    return estimatedHeight > this.maxHeight();
  });

  onItemClick(index: number, item: ChartLegendItem): void {
    this.itemClick.emit({ index, item });
  }
}
