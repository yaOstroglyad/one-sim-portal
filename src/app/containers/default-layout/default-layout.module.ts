import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultFooterComponent } from './default-footer/default-footer.component';
import { DefaultHeaderComponent } from './default-header/default-header.component';
import { DefaultLayoutComponent } from './default-layout.component';
import { DefaultLayoutRoutingModule } from './default-layout-routing.module';
import {
	AvatarModule,
	BadgeModule,
	BreadcrumbModule,
	ButtonGroupModule,
	ButtonModule,
	CardModule,
	DropdownModule,
	FooterModule,
	FormModule,
	GridModule,
	HeaderModule,
	ListGroupModule,
	NavModule,
	ProgressModule, SharedModule, SidebarModule, TabsModule, UtilitiesModule
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarSkeletonComponent } from './sidebar-skeleton/sidebar-skeleton.component';
import { SidebarBrandComponent } from '../../shared/components/sidebar-brand/sidebar-brand.component';

@NgModule({
	declarations: [
		DefaultFooterComponent,
		DefaultHeaderComponent,
		DefaultLayoutComponent
	],
	imports: [
		CommonModule,
		DefaultLayoutRoutingModule,
		AvatarModule,
		BreadcrumbModule,
		FooterModule,
		DropdownModule,
		GridModule,
		HeaderModule,
		SidebarModule,
		IconModule,
		NavModule,
		ButtonModule,
		FormModule,
		UtilitiesModule,
		ButtonGroupModule,
		ReactiveFormsModule,
		SidebarModule,
		SharedModule,
		TabsModule,
		ListGroupModule,
		ProgressModule,
		BadgeModule,
		ListGroupModule,
		CardModule,
		NgScrollbarModule,
		BreadcrumbComponent,
		TranslateModule,
		SidebarSkeletonComponent,
		SidebarBrandComponent
	]
})
export class DefaultLayoutModule {}
