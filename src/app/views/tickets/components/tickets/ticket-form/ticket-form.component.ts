import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  input,
  output,
  signal,
  computed,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';

import { FormConfig, FormGeneratorComponent } from '@shared';
import { Ticket } from '../../../models';
import { TicketService, TicketEventService } from '../../../services';
import {
  getTicketFormConfig,
  getTicketInitialValues,
  getTicketCreateRequest,
  getTicketUpdateRequest
} from './ticket-form.utils';

@Component({
    standalone: true,
    selector: 'app-ticket-form',
    imports: [
        FormGeneratorComponent
    ],
    templateUrl: './ticket-form.component.html',
    styleUrls: ['./ticket-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketFormComponent implements OnInit {
  // Inputs/Outputs
  ticket = input<Ticket | null>(null);
  save = output<void>();

  // Services
  private ticketService = inject(TicketService);
  private ticketEventService = inject(TicketEventService);
  private destroyRef = inject(DestroyRef);

  // State signals
  loading = signal(false);
  private ticketForm = signal<FormGroup | null>(null);

  // Form config - initialized once in ngOnInit
  formSchema: FormConfig;

  // Computed
  isFormInvalid = computed(() => {
    const form = this.ticketForm();
    return form ? form.invalid : true;
  });

  ngOnInit(): void {
    // Create form config once based on initial ticket value
    this.formSchema = getTicketFormConfig(this.ticket());
  }

  // Public access to form for external submission (used by TicketEditWrapperComponent)
  getForm(): FormGroup | null {
    return this.ticketForm();
  }

  onSubmit(): void {
    const form = this.ticketForm();
    if (!form || form.invalid) {
      return;
    }

    this.loading.set(true);

    const formValue = form.getRawValue();
    const currentTicket = this.ticket();

    const operation$ = currentTicket
      ? this.ticketService.updateTicket(currentTicket.id, getTicketUpdateRequest(formValue))
      : this.ticketService.createTicket(getTicketCreateRequest(formValue));

    operation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ticket) => {
          this.loading.set(false);
          // Emit appropriate event
          if (currentTicket) {
            this.ticketEventService.emitTicketUpdated(ticket);
          } else {
            this.ticketEventService.emitTicketCreated(ticket);
          }
          this.save.emit();
        },
        error: (error) => {
          console.error('Error saving ticket:', error);
          this.loading.set(false);
        }
      });
  }

  onFormReady(form: FormGroup): void {
    // Only initialize form once - formChanges emits on every value change
    if (this.ticketForm()) {
      return;
    }

    this.ticketForm.set(form);

    // Apply initial values based on ticket
    const initialValues = getTicketInitialValues(this.ticket());
    if (initialValues && form) {
      form.patchValue(initialValues, { emitEvent: false });
    }
  }
}
