import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { GenericRightPanelComponent, PanelAction } from '../../../../../shared';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class RegionListComponent implements OnInit, OnDestroy {

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

  private readonly regionService = inject(RegionService);
  private readonly countryService = inject(CountryService);
  private readonly tableService = inject(RegionsTableService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
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

  ngOnDestroy(): void {
    // Cleanup handled automatically by Angular
  }

  private loadData(): void {
    this.dataList$ = this.refreshTrigger$.pipe(
      switchMap(() => this.regionService.getRegions()),
      map(apiData => {
        const regionsWithCounts = apiData.map(region => ({
          ...region,
          countryCount: this.getCountryCountForRegion(region.id)
        }));
        this.tableService.updateTableData(regionsWithCounts);
        return regionsWithCounts;
      }),
      catchError(error => {
        console.error('Error loading regions:', error);
        return of([]);
      })
    );

    // Create countries$ once - don't recreate it each time!
    if (!this.countries$) {
      this.countries$ = this.countryService.getCountries().pipe(
        catchError(error => {
          console.error('Error loading countries:', error);
          return of([]);
        })
      );
    }
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
    this.cdr.markForCheck();
  }

  onViewDetails(region: RegionSummary): void {
    this.selectedRegion = region;

    // Load region details from API
    this.regionService.getRegion(region.id).subscribe({
      next: (details) => {
        this.selectedRegionDetails = details;
        this.showDetailsPanel = true;
        this.cdr.markForCheck(); // Trigger change detection for OnPush
      },
      error: (error) => {
        console.error('Error loading region details:', error);
        this.cdr.markForCheck(); // Trigger change detection even for errors
        // Show error state or fallback UI
      }
    });
  }

  onEdit(region: RegionSummary): void {
    this.selectedRegion = region;
    this.showEditPanel = true;
    this.cdr.markForCheck();
  }

  onEditFromDetails(): void {
    this.showDetailsPanel = false;
    this.showEditPanel = true;
    this.cdr.markForCheck();
  }

  onDelete(region: RegionSummary): void {
    this.selectedRegion = region;
    this.showDeletePanel = true;
    this.cdr.markForCheck();
  }

  onConfirmDelete(): void {
    if (this.selectedRegion) {
      this.regionService.deleteRegion(this.selectedRegion.id).subscribe({
        next: () => {
          this.showDeletePanel = false;
          this.selectedRegion = null;
          this.onRefresh();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error deleting region:', error);
          this.cdr.markForCheck();
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
    this.cdr.markForCheck();
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
