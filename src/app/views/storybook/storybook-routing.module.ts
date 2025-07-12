import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StorybookComponent } from './storybook.component';

const routes: Routes = [
  {
    path: '',
    component: StorybookComponent,
    data: {
      title: 'Storybook'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StorybookRoutingModule { }