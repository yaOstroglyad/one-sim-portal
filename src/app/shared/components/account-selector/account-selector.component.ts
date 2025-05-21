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
import { FormConfig, FieldType } from '../../model';
import { Validators } from '@angular/forms';
import { map, takeUntil } from 'rxjs/operators';
import { FormGeneratorModule } from '../form-generator/form-generator.module';
import { AccountsDataService } from '../../services/accounts-data.service';
import { Subject, of } from 'rxjs';
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
		FormGeneratorModule
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountSelectorComponent implements OnInit, OnDestroy {
	@Input() helperText: string = 'common.selectAccountFirst';
	@Output() accountSelected = new EventEmitter<Account>();

	public accountSelectorConfig: FormConfig;
	public selectedAccountId: string | null = null;
	private accounts: Account[] = [];
	private destroy$ = new Subject<void>();

	constructor(
    private accountsService: AccountsDataService,
    private cdr: ChangeDetectorRef
  ) {}

	ngOnInit(): void {
		this.loadAccounts();
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
				this.initAccountSelector(accounts);
			});
	}

	private initAccountSelector(accounts: Account[]): void {
		this.accountSelectorConfig = {
			fields: [
				{
					type: FieldType.select,
					name: 'ownerAccountId',
					label: 'domains.ownerAccount',
					value: null,
					validators: [Validators.required],
					options: of(accounts.map(account => ({
						value: account.id,
						displayValue: account.name || account.email || account.id
					}))),
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
		this.cdr.markForCheck();
	}

	private onAccountSelected(accountId: string): void {
		this.selectedAccountId = accountId;
		const selectedAccount = this.accounts.find(account => account.id === accountId);
		selectedAccount['isAdmin'] = selectedAccount.name === 'admin';
		if (selectedAccount) {
			this.accountSelected.emit(selectedAccount);
		}
	}
}
