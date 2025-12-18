import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import {
  Account,
  WhiteLabelDataService,
  AuthService,
  ADMIN_PERMISSION
} from '@shared';
import { Observable } from 'rxjs';
import { TemplateTypeGridComponent } from './template-type-grid/template-type-grid.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@shared/services/ui/notification.service';
import { AccountSelectorComponent } from '@shared/components/account-selector/account-selector.component';
import { IconDirective } from '@coreui/icons-angular';

@Component({
    standalone: true,
    selector: 'app-email-configurations',
    templateUrl: './email-configurations.component.html',
    styleUrls: ['./email-configurations.component.scss'],
    imports: [
        CommonModule,
        TranslateModule,
        IconDirective,
        TemplateTypeGridComponent,
        AccountSelectorComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailConfigurationsComponent implements OnInit {
  private readonly whiteLabelService = inject(WhiteLabelDataService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  public templateTypes$: Observable<string[]>;
  public isAdmin: boolean = false;
  public selectedAccountId: string | null = null;
  public selectedTemplateType: string | null = null;

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
      this.notification.warning('COMMON.select_account_hint_message');
      return;
    }
    this.selectedTemplateType = type;
  }
}
