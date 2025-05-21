import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Account, permissionGuard, WhiteLabelDataService } from '../../../shared';
import { Observable } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { TemplateTypeGridComponent } from './template-type-grid/template-type-grid.component';
import { AuthService, ADMIN_PERMISSION } from '../../../shared';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountSelectorComponent } from '../../../shared/components/account-selector/account-selector.component';

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
    TranslateModule,
    TemplateTypeGridComponent,
    AccountSelectorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailConfigurationsComponent implements OnInit {
  public templateTypes$: Observable<string[]>;
  public isAdmin: boolean = false;
  public selectedAccountId: string | null = null;
  public selectedTemplateType: string | null = null;

  constructor(
    private whiteLabelService: WhiteLabelDataService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.templateTypes$ = this.whiteLabelService.emailTemplateTypes();
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  public onAccountSelected(account: Account): void {
    this.selectedAccountId = account.id;
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
}
