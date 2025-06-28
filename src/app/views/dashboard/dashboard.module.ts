import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { TabsComponent, TabComponent } from '../../shared/components/tabs';
import { TooltipDirective, TooltipComponent } from '../../shared/components/tooltip';

import {
  AvatarModule,
  ButtonGroupModule,
  ButtonModule,
  CardModule,
  FormModule,
  GridModule,
  NavModule,
  ProgressModule,
  TableModule,
  TabsModule
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    CardModule,
    NavModule,
    IconModule,
    TabsModule,
    GridModule,
    ProgressModule,
    ButtonModule,
    FormModule,
    ButtonGroupModule,
    AvatarModule,
    TableModule,
    CardComponent, // Import standalone component
    TabsComponent, // Import standalone tabs component
    TabComponent, // Import standalone tab component
    TooltipDirective, // Import standalone tooltip directive
    TooltipComponent // Import standalone tooltip component
  ]
})
export class DashboardModule { }