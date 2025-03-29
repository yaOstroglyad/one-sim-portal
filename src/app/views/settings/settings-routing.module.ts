import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, permissionGuard } from '../../shared';

const routes: Routes = [
	{
		path: '',
		children: [
			{
				path: 'payment-gateway',
				loadComponent: () => import('./payment-gateway/payment-gateway.component')
					.then(m => m.PaymentGatewayComponent),
				data: {
					title: 'nav.paymentGateway',
					permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
				},
				canActivate: [permissionGuard]
			},
			{
				path: 'view-configuration',
				children: [
					{
						path: '',
						loadComponent: () => import('./view-configuration/view-configuration.component')
							.then(m => m.ViewConfigurationComponent),
						data: {
							title: 'nav.viewConfiguration',
							permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
						},
						canActivate: [permissionGuard]
					},
					{
						path: 'portal',
						data: {
							title: 'nav.portal',
							permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
						},
						loadComponent: () => import('./view-configuration/portal/portal.component')
							.then(m => m.PortalComponent),
					}
				]
			},
			{
				path: '',
				redirectTo: 'payment-gateway',
				pathMatch: 'full'
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SettingsRoutingModule {
}
