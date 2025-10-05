import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SmartFilterConfig,
  SearchableSelectOption,
  CompaniesDataService,
  VALUE_MAPPER_TYPES
} from '../../../../shared';

// Constants
export const USERS_CONFIG = {
  DEFAULT_PAGE_SIZE: 15,
  FILTER_DEBOUNCE_TIME: 700,
  NOTIFICATION_DURATION: 2000,
  SEARCH_NOTIFICATION_DURATION: 1000
} as const;

// User Types
export const USER_TYPES = {
  CORPORATE: 'CORPORATE',
  PRIVATE: 'PRIVATE'
} as const;

export const DEFAULT_USER_TYPE = USER_TYPES.CORPORATE;

// Filter form configuration
export interface UsersFilterParams {
  page: number;
  size: number;
  searchQuery?: string;
  companyAccountId?: string;
  type?: string;
}

// Form creation utilities
export class UsersFormUtils {
  static createFilterForm(): FormGroup {
    return new FormGroup({
      searchQuery: new FormControl(null),
      companyAccountId: new FormControl(null),
      type: new FormControl(DEFAULT_USER_TYPE)
    });
  }

  static createFilterParams(formValue: any, page = 0, size: number = USERS_CONFIG.DEFAULT_PAGE_SIZE): UsersFilterParams {
    const params: UsersFilterParams = {
      page,
      size
    };

    // Only add parameters that have values
    if (formValue.searchQuery) {
      params.searchQuery = formValue.searchQuery;
    }
    if (formValue.companyAccountId) {
      params.companyAccountId = formValue.companyAccountId;
    }
    if (formValue.type) {
      params.type = formValue.type;
    }

    return params;
  }
}

// Smart filter configuration
export class UsersSmartFilterConfig {
  static create(companiesDataService: CompaniesDataService, isAdmin: boolean = false): SmartFilterConfig {
    return {
      threshold: isAdmin ? 2 : 1, // Switch to advanced mode when > threshold filters
      maxVisibleChips: 3, // Show maximum 3 chips
      services: {
        companiesService: companiesDataService
      },
      fields: [
        ...(isAdmin ? [{
          key: 'companyAccountId',
          label: 'customer.company', // Using existing translation
          valueMapper: {
            type: VALUE_MAPPER_TYPES.OBSERVABLE,
            serviceKey: 'companiesService',
            methodName: 'list',
            valueField: 'name',
            keyField: 'accountId',
            cacheKey: 'companies-list'
          },
          chipConfig: {
            color: 'warning',
            priority: 1,
            tooltip: (_value: any, displayValue: string) =>
              `Filter by company: ${displayValue}`
          }
        }] : []),
        {
          key: 'searchQuery',
          label: 'common.search', // Using common translation
          chipConfig: {
            color: 'primary',
            priority: 2
          }
        },
        {
          key: 'type',
          label: 'users.type', // Using users translation
          defaultValue: DEFAULT_USER_TYPE,
          chipConfig: {
            color: 'info',
            priority: 3
          }
        },
      ],
      globalSettings: {
        autoApply: false, // Don't auto-apply (using debounce)
        persistFilters: false, // Don't save filters
        resetToDefaults: false, // Full reset on clear
        debounceTime: USERS_CONFIG.FILTER_DEBOUNCE_TIME // Use the same debounce time
      }
    };
  }
}

// Company options utilities
export class UsersCompanyUtils {
  static createCompanyOptions(companiesDataService: CompaniesDataService): Observable<SearchableSelectOption[]> {
    return companiesDataService.list().pipe(
      map(companies => {
        if (!companies || !Array.isArray(companies)) {
          return [];
        }
        return companies.map(company => ({
          value: company.accountId,
          label: company.name,
          data: company
        } as SearchableSelectOption));
      })
    );
  }
}

// User type options
export class UsersTypeUtils {
  static createUserTypeOptions(types: string[]): SearchableSelectOption[] {
    return types.map(type => ({
      value: type,
      label: this.formatTypeLabel(type)
    }));
  }

  private static formatTypeLabel(type: string): string {
    // Convert CORPORATE -> Corporate, PRIVATE -> Private, etc.
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }
}

// Notification utilities
export class UsersNotificationUtils {
  static showSuccessNotification(
    snackBar: MatSnackBar,
    message: string,
    duration = USERS_CONFIG.NOTIFICATION_DURATION
  ): void {
    snackBar.open(message, null, {
      panelClass: 'app-notification-success',
      duration
    });
  }

  static showSearchResultsNotification(
    snackBar: MatSnackBar,
    totalElements: number
  ): void {
    snackBar.open(
      `Search results loaded successfully. Total elements: ${totalElements}`,
      null,
      {
        panelClass: 'app-notification-success',
        duration: USERS_CONFIG.SEARCH_NOTIFICATION_DURATION
      }
    );
  }

  static showErrorNotification(
    snackBar: MatSnackBar,
    message: string,
    duration = USERS_CONFIG.NOTIFICATION_DURATION
  ): void {
    snackBar.open(message, null, {
      panelClass: 'app-notification-error',
      duration
    });
  }

  static showWarningNotification(
    snackBar: MatSnackBar,
    message: string,
    duration = USERS_CONFIG.NOTIFICATION_DURATION
  ): void {
    snackBar.open(message, null, {
      panelClass: 'app-notification-warning',
      duration
    });
  }
}

// Data processing utilities
export class UsersDataUtils {
  static processUsersData(data: any): { content: any[], totalPages: number, totalElements: number } {
    return {
      content: data.content || [],
      totalPages: data.totalPages || 0,
      totalElements: data.totalElements || 0
    };
  }
}

// Main utility class that combines all utilities
export class UsersUtils {
  // Form utilities
  static readonly Form = UsersFormUtils;

  // Smart filter utilities
  static readonly SmartFilter = UsersSmartFilterConfig;

  // Company utilities
  static readonly Company = UsersCompanyUtils;

  // User type utilities
  static readonly Type = UsersTypeUtils;

  // Notification utilities
  static readonly Notification = UsersNotificationUtils;

  // Data utilities
  static readonly Data = UsersDataUtils;

  // Constants
  static readonly CONFIG = USERS_CONFIG;
}
