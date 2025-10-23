import {
	Component,
	ChangeDetectionStrategy,
	signal,
	effect,
	inject,
	computed,
	HostListener,
	ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GlobalFlyoutService } from '../../services/global-flyout.service';
import { FabConfigService } from '../../services/fab-config.service';
import { FabButtonConfig, FabMenuItem } from '../../models';
import { IconComponent } from '../../../icon';

@Component({
	selector: 'app-global-fab',
	standalone: true,
	imports: [CommonModule, IconComponent],
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

	// Effects as field initializers
	private readonly serviceSyncEffect = effect(() => {
		this.isOpen.set(this.flyout.isOpen());
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
						console.error('Navigation failed:', err)
					);
				}
				break;
			case 'component':
				// Open flyout with specific component
				if (button.target) {
					this.flyout.open(button.target);
				}
				break;
			case 'callback':
				// Execute callback function - would need to be passed in config
				console.log('Callback action:', button.target);
				break;
			case 'external':
				// Open external URL
				if (button.target) {
					window.open(button.target, '_blank');
				}
				break;
			default:
				console.warn('Unknown action for button:', button.id);
		}
	}
}
