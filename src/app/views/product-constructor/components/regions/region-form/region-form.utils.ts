import { FieldType, FormConfig, GridSelectOption } from '../../../../../shared';
import { Validators } from '@angular/forms';
import { Country, RegionSummary } from '../../../models';

export function getRegionFormConfig(
  countries: Country[],
  region: RegionSummary | null = null
): FormConfig {
  return {
    fields: [
      {
        type: FieldType.text,
        name: 'name',
        label: 'Region Name',
        placeholder: 'Enter region name (e.g., Europe, North America)',
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
        hintMessage: 'A descriptive name for this geographic region',
        value: region?.name || ''
      },
      {
        type: FieldType.multiselectGrid,
        name: 'countryIds',
        label: 'Countries',
        hintMessage: 'Select countries to include in this region',
        value: [],
        gridOptions: getCountryOptions(countries),
        gridConfig: {
          searchable: true,
          searchFields: ['displayValue', 'secondary', 'tertiary'],
          showBulkActions: true,
          layout: 'grid',
          searchPlaceholder: 'Search countries...',
          displayFields: {
            primary: 'displayValue',
            secondary: 'secondary',
            tertiary: 'tertiary',
            badge: 'badge'
          }
        }
      }
    ]
  };
}

export function getCountryOptions(countries: Country[]): GridSelectOption[] {
  if (!countries) return [];
  
  return countries.map(country => ({
    value: country.id,
    displayValue: country.name,
    secondary: `${country.isoAlphaCode2} / ${country.isoAlphaCode3}`,
    tertiary: undefined,
    badge: country.isoAlphaCode2,
    disabled: false
  }));
}

export function getRegionCreateRequest(formValue: any) {
  return {
    name: formValue.name,
    countryIds: formValue.countryIds || []
  };
}

export function getRegionUpdateRequest(formValue: any) {
  return {
    name: formValue.name,
    countryIds: formValue.countryIds || []
  };
}