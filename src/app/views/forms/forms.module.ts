import { NgModule } from '@angular/core';
import { FormControlsComponent } from './form-controls/form-controls.component';
import { FormsRoutingModule } from './forms-routing.module';


@NgModule({
  declarations: [
    FormControlsComponent
  ],
  imports: [
      FormsRoutingModule
  ]
})
export class CFormsModule {
}
