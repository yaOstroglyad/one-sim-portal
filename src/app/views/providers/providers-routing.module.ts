import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProvidersComponent } from './providers.component';
import { ADMIN_PERMISSION, permissionGuard } from '../../shared';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'nav.providers',
      permissions: [ADMIN_PERMISSION]
    },
    component: ProvidersComponent,
    canActivate: [permissionGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProvidersRoutingModule {
}
