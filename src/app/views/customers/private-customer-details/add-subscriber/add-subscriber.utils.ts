import { FormConfig, FieldType } from '../../../../shared';
import { Observable } from 'rxjs';
import { Provider } from '../../../../shared/model/provider';
import { Package } from '../../../../shared/model/package';
import { map } from 'rxjs/operators';
import { Validators } from '@angular/forms';

export function getAddSubscriberFormConfig(
  providers$: Observable<Provider[]>,
  products$: Observable<Package[]>,
  email: string
): FormConfig {
  return {
    fields: [
      {
        type: FieldType.select,
        name: 'serviceProviderId',
        label: 'add-subscriber.provider',
        validators: [Validators.required],
        options: providers$.pipe(map(providers => providers.map(provider => ({ value: provider.id, displayValue: provider.name })))),
        placeholder: 'add-subscriber.select-provider'
      },
      {
        type: FieldType.select,
        name: 'productId',
        label: 'add-subscriber.product',
        dependsOn: ['serviceProviderId'],
        validators: [Validators.required],
        options: products$.pipe(map(products => products.map(product => ({ value: product.id, displayValue: product.name })))),
        placeholder: 'add-subscriber.select-product'
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
        value: email,
        label: 'add-subscriber.email',
        validators: [],
        placeholder: 'add-subscriber.enter-email',
        hintMessage: 'Email will be sent to register the user.'
      }
    ]
  };
}
