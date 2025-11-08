import {
	Component,
	ChangeDetectionStrategy,
	signal,
	inject,
	computed,
	HostListener,
	ElementRef,
	OnInit,
	OnDestroy,
	effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalFlyoutService, FabConfigService } from '@shared/components/fab-layout';
import { FabButtonConfig, FabMenuItem } from '../../models';
import { IconComponent } from '@shared';

@Component({
	selector: 'app-global-fab',
	standalone: true,
	imports: [CommonModule, TranslateModule, IconComponent],
	templateUrl: './global-fab.component.html',
	styleUrls: ['./global-fab.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalFabComponent implements OnInit, OnDestroy {
	private readonly flyout = inject(GlobalFlyoutService);
	private readonly fabConfig = inject(FabConfigService);
	private readonly elementRef = inject(ElementRef);
	private readonly router = inject(Router);

	readonly isOpen = signal(false);

	// Auto-hide state
	readonly isVisible = signal(false);
	private mouseLeaveTimeout?: number;
	private showTimeout?: number;
	private readonly EDGE_THRESHOLD = 50; // pixels from bottom edge to trigger show
	private readonly HIDE_THRESHOLD = 50; // pixels from bottom edge to trigger hide
	private readonly SHOW_DELAY = 400; // ms delay before showing (to avoid accidental triggers)
	private readonly HIDE_DELAY = 800; // ms delay before hiding (smooth miss hovers)

	// Computed values from FabConfigService
	readonly configuration = this.fabConfig.configuration;
	readonly fabState = this.fabConfig.state;
	readonly isMenuOpen = this.fabConfig.isMenuOpen;
	readonly activeButton = this.fabConfig.activeButton;

	// Computed menu items for active button
	readonly activeMenuItems = computed(() => {
		const active = this.activeButton();
		return active?.menuItems?.sort((a, b) => a.order - b.order) || [];
	});

	// Check if there are any buttons to display
	// If all buttons filtered out by permissions, FAB should be hidden
	readonly hasButtons = computed(() => {
		const config = this.configuration();
		return config?.buttons && config.buttons.length > 0;
	});

	ngOnInit(): void {
		// Initially show FAB briefly, then hide
		this.isVisible.set(true);
		setTimeout(() => {
			if (!this.isMenuOpen()) {
				this.isVisible.set(false);
			}
		}, 3000);
	}

	ngOnDestroy(): void {
		if (this.mouseLeaveTimeout) {
			clearTimeout(this.mouseLeaveTimeout);
		}
		if (this.showTimeout) {
			clearTimeout(this.showTimeout);
		}
	}

	@HostListener('document:mousemove', ['$event'])
	onMouseMove(event: MouseEvent): void {
		const windowHeight = window.innerHeight;
		const distanceFromBottomEdge = windowHeight - event.clientY;

		// Show FAB when mouse is near bottom edge (with delay)
		if (distanceFromBottomEdge <= this.EDGE_THRESHOLD) {
			this.scheduleFabShow();
		}
		// Hide FAB when mouse moves away from bottom edge
		else if (distanceFromBottomEdge > this.HIDE_THRESHOLD && !this.isMenuOpen()) {
			this.cancelFabShow();
			this.scheduleFabHide();
		}
	}

	@HostListener('mouseenter')
	onMouseEnter(): void {
		// Keep FAB visible when hovering
		if (this.mouseLeaveTimeout) {
			clearTimeout(this.mouseLeaveTimeout);
			this.mouseLeaveTimeout = undefined;
		}
		this.showFab();
	}

	@HostListener('mouseleave')
	onMouseLeave(): void {
		// Hide FAB after delay when mouse leaves
		// But keep visible if menu is open
		if (!this.isMenuOpen()) {
			this.scheduleFabHide();
		}
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		// Check if click was outside the component
		if (!this.elementRef.nativeElement.contains(event.target) && this.isMenuOpen()) {
			this.fabConfig.closeMenu();
			// Hide FAB after menu closes
			this.scheduleFabHide();
		}
	}

	private scheduleFabShow(): void {
		// Cancel hide timeout if scheduled
		if (this.mouseLeaveTimeout) {
			clearTimeout(this.mouseLeaveTimeout);
			this.mouseLeaveTimeout = undefined;
		}

		// If already scheduled or visible, don't reschedule
		if (this.showTimeout || this.isVisible()) {
			return;
		}

		// Schedule show with delay
		this.showTimeout = window.setTimeout(() => {
			this.isVisible.set(true);
			this.showTimeout = undefined;
		}, this.SHOW_DELAY);
	}

	private cancelFabShow(): void {
		if (this.showTimeout) {
			clearTimeout(this.showTimeout);
			this.showTimeout = undefined;
		}
	}

	private showFab(): void {
		this.cancelFabShow();
		if (this.mouseLeaveTimeout) {
			clearTimeout(this.mouseLeaveTimeout);
			this.mouseLeaveTimeout = undefined;
		}
		this.isVisible.set(true);
	}

	private scheduleFabHide(): void {
		if (this.mouseLeaveTimeout) {
			clearTimeout(this.mouseLeaveTimeout);
		}
		this.mouseLeaveTimeout = window.setTimeout(() => {
			if (!this.isMenuOpen()) {
				this.isVisible.set(false);
			}
		}, this.HIDE_DELAY);
	}

	onButtonClick(button: FabButtonConfig): void {
		if (button.hasMenu && button.menuItems?.length) {
			this.fabConfig.toggleMenu(button.id);
		} else {
			this.executeButtonAction(button);
		}
	}

	onMenuItemClick(menuItem: FabMenuItem): void {
		this.fabConfig.executeMenuAction(menuItem);
	}

	private executeButtonAction(button: FabButtonConfig): void {
		switch (button.action) {
			case 'route':
				// Navigate to route
				if (button.target) {
					this.router.navigate([button.target]).catch(err =>
						console.error('[GlobalFAB] Navigation failed:', err)
					);
				}
				break;
			case 'component':
				// Open flyout with specific component
				if (button.target) {
					this.flyout.open({
						featureKey: button.target,
						title: button.title
					});
				}
				break;
			case 'callback':
				// Execute callback function - would need to be passed in config
				break;
			case 'external':
				// Open external URL
				if (button.target) {
					window.open(button.target, '_blank');
				}
				break;
			default:
				console.warn('[GlobalFAB] Unknown action for button:', button.id);
		}
	}
}
