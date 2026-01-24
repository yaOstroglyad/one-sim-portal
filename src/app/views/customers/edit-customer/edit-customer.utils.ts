import {
  FieldType,
  FormConfig,
  Customer,
  CustomerType,
  FieldConfig,
  CompaniesDataService,
  Company,
  CreateCustomerCommand
} from '@shared';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map } from 'rxjs/operators';
import { CompanyProductService } from '../../product-constructor/services';

const emailHintMessage = 'customer.emailHint';

function createCompanySearchField(companiesService: CompaniesDataService): FieldConfig {
  return {
    type: FieldType.searchableSelect,
    name: 'company',
    label: 'customer.companySearch',
    validators: [Validators.required],
    searchableSelectConfig: {
      entityKey: 'common.entities.company',
      clearable: false,
      options$: companiesService.list().pipe(
        map(companies => companies.map((company: Company) => ({
          value: company,
          label: company.name || company.id
        })))
      )
    }
  };
}

export interface CustomerCreateResult {
  command: CreateCustomerCommand;
  productId: string | null;
}

export function getCustomerCreateRequest(form: any, isAdmin: boolean = false): CustomerCreateResult {
  const command: CreateCustomerCommand = {
    name: form.name,
    description: form.description || undefined,
    externalId: form.externalId || undefined,
    tags: form?.tags?.length ? form.tags : undefined,
    type: form?.type || CustomerType.Private,
    customerEmail: form.email
  };

  // Only include companyId for admin users
  if (isAdmin && form.company?.id) {
    command.companyId = form.company.id;
  }

  return {
    command,
    productId: form.productId || null
  };
}

export function getProductOptions$(companyProductService: CompanyProductService, accountId?: string) {
  return companyProductService.searchCompanyProducts({
    searchParams: accountId ? { accountId } : {},
    page: { page: 0, size: 1000 }
  }).pipe(
    map(response => response.content?.map(product => ({
      value: product.id,
      label: product.name
    })) || [])
  );
}

export function getEditCustomerFormConfig(
  companyProductService: CompanyProductService,
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
      type: FieldType.searchableSelect,
      name: 'productId',
      label: 'customer.product',
      validators: [],
      searchableSelectConfig: {
        entityKey: 'common.entities.product',
        clearable: true,
        // For admin: products will be loaded when company is selected
        // For non-admin: load all available products
        options$: isAdmin ? of([]) : getProductOptions$(companyProductService)
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
