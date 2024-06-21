import { INavData } from '@coreui/angular';

export const menuItemToPermission = {
  Providers: ['admin'],
  Customers: ['admin'],
  Products: ['all'],
  Inventory: ['all']
}

export const navItems: INavData[] = [
  // {
  //   name: 'Users',
  //   url: 'users',
  //   iconComponent: { name: 'cil-user' },
  // },
  // {
  //   name: 'Permissions',
  //   url: 'permissions',
  //   iconComponent: { name: 'cil-shield-alt' },
  // },
  // {
  //   name: 'Sims',
  //   url: 'sims',
  //   iconComponent: { name: 'cil-sim' },
  // },
  // {
  //   name: 'Subscribers',
  //   url: 'subscribers',
  //   iconComponent: { name: 'cil-group' },
  // },
  {
    name: 'Customers',
    url: 'customers',
    iconComponent: { name: 'cil-industry' },
  },
  {
    name: 'Providers',
    url: 'providers',
    iconComponent: { name: 'cil-apps-settings' },
  },
  {
    name: 'Products',
    url: 'products',
    iconComponent: { name: 'cil3d' },
  },
  {
    name: 'Inventory',
    url: 'inventory',
    iconComponent: { name: 'cil-sim' },
  },
  // {
  //   name: 'Settings',
  //   url: 'settings',
  //   iconComponent: { name: 'cil-settings' },
  // },
];
