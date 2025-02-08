import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { CompaniesDataService, Company, GenericTableModule, HeaderModule, TableConfig } from '../../shared';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CompaniesTableService } from './companies-table.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ButtonDirective, FormControlDirective } from '@coreui/angular';
import { TranslateModule } from '@ngx-translate/core';
import { IconDirective } from '@coreui/icons-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { EditCompanyComponent } from './edit-company/edit-company.component';
import { debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SendInviteEmailComponent } from './send-invite-email/send-invite-email.component';


@Component({
	selector: 'app-companies',
	templateUrl: './companies.component.html',
	styleUrls: ['./companies.component.scss'],
	standalone: true,
	imports: [
		HeaderModule,
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

	],
	providers: [
		CompaniesTableService,
		CompaniesDataService
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompaniesComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>();
	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<Company[]>;
	public filterForm: FormGroup;

	constructor(
		private cdr: ChangeDetectorRef,
		private tableService: CompaniesTableService,
		private companiesDataService: CompaniesDataService,
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

	public createCompany(): void {
		const dialogRef = this.dialog.open(EditCompanyComponent, {
			width: '650px',
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.companiesDataService.create(result).subscribe(() => {
					this.loadData();
				});
			}
		});
	}

	public openSendEmail(item: any): void {
		const dialogRef = this.dialog.open(SendInviteEmailComponent, {
			width: '400px',
			data: item
		});

		dialogRef.afterClosed().pipe(
			takeUntil(this.unsubscribe$),
			switchMap(email => {
				if (email) {
					return this.companiesDataService.sendInviteEmail(item.id, email).pipe(
						tap(() =>
							this.snackBar.open('Mail sent successfully', null, {
								panelClass: 'app-notification-success',
								duration: 2000
							})
						)
					);
				}
			})
		).subscribe();
	}

	public resetForm(): void {
		this.filterForm.reset();
	}

	private initFormControls(): void {
		this.filterForm = new FormGroup({
			name: new FormControl(null),
			type: new FormControl(null),
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
		type?: string
	} = {page: 0, size: 10}): void {
		this.companiesDataService.paginatedCompanies(params, params.page, params.size)
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
