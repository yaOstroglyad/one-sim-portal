import { Injectable } from '@angular/core';
import { UserRole } from '../../../../../shared';
import { 
  UIConfig, 
  ModifyPriceDialogConfig, 
  TariffOfferDetailsConfig,
  CompanyProductFormConfig,
  TableConfig 
} from './ui-config.interfaces';
import { AdminUIConfig } from './configs/admin.config';
import { CustomerUIConfig } from './configs/customer.config';
import { SupportUIConfig } from './configs/support.config';
import { SpecialUIConfig } from './configs/special.config';

@Injectable({
  providedIn: 'root'
})
export class UIConfigFactory {

  createModifyPriceDialogConfig(userRole: UserRole): ModifyPriceDialogConfig {
    const baseConfig = this.getBaseConfig(userRole);
    return {
      ...baseConfig,
      showCurrentTariffInfo: userRole === UserRole.ADMIN
    };
  }

  createTariffOfferDetailsConfig(userRole: UserRole): TariffOfferDetailsConfig {
    const baseConfig = this.getBaseConfig(userRole);
    return {
      ...baseConfig,
      showProductDetails: true,
      showEditButton: userRole === UserRole.ADMIN || userRole === UserRole.CUSTOMER
    };
  }

  createCompanyProductFormConfig(userRole: UserRole): CompanyProductFormConfig {
    const baseConfig = this.getBaseConfig(userRole);
    return {
      ...baseConfig,
      showAccountSelector: userRole === UserRole.ADMIN
    };
  }

  createTableConfig(userRole: UserRole): TableConfig {
    const baseConfig = this.getBaseConfig(userRole);
    return {
      ...baseConfig,
      showAddButton: userRole === UserRole.ADMIN || userRole === UserRole.SPECIAL,
      showEditButton: false, // Handled via menu
      showMenu: true
    };
  }

  private getBaseConfig(userRole: UserRole): UIConfig {
    switch (userRole) {
      case UserRole.ADMIN:
        return new AdminUIConfig();
      case UserRole.CUSTOMER:
        return new CustomerUIConfig();
      case UserRole.SUPPORT:
        return new SupportUIConfig();
      case UserRole.SPECIAL:
        return new SpecialUIConfig();
      default:
        return new CustomerUIConfig(); // Default fallback
    }
  }
}