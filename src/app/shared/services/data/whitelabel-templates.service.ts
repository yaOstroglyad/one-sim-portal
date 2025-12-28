import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailTemplate } from '@shared/models';

export interface EmailTemplateCreateRequest {
  type: string;
  language: string;
  subject: string;
  body: string;
  ownerAccountId?: string;
}

export interface EmailTemplateUpdateRequest {
  id: string;
  subject: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhitelabelTemplatesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = '/api/v1/whitelabel/email-templates';

  /**
   * Get all available email template types
   */
  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/query/template-types`);
  }

  /**
   * Get all email templates by type and optionally by owner account
   */
  getAllByType(type: string, ownerAccountId?: string): Observable<EmailTemplate[]> {
    let params = new HttpParams().set('type', type);

    if (ownerAccountId) {
      params = params.set('ownerAccountId', ownerAccountId);
    }

    return this.http.get<EmailTemplate[]>(`${this.API_URL}/query/all-by-type`, { params });
  }

  /**
   * Get all available languages for email templates
   */
  getLanguages(): Observable<string[]> {
    return this.http.get<string[]>('/api/v1/whitelabel/common/languages');
  }

  /**
   * Create a new email template
   */
  create(payload: EmailTemplateCreateRequest): Observable<EmailTemplate> {
    return this.http.post<EmailTemplate>(`${this.API_URL}/command/create`, payload);
  }

  /**
   * Update an existing email template
   */
  update(payload: EmailTemplateUpdateRequest): Observable<EmailTemplate> {
    return this.http.patch<EmailTemplate>(`${this.API_URL}/command/update`, payload);
  }

  /**
   * Set an email template as primary for its type
   */
  setPrimary(id: string): Observable<EmailTemplate> {
    return this.http.patch<EmailTemplate>(`${this.API_URL}/command/set-primary/${id}`, {});
  }
}
