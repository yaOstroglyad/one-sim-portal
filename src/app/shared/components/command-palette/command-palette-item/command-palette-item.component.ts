import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconDirective } from '@coreui/icons-angular';
import { TranslatePipe } from '@ngx-translate/core';

import { SearchResult, MATCH_SOURCES, RESULT_SOURCES } from '../../../models/search';

@Component({
  standalone: true,
  selector: 'os-command-palette-item',
  imports: [IconDirective, TranslatePipe],
  templateUrl: './command-palette-item.component.html',
  styleUrl: './command-palette-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.selected]': 'isSelected()',
    '[class.backend]': 'isBackendResult()',
    '[attr.role]': '"option"',
    '[attr.aria-selected]': 'isSelected()',
    '(click)': 'onSelect()',
  },
})
export class CommandPaletteItemComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly item = input.required<SearchResult>();
  readonly isSelected = input(false);
  readonly query = input('');

  readonly select = output<SearchResult>();

  protected readonly MATCH_SOURCES = MATCH_SOURCES;

  protected isBackendResult(): boolean {
    return this.item().source === RESULT_SOURCES.BACKEND;
  }

  protected getDisplayLabel(): string {
    const result = this.item();
    if (result.parentLabel && result.fragment) {
      return `${result.parentLabel} > ${result.label}`;
    }
    return result.label;
  }

  protected getHighlightedLabel(): SafeHtml {
    const result = this.item();
    const label = this.getDisplayLabel();
    const ranges = result.highlightRanges;

    if (!ranges || ranges.length === 0 || result.matchedOn !== MATCH_SOURCES.LABEL) {
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(label));
    }

    return this.sanitizer.bypassSecurityTrustHtml(this.applyHighlights(label, ranges));
  }

  protected getHighlightedUrl(): SafeHtml {
    const result = this.item();
    const url = result.fragment ? `${result.url}#${result.fragment}` : result.url;

    if (result.matchedOn !== MATCH_SOURCES.URL || !result.highlightRanges) {
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(url));
    }

    return this.sanitizer.bypassSecurityTrustHtml(this.applyHighlights(url, result.highlightRanges));
  }

  protected onSelect(): void {
    this.select.emit(this.item());
  }

  private applyHighlights(text: string, ranges: Array<[number, number]>): string {
    if (ranges.length === 0) {
      return this.escapeHtml(text);
    }

    // Sort ranges by start position
    const sortedRanges = [...ranges].sort((a, b) => a[0] - b[0]);

    let result = '';
    let lastIndex = 0;

    for (const [start, end] of sortedRanges) {
      // Add text before highlight
      if (start > lastIndex) {
        result += this.escapeHtml(text.slice(lastIndex, start));
      }

      // Add highlighted text
      result += `<strong>${this.escapeHtml(text.slice(start, end))}</strong>`;
      lastIndex = end;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      result += this.escapeHtml(text.slice(lastIndex));
    }

    return result;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
