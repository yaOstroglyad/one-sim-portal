import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	OnDestroy,
	ChangeDetectionStrategy,
	ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { AccountsDataService } from '../../services/accounts-data.service';
import { Subject } from 'rxjs';
import { Account } from '../../model';

@Component({
	selector: 'app-account-selector',
	templateUrl: './account-selector.component.html',
	styleUrls: ['./account-selector.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		TranslateModule,
		MatIconModule,
		MatFormFieldModule,
		MatSelectModule,
		ReactiveFormsModule
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountSelectorComponent implements OnInit, OnDestroy {
	@Input() helperText: string = 'common.selectAccountFirst';
	@Input() defaultAccountName: string | null = null; // New input for default account selection
	@Input() preSelectedAccountId: string | null = null; // New input for pre-selected account ID
	@Input() selectFirstByDefault: boolean = false; // New input for selecting first account by default
	@Output() accountSelected = new EventEmitter<Account>();

	public accountControl = new FormControl<string | null>(null);
	public accounts: Account[] = [];
	public selectedAccountId: string | null = null;
	private destroy$ = new Subject<void>();

	constructor(
		private accountsService: AccountsDataService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadAccounts();
		this.setupAccountListener();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private loadAccounts(): void {
		this.accountsService.ownerAccounts()
			.pipe(takeUntil(this.destroy$))
			.subscribe(accounts => {
				this.accounts = accounts;
				
				// Auto-select account with priority order
				let accountToSelect: Account | undefined = undefined;
				
				// 1. Pre-selected account ID (from navigation)
				if (this.preSelectedAccountId && accounts.length > 0) {
					accountToSelect = accounts.find(account => account.id === this.preSelectedAccountId);
					if (accountToSelect) {
						console.log('[AccountSelector] Auto-selecting pre-selected account:', accountToSelect.name);
					}
				}
				
				// 2. Default account name (search by name)
				if (!accountToSelect && this.defaultAccountName && accounts.length > 0) {
					accountToSelect = accounts.find(account => 
						account.name?.toLowerCase().includes(this.defaultAccountName!.toLowerCase())
					);
					if (accountToSelect) {
						console.log('[AccountSelector] Auto-selecting default account:', accountToSelect.name);
					}
				}
				
				// 3. First account (if selectFirstByDefault is enabled)
				if (!accountToSelect && this.selectFirstByDefault && accounts.length > 0) {
					accountToSelect = accounts[0];
					console.log('[AccountSelector] Auto-selecting first account:', accountToSelect.name);
				}
				
				if (accountToSelect) {
					this.accountControl.setValue(accountToSelect.id, { emitEvent: false });
					this.selectedAccountId = accountToSelect.id;
					// Emit the selection after a short delay to ensure parent component is ready
					setTimeout(() => {
						accountToSelect!['isAdmin'] = accountToSelect!.name === 'admin';
						this.accountSelected.emit(accountToSelect!);
					}, 100);
				}
				
				this.cdr.markForCheck();
			});
	}

	private setupAccountListener(): void {
		this.accountControl.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe(accountId => {
				if (!accountId) return;
				this.onAccountSelected(accountId);
			});
	}

	private onAccountSelected(accountId: string): void {
		this.selectedAccountId = accountId;
		const selectedAccount = this.accounts.find(account => account.id === accountId);
		if (selectedAccount) {
			selectedAccount['isAdmin'] = selectedAccount.name === 'admin';
			this.accountSelected.emit(selectedAccount);
		}
	}

	public getAccountDisplayName(account: Account): string {
		return account.name || account.email || account.id;
	}
}
