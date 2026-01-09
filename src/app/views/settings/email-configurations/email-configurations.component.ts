import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
import {
  WhitelabelTemplatesService,
  AuthService,
  ADMIN_PERMISSION,
  AccountContextService
} from '@shared';
import { Observable } from 'rxjs';
import { TemplateTypeGridComponent } from './template-type-grid/template-type-grid.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '@shared/services/ui/notification.service';
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
        TemplateTypeGridComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailConfigurationsComponent implements OnInit, OnDestroy {
  private readonly templatesService = inject(WhitelabelTemplatesService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly accountContext = inject(AccountContextService);

  public templateTypes$: Observable<string[]>;
  public isAdmin: boolean = false;
  public selectedTemplateType: string | null = null;

  constructor() {
    // React to account changes from global context
    effect(() => {
      const account = this.accountContext.selectedAccount();
      if (account && this.selectedTemplateType) {
        this.selectTemplateType(this.selectedTemplateType);
      }
    });
  }

  ngOnInit(): void {
    this.templateTypes$ = this.templatesService.getTypes();
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

    // Configure account context for this page
    this.accountContext.configure({
      visible: true,
      required: true
    });
  }

  ngOnDestroy(): void {
    this.accountContext.reset();
  }

  get selectedAccountId(): string | null {
    return this.accountContext.selectedAccountId();
  }

  public selectTemplateType(type: string): void {
    if (this.isAdmin && !this.selectedAccountId) {
      this.notification.warning('COMMON.select_account_hint_message');
      return;
    }
    this.selectedTemplateType = type;
  }
}
