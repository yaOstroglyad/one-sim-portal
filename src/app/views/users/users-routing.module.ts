import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ADMIN_PERMISSION, permissionGuard } from '../../shared';
import { UsersComponent } from './users.component';

const routes: Routes = [
	{
		path: '',
		data: {
			title: 'nav.users',
			permissions: [ADMIN_PERMISSION]
		},
		component: UsersComponent,
		canActivate: [permissionGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UsersRoutingModule {
}
