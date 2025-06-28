import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION } from '../../shared';

export const navItems: any[] = [
	{
		name: 'nav.dashboard',
		url: 'dashboard',
		iconComponent: {name: 'cil-chart-pie'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION],
		featureToggle: 'dashboard'
	},
	{
		name: 'nav.companies',
		url: 'companies',
		iconComponent: {name: 'cil-industry'},
		permissions: [ADMIN_PERMISSION]
	},
	{
		name: 'nav.customers',
		url: 'customers',
		iconComponent: {name: 'cil-group'},
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
		name: 'nav.emailLogs',
		url: 'email-logs',
		iconComponent: {name: 'cil-envelope-closed'},
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
		url: '/home/settings',
		iconComponent: {name: 'cil-settings'},
		children: [
			{
				name: 'nav.general',
				url: '/home/settings/general',
			},
			{
				name: 'nav.paymentGateway',
				url: '/home/settings/payment-gateway'
			},
			{
				name: 'nav.domains',
				permissions: [ADMIN_PERMISSION],
				url: '/home/settings/domains'
			},
			{
				name: 'nav.viewConfiguration',
				permissions: [ADMIN_PERMISSION],
				children: [
					{
						name: 'nav.portal',
						url: '/home/settings/view-configuration/portal'
					},
					{
						name: 'nav.retail',
						url: '/home/settings/view-configuration/retail'
					}
				]
			},
			{
				name: 'nav.emailConfigurations',
				url: '/home/settings/email-configurations',
				permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
			}
		]
	}
];
