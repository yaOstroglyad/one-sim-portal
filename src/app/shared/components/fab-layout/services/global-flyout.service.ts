import { Injectable, signal } from '@angular/core';
import { FlyoutOpenConfig } from '../models';

@Injectable({ providedIn: 'root' })
export class GlobalFlyoutService {
  readonly isOpen = signal(false);
  readonly activeFeatureKey = signal<string | null>(null);
  readonly params = signal<unknown | null>(null);
  readonly title = signal<string | null>(null);
  readonly destroyOnClose = signal<boolean | undefined>(undefined); // Runtime override

  open(config: FlyoutOpenConfig = {}) {
    this.isOpen.set(true);
    if (config.featureKey) this.activeFeatureKey.set(config.featureKey);
    if (config.params !== undefined) this.params.set(config.params);
    if (config.title !== undefined) this.title.set(config.title);
    if (config.destroyOnClose !== undefined) this.destroyOnClose.set(config.destroyOnClose);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen() ? this.close() : this.open();
  }
}
