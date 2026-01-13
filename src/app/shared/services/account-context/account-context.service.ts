import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { take } from 'rxjs';
import { Account } from '@shared/models';
import { AccountContextOptions } from '@shared/models/ui/account-context.model';
import { AccountsDataService } from '../data';
import { AuthService } from '@shared/auth';
import { ADMIN_PERMISSION } from '@shared/constants';

const STORAGE_KEY = 'os_account_context_selected_id';

@Injectable({ providedIn: 'root' })
export class AccountContextService {
  private readonly accountsDataService = inject(AccountsDataService);
  private readonly authService = inject(AuthService);

  // === State Signals ===
  readonly accounts = signal<Account[]>([]);
  readonly selectedAccount = signal<Account | null>(null);
  readonly isLoading = signal<boolean>(false);

  // === Module Configuration Signals ===
  readonly isVisible = signal<boolean>(false);
  readonly isRequired = signal<boolean>(false);
  readonly selectFirstByDefault = signal<boolean>(false);

  // === Computed Signals ===
  readonly selectedAccountId = computed(() => this.selectedAccount()?.id ?? null);
  readonly isEmpty = computed(() => this.accounts().length === 0);
  readonly needsAttention = computed(() =>
    this.isVisible() && this.isRequired() && !this.selectedAccount()
  );

  /**
   * Indicates if the account context is ready for data loading.
   * - Non-admins: always ready (context is dormant)
   * - Admins: ready when accounts are loaded and selection is complete
   */
  readonly isReady = computed(() => {
    // If not initialized (non-admin or not yet configured), ready immediately
    if (!this.initialized) {
      return true;
    }
    // For admins: wait until loading is complete
    if (this.isLoading()) {
      return false;
    }
    // Loading complete - ready to proceed
    // (either account is selected or no accounts available)
    return true;
  });

  // === Internal State ===
  private initialized = false;

  constructor() {
    // Listen for auth changes - clear on logout (uses signal-based permission)
    effect(() => {
      const isAdmin = this.authService.hasPermission$(ADMIN_PERMISSION)();
      if (this.initialized && !isAdmin) {
        this.clearOnLogout();
      }
    });
  }

  /**
   * Configure the account context for the current page/module.
   * Only initializes for admin users.
   */
  configure(options: AccountContextOptions): void {
    if (!this.authService.hasPermission$(ADMIN_PERMISSION)()) {
      return; // Non-admin: remain dormant
    }

    // Set module configuration
    this.isVisible.set(options.visible);
    this.isRequired.set(options.required ?? false);
    this.selectFirstByDefault.set(options.selectFirstByDefault ?? false);

    // Lazy initialization - only load accounts once
    if (!this.initialized) {
      this.loadAccounts();
      this.initialized = true;
    } else {
      // Already initialized, apply auto-select logic if needed
      this.applyAutoSelect();
    }
  }

  /**
   * Reset the context when leaving a page.
   * Clears visibility but preserves account selection.
   */
  reset(): void {
    this.isVisible.set(false);
    this.isRequired.set(false);
    this.selectFirstByDefault.set(false);
  }

  /**
   * Select an account programmatically.
   */
  selectAccount(account: Account): void {
    this.selectedAccount.set(account);
    this.saveToStorage(account.id);
  }

  /**
   * Clear the current selection.
   */
  clearSelection(): void {
    this.selectedAccount.set(null);
    this.clearStorage();
  }

  /**
   * Get display name for an account.
   */
  getAccountDisplayName(account: Account): string {
    return account.name || account.email || account.id;
  }

  // === Private Methods ===

  private loadAccounts(): void {
    this.isLoading.set(true);

    this.accountsDataService.ownerAccounts()
      .pipe(take(1))
      .subscribe({
        next: (accounts) => {
          this.accounts.set(accounts);
          this.isLoading.set(false);
          this.restoreFromStorage();
          this.applyAutoSelect();
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  private applyAutoSelect(): void {
    // Only auto-select if:
    // 1. No current selection
    // 2. selectFirstByDefault is enabled
    // 3. Accounts are available
    if (!this.selectedAccount() && this.selectFirstByDefault() && this.accounts().length > 0) {
      const firstAccount = this.accounts()[0];
      this.selectAccount(firstAccount);
    }
  }

  private saveToStorage(accountId: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, accountId);
    } catch {
      // localStorage might be unavailable
    }
  }

  private restoreFromStorage(): void {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const account = this.accounts().find(a => a.id === savedId);
        if (account) {
          this.selectedAccount.set(account);
        } else {
          // Invalid ID - clear storage
          this.clearStorage();
        }
      }
    } catch {
      // localStorage might be unavailable
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage might be unavailable
    }
  }

  private clearOnLogout(): void {
    this.selectedAccount.set(null);
    this.accounts.set([]);
    this.clearStorage();
    this.reset();
    this.initialized = false;
  }
}
