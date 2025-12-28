import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, TemplateRef, OnChanges, SimpleChanges, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import {
  EmailTemplate,
  WhitelabelTemplatesService,
  TableConfig,
  GenericTableComponent
} from '@shared';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TemplateTypeGridService } from './template-type-grid.service';
import { EditEmailTemplateComponent } from '../edit-email-template/edit-email-template.component';
import { NotificationService } from '@shared/services/ui/notification.service';

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

  private readonly templatesService = inject(WhitelabelTemplatesService);
  private readonly tableService = inject(TemplateTypeGridService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<EmailTemplate[]>;

  private reloadTrigger$ = new BehaviorSubject<void>(undefined);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.tableService.isPrimaryTemplate = this.isPrimaryTemplate;
    this.tableConfig$ = this.tableService.getTableConfig();

    this.dataList$ = this.reloadTrigger$.pipe(
      switchMap(() =>
        this.templatesService.getAllByType(this.type, this.ownerAccountId)
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
        this.templatesService.create(result).subscribe(() => {
          this.reloadTrigger$.next();
          this.notification.success('notifications.templateCreated');
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
        this.templatesService.update(result).subscribe(() => {
          this.reloadTrigger$.next();
          this.notification.success('notifications.templateUpdated');
        });
      }
    });
  }

  public setAsPrimary(template: EmailTemplate): void {
    this.templatesService.setPrimary(template.id).subscribe(() => {
      this.reloadTrigger$.next();
      this.notification.success('notifications.changesSaved');
    });
  }
}
