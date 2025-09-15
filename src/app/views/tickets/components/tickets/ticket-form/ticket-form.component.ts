import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

import { FormConfig, FormGeneratorComponent } from '../../../../../shared';
import { Ticket } from '../../../models';
import { TicketService, TicketEventService } from '../../../services';
import {
  getTicketFormConfig,
  getTicketInitialValues,
  getTicketCreateRequest,
  getTicketUpdateRequest
} from './ticket-form.utils';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [
    CommonModule,
    FormGeneratorComponent
  ],
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketFormComponent implements OnInit {
  @Input() ticket: Ticket | null = null;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  ticketForm: FormGroup;
  loading = false;
  formSchema: FormConfig;
  private initialFormValues: any = null;

  constructor(
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef,
    private ticketEventService: TicketEventService
  ) {}

  ngOnInit(): void {
    this.formSchema = getTicketFormConfig(this.ticket);
    this.initialFormValues = getTicketInitialValues(this.ticket);
  }

  onSubmit(): void {
    if (!this.ticketForm || this.ticketForm.invalid) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const formValue = this.ticketForm.getRawValue();

    const operation$ = this.ticket
      ? this.ticketService.updateTicket(this.ticket.id, getTicketUpdateRequest(formValue))
      : this.ticketService.createTicket(getTicketCreateRequest(formValue));

    operation$.subscribe({
      next: (ticket) => {
        this.loading = false;
        // Emit appropriate event
        if (this.ticket) {
          this.ticketEventService.emitTicketUpdated(ticket);
        } else {
          this.ticketEventService.emitTicketCreated(ticket);
        }
        this.save.emit();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error saving ticket:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onFormReady(form: FormGroup): void {
    this.ticketForm = form;
    
    // Apply initial values if they were stored before form was ready
    if (this.initialFormValues && form) {
      // Use emitEvent: false to prevent triggering valueChanges
      form.patchValue(this.initialFormValues, { emitEvent: false });
      this.initialFormValues = null; // Clear after applying
    }
    
    this.cdr.markForCheck();
  }

  get isFormInvalid(): boolean {
    return this.ticketForm ? this.ticketForm.invalid : true;
  }
}
