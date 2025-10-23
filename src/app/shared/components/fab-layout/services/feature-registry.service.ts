import { Injectable, Type, signal } from '@angular/core';
import { FeatureEntry, FeatureMeta } from '../models';

@Injectable({ providedIn: 'root' })
export class FeatureRegistryService {
  private readonly _features = signal<FeatureEntry[]>([]);
  readonly features = this._features.asReadonly();

  register(entry: FeatureEntry) {
    const exists = this._features().some(f => f.meta.key === entry.meta.key);
    if (!exists) {
      this._features.update(list => [...list, entry].sort(this.sortByOrder));
    }
  }

  async resolveComponent(key: string): Promise<Type<unknown> | null> {
    const entry = this._features().find(f => f.meta.key === key);
    if (!entry) return null;
    return entry.load();
  }

  private sortByOrder(a: FeatureEntry, b: FeatureEntry): number {
    return (a.meta.order ?? 0) - (b.meta.order ?? 0);
  }
}