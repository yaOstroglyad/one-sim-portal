import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION } from '../../shared';

export const navItems: any[] = [
	{
		name: 'nav.customers',
		url: 'customers',
		iconComponent: {name: 'cil-industry'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION]
	},
	{
		name: 'nav.providers',
		url: 'providers',
		iconComponent: {name: 'cil-apps-settings'},
		permissions: [ADMIN_PERMISSION]
	},
	{
		name: 'nav.orders',
		url: 'orders',
		iconComponent: {name: 'cil-basket'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
	},
	{
		name: 'nav.products',
		url: 'products',
		iconComponent: {name: 'cil3d'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
	},
	{
		name: 'nav.inventory',
		url: 'inventory',
		iconComponent: {name: 'cil-sim'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
	},
	{
		name: 'nav.users',
		url: 'users',
		iconComponent: {name: 'cil-user'},
		permissions: [ADMIN_PERMISSION]
	},
	{
		name: 'nav.settings',
		url: 'settings',
		iconComponent: {name: 'cil-settings'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
	}
];
