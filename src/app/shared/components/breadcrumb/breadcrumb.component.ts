import { Component, inject, OnInit, OnDestroy, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { LanguageService } from '../../services/ui';

interface Breadcrumb {
  readonly label: string;
  readonly url: string;
}

@Component({
    standalone: true,
    selector: 'app-breadcrumb',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    imports: [
        CommonModule,
        RouterLink,
        TranslateModule
    ]
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);
  private readonly unsubscribe$ = new Subject<void>();

  // Signals
  readonly breadcrumbs = signal<Breadcrumb[]>([]);

  readonly breadcrumbClasses = computed(() => ({
    'os-breadcrumb--rtl': this.languageService.isRtl()
  }));

  ngOnInit(): void {
    // Initialize breadcrumbs
    this.updateBreadcrumbs();

    // Listen for route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private updateBreadcrumbs(): void {
    const breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
    this.breadcrumbs.set(breadcrumbs);
  }

  private createBreadcrumbs(route: ActivatedRoute,
                            url: string = '',
                            breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    // Get the primary outlet child
    let child = route.firstChild;

    // If no child, return current breadcrumbs
    if (!child) {
      return breadcrumbs;
    }

    // Process all route segments
    while (child) {
      // Build URL path
      if (child.snapshot.url.length > 0) {
        const pathSegment = child.snapshot.url.map(segment => segment.path).join('/');
        url += `/${pathSegment}`;
      }

      // Check for title in route data
      const title = child.snapshot.data['title'];
      if (title) {
        const breadcrumb = {
          label: title,
          url: url || '/'
        };
        breadcrumbs.push(breadcrumb);
      }

      // Move to next child
      child = child.firstChild;
    }

    return breadcrumbs;
  }
}
