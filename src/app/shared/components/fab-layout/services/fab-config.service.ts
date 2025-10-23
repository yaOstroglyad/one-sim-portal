import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, delay } from 'rxjs';
import { FabConfiguration, FabButtonConfig, FabMenuItem, FabState } from '../models/fab-layout.model';
import { GlobalFlyoutService } from './global-flyout.service';

@Injectable({
  providedIn: 'root'
})
export class FabConfigService {
  private readonly router = inject(Router);
  private readonly flyout = inject(GlobalFlyoutService);
  
  private readonly _state = signal<FabState>({
    activeButtonId: null,
    isMenuOpen: false,
    openMenuButtonId: null
  });

  private readonly _configuration = signal<FabConfiguration | null>(null);

  // Public readonly signals
  readonly state = this._state.asReadonly();
  readonly configuration = this._configuration.asReadonly();
  readonly isMenuOpen = computed(() => this._state().isMenuOpen);
  readonly activeButton = computed(() => {
    const config = this._configuration();
    const activeId = this._state().activeButtonId;
    return config?.buttons.find(btn => btn.id === activeId) || null;
  });

  constructor() {
    // Auto-load configuration on service initialization
    this.loadConfiguration().subscribe(config => {
      this._configuration.set(config);
    });
  }

  /**
   * Mock API call to load FAB configuration
   * In real implementation, this would call backend API
   */
  loadConfiguration(): Observable<FabConfiguration> {
    const mockConfig: FabConfiguration = {
      position: 'center',
      theme: 'light',
      buttons: [
        {
          id: 'support-chat',
          label: 'Чаты',
          icon: 'chat',
          order: 1,
          roles: ['admin', 'support', 'customer'],
          hasMenu: false,
          action: 'component',
          target: 'SupportChatShellComponent'
        }
      ]
    };

    // Simulate API delay
    return of(mockConfig).pipe(delay(100));
  }

  /**
   * Update FAB configuration dynamically
   * This method can be called when navigating to different sections
   */
  updateConfiguration(newConfig: Partial<FabConfiguration>): void {
    const current = this._configuration();
    if (current) {
      this._configuration.set({ ...current, ...newConfig });
    }
  }

  /**
   * Add buttons to existing configuration
   * Useful for adding context-specific buttons
   */
  addButtons(buttons: FabButtonConfig[]): void {
    const current = this._configuration();
    if (current) {
      const updatedButtons = [...current.buttons, ...buttons]
        .sort((a, b) => a.order - b.order);
      
      this._configuration.set({
        ...current,
        buttons: updatedButtons
      });
    }
  }

  /**
   * Remove buttons by IDs
   */
  removeButtons(buttonIds: string[]): void {
    const current = this._configuration();
    if (current) {
      const filteredButtons = current.buttons.filter(
        btn => !buttonIds.includes(btn.id)
      );
      
      this._configuration.set({
        ...current,
        buttons: filteredButtons
      });
    }
  }

  /**
   * Toggle menu for specific button
   */
  toggleMenu(buttonId: string): void {
    const currentState = this._state();
    const isCurrentlyOpen = currentState.isMenuOpen && currentState.openMenuButtonId === buttonId;
    
    this._state.set({
      activeButtonId: isCurrentlyOpen ? null : buttonId,
      isMenuOpen: !isCurrentlyOpen,
      openMenuButtonId: isCurrentlyOpen ? null : buttonId
    });
  }

  /**
   * Close any open menu
   */
  closeMenu(): void {
    this._state.set({
      activeButtonId: null,
      isMenuOpen: false,
      openMenuButtonId: null
    });
  }

  /**
   * Execute menu item action
   */
  executeMenuAction(menuItem: FabMenuItem): void {
    switch (menuItem.action) {
      case 'route':
        // Navigate to route
        if (menuItem.target) {
          this.router.navigate([menuItem.target]).catch(err => 
            console.error('Navigation failed:', err)
          );
        }
        break;
      case 'component':
        // Open flyout with specific component
        if (menuItem.target) {
          this.flyout.open(menuItem.target);
        }
        break;
      case 'callback':
        // Execute callback function - would need to be passed in config
        console.log('Callback action:', menuItem.target);
        break;
      case 'external':
        // Open external URL
        if (menuItem.target) {
          window.open(menuItem.target, '_blank');
        }
        break;
    }

    // Close menu after action
    this.closeMenu();
  }

  /**
   * Factory method to create button configurations
   * Useful for programmatic button creation
   */
  createButtonConfig(
    id: string,
    label: string,
    icon: string,
    options: Partial<FabButtonConfig> = {}
  ): FabButtonConfig {
    return {
      id,
      label,
      icon,
      order: 999,
      roles: [],
      hasMenu: false,
      action: 'callback',
      ...options
    };
  }
}