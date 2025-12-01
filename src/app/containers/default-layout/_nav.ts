import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION, SPECIAL_PERMISSION, ANALYTICS_PERMISSION } from '@shared';

export const navItems: any[] = [
	{
		name: 'nav.analytics',
		url: '/home/analytics',
		iconComponent: {name: 'cil-chart-pie'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION, SPECIAL_PERMISSION, ANALYTICS_PERMISSION],
		featureToggle: 'dashboard',
		children: [
			{
				name: 'nav.dashboard',
				url: '/home/analytics/dashboard',
				permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION, SPECIAL_PERMISSION, ANALYTICS_PERMISSION]
			},
			{
				name: 'nav.reports',
				url: '/home/analytics/reports',
				permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION, SUPPORT_PERMISSION, SPECIAL_PERMISSION, ANALYTICS_PERMISSION]
			},
			{
				name: 'nav.adminOverview',
				url: '/home/analytics/admin-overview',
				permissions: [ADMIN_PERMISSION]
			}
		]
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
		name: 'nav.inventory',
		url: 'inventory',
		iconComponent: {name: 'cil-sim'},
		permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
	},
	{
		name: 'nav.products',
		url: 'company-products',
		iconComponent: {name: 'cil3d'},
		permissions: [CUSTOMER_PERMISSION]
	},
	{
		name: 'nav.tickets',
		url: '/home/tickets',
		iconComponent: {name: 'cil-speech'},
		featureToggle: 'tickets',
		permissions: [ADMIN_PERMISSION, SUPPORT_PERMISSION, CUSTOMER_PERMISSION]
	},
	{
		name: 'nav.productconstructor',
		url: 'product-constructor',
		iconComponent: {name: 'cil-layers'},
		permissions: [ADMIN_PERMISSION],
		featureToggle: 'productConstructor'
	},
	{
		name: 'nav.settings',
		url: '/home/settings',
		permissions: [ADMIN_PERMISSION],
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
				name: 'nav.invoicingGateway',
				url: '/home/settings/invoices'
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
			},
			{
				name: 'nav.users',
				url: '/home/settings/users',
				permissions: [ADMIN_PERMISSION]
			},
			{
				name: 'nav.roles',
				url: '/home/settings/roles',
				permissions: [ADMIN_PERMISSION]
			}
		]
	},
	{
		name: 'Storybook',
		url: 'storybook',
		iconComponent: {name: 'cil-library'},
		permissions: [ADMIN_PERMISSION],
		featureToggle: 'storybook'
	}
];
