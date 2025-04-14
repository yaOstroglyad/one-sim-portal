import { FormConfig, FieldType, ProductsDataService } from '../../../../shared';
import { Observable, of } from 'rxjs';
import { Provider } from '../../../../shared/model/provider';
import { map } from 'rxjs/operators';
import { Validators } from '@angular/forms';

export function getAddSubscriberFormConfig(
  providers$: Observable<Provider[]>,
  productsDataService: ProductsDataService,
  email: string,
  customerId: string
): FormConfig {
  return {
    fields: [
      {
        type: FieldType.select,
        name: 'serviceProviderId',
        label: 'add-subscriber.provider',
        validators: [Validators.required],
        options: providers$.pipe(
          map(providers => providers.map(
            provider => ({ value: provider.id, displayValue: provider.name })
          ))
        ),
        placeholder: 'add-subscriber.select-provider'
      },
      {
        type: FieldType.select,
        name: 'productId',
        label: 'add-subscriber.product',
        dependsOnValue: ['serviceProviderId'],
        disabled: true,
        validators: [Validators.required],
        options: (values) => {
          const { serviceProviderId } = values;
          if (!serviceProviderId) return of([]);

          return productsDataService.listFiltered({
            serviceProviderId: serviceProviderId,
            customerId
          }).pipe(
            map(products => products.map(p => ({
              value: p.id,
              displayValue: p.name
            })))
          );
        },
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
