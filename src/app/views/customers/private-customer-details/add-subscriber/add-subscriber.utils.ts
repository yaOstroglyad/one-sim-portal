import { FormConfig, FieldType } from '@shared';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Validators } from '@angular/forms';
import { AddSubscriberProductService } from '../add-subscriber-product/add-subscriber-product.service';

export function getAddSubscriberFormConfig(
  addSubscriberProductService: AddSubscriberProductService,
  subscriberId: string | undefined
): FormConfig {
  // If no subscriberId, return empty options
  const productOptions$ = subscriberId
    ? addSubscriberProductService.list(subscriberId).pipe(
        map(options => options.map(option => ({
          value: option.value?.id,
          label: option.displayValue
        })))
      )
    : of([]);

  return {
    fields: [
      {
        type: FieldType.searchableSelect,
        name: 'productId',
        label: 'add-subscriber.product',
        validators: [Validators.required],
        searchableSelectConfig: {
          entityKey: 'common.entities.product',
          clearable: false,
          options$: productOptions$
        }
      },
      {
        type: FieldType.text,
        name: 'subscriberName',
        label: 'add-subscriber.name',
        validators: [],
        placeholder: 'add-subscriber.enter-name'
      },
      {
        type: FieldType.email,
        name: 'email',
        validators: [Validators.required],
        label: 'add-subscriber.email',
        placeholder: 'add-subscriber.enter-email',
        hintMessage: 'Email will be sent to register the user.'
      }
    ]
  };
}
