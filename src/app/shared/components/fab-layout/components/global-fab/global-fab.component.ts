import {
	Component,
	ChangeDetectionStrategy,
	signal,
	inject,
	computed,
	HostListener,
	ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalFlyoutService } from '../../services/global-flyout.service';
import { FabConfigService } from '../../services/fab-config.service';
import { FabButtonConfig, FabMenuItem } from '../../models';
import { IconComponent } from '../../../icon';

@Component({
	selector: 'app-global-fab',
	standalone: true,
	imports: [CommonModule, TranslateModule, IconComponent],
	templateUrl: './global-fab.component.html',
	styleUrls: ['./global-fab.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalFabComponent {
	private readonly flyout = inject(GlobalFlyoutService);
	private readonly fabConfig = inject(FabConfigService);
	private readonly elementRef = inject(ElementRef);
	private readonly router = inject(Router);

	readonly isOpen = signal(false);

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

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		// Check if click was outside the component
		if (!this.elementRef.nativeElement.contains(event.target) && this.isMenuOpen()) {
			this.fabConfig.closeMenu();
		}
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
