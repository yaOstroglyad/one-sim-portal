import { Routes } from '@angular/router';
import { StorybookComponent } from './storybook.component';

export const STORYBOOK_ROUTES: Routes = [
  {
    path: '',
    component: StorybookComponent,
    data: {
      title: 'Storybook'
    }
  }
];