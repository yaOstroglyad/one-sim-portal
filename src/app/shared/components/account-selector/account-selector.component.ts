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
