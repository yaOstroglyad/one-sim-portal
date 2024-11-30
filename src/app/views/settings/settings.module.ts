import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { MatTabsModule } from '@angular/material/tabs';
import { WhiteLabelConfigurationComponent } from './white-label-configuration/white-label-configuration.component';
import { MatCardModule } from '@angular/material/card';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { PaymentGatewayTableModule } from './payment-gateway-table/payment-gateway-table.module';



@NgModule({
  declarations: [
    SettingsComponent,
  ],
	imports: [
		CommonModule,
		SettingsRoutingModule,
		MatTabsModule,
		WhiteLabelConfigurationComponent,
		MatCardModule,
		PaymentGatewayModule,
		PaymentGatewayTableModule
	]
})
export class SettingsModule { }
