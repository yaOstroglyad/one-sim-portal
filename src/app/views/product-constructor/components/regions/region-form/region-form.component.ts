import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormGeneratorComponent, FormConfig } from '../../../../../shared';
import { RegionService } from '../../../services';
import { RegionSummary, Country } from '../../../models';
import { getRegionFormConfig, getRegionCreateRequest, getRegionUpdateRequest } from './region-form.utils';

@Component({
  selector: 'app-region-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormGeneratorComponent
  ],
  template: `
    <div class="region-form">
      <app-form-generator 
        [config]="formConfig" 
        (formChanges)="onFormChanges($event)">
      </app-form-generator>
    </div>
  `,
  styleUrls: ['./region-form.component.scss']
})
export class RegionFormComponent implements OnInit, OnChanges {
  @Input() region: RegionSummary | null = null;
  @Input() countries: Country[] = [];
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  formConfig: FormConfig;
  regionForm: FormGroup; // For backward compatibility with region-list
  loading = false;
  private initialFormValues: any = null;

  constructor(private regionService: RegionService) {}

  ngOnInit(): void {
    this.formConfig = getRegionFormConfig(this.countries, this.region);
    this.loadRegionDataIfNeeded();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countries'] && !changes['countries'].firstChange) {
      // Reinitialize form config when countries change
      this.formConfig = getRegionFormConfig(this.countries, this.region);
    }
    
    if (changes['region'] && !changes['region'].firstChange) {
      // Only load region data if region input actually changed (not on first change)
      this.loadRegionDataIfNeeded();
    }
  }

  private loadRegionDataIfNeeded(): void {
    if (this.region && typeof this.regionService.getRegion === 'function') {
      // Load existing countries for this region
      this.regionService.getRegion(this.region.id).subscribe({
        next: (regionDetails) => {
          const countryIds = regionDetails.countries?.map(c => c.id) || [];
          // Update form with existing data when form is ready
          this.updateFormWithRegionData(countryIds);
        },
        error: (error) => {
          console.error('Error loading region details:', error);
          // Set form with basic data even if detail loading fails
          this.updateFormWithRegionData([]);
        }
      });
    }
  }

  private updateFormWithRegionData(countryIds: number[]): void {
    // Wait for form to be available or set initial values
    if (this.regionForm) {
      this.regionForm.patchValue({
        name: this.region?.name || '',
        countryIds: countryIds
      });
    } else {
      // Store values to set when form becomes available
      this.initialFormValues = {
        name: this.region?.name || '',
        countryIds: countryIds
      };
    }
  }

  get isEditing(): boolean {
    return !!this.region;
  }

  onFormChanges(form: FormGroup): void {
    this.regionForm = form; // For backward compatibility
    
    // Apply initial values if they were stored before form was ready
    if (this.initialFormValues && form) {
      form.patchValue(this.initialFormValues);
      this.initialFormValues = null; // Clear after applying
    }
  }

  onSubmit(): void {
    if (!this.regionForm?.valid) return;

    this.loading = true;
    const formValue = this.regionForm.value;
    
    const request = this.isEditing
      ? getRegionUpdateRequest(formValue)
      : getRegionCreateRequest(formValue);

    const operation$ = this.isEditing
      ? this.regionService.updateRegion(this.region!.id, request)
      : this.regionService.createRegion(request);

    operation$.subscribe({
      next: () => {
        this.loading = false;
        this.save.emit();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error saving region:', error);
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}