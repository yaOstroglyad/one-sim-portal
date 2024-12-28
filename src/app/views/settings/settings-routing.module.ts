import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { ADMIN_PERMISSION, CUSTOMER_PERMISSION, permissionGuard } from '../../shared';

const routes: Routes = [
	{
		path: '',
		data: {
			title: 'nav.settings',
			permissions: [ADMIN_PERMISSION, CUSTOMER_PERMISSION]
		},
		component: SettingsComponent,
		canActivate: [permissionGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SettingsRoutingModule {
}
