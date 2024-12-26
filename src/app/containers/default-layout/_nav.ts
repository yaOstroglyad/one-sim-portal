import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION } from '../../shared';

export const navItems: any[] = [
	{
		name: 'Customers',
		url: 'customers',
		iconComponent: {name: 'cil-industry'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION]
	},
	{
		name: 'Providers',
		url: 'providers',
		iconComponent: {name: 'cil-apps-settings'},
		permissions: [ADMIN_PERMISSION]
	},
	{
		name: 'Orders',
		url: 'orders',
		iconComponent: {name: 'cil-basket'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
	},
	{
		name: 'Products',
		url: 'products',
		iconComponent: {name: 'cil3d'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
	},
	{
		name: 'Inventory',
		url: 'inventory',
		iconComponent: {name: 'cil-sim'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
	},
	{
		name: 'Users',
		url: 'users',
		iconComponent: {name: 'cil-user'},
		permissions: [ADMIN_PERMISSION]
	},
	{
		name: 'Settings',
		url: 'settings',
		iconComponent: {name: 'cil-settings'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
	}
];
