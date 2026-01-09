import {
  FieldType,
  ProvidersDataService,
  FormConfig,
  Customer,
  CustomerType,
  ProductsDataService,
  FieldConfig,
  CompaniesDataService
} from '@shared';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map } from 'rxjs/operators';

const emailHintMessage = 'customer.emailHint';

function createCompanySearchField(companiesService: CompaniesDataService): FieldConfig {
  return {
    type: FieldType.searchableSelect,
    name: 'companyId',
    label: 'customer.companySearch',
    placeholder: 'customer.companySearchPlaceholder',
    validators: [Validators.required],
    searchableSelectConfig: {
      placeholder: 'customer.companySearchPlaceholder',
      searchPlaceholder: 'customer.companySearchInputPlaceholder',
      noResultsText: 'customer.companySearchNoResults',
      clearable: false,
      searchFn: (searchTerm: string) => {
        return companiesService.paginatedCompanies({ name: searchTerm }, 0, 20).pipe(
          map(response => response.content?.map((company: any) => ({
            value: company.id,
            label: company.name || company.id
          })) || [])
        );
      }
    }
  };
}

export function getCustomerCreateRequest(form: any, isAdmin: boolean = false) {
  return {
    customerCommand: {
      id: form?.id || null,
      companyId: isAdmin ? form.companyId : undefined,
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
  companiesService?: CompaniesDataService
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

  // Add company search for admin
  if (isAdmin && companiesService) {
    fields.push(createCompanySearchField(companiesService));
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
      dependsOnValue: isAdmin ? ['serviceProviderId', 'companyId'] : ['serviceProviderId'],
      disabled: true,
      options: (values) => {
        const { serviceProviderId, companyId } = values;
        if (!serviceProviderId) return of([]);

        // For admin, pass companyId to get products available for that company
        const filterParams: any = { serviceProviderId };
        if (isAdmin && companyId) {
          filterParams.companyId = companyId;
        }

        return productsDataService.listFiltered(filterParams).pipe(
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
