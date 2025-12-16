import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-settings',
    template: `<router-outlet></router-outlet>`,
    imports: [RouterModule]
})
export class SettingsComponent {}
