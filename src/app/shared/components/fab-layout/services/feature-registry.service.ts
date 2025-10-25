import { Injectable, signal, Type } from '@angular/core';
import { FeatureEntry } from '../models';

@Injectable({ providedIn: 'root' })
export class FeatureRegistryService {
  private readonly _features = signal<FeatureEntry[]>([]);
  readonly features = this._features.asReadonly();

  register(entry: FeatureEntry) {
    const exists = this._features().some(f => f.meta.key === entry.meta.key);
    if (!exists) {
      this._features.update(list => [...list, entry].sort(this.sortByOrder));
    } else {
      console.warn('[FeatureRegistry] Feature already registered:', entry.meta.key);
    }
  }

  unregister(key: string) {
    const exists = this._features().some(f => f.meta.key === key);
    if (exists) {
      this._features.update(list => list.filter(f => f.meta.key !== key));
    } else {
      console.warn('[FeatureRegistry] Feature not found for unregistration:', key);
    }
  }

  async resolveComponent(key: string): Promise<Type<unknown> | null> {
    const entry = this._features().find(f => f.meta.key === key);
    if (!entry) {
      console.error('[FeatureRegistry] No entry found for key:', key);
      return null;
    }

    return await entry.load();
  }

  private sortByOrder(a: FeatureEntry, b: FeatureEntry): number {
    return (a.meta.order ?? 0) - (b.meta.order ?? 0);
  }
}
