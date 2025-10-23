import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalFlyoutService {
  readonly isOpen = signal(false);
  readonly activeFeatureKey = signal<string | null>(null);
  readonly params = signal<unknown | null>(null);

  open(featureKey?: string, params?: unknown) {
    this.isOpen.set(true);
    if (featureKey) this.activeFeatureKey.set(featureKey);
    if (params !== undefined) this.params.set(params);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen() ? this.close() : this.open();
  }
}