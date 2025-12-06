import { Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { FieldType, FormConfig, SelectOption } from '@shared';
import { Ticket, CreateTicketRequest, UpdateTicketRequest, TicketPriority, TicketCategory } from '../../../models';

export function getTicketFormConfig(
  ticket: Ticket | null = null
): FormConfig {
  const isEditMode = !!ticket;

  return {
    fields: [
      {
        name: 'subject',
        type: FieldType.text,
        label: 'tickets.form.subject',
        validators: isEditMode
          ? [Validators.maxLength(200)]
          : [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
        placeholder: 'tickets.form.subjectPlaceholder'
      },
      {
        name: 'description',
        type: FieldType.textarea,
        label: 'tickets.form.description',
        validators: [Validators.maxLength(5000)],
        placeholder: 'tickets.form.descriptionPlaceholder'
      },
      {
        name: 'category',
        type: FieldType.select,
        label: 'tickets.form.category',
        validators: isEditMode ? [] : [Validators.required],
        options: getCategoryOptions(),
        placeholder: 'tickets.form.selectCategory'
      },
      {
        name: 'priority',
        type: FieldType.select,
        label: 'tickets.form.priority',
        validators: isEditMode ? [] : [Validators.required],
        options: getPriorityOptions(),
        placeholder: 'tickets.form.selectPriority'
      },
      // Add status field conditionally for edit mode
      ...(isEditMode ? [{
        name: 'status',
        type: FieldType.select,
        label: 'tickets.form.status',
        validators: [],
        options: getStatusOptions(),
        placeholder: 'tickets.form.selectStatus'
      }] : [])
    ]
  };
}

export function getPriorityOptions(): Observable<SelectOption[]> {
  return of([
    { value: 'LOW', displayValue: 'tickets.priorityValues.low' },
    { value: 'MEDIUM', displayValue: 'tickets.priorityValues.medium' },
    { value: 'HIGH', displayValue: 'tickets.priorityValues.high' },
    { value: 'URGENT', displayValue: 'tickets.priorityValues.urgent' }
  ]);
}

export function getCategoryOptions(): Observable<SelectOption[]> {
  return of([
    { value: 'GENERAL_INQUIRY', displayValue: 'tickets.categoryValues.generalInquiry' },
    { value: 'TECHNICAL_ISSUE', displayValue: 'tickets.categoryValues.technicalIssue' },
    { value: 'BILLING_QUESTION', displayValue: 'tickets.categoryValues.billingQuestion' },
    { value: 'FEATURE_REQUEST', displayValue: 'tickets.categoryValues.featureRequest' },
    { value: 'BUG_REPORT', displayValue: 'tickets.categoryValues.bugReport' },
    { value: 'ACCOUNT_ISSUE', displayValue: 'tickets.categoryValues.accountIssue' },
    { value: 'INTEGRATION_SUPPORT', displayValue: 'tickets.categoryValues.integrationSupport' },
    { value: 'PERFORMANCE_ISSUE', displayValue: 'tickets.categoryValues.performanceIssue' },
    { value: 'SECURITY_CONCERN', displayValue: 'tickets.categoryValues.securityConcern' },
    { value: 'DATA_REQUEST', displayValue: 'tickets.categoryValues.dataRequest' },
    { value: 'COMPLIANCE_INQUIRY', displayValue: 'tickets.categoryValues.complianceInquiry' },
    { value: 'OTHER', displayValue: 'tickets.categoryValues.other' }
  ]);
}

export function getStatusOptions(): Observable<SelectOption[]> {
  return of([
    { value: 'OPEN', displayValue: 'tickets.statusValues.open' },
    { value: 'IN_PROGRESS', displayValue: 'tickets.statusValues.inProgress' },
    { value: 'RESOLVED', displayValue: 'tickets.statusValues.resolved' },
    { value: 'CLOSED', displayValue: 'tickets.statusValues.closed' },
    { value: 'CANCELLED', displayValue: 'tickets.statusValues.cancelled' }
  ]);
}

export function getTicketInitialValues(ticket: Ticket | null): any {
  return {
    subject: ticket?.subject || '',
    description: ticket?.description || '',
    category: ticket?.category || null,
    priority: ticket?.priority || null,
    ...(ticket && { status: ticket.status })
  };
}

export function getTicketCreateRequest(formValue: any): CreateTicketRequest {
  return {
    subject: formValue.subject,
    description: formValue.description,
    priority: formValue.priority as TicketPriority,
    category: formValue.category as TicketCategory
  };
}

export function getTicketUpdateRequest(formValue: any): UpdateTicketRequest {
  return {
    subject: formValue.subject,
    description: formValue.description,
    priority: formValue.priority as TicketPriority,
    category: formValue.category as TicketCategory,
    status: formValue.status
  };
}