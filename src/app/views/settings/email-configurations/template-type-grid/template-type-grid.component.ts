import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, TemplateRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import {
  EmailTemplate,
  WhiteLabelDataService,
  TableConfig,
  GenericTableComponent
} from '@shared';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TemplateTypeGridService } from './template-type-grid.service';
import { EditEmailTemplateComponent } from '../edit-email-template/edit-email-template.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import {
  BadgeComponent,
} from '@coreui/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    standalone: true,
    selector: 'app-template-type-grid',
    templateUrl: './template-type-grid.component.html',
    providers: [TemplateTypeGridService],
    imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    TranslateModule,
    GenericTableComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    BadgeComponent
],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateTypeGridComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('isPrimaryTemplate', { static: true }) isPrimaryTemplate: TemplateRef<any>;
  @Input() type: string;
  @Input() ownerAccountId?: string;

  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<EmailTemplate[]>;

  private reloadTrigger$ = new BehaviorSubject<void>(undefined);
  private destroy$ = new Subject<void>();

  constructor(
    private whiteLabelService: WhiteLabelDataService,
    private tableService: TemplateTypeGridService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.tableService.isPrimaryTemplate = this.isPrimaryTemplate;
    this.tableConfig$ = this.tableService.getTableConfig();

    this.dataList$ = this.reloadTrigger$.pipe(
      switchMap(() =>
        this.whiteLabelService.allEmailTemplatesByType(this.type, this.ownerAccountId)
      ),
      takeUntil(this.destroy$)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.type && !changes.type.firstChange) ||
      (changes.ownerAccountId && !changes.ownerAccountId.firstChange)) {
      this.reloadTrigger$.next();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public createTemplate(): void {
    const dialogRef = this.dialog.open(EditEmailTemplateComponent, {
      width: '600px',
      data: {
        type: this.type,
        ownerAccountId: this.ownerAccountId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.whiteLabelService.createEmailTemplateIntegration(result).subscribe(() => {
          this.reloadTrigger$.next();
          this.snackBar.open('Template created successfully', null, {
            duration: 2000,
            panelClass: 'app-notification-success'
          });
        });
      }
    });
  }

  public editTemplate(template: EmailTemplate): void {
    const dialogRef = this.dialog.open(EditEmailTemplateComponent, {
      width: '600px',
      data: {
        template,
        type: this.type,
        ownerAccountId: this.ownerAccountId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.whiteLabelService.updateEmailTemplateIntegration(result).subscribe(() => {
          this.reloadTrigger$.next();
          this.snackBar.open('Template updated successfully', null, {
            duration: 2000,
            panelClass: 'app-notification-success'
          });
        });
      }
    });
  }

  public setAsPrimary(template: EmailTemplate): void {
    this.whiteLabelService.setPrimaryEmailTemplateIntegration(template.id).subscribe(() => {
      this.reloadTrigger$.next();
      this.snackBar.open('Template set as primary successfully', null, {
        duration: 2000,
        panelClass: 'app-notification-success'
      });
    });
  }
}
