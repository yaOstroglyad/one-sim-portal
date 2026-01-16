import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';

import { LayoutService } from '../../../containers/default-layout/services';
import { LanguageService } from '../../services/ui';
import { HeaderSearchComponent } from '../command-palette/header-search/header-search.component';

/**
 * Simplified header component for public pages (no auth required)
 * Used on /docs and other public routes
 *
 * Features:
 * - Search bar (Cmd+K)
 * - Theme toggle
 * - Mobile menu toggle
 *
 * Does NOT include:
 * - User menu
 * - Account selector
 * - Notifications
 */
@Component({
  standalone: true,
  selector: 'os-public-header',
  imports: [
    NgClass,
    RouterModule,
    IconDirective,
    HeaderSearchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.scss'
})
export class PublicHeaderComponent {
  private readonly layoutService = inject(LayoutService);
  private readonly languageService = inject(LanguageService);

  // Convert observable to signal
  private readonly layoutConfig = toSignal(this.layoutService.getLayoutConfig(), {
    initialValue: { sidebarCollapsed: false, darkTheme: false, rtlDirection: false }
  });

  // Computed values
  readonly isDarkTheme = computed(() => this.layoutConfig().darkTheme);

  readonly headerClasses = computed(() => ({
    'header--rtl': this.languageService.isRtl()
  }));

  toggleMobileSidebar(): void {
    this.layoutService.toggleMobileSidebar();
  }

  toggleTheme(): void {
    this.layoutService.toggleTheme();
  }
}
