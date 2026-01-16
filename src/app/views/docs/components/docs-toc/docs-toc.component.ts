import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { TocSection } from '../../models';

@Component({
  standalone: true,
  selector: 'os-docs-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './docs-toc.component.html',
  styleUrl: './docs-toc.component.scss',
})
export class DocsTocComponent {
  readonly sections = input.required<TocSection[]>();
  readonly activeSection = input<string | null>(null);
  readonly sectionClick = output<string>();

  onSectionClick(sectionId: string, event: Event): void {
    event.preventDefault();
    this.sectionClick.emit(sectionId);
  }
}
