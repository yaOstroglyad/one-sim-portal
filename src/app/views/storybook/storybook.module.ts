import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StorybookRoutingModule } from './storybook-routing.module';
import { StorybookComponent } from './storybook.component';
import { BadgeComponent } from '../../shared/components/badge';
import { CardComponent } from '../../shared/components/card/card.component';
import { TabsComponent, TabComponent } from '../../shared/components/tabs';
import { TooltipDirective, TooltipComponent } from '../../shared/components/tooltip';
import { OsBarChartComponent } from '../../shared/components/bar-chart';
import { OsLineChartComponent } from '../../shared/components/line-chart';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

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
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    StorybookComponent
  ],
  imports: [
    CommonModule,
    StorybookRoutingModule,
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
    TranslateModule,
    BadgeComponent, // Import standalone badge component
    CardComponent, // Import standalone component
    TabsComponent, // Import standalone tabs component
    TabComponent, // Import standalone tab component
    TooltipDirective, // Import standalone tooltip directive
    TooltipComponent, // Import standalone tooltip component
    OsBarChartComponent, // Import standalone bar chart component
    OsLineChartComponent, // Import standalone line chart component
    PaginationComponent // Import standalone pagination component
  ]
})
export class StorybookModule { }