import { Component, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

import { DocsDataService } from '../../services';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

/**
 * Redirect component for /docs root path
 * Waits for documents to load and redirects to the first one
 */
@Component({
  selector: 'os-docs-default-redirect',
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    @if (showEmpty) {
      <div class="docs-redirect-empty">
        <app-empty-state
          title="No Documentation"
          message="Documentation is not available at this time.">
        </app-empty-state>
      </div>
    }
  `,
  styles: [`
    .docs-redirect-empty {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      padding: 2rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsDefaultRedirectComponent {
  private readonly router = inject(Router);
  private readonly docsDataService = inject(DocsDataService);

  showEmpty = false;

  constructor() {
    effect(() => {
      const isLoading = this.docsDataService.isLoading();
      const error = this.docsDataService.error();
      const firstDoc = this.docsDataService.getFirstDocument();

      // Wait for loading to complete
      if (isLoading) return;

      // If error or no documents, show empty state
      if (error || !firstDoc) {
        this.showEmpty = true;
        return;
      }

      // Redirect to first document
      this.router.navigate(['/docs', firstDoc.id], { replaceUrl: true });
    });
  }
}
