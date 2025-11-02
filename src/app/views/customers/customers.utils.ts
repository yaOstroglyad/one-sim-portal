import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  SmartFilterConfig,
  SearchableSelectOption,
  Customer,
  CustomerType,
  CustomersDataService,
  CompaniesDataService
} from '@shared';
import { EditCustomerComponent } from './edit-customer/edit-customer.component';

// Constants
export const CUSTOMERS_CONFIG = {
  DEFAULT_PAGE_SIZE: 15,
  FILTER_DEBOUNCE_TIME: 700,
  DIALOG_WIDTH: '650px',
  NOTIFICATION_DURATION: 1000
} as const;

// Filter form configuration
export interface CustomersFilterParams {
  page: number;
  size: number;
  iccid?: string;
  name?: string;
  externalId?: string;
  externalTransactionId?: string;
  type?: string;
  companyId?: string;
}

// Form creation utilities
export class CustomersFormUtils {
  static createFilterForm(): FormGroup {
    return new FormGroup({
      iccid: new FormControl(null),
      name: new FormControl(null),
      externalId: new FormControl(null),
      externalTransactionId: new FormControl(null),
      type: new FormControl(null),
      companyId: new FormControl(null)
    });
  }

  static createFilterParams(formValue: any, page = 0, size = CUSTOMERS_CONFIG.DEFAULT_PAGE_SIZE): CustomersFilterParams {
    return {
      page,
      size,
      ...formValue
    };
  }
}

// Smart filter configuration
export class CustomersSmartFilterConfig {
  static create(companiesDataService: CompaniesDataService, isAdmin: boolean = false): SmartFilterConfig {
    return {
      threshold: isAdmin ? 4 : 3, // Switch to advanced mode when > threshold filters
      maxVisibleChips: 3, // Show maximum 3 chips
      services: {
        companiesService: companiesDataService
      },
      fields: [
        {
          key: 'name',
          label: 'Name',
          chipConfig: {
            color: 'primary',
            priority: 1
          }
        },
        {
          key: 'iccid',
          label: 'ICCID',
          chipConfig: {
            color: 'info',
            priority: 2
          }
        },
        {
          key: 'externalId',
          label: 'External ID',
          chipConfig: {
            color: 'secondary',
            priority: 3
          }
        },
        {
          key: 'externalTransactionId',
          label: 'External Transaction ID',
          chipConfig: {
            color: 'secondary',
            priority: 4
          }
        },
        ...(isAdmin ? [{
          key: 'companyId',
          label: 'Company',
          valueMapper: {
            type: 'observable' as const,
            serviceKey: 'companiesService',
            methodName: 'list',
            valueField: 'name',
            keyField: 'id',
            cacheKey: 'companies-list'
          },
          chipConfig: {
            color: 'warning',
            priority: 5,
            tooltip: (_value: any, displayValue: string) =>
              `Filter by company: ${displayValue}`
          }
        }] : [])
      ],
      globalSettings: {
        autoApply: false, // Don't auto-apply (using debounce)
        persistFilters: false, // Don't save filters
        resetToDefaults: false // Full reset on clear
      }
    };
  }
}

// Company options utilities
export class CustomersCompanyUtils {
  static createCompanyOptions(companiesDataService: CompaniesDataService): Observable<SearchableSelectOption[]> {
    return companiesDataService.list().pipe(
      map(companies => {
        if (!companies || !Array.isArray(companies)) {
          return [];
        }
        return companies.map(company => ({
          value: company.id,
          label: company.name,
          data: company
        } as SearchableSelectOption));
      })
    );
  }
}

// Dialog utilities
export class CustomersDialogUtils {
  static openCreateCustomerDialog(
    dialog: MatDialog,
    customersDataService: CustomersDataService,
    onSuccess: () => void
  ): void {
    const dialogRef = dialog.open(EditCustomerComponent, {
      width: CUSTOMERS_CONFIG.DIALOG_WIDTH,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        customersDataService.create(result).subscribe(() => {
          onSuccess();
        });
      }
    });
  }
}

// Navigation utilities
export class CustomersNavigationUtils {
  static navigateToCustomerDetails(router: Router, customer: Customer): void {
    if (customer.type.toUpperCase() === CustomerType.Private.toUpperCase()) {
      router.navigate([`home/customers/customer-details/${customer.type}/${customer.id}`]);
    }
  }
}

// Notification utilities
export class CustomersNotificationUtils {
  static showSearchResultsNotification(
    snackBar: MatSnackBar,
    totalElements: number
  ): void {
    snackBar.open(
      `Search results loaded successfully. Total elements: ${totalElements}`,
      null,
      {
        panelClass: 'app-notification-success',
        duration: CUSTOMERS_CONFIG.NOTIFICATION_DURATION
      }
    );
  }
}

// Data loading utilities
export class CustomersDataUtils {
  static processCustomersData(data: any): { content: Customer[], totalPages: number, totalElements: number } {
    return {
      content: data.content || [],
      totalPages: data.totalPages || 15,
      totalElements: data.totalElements || 0
    };
  }
}

// Main utility class that combines all utilities
export class CustomersUtils {
  // Form utilities
  static readonly Form = CustomersFormUtils;

  // Smart filter utilities
  static readonly SmartFilter = CustomersSmartFilterConfig;

  // Company utilities
  static readonly Company = CustomersCompanyUtils;

  // Dialog utilities
  static readonly Dialog = CustomersDialogUtils;

  // Navigation utilities
  static readonly Navigation = CustomersNavigationUtils;

  // Notification utilities
  static readonly Notification = CustomersNotificationUtils;

  // Data utilities
  static readonly Data = CustomersDataUtils;

  // Constants
  static readonly CONFIG = CUSTOMERS_CONFIG;
}
