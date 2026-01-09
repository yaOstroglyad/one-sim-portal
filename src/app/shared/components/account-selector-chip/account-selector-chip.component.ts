import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AccountContextService } from '../../services/account-context';
import { Account } from '@shared/models';

@Component({
  standalone: true,
  selector: 'os-account-selector-chip',
  templateUrl: './account-selector-chip.component.html',
  styleUrls: ['./account-selector-chip.component.scss'],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountSelectorChipComponent {
  protected readonly accountContext = inject(AccountContextService);

  onAccountChange(accountId: string): void {
    const account = this.accountContext.accounts().find(a => a.id === accountId);
    if (account) {
      this.accountContext.selectAccount(account);
    }
  }

  getDisplayName(account: Account): string {
    return this.accountContext.getAccountDisplayName(account);
  }
}
