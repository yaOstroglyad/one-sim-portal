import { FieldType, FormConfig } from '../../../../../shared';
import { Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../../models';
import { ServiceCoverage, ValidityPeriod } from '../../../models/common.model';
import { BundleService, RegionService } from '../../../services';
import { CountryService } from '../../../../../shared';

export function getProductFormConfig(
  product: Product | null = null,
  isEditing: boolean = false,
  bundleService: BundleService,
  regionService: RegionService,
  countryService: CountryService
): FormConfig {
  return {
    fields: [
      // Product Name
      {
        type: FieldType.text,
        name: 'name',
        label: 'Product Name',
        placeholder: 'Enter product name',
        validators: [Validators.required, Validators.maxLength(255)],
        value: product?.name || ''
      },

      // Description - only for edit mode
      ...(isEditing ? [{
        type: FieldType.textarea,
        name: 'description',
        label: 'Description',
        placeholder: 'Enter product description',
        validators: [Validators.maxLength(1000)],
        value: product?.description || ''
      }] : []),

      // Bundle Selection - only for create mode
      ...(!isEditing ? [{
        type: FieldType.select,
        name: 'bundleId',
        label: 'Bundle',
        placeholder: 'Select a bundle',
        validators: [Validators.required],
        options: bundleService.getBundles().pipe(
          map(bundles => bundles.map(bundle => ({
            value: bundle.id,
            displayValue: bundle.name
          }))),
          catchError(error => {
            console.error('Error loading bundles:', error);
            return of([]);
          })
        ),
        value: product?.bundle?.id || ''
      }] : []),

      // Service Coverage Type - only for create mode
      ...(!isEditing ? [{
        type: FieldType.select,
        name: 'serviceCoverageType',
        label: 'Coverage Type',
        validators: [Validators.required],
        options: of([
          { value: 'REGION', displayValue: 'Region' },
          { value: 'COUNTRY', displayValue: 'Country' }
        ]),
        value: product?.serviceCoverage?.type || 'REGION',
        inputEvent: (event: any, formGenerator: any, field: any) => {
          // Reset service coverage when type changes
          const serviceCoverageControl = formGenerator.form.get('serviceCoverageId');
          const serviceCoverageNameControl = formGenerator.form.get('serviceCoverageName');
          if (serviceCoverageControl) {
            serviceCoverageControl.setValue('');
          }
          if (serviceCoverageNameControl) {
            serviceCoverageNameControl.setValue('');
          }
        }
      }] : []),

      // Service Coverage Selection - only for create mode
      ...(!isEditing ? [{
        type: FieldType.select,
        name: 'serviceCoverageId',
        label: 'Service Coverage',
        placeholder: 'Select service coverage',
        validators: [Validators.required],
        options: (values: Record<string, any>) => {
          const coverageType = values['serviceCoverageType'] || 'REGION';
          
          if (coverageType === 'REGION') {
            return regionService.getRegions().pipe(
              map(regions => regions.map(region => ({
                value: region.id.toString(),
                displayValue: region.name
              }))),
              catchError(error => {
                console.error('Error loading regions:', error);
                return of([]);
              })
            );
          } else {
            return countryService.getCountries().pipe(
              map(countries => countries.map(country => ({
                value: country.id.toString(),
                displayValue: country.name
              }))),
              catchError(error => {
                console.error('Error loading countries:', error);
                return of([]);
              })
            );
          }
        },
        dependsOnValue: ['serviceCoverageType'],
        value: product?.serviceCoverage?.id?.toString() || '',
        inputEvent: (event: any, formGenerator: any, field: any) => {
          // Update service coverage name when selection changes
          const selectedId = event.value;
          const coverageType = formGenerator.form.get('serviceCoverageType')?.value;
          const serviceCoverageNameControl = formGenerator.form.get('serviceCoverageName');
          
          if (!selectedId || !serviceCoverageNameControl) {
            serviceCoverageNameControl?.setValue('');
            return;
          }

          if (coverageType === 'REGION') {
            regionService.getRegions().pipe(
              map(regions => {
                const selected = regions.find(region => region.id.toString() === selectedId);
                return selected?.name || '';
              }),
              catchError(() => of(''))
            ).subscribe(name => {
              serviceCoverageNameControl.setValue(name);
            });
          } else {
            countryService.getCountries().pipe(
              map(countries => {
                const selected = countries.find(country => country.id.toString() === selectedId);
                return selected?.name || '';
              }),
              catchError(() => of(''))
            ).subscribe(name => {
              serviceCoverageNameControl.setValue(name);
            });
          }
        }
      }] : []),

      // Hidden field for service coverage name - only for create mode
      ...(!isEditing ? [{
        type: FieldType.text,
        name: 'serviceCoverageName',
        label: '',
        invisible: true,
        value: product?.serviceCoverage?.name || ''
      }] : []),

      // Validity Period
      {
        type: FieldType.number,
        name: 'validityPeriod',
        label: 'Validity Period',
        placeholder: 'Enter validity period',
        validators: [Validators.required, Validators.min(1)],
        value: product?.validityPeriod?.period || ''
      },

      // Validity Time Unit
      {
        type: FieldType.select,
        name: 'validityTimeUnit',
        label: 'Time Unit',
        validators: [Validators.required],
        options: of([
          { value: 'days', displayValue: 'Days' },
          { value: 'weeks', displayValue: 'Weeks' },
          { value: 'months', displayValue: 'Months' },
          { value: 'years', displayValue: 'Years' }
        ]),
        value: product?.validityPeriod?.timeUnit || 'days'
      }
    ]
  };
}

export function getProductCreateRequest(formValue: any): CreateProductRequest {
  return {
    name: formValue.name,
    bundleId: formValue.bundleId,
    serviceCoverage: {
      id: parseInt(formValue.serviceCoverageId),
      name: formValue.serviceCoverageName,
      type: formValue.serviceCoverageType
    },
    validityPeriod: {
      period: parseInt(formValue.validityPeriod),
      timeUnit: formValue.validityTimeUnit
    }
  };
}

export function getProductUpdateRequest(formValue: any): UpdateProductRequest {
  return {
    name: formValue.name,
    description: formValue.description || '',
    validityPeriod: {
      period: parseInt(formValue.validityPeriod),
      timeUnit: formValue.validityTimeUnit
    }
  };
}