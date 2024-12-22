import { Directive, inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../auth';

@Directive({
  standalone: true,
  selector: '[appHasPermission]'
})
export class HasPermissionDirective {
  authService = inject(AuthService);
  viewContainer = inject(ViewContainerRef);
  templateRef = inject(TemplateRef<any>);

  @Input('appHasPermission') set requiredPermissions(permissions: string[]) {
    if (!permissions.some(permission => this.authService.hasPermission(permission))) {
      this.viewContainer.clear();
    } else {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
