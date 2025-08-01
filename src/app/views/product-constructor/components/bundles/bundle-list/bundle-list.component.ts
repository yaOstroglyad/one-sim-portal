import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { GenericRightPanelComponent, PanelAction } from '../../../../../shared/components/generic-right-panel/generic-right-panel.component';
import { BundleFormComponent } from '../bundle-form/bundle-form.component';
import { BundleDetailsComponent } from '../bundle-details/bundle-details.component';
import { GenericTableModule, HeaderModule, TableConfig, TemplateType, DeleteConfirmationComponent } from '../../../../../shared';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ButtonDirective, FormControlDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { BundleService } from '../../../services';
import { MobileBundle } from '../../../models';
import { BundlesTableService } from '../bundles-table.service';

@Component({
  selector: 'app-bundle-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    GenericRightPanelComponent,
    BundleFormComponent,
    BundleDetailsComponent,
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
  providers: [BundlesTableService],
  templateUrl: './bundle-list.component.html',
  styleUrls: ['./bundle-list.component.scss']
})
export class BundleListComponent implements OnInit {

  dataList$: Observable<any[]>;
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
  selectedBundle: MobileBundle | null = null;
  selectedBundleDetails: MobileBundle | null = null;

  // Panel actions
  detailsPanelActions: PanelAction[] = [];

  constructor(
    private bundleService: BundleService,
    private tableService: BundlesTableService
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
      switchMap(() => this.bundleService.getBundles()),
      map(apiData => apiData.map(bundle => ({
        ...bundle,
        dataTotal: this.calculateTotalData(bundle.usageUnits),
        usageUnitsDisplay: this.formatUsageUnits(bundle.usageUnits)
      }))),
      tap(data => {
        this.tableService.updateTableData(data);
      }),
      catchError(error => {
        console.error('Error loading bundles:', error);
        return of([]);
      })
    );
  }

  private calculateTotalData(usageUnits: any[]): string {
    const dataUnits = usageUnits.filter(unit => unit.type === 'data');
    if (dataUnits.length === 0) return 'No data';
    
    const totalBytes = dataUnits.reduce((total, unit) => {
      const bytes = this.convertToBytes(unit.value, unit.unitType);
      return total + bytes;
    }, 0);

    return this.formatBytes(totalBytes);
  }

  private convertToBytes(value: number, unitType: string): number {
    switch (unitType.toLowerCase()) {
      case 'byte': return value;
      case 'kb': return value * 1024;
      case 'mb': return value * 1024 * 1024;
      case 'gb': return value * 1024 * 1024 * 1024;
      case 'tb': return value * 1024 * 1024 * 1024 * 1024;
      default: return value; // assume bytes
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatUsageUnits(usageUnits: any[]): string {
    return usageUnits.map(unit => {
      const typeDisplay = unit.type.charAt(0).toUpperCase() + unit.type.slice(1);
      return `${unit.value} ${unit.unitType} ${typeDisplay}`;
    }).join(', ');
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
        label: 'Edit Bundle',
        handler: () => this.onEditFromDetails()
      }
    ];
  }

  onCreateNew(): void {
    this.selectedBundle = null;
    this.showCreatePanel = true;
  }

  onViewDetails(bundle: MobileBundle): void {
    this.selectedBundle = bundle;
    // Mock bundle details data until API is ready
    this.selectedBundleDetails = { ...bundle };
    this.showDetailsPanel = true;
  }

  onEdit(bundle: MobileBundle): void {
    this.selectedBundle = bundle;
    this.showEditPanel = true;
  }

  onEditFromDetails(): void {
    this.showDetailsPanel = false;
    this.showEditPanel = true;
  }

  onDelete(bundle: MobileBundle): void {
    this.selectedBundle = bundle;
    this.showDeletePanel = true;
  }

  onConfirmDelete(): void {
    if (this.selectedBundle) {
      this.bundleService.deleteBundle(this.selectedBundle.id).subscribe({
        next: () => {
          this.showDeletePanel = false;
          this.selectedBundle = null;
          this.onRefresh();
        },
        error: (error) => {
          console.error('Error deleting bundle:', error);
        }
      });
    }
  }

  onPanelClose(): void {
    this.showCreatePanel = false;
    this.showEditPanel = false;
    this.showDeletePanel = false;
    this.showDetailsPanel = false;
    this.selectedBundle = null;
    this.selectedBundleDetails = null;
  }

  onBundleSaved(): void {
    this.onPanelClose();
    this.onRefresh();
  }

  getUsageUnitColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'data': return 'primary';
      case 'voice': return 'success';
      case 'sms': return 'info';
      default: return 'medium';
    }
  }

  getUsageUnitIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'data': return 'cil-data-transfer-down';
      case 'voice': return 'cil-phone';
      case 'sms': return 'cil-envelope-closed';
      default: return 'cil-applications';
    }
  }
}