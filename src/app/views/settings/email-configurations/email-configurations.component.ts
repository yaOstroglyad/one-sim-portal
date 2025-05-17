import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { WhiteLabelDataService } from '../../../shared';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TemplateTypeGridComponent } from './template-type-grid/template-type-grid.component';
import { AuthService, ADMIN_PERMISSION } from '../../../shared';
import { AccountsDataService } from '../../../shared';
import { FormConfig, FieldType, FormGeneratorModule } from '../../../shared';
import { map } from 'rxjs/operators';
import { Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-email-configurations',
  templateUrl: './email-configurations.component.html',
  styleUrls: ['./email-configurations.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    FormGeneratorModule,
    TranslateModule,
    TemplateTypeGridComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailConfigurationsComponent implements OnInit {
  public templateTypes$: Observable<string[]>;
  public isAdmin: boolean = false;
  public selectedAccountId: string | null = null;
  public accountSelectorConfig: FormConfig;
  public selectedTemplateType: string | null = null;

  constructor(
    private whiteLabelService: WhiteLabelDataService,
    private authService: AuthService,
    private accountsService: AccountsDataService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.templateTypes$ = this.whiteLabelService.emailTemplateTypes();
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
    if (this.isAdmin) {
      this.initAccountSelector();
    }
  }

  public onAccountSelected(accountId: string): void {
    this.selectedAccountId = accountId;
    if (this.selectedTemplateType) {
      this.selectTemplateType(this.selectedTemplateType);
    }
  }

  public selectTemplateType(type: string): void {
    if (this.isAdmin && !this.selectedAccountId) {
      this.snackBar.open('Please select an account first', null, {
        duration: 3000,
        panelClass: 'app-notification-warning'
      });
      return;
    }
    this.selectedTemplateType = type;
  }

  private initAccountSelector(): void {
    this.accountSelectorConfig = {
      fields: [
        {
          type: FieldType.select,
          name: 'ownerAccountId',
          label: 'domains.ownerAccount',
          value: null,
          validators: [Validators.required],
          options: this.accountsService.ownerAccounts().pipe(
            map(accounts => accounts.map(account => ({
              value: account.id,
              displayValue: account.name || account.email || account.id
            })))
          ),
          multiple: false,
          inputEvent: (event: any) => {
            if (!event || !event.value) {
              return;
            }
            this.onAccountSelected(event.value);
          }
        }
      ]
    };
  }
}
