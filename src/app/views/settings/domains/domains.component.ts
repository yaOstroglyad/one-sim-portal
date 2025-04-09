import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BadgeComponent, ButtonDirective, FormControlDirective } from '@coreui/angular';
import { TranslateModule } from '@ngx-translate/core';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DomainsTableService } from './domains-table.service';
import { DomainsDataService } from '../../../shared/services/domains-data.service';
import { Domain } from '../../../shared/model/domain';
import { GenericTableModule, HeaderModule, TableConfig } from '../../../shared';
import { EditDomainNameComponent } from './edit-domain-name/edit-domain-name.component';
import { CreateDomainComponent } from './create-domain/create-domain.component';

@Component({
  selector: 'app-domains',
  templateUrl: './domains.component.html',
  styleUrls: ['./domains.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormControlDirective,
    TranslateModule,
    ButtonDirective,
    IconDirective,
    GenericTableModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    HeaderModule,
    BadgeComponent
  ],
  providers: [
    DomainsTableService,
    DomainsDataService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DomainsComponent implements OnInit, OnDestroy {
  @ViewChild('activeTemplate') activeTemplate: TemplateRef<any>;

  private unsubscribe$ = new Subject<void>();
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<Domain[]>;
  public filterForm: FormGroup;

  constructor(
    private cdr: ChangeDetectorRef,
    private tableService: DomainsTableService,
    private domainsDataService: DomainsDataService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
  }

  public ngOnInit(): void {
    this.initFormControls();
    this.loadData();
    this.setupFilters();
  }

  public ngOnDestroy(): void {
    this.dialog.closeAll();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onPageChange({page, size}: { page: number; size: number }): void {
    this.loadData({
      page,
      size,
      ...this.filterForm.getRawValue()
    });
  }

  public applyFilter(): void {
    const params = {
      page: 0,
      size: 10,
      ...this.filterForm.getRawValue()
    };
    this.loadData(params);
  }

  public onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableService.updateColumnVisibility(selectedColumns);
  }

  public createDomain(): void {
    this.dialog.closeAll();

    const dialogRef = this.dialog.open(CreateDomainComponent, {
      width: '650px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.domainsDataService.create(result).subscribe(() => {
          this.loadData();
          this.snackBar.open('Domain created successfully', null, {
            panelClass: 'app-notification-success',
            duration: 3000
          });
        });
      }
    });
  }

  public editDomainName(domain: Domain): void {
    this.dialog.closeAll();

    const dialogRef = this.dialog.open(EditDomainNameComponent, {
      width: '650px',
      data: domain
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.domainsDataService.updateDomainName(result).subscribe(() => {
          this.loadData();
          this.snackBar.open('Domain name updated successfully', null, {
            panelClass: 'app-notification-success',
            duration: 3000
          });
        });
      }
    });
  }

  public changeDomainState(domain: Domain): void {
    this.domainsDataService.changeDomainState(domain.id, !domain.active).subscribe(() => {
      this.loadData();
      this.snackBar.open(`Domain ${domain.active ? 'deactivated' : 'activated'} successfully`, null, {
        panelClass: 'app-notification-success',
        duration: 3000
      });
    });
  }

  public resetForm(): void {
    this.filterForm.reset();
  }

  private initFormControls(): void {
    this.filterForm = new FormGroup({
      name: new FormControl(null),
      applicationType: new FormControl(null),
    });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.applyFilter();
    });
  }

  private loadData(params: {
    page: number;
    size: number;
    name?: string;
    applicationType?: string
  } = {page: 0, size: 10}): void {
    this.domainsDataService.paginatedDomains(params, params.page, params.size)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.tableService.updateConfigData(data?.totalPages || 20);
        this.tableConfig$ = this.tableService.getTableConfig();
        this.dataList$ = of(data.content);
        this.cdr.detectChanges();
        if (this.filterForm.dirty) {
          this.snackBar.open(`Search results loaded successfully. Total elements: ${data.totalElements}`, null, {
            panelClass: 'app-notification-success',
            duration: 1000
          });
        }
      });
  }
}
