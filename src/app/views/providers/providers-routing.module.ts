import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProvidersComponent } from './providers.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Providers'
    },
    component: ProvidersComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProvidersRoutingModule {
}
