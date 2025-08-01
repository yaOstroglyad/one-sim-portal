import { FieldType, FormConfig } from '../../../../../shared';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';
import { MobileBundle, CreateBundleRequest, UpdateBundleRequest } from '../../../models';

const usageTypes = [
  { value: 'data', displayValue: 'Data' },
  { value: 'voice', displayValue: 'Voice' },
  { value: 'sms', displayValue: 'SMS' }
];

const unitTypes = {
  data: [
    { value: 'Byte', displayValue: 'Bytes' },
    { value: 'Kb', displayValue: 'KB' },
    { value: 'Mb', displayValue: 'MB' },
    { value: 'Gb', displayValue: 'GB' },
    { value: 'Tb', displayValue: 'TB' }
  ],
  voice: [
    { value: 'Seconds', displayValue: 'Seconds' },
    { value: 'Minutes', displayValue: 'Minutes' },
    { value: 'Hours', displayValue: 'Hours' }
  ],
  sms: [
    { value: 'Messages', displayValue: 'Messages' }
  ]
};

export function getBundleFormConfig(bundle: MobileBundle | null = null): FormConfig {
  return {
    fields: [
      {
        type: FieldType.text,
        name: 'name',
        label: 'Bundle Name',
        placeholder: 'Enter bundle name',
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
        value: bundle?.name || ''
      },
      {
        type: FieldType.formArray,
        name: 'usageUnits',
        label: 'Usage Units',
        hintMessage: 'Define the data, voice, and SMS allocations for this bundle',
        validators: [Validators.required],
        value: bundle?.usageUnits || [],
        arrayConfig: {
          minItems: 1,
          defaultItem: { type: 'data', value: '', unitType: 'MB' },
          addButtonText: 'Add Usage Unit',
          removeButtonText: 'Remove',
          emptyMessage: 'No usage units defined yet. Click "Add Usage Unit" to start.',
          itemLabel: (index: number) => `Usage Unit ${index + 1}`,
          itemConfig: {
            fields: [
              {
                type: FieldType.select,
                name: 'type',
                label: 'Type',
                validators: [Validators.required],
                options: of(usageTypes),
                value: 'data',
                inputEvent: (event: any, formGenerator: any, field: any) => {
                  // When type changes, update unitType value to the default for the new type
                  const newType = event.value;
                  const unitTypeControl = formGenerator.form.get('unitType');
                  if (unitTypeControl) {
                    unitTypeControl.setValue(getDefaultUnitType(newType));
                  }
                }
              },
              {
                type: FieldType.number,
                name: 'value',
                label: 'Amount',
                placeholder: '0',
                validators: [Validators.required, Validators.min(0.01)],
                value: ''
              },
              {
                type: FieldType.select,
                name: 'unitType',
                label: 'Unit',
                validators: [Validators.required],
                options: (values: Record<string, any>) => {
                  const selectedType = values['type'] || 'data';
                  return of(unitTypes[selectedType as keyof typeof unitTypes] || unitTypes.data);
                },
                dependsOnValue: ['type'],
                value: getDefaultUnitType('data')
              }
            ]
          }
        }
      }
    ]
  };
}

function getDefaultUnitType(type: string): string {
  switch (type) {
    case 'data': return 'MB';
    case 'voice': return 'Minutes';
    case 'sms': return 'Messages';
    default: return 'MB';
  }
}

export function getBundleCreateRequest(formValue: any): CreateBundleRequest {
  return {
    name: formValue.name,
    usageUnits: formValue.usageUnits.map((unit: any) => ({
      type: unit.type,
      value: parseFloat(unit.value),
      unitType: unit.unitType
    }))
  };
}

export function getBundleUpdateRequest(formValue: any): UpdateBundleRequest {
  return {
    name: formValue.name,
    usageUnits: formValue.usageUnits.map((unit: any) => ({
      type: unit.type,
      value: parseFloat(unit.value),
      unitType: unit.unitType
    }))
  };
}
