import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EditCompanySettings } from '@shared/models';

export interface ApplicationTypeOption {
  value: string;
  displayValue: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhitelabelSettingsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = '/api/v1/whitelabel/account-settings';

  /**
   * Get company settings by account ID
   * If accountId is not provided, returns settings for current user's account
   */
  get(accountId?: string): Observable<EditCompanySettings> {
    const params = accountId
      ? new HttpParams().set('accountId', accountId)
      : undefined;

    return this.http.get<EditCompanySettings>(`${this.API_URL}/query`, { params });
  }

  /**
   * Create new company settings
   */
  create(payload: EditCompanySettings): Observable<EditCompanySettings> {
    return this.http.post<EditCompanySettings>(`${this.API_URL}/command/create`, payload);
  }

  /**
   * Update existing company settings
   */
  update(payload: EditCompanySettings): Observable<EditCompanySettings> {
    return this.http.patch<EditCompanySettings>(`${this.API_URL}/command/update`, payload);
  }

  /**
   * Get all available application types (used for domain configuration)
   * API returns string[] but we transform to ApplicationTypeOption[] for form compatibility
   */
  getApplicationTypes(): Observable<ApplicationTypeOption[]> {
    return this.http.get<string[]>('/api/v1/whitelabel/common/application-types').pipe(
      map(types => types.map(type => ({
        value: type,
        displayValue: type
      })))
    );
  }
}
