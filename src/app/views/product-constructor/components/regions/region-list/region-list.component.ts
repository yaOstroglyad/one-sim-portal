import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { GenericRightPanelComponent, PanelAction } from '../../../../../shared/components/generic-right-panel/generic-right-panel.component';
import { RegionFormComponent } from '../region-form/region-form.component';
import { RegionDetailsComponent } from '../region-details/region-details.component';
import { GenericTableModule, HeaderModule, TableConfig, DeleteConfirmationComponent } from '../../../../../shared';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ButtonDirective, FormControlDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { RegionService } from '../../../services';
import { Region, RegionSummary } from '../../../models';
import { CountryService, Country } from '../../../../../shared';
import { RegionsTableService } from '../regions-table.service';

@Component({
  selector: 'app-region-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    GenericRightPanelComponent,
    RegionFormComponent,
    RegionDetailsComponent,
    DeleteConfirmationComponent,
    GenericTableModule,
    HeaderModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    ButtonDirective,
    FormControlDirective,
    IconDirective
  ],
  providers: [RegionsTableService],
  templateUrl: './region-list.component.html',
  styleUrls: ['./region-list.component.scss']
})
export class RegionListComponent implements OnInit {

  dataList$: Observable<RegionSummary[]>;
  countries$: Observable<Country[]>;
  tableConfig$: BehaviorSubject<TableConfig>;
  filterForm: FormGroup;
  loading = true;
  error = false;

  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  // Panel states
  showCreatePanel = false;
  showEditPanel = false;
  showDeletePanel = false;
  showDetailsPanel = false;
  selectedRegion: RegionSummary | null = null;
  selectedRegionDetails: Region | null = null;

  // Panel actions
  detailsPanelActions: PanelAction[] = [];

  constructor(
    private regionService: RegionService,
    private countryService: CountryService,
    private tableService: RegionsTableService
  ) {
    // Initialize form
    this.filterForm = new FormGroup({
      name: new FormControl('')
    });

    // Get table config from service
    this.tableConfig$ = this.tableService.getTableConfig();

    // Initialize panel actions
    this.initializePanelActions();

    // Initialize dataList$ immediately
    this.loadData();
    // Trigger initial load
    this.refreshTrigger$.next();
  }

  ngOnInit(): void {
    // Data already loaded in constructor
  }

  private loadData(): void {
    this.dataList$ = this.refreshTrigger$.pipe(
      switchMap(() => this.regionService.getRegions()),
      map(apiData => apiData.map(region => ({
        ...region,
        countryCount: this.getCountryCountForRegion(region.id)
      }))),
      tap(data => {
        this.tableService.updateTableData(data);
      }),
      catchError(error => {
        console.error('Error loading regions:', error);
        return of([]);
      })
    );
    this.countries$ = this.countryService.getCountries().pipe(
      catchError(error => {
        console.error('Error loading countries:', error);
        return of([]);
      })
    );
  }

  onRefresh(): void {
    this.refreshTrigger$.next();
  }

  resetForm(): void {
    this.filterForm.reset();
    this.onRefresh();
  }

  private initializePanelActions(): void {
    this.detailsPanelActions = [
      {
        id: 'edit',
        icon: 'cilPencil',
        label: 'Edit Region',
        handler: () => this.onEditFromDetails()
      }
    ];
  }

  onCreateNew(): void {
    this.selectedRegion = null;
    this.showCreatePanel = true;
  }

  onViewDetails(region: RegionSummary): void {
    this.selectedRegion = region;

    // Mock region details data until API is ready
    const mockRegionDetails: Region = {
      id: region.id,
      name: region.name,
      countries: region.id === 1 ? [
        { id: 1, name: 'Germany', isoAlphaCode2: 'DE', isoAlphaCode3: 'DEU', dialingCode: '+49' },
        { id: 2, name: 'France', isoAlphaCode2: 'FR', isoAlphaCode3: 'FRA', dialingCode: '+33' },
        { id: 5, name: 'Italy', isoAlphaCode2: 'IT', isoAlphaCode3: 'ITA', dialingCode: '+39' },
        { id: 6, name: 'Spain', isoAlphaCode2: 'ES', isoAlphaCode3: 'ESP', dialingCode: '+34' },
        { id: 7, name: 'Netherlands', isoAlphaCode2: 'NL', isoAlphaCode3: 'NLD', dialingCode: '+31' }
      ] : [
        { id: 3, name: 'United States', isoAlphaCode2: 'US', isoAlphaCode3: 'USA', dialingCode: '+1' },
        { id: 4, name: 'Canada', isoAlphaCode2: 'CA', isoAlphaCode3: 'CAN', dialingCode: '+1' },
        { id: 8, name: 'Mexico', isoAlphaCode2: 'MX', isoAlphaCode3: 'MEX', dialingCode: '+52' }
      ]
    };

    this.selectedRegionDetails = mockRegionDetails;
    this.showDetailsPanel = true;

    // Uncomment when API is ready:
    // this.regionService.getRegion(region.id).subscribe({
    //   next: (details) => {
    //     this.selectedRegionDetails = details;
    //     this.showDetailsPanel = true;
    //   },
    //   error: (error) => {
    //     console.error('Error loading region details:', error);
    //   }
    // });
  }

  onEdit(region: RegionSummary): void {
    this.selectedRegion = region;
    this.showEditPanel = true;
  }

  onEditFromDetails(): void {
    this.showDetailsPanel = false;
    this.showEditPanel = true;
  }


  onDelete(region: RegionSummary): void {
    this.selectedRegion = region;
    this.showDeletePanel = true;
  }

  onConfirmDelete(): void {
    if (this.selectedRegion) {
      this.regionService.deleteRegion(this.selectedRegion.id).subscribe({
        next: () => {
          this.showDeletePanel = false;
          this.selectedRegion = null;
          this.onRefresh();
        },
        error: (error) => {
          console.error('Error deleting region:', error);
        }
      });
    }
  }

  onPanelClose(): void {
    this.showCreatePanel = false;
    this.showEditPanel = false;
    this.showDeletePanel = false;
    this.showDetailsPanel = false;
    this.selectedRegion = null;
    this.selectedRegionDetails = null;
  }

  onRegionSaved(): void {
    this.onPanelClose();
    this.onRefresh();
  }

  /**
   * Hardcoded mapping for countryCount since backend doesn't provide this field
   * TODO: Remove when backend API includes countryCount in response
   */
  private getCountryCountForRegion(regionId: number): number {
    // Hardcoded mapping based on expected data
    const countryCountMapping: Record<number, number> = {
      1073741824: 25, // If API returns this specific ID
      1: 25,          // Europe - fallback mapping
      2: 3,           // North America - fallback mapping
      3: 12,          // Asia Pacific - fallback mapping
      4: 8,           // Middle East - fallback mapping
      5: 15,          // Latin America - fallback mapping
      6: 5,           // Africa - fallback mapping
    };

    // Return mapped count or default to 1 if region not found
    return countryCountMapping[regionId] || 1;
  }
}
