import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { isToggleActive, isToggleActive$ } from '../services/feature-toggle';

/**
 * Structural directive for conditionally displaying elements based on feature toggles
 *
 * @example
 * <div *featureToggle="'new-ui'">This content is only shown when new-ui toggle is active</div>
 * <button *featureToggle="'bulk-operations'">Bulk Delete</button>
 */
@Directive({
  selector: '[featureToggle]',
  standalone: true
})
export class FeatureToggleDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() featureToggle: string;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit() {
    if (!this.featureToggle) {
      console.warn('featureToggle directive used without toggle key');
      return;
    }

    // Initial check
    this.updateView(isToggleActive(this.featureToggle));

    // Subscribe to changes
    isToggleActive$(this.featureToggle)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isActive => this.updateView(isActive));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(show: boolean) {
    this.viewContainer.clear();
    if (show) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
