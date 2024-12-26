import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableConfig, User } from '../../shared';
import { UsersTableService } from './users-table.service';
import { UsersDataService } from './users-data.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserComponent } from './create-user/create-user.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<User[]>;
  public filterForm: FormGroup;

  constructor(
    private cdr: ChangeDetectorRef,
    private tableService: UsersTableService,
    private usersDataService: UsersDataService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  public ngOnInit(): void {
    this.initFormControls();
    this.loadData();
    this.setupFilters();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onPageChange({ page, size }: { page: number; size: number }): void {
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

  public createUser(): void {
    const dialogRef = this.dialog.open(CreateUserComponent, {
      width: '600px',
      data: null
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.unsubscribe$),
      switchMap(user => {
        if (user) {
          return this.usersDataService.createUser(user).pipe(
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

  public resetPassword(user: User): void {
    // Implement password reset logic here
  }

  private initFormControls(): void {
    this.filterForm = new FormGroup({
      search: new FormControl(null)
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
    search?: string;
  } = { page: 0, size: 10 }): void {
    this.usersDataService.paginatedUsers(params, params.page, params.size)
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

  public resetForm(): void {
    this.filterForm.reset();
  }
}
