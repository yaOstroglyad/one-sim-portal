import {
  FieldType,
  ProvidersDataService,
  FormConfig,
  Customer,
  CustomerType,
  ProductsDataService,
  AccountsDataService,
  SelectOption,
  FieldConfig
} from '@shared';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map } from 'rxjs/operators';

const emailHintMessage = 'customer.emailHint';

function createCompanySelectionField(accountsService: AccountsDataService): FieldConfig {
  return {
    type: FieldType.select,
    name: 'accountId',
    label: 'customer.company',
    placeholder: 'customer.companyPlaceholder',
    validators: [Validators.required],
    options: accountsService.ownerAccounts().pipe(
      map(accounts => accounts.map(account => ({
        value: account.id,
        displayValue: account.name || account.email || account.id
      } as SelectOption)))
    )
  };
}

export function getCustomerCreateRequest(form: any, isAdmin: boolean = false) {
  return {
    customerCommand: {
      id: form?.id || null,
      accountId: isAdmin ? form.accountId : undefined,
      name: form.name,
      description: form.description,
      externalId: form.externalId || '',
      tags: form?.tags || [],
      type: form?.type || ''
    },
    subscriberCommand: form?.type === CustomerType.Private ? {
      serviceProviderId: form.serviceProviderId || '',
      externalId: form.subscriberExternalId || null
    } : null,
    productId: form.productId || null,
    userProfileEmail: form.email || ''
  };
}

export function getEditCustomerFormConfig(
  serviceProviderDataService: ProvidersDataService,
  productsDataService: ProductsDataService,
  data: Customer,
  isAdmin: boolean = false,
  accountsService?: AccountsDataService
): FormConfig {
  const fields: FieldConfig[] = [
    {
      type: FieldType.uuid,
      name: 'id',
      label: 'ID',
      value: data?.id,
      invisible: true
    },
    {
      type: FieldType.select,
      name: 'type',
      label: 'Type',
      value: CustomerType.Private,
      validators: [Validators.required],
      options: of([
        { value: CustomerType.Private, displayValue: CustomerType.Private }
      ]),
      invisible: true
    }
  ];

  // Add company selection for admin at the beginning
  if (isAdmin && accountsService) {
    fields.push(createCompanySelectionField(accountsService));
  }

  fields.push(
    {
      type: FieldType.email,
      name: 'email',
      label: 'customer.email',
      placeholder: 'customer.emailPlaceholder',
      validators: [Validators.required, Validators.email],
      hintMessage: emailHintMessage,
      className: 'height-100px'
    },
    {
      type: FieldType.text,
      name: 'name',
      label: 'customer.name',
      placeholder: 'customer.namePlaceholder',
      value: data?.name,
      validators: [Validators.required]
    },
    {
      type: FieldType.select,
      name: 'serviceProviderId',
      label: 'customer.serviceProvider',
      placeholder: 'customer.serviceProviderPlaceholder',
      validators: [Validators.required],
      options: serviceProviderDataService.list().pipe(
        map(providers => providers.map(
          provider => ({
            value: provider.id,
            displayValue: provider.name
          })
        ))
      )
    },
    {
      type: FieldType.select,
      name: 'productId',
      label: 'customer.product',
      placeholder: 'customer.productPlaceholder',
      validators: [],
      dependsOnValue: ['serviceProviderId'],
      disabled: true,
      options: (values) => {
        const { serviceProviderId } = values;
        if (!serviceProviderId) return of([]);

        return productsDataService.listFiltered({
          serviceProviderId: serviceProviderId
        }).pipe(
          map(products => products.map(p => ({
            value: p.id,
            displayValue: p.name
          })))
        );
      }
    },
    {
      type: FieldType.textarea,
      name: 'description',
      label: 'customer.description',
      placeholder: 'customer.descriptionPlaceholder',
      value: data?.description
    },
    {
      type: FieldType.chips,
      name: 'tags',
      label: 'customer.tags',
      placeholder: 'customer.tagsPlaceholder',
      addOnBlur: true,
      separatorKeysCodes: [ENTER, COMMA],
      selectable: true,
      removable: true
    },
    {
      type: FieldType.text,
      name: 'subscriberExternalId',
      label: 'Subscriber External ID',
      invisible: true
    },
    {
      type: FieldType.text,
      name: 'externalId',
      label: 'Customer External ID',
      invisible: true
    }
  );

  return { fields };
}
