import { Observable } from 'rxjs';

export interface FeatureToggle {
  key: string;
  enabled: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FeatureToggleResponse {
  toggles: FeatureToggle[];
  timestamp: Date;
}

export interface FeatureToggleService {
  isToggleActive(key: string): boolean;
  isToggleActive$(key: string): Observable<boolean>;
  readonly featureToggles: Set<string>;
}