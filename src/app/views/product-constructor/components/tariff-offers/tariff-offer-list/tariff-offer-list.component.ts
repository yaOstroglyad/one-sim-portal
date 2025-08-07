import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, take, of, Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { FormControlDirective } from '@coreui/angular';
import { BadgeComponent } from '@coreui/angular';

import { TariffOffer, ActiveTariffOffer } from '../../../models/tariff-offer.model';
import { TariffOffersTableService } from '../tariff-offers-table.service';
import { TariffOfferService } from '../../../../../shared/services/tariff-offer.service';
import { GenericTableModule, HeaderModule, DeleteConfirmationComponent } from '../../../../../shared';
import { GenericRightPanelComponent, PanelAction } from '../../../../../shared/components/generic-right-panel/generic-right-panel.component';
import { TariffOfferFormComponent } from '../tariff-offer-form/tariff-offer-form.component';
import { TariffOfferDetailsComponent } from '../tariff-offer-details/tariff-offer-details.component';

@Component({
  selector: 'app-tariff-offer-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    ButtonDirective,
    IconDirective,
    FormControlDirective,
    BadgeComponent,
    GenericTableModule,
    HeaderModule,
    GenericRightPanelComponent,
    DeleteConfirmationComponent,
    TariffOfferFormComponent,
    TariffOfferDetailsComponent
  ],
  providers: [TariffOffersTableService],
  templateUrl: './tariff-offer-list.component.html',
  styleUrls: ['./tariff-offer-list.component.scss']
})
export class TariffOfferListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('priceTemplate', { static: true }) priceTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;

  filterForm: FormGroup;
  tableConfig$!: Observable<any>;
  dataList$: Observable<ActiveTariffOffer[]>;
  private unsubscribe$ = new Subject<void>();

  // Panel states
  showCreatePanel = false;
  showEditPanel = false;
  showDetailsPanel = false;
  showDeletePanel = false;
  
  selectedTariffOffer: TariffOffer | null = null;
  selectedTariffOfferDetails: TariffOffer | null = null;

  detailsPanelActions: PanelAction[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: 'edit',
      handler: () => this.onEdit(this.selectedTariffOfferDetails!)
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private translateService: TranslateService,
    private tableService: TariffOffersTableService,
    private tariffOfferService: TariffOfferService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadTariffOffers();
  }

  ngAfterViewInit(): void {
    this.tableService.setTemplates(this.priceTemplate, this.statusTemplate);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      productName: [''],
      providerProductName: [''],
      currency: ['']
    });
  }

  loadTariffOffers(): void {
    this.tariffOfferService.getActiveTariffOffers()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.tableConfig$ = this.tableService.tableConfig$;
        this.dataList$ = of(data);
        this.cdr.markForCheck();
      });
  }

  onRefresh(): void {
    this.loadTariffOffers();
  }

  onPageChange(event: any): void {
    console.log('Page change:', event);
    this.onRefresh();
  }

  onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableService.updateColumnVisibility(selectedColumns);
  }

  resetForm(): void {
    this.filterForm.reset();
    this.onRefresh();
  }

  onCreateNew(): void {
    this.selectedTariffOffer = null;
    this.showCreatePanel = true;
  }

  onEdit(tariffOffer: TariffOffer): void {
    this.selectedTariffOffer = tariffOffer;
    this.showEditPanel = true;
  }

  onViewDetails(tariffOffer: TariffOffer): void {
    this.tariffOfferService.getTariffOfferById(tariffOffer.id)
      .pipe(take(1))
      .subscribe({
        next: (details) => {
          this.selectedTariffOfferDetails = details;
          this.showDetailsPanel = true;
        },
        error: (error) => {
          console.error('Error loading tariff offer details:', error);
        }
      });
  }

  onDelete(tariffOffer: TariffOffer): void {
    this.selectedTariffOffer = tariffOffer;
    this.showDeletePanel = true;
  }

  onConfirmDelete(): void {
    if (this.selectedTariffOffer) {
      this.tariffOfferService.deleteTariffOffer(this.selectedTariffOffer.id)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.onPanelClose();
            this.onRefresh();
          },
          error: (error) => {
            console.error('Error deleting tariff offer:', error);
          }
        });
    }
  }

  onTariffOfferSaved(): void {
    this.onPanelClose();
    this.onRefresh();
  }

  onPanelClose(): void {
    this.showCreatePanel = false;
    this.showEditPanel = false;
    this.showDetailsPanel = false;
    this.showDeletePanel = false;
    this.selectedTariffOffer = null;
    this.selectedTariffOfferDetails = null;
  }
}